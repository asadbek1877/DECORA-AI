import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { ScreenWrapper } from '../src/components/new-ui/ScreenWrapper';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { useDesignStore } from '../src/store/designStore';
import { useAuthStore } from '../src/store/authStore';
import { AnimatedPressable, AnimatedCard } from '../src/components/new-ui/AnimatedPressable';
import { api } from '../src/api/client';
import { useScrollNavigation } from '../src/hooks/useScrollNavigation';

const { width } = Dimensions.get('window');

interface GalleryVariant {
  id: string;
  styleName: string;
  styleCategory?: string;
  afterImageUrl: string;
  order: number;
}

interface GalleryItem {
  id: string;
  title?: string;
  beforeImageUrl: string;
  variants: GalleryVariant[];
}

const GalleryScreen: React.FC = () => {
  const router = useRouter();
  const { colors } = useUI();
  const { t } = useLanguageStore();
  const { isAuthenticated } = useAuthStore();
  const { history, loadHistory, historyLoaded } = useDesignStore();
  const { handleScroll, bottomNavStyle } = useScrollNavigation();
  
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<'history' | 'likes' | 'prompts' | 'summary' | 'public'>('history');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [likedProjects, setLikedProjects] = useState<any[]>([]);
  const [promptHistory, setPromptHistory] = useState<any[]>([]);
  const [userSummary, setUserSummary] = useState<any>(null);

  // Initialize on mount and when auth state changes
  useFocusEffect(
    React.useCallback(() => {
      // Determine which tab to show based on auth state
      if (isAuthenticated) {
        setTab('history');
        loadHistoryData();
      } else {
        setTab('public');
        fetchPublicGallery();
      }
    }, [isAuthenticated])
  );

  const loadLikes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getLikedProjects();
      if (response.success && response.data) {
        setLikedProjects(response.data);
      } else {
        setError('Failed to load liked projects');
        setLikedProjects([]);
      }
    } catch (error: any) {
      console.error('Failed to load likes:', error);
      setError(error.message || 'Could not load liked projects');
      setLikedProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPromptHistory();
      if (response.success && response.data) {
        setPromptHistory(response.data);
      } else {
        setError('Failed to load prompt history');
        setPromptHistory([]);
      }
    } catch (error: any) {
      console.error('Failed to load prompts:', error);
      setError(error.message || 'Could not load prompt history');
      setPromptHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getUserSummary();
      if (response.success && response.data) {
        setUserSummary(response.data);
      } else {
        setError('Failed to load summary');
        setUserSummary(null);
      }
    } catch (error: any) {
      console.error('Failed to load summary:', error);
      setError(error.message || 'Could not load summary');
      setUserSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use the new refreshHistory method for persistent storage
      const { refreshHistory } = useDesignStore.getState();
      await refreshHistory();
    } catch (error: any) {
      console.error('Failed to load history:', error);
      setError(error.message || 'Could not load your designs');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicGallery = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getGallery();
      
      if (!response.success) {
        throw new Error('Gallery service unavailable');
      }
      
      // Transform backend data to frontend format
      const galleryData: GalleryItem[] = (response.data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        beforeImageUrl: item.beforeImage?.path || item.beforeImageUrl || '',
        variants: (item.images || [])
          .filter((img: any) => img.type === 'after')
          .map((img: any, idx: number) => ({
            id: img.id,
            styleName: img.style || 'Unknown',
            styleCategory: img.style,
            afterImageUrl: img.path,
            order: img.order || idx,
          })),
      }));
      
      setItems(galleryData);

      const defaultVariants: Record<string, number> = {};
      galleryData.forEach((item: GalleryItem) => {
        defaultVariants[item.id] = 0;
      });
      setSelectedVariantIndex(defaultVariants);
    } catch (err: any) {
      console.error('Failed to load gallery:', err);
      setError(err.message || 'Could not load gallery');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (tab === 'history' && isAuthenticated) {
        await loadHistoryData();
      } else if (tab === 'likes' && isAuthenticated) {
        await loadLikes();
      } else if (tab === 'prompts' && isAuthenticated) {
        await loadPrompts();
      } else if (tab === 'summary' && isAuthenticated) {
        await loadSummary();
      } else {
        await fetchPublicGallery();
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteDesign = (projectId: string, projectTitle?: string) => {
    Alert.alert(
      'Delete Design',
      `Are you sure you want to delete "${projectTitle || 'this design'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteProject(projectId);
              // Refresh history after deletion
              await loadHistoryData();
              Alert.alert('Success', 'Design deleted successfully');
            } catch (error: any) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete design');
            }
          }
        }
      ]
    );
  };

  const handleToggleLike = async (projectId: string) => {
    try {
      const { toggleProjectLike } = useDesignStore.getState();
      const isLiked = await toggleProjectLike(projectId);
      Alert.alert('Success', isLiked ? 'Added to favorites' : 'Removed from favorites');
    } catch (error: any) {
      console.error('Like toggle error:', error);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  // RENDER AUTHENTICATED USER SCREENS
  if (isAuthenticated) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.bg }]}>
        <AppHeader title={tab === 'history' ? 'My Designs' : tab.charAt(0).toUpperCase() + tab.slice(1)} />

        {/* Tabs */}
        <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
          {(['history', 'likes', 'prompts', 'summary'] as const).map((tabName) => (
            <TouchableOpacity
              key={tabName}
              onPress={() => {
                setTab(tabName);
                // Trigger load for the selected tab
                if (tabName === 'history') {
                  loadHistoryData();
                } else if (tabName === 'likes') {
                  loadLikes();
                } else if (tabName === 'prompts') {
                  loadPrompts();
                } else if (tabName === 'summary') {
                  loadSummary();
                }
              }}
              style={[
                styles.tab,
                { borderBottomColor: tab === tabName ? colors.primary : colors.border }
              ]}
            >
              <Text style={[
                styles.tabText,
                { color: tab === tabName ? colors.primary : colors.muted }
              ]}>
                {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <>
            {!historyLoaded || loading ? (
              <View style={[styles.loadingContainer, { flex: 1 }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>Loading your designs...</Text>
              </View>
            ) : error ? (
              <ScreenWrapper>
                <View style={styles.emptyContainer}>
                  <Ionicons name="alert-circle-outline" size={64} color={colors.primary} />
                  <Text style={[styles.emptyText, { color: colors.text, marginTop: 16 }]}>
                    Error Loading Designs
                  </Text>
                  <Text style={[styles.emptyText, { color: colors.muted, fontSize: 14, marginTop: 8 }]}>
                    {error}
                  </Text>
                  <AnimatedPressable
                    style={[styles.ctaBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                    onPress={() => loadHistoryData()}
                  >
                    <Text style={styles.ctaBtnText}>Try Again</Text>
                  </AnimatedPressable>
                </View>
              </ScreenWrapper>
            ) : history.length === 0 ? (
              <ScreenWrapper>
                <View style={styles.emptyContainer}>
                  <Ionicons name="images-outline" size={64} color={colors.muted} />
                  <Text style={[styles.emptyText, { color: colors.text, marginTop: 16 }]}>
                    No designs yet
                  </Text>
                  <Text style={[styles.emptyText, { color: colors.muted, fontSize: 14, marginTop: 8 }]}>
                    Create your first AI room design
                  </Text>
                  <AnimatedPressable
                    style={[styles.ctaBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                    onPress={() => router.push('/createDesign' as any)}
                  >
                    <Text style={styles.ctaBtnText}>Create Design</Text>
                  </AnimatedPressable>
                </View>
              </ScreenWrapper>
            ) : (
              <ScreenWrapper>
                <FlatList
                  data={history}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.historyList}
                  numColumns={2}
                  columnWrapperStyle={styles.columnWrapper}
                  renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 50)} style={{ flex: 1 }}>
                      <AnimatedCard
                        style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => router.push({ pathname: '/result', params: { designId: item.id } } as any)}
                      >
                        {item.originalImageUrl ? (
                          <Image source={{ uri: item.originalImageUrl }} style={styles.cardImage} resizeMode="cover" />
                        ) : (
                          <View style={[styles.cardImage, { backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="image-outline" size={32} color={colors.muted} />
                          </View>
                        )}
                        {item.finalImageUrl && (
                          <View style={[styles.cardBadge, { backgroundColor: colors.primary }]}>
                            <Ionicons name="checkmark-circle" size={16} color="white" />
                            <Text style={styles.cardBadgeText}>AI Done</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={[styles.deleteBtn, { backgroundColor: colors.primary }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteDesign(item.id, item.roomType);
                          }}
                        >
                          <Ionicons name="close" size={18} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.likeBtn, { backgroundColor: item.isLiked ? colors.primary : colors.surfaceSoft }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleLike(item.id);
                          }}
                        >
                          <Ionicons 
                            name={item.isLiked ? 'heart' : 'heart-outline'} 
                            size={18} 
                            color={item.isLiked ? 'white' : colors.muted} 
                          />
                        </TouchableOpacity>
                        <View style={[styles.cardTag, { backgroundColor: colors.primary }]}>
                          <Text style={styles.cardTagText}>{item.styleName || item.style || 'Design'}</Text>
                        </View>
                        <View style={styles.cardBody}>
                          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                            {item.roomType || 'Room'}
                          </Text>
                          <Text style={[styles.cardDate, { color: colors.muted }]}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Text>
                          {item.lastPrompt && (
                            <Text style={[styles.cardPrompt, { color: colors.muted }]} numberOfLines={1}>
                              {item.lastPrompt}
                            </Text>
                          )}
                        </View>
                      </AnimatedCard>
                    </Animated.View>
                  )}
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  scrollEnabled={true}
                />
              </ScreenWrapper>
            )}
          </>
        )}

        {/* LIKES TAB */}
        {tab === 'likes' && (
          <>
            {loading ? (
              <View style={[styles.loadingContainer, { flex: 1 }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>Loading liked projects...</Text>
              </View>
            ) : error ? (
              <ScreenWrapper>
                <View style={styles.emptyContainer}>
                  <Ionicons name="alert-circle-outline" size={64} color={colors.primary} />
                  <Text style={[styles.emptyText, { color: colors.text, marginTop: 16 }]}>
                    Error Loading Likes
                  </Text>
                  <AnimatedPressable
                    style={[styles.ctaBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                    onPress={() => loadLikes()}
                  >
                    <Text style={styles.ctaBtnText}>Try Again</Text>
                  </AnimatedPressable>
                </View>
              </ScreenWrapper>
            ) : likedProjects.length === 0 ? (
              <ScreenWrapper>
                <View style={styles.emptyContainer}>
                  <Ionicons name="heart-outline" size={64} color={colors.muted} />
                  <Text style={[styles.emptyText, { color: colors.text, marginTop: 16 }]}>
                    No liked projects yet
                  </Text>
                  <Text style={[styles.emptyText, { color: colors.muted, fontSize: 14, marginTop: 8 }]}>
                    Like designs to save them here
                  </Text>
                </View>
              </ScreenWrapper>
            ) : (
              <ScreenWrapper>
                <FlatList
                  data={likedProjects}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.historyList}
                  numColumns={2}
                  columnWrapperStyle={styles.columnWrapper}
                  renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 50)} style={{ flex: 1 }}>
                      <AnimatedCard
                        style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                        ) : (
                          <View style={[styles.cardImage, { backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="image-outline" size={32} color={colors.muted} />
                          </View>
                        )}
                        <View style={[styles.cardTag, { backgroundColor: colors.primary }]}>
                          <Text style={styles.cardTagText}>{item.style || 'Liked'}</Text>
                        </View>
                        <View style={styles.cardBody}>
                          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                            {item.title || 'Liked Design'}
                          </Text>
                          <Text style={[styles.cardDate, { color: colors.muted }]}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </AnimatedCard>
                    </Animated.View>
                  )}
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              </ScreenWrapper>
            )}
          </>
        )}

        {/* PROMPTS TAB */}
        {tab === 'prompts' && (
          <>
            {loading ? (
              <View style={[styles.loadingContainer, { flex: 1 }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>Loading prompt history...</Text>
              </View>
            ) : error ? (
              <ScreenWrapper>
                <View style={styles.emptyContainer}>
                  <Ionicons name="alert-circle-outline" size={64} color={colors.primary} />
                  <Text style={[styles.emptyText, { color: colors.text, marginTop: 16 }]}>
                    Error Loading Prompts
                  </Text>
                  <AnimatedPressable
                    style={[styles.ctaBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                    onPress={() => loadPrompts()}
                  >
                    <Text style={styles.ctaBtnText}>Try Again</Text>
                  </AnimatedPressable>
                </View>
              </ScreenWrapper>
            ) : promptHistory.length === 0 ? (
              <ScreenWrapper>
                <View style={styles.emptyContainer}>
                  <Ionicons name="text-outline" size={64} color={colors.muted} />
                  <Text style={[styles.emptyText, { color: colors.text, marginTop: 16 }]}>
                    No prompt history
                  </Text>
                  <Text style={[styles.emptyText, { color: colors.muted, fontSize: 14, marginTop: 8 }]}>
                    Your custom prompts will appear here
                  </Text>
                </View>
              </ScreenWrapper>
            ) : (
              <ScreenWrapper>
                <ScrollView contentContainerStyle={[styles.historyList, { gap: 12 }]} refreshControl={
                  <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }>
                  {promptHistory.map((item, index) => (
                    <Animated.View key={item.id} entering={FadeInDown.delay(index * 50)}>
                      <View style={[{ padding: 12, borderRadius: 8, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                        <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 8 }]}>
                          {item.prompt || 'Untitled prompt'}
                        </Text>
                        <Text style={[styles.cardDate, { color: colors.muted }]}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </Animated.View>
                  ))}
                </ScrollView>
              </ScreenWrapper>
            )}
          </>
        )}

        {/* SUMMARY TAB */}
        {tab === 'summary' && (
          <>
            {loading ? (
              <View style={[styles.loadingContainer, { flex: 1 }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>Loading summary...</Text>
              </View>
            ) : error ? (
              <ScreenWrapper>
                <View style={styles.emptyContainer}>
                  <Ionicons name="alert-circle-outline" size={64} color={colors.primary} />
                  <Text style={[styles.emptyText, { color: colors.text, marginTop: 16 }]}>
                    Error Loading Summary
                  </Text>
                  <AnimatedPressable
                    style={[styles.ctaBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                    onPress={() => loadSummary()}
                  >
                    <Text style={styles.ctaBtnText}>Try Again</Text>
                  </AnimatedPressable>
                </View>
              </ScreenWrapper>
            ) : !userSummary ? (
              <ScreenWrapper>
                <View style={styles.emptyContainer}>
                  <Ionicons name="stats-chart-outline" size={64} color={colors.muted} />
                  <Text style={[styles.emptyText, { color: colors.text, marginTop: 16 }]}>
                    No summary data
                  </Text>
                  <Text style={[styles.emptyText, { color: colors.muted, fontSize: 14, marginTop: 8 }]}>
                    Summary will be available after creating designs
                  </Text>
                </View>
              </ScreenWrapper>
            ) : (
              <ScreenWrapper>
                <ScrollView contentContainerStyle={styles.historyList} refreshControl={
                  <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }>
                  <View style={[{ padding: 16, borderRadius: 12, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                    <Text style={[styles.headerTitle, { color: colors.text, fontSize: 18, marginBottom: 16 }]}>
                      Your Design Summary
                    </Text>
                    {userSummary.totalDesigns !== undefined && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={[styles.cardDate, { color: colors.muted, marginBottom: 4 }]}>Total Designs</Text>
                        <Text style={[styles.cardTitle, { color: colors.text, fontSize: 24 }]}>
                          {userSummary.totalDesigns}
                        </Text>
                      </View>
                    )}
                    {userSummary.favoriteStyle && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={[styles.cardDate, { color: colors.muted, marginBottom: 4 }]}>Favorite Style</Text>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>
                          {userSummary.favoriteStyle}
                        </Text>
                      </View>
                    )}
                    {userSummary.totalCreditsUsed !== undefined && (
                      <View>
                        <Text style={[styles.cardDate, { color: colors.muted, marginBottom: 4 }]}>Credits Used</Text>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>
                          {userSummary.totalCreditsUsed}
                        </Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </ScreenWrapper>
            )}
          </>
        )}

        <BottomNav active="gallery" animatedStyle={bottomNavStyle} />
      </View>
    );
  }

  // RENDER PUBLIC GALLERY TAB
  if (tab === 'public') {
    if (loading) {
      return (
        <View style={[styles.safe, { backgroundColor: colors.bg }]}>
          <AppHeader title="Gallery" />
          <ScreenWrapper>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.muted }]}>Loading gallery...</Text>
            </View>
          </ScreenWrapper>
          <BottomNav active="gallery" animatedStyle={bottomNavStyle} />
        </View>
      );
    }

    if (error || items.length === 0) {
      return (
        <View style={[styles.safe, { backgroundColor: colors.bg }]}>
          <AppHeader title="Gallery" />
          <ScreenWrapper>
            <View style={styles.emptyContainer}>
              <Ionicons name="image-outline" size={64} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.text, marginTop: 16 }]}>
                {error ? 'Gallery Unavailable' : 'No Gallery Items'}
              </Text>
              <Text style={[styles.emptyText, { color: colors.muted, fontSize: 14, marginTop: 8 }]}>
                {error ? 'The gallery service is currently unavailable' : 'No inspiration gallery available yet'}
              </Text>
              <AnimatedPressable
                style={[styles.ctaBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                onPress={() => router.push('/createDesign' as any)}
              >
                <Text style={styles.ctaBtnText}>Create Your Own Design</Text>
              </AnimatedPressable>
              {error && (
                <AnimatedPressable
                  style={[styles.ctaBtn, { backgroundColor: colors.surface, marginTop: 10, borderWidth: 1, borderColor: colors.border }]}
                  onPress={handleRefresh}
                >
                  <Text style={[styles.ctaBtnText, { color: colors.text }]}>Try Again</Text>
                </AnimatedPressable>
              )}
            </View>
          </ScreenWrapper>
          <BottomNav active="gallery" animatedStyle={bottomNavStyle} />
        </View>
      );
    }

    const currentItem = items[currentItemIndex];
    const currentVariant = currentItem?.variants?.[selectedVariantIndex[currentItem?.id] || 0];

    // Reset selected variant to index 0 when switching items
    React.useEffect(() => {
      if (currentItem?.id && selectedVariantIndex[currentItem.id] === undefined) {
        setSelectedVariantIndex((prev) => ({
          ...prev,
          [currentItem.id]: 0,
        }));
      }
    }, [currentItem?.id]);

    return (
      <View style={[styles.safe, { backgroundColor: colors.bg }]}>
        <AppHeader title="Gallery" />

        <ScreenWrapper>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.container, { paddingBottom: 80 }]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <Animated.View
              entering={FadeInDown}
              style={[styles.header, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Beautiful Transformations
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
                Explore stunning design possibilities
              </Text>
            </Animated.View>

            {/* Current Item Display */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.itemContainer}>
              {/* Title */}
              {currentItem?.title && (
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {currentItem.title}
                </Text>
              )}

              {/* Before Image */}
              <View style={[styles.imageWrapper, { backgroundColor: colors.surfaceSoft }]}>
                <Image
                  source={{ uri: currentItem?.beforeImageUrl }}
                  style={styles.beforeImage}
                  resizeMode="cover"
                />
                <View style={[styles.label, styles.beforeLabel]}>
                  <Text style={styles.labelText}>Before</Text>
                </View>
              </View>

              {/* After Image */}
              {currentVariant && (
                <View style={[styles.imageWrapper, { backgroundColor: colors.surfaceSoft }]}>
                  <Image
                    source={{ uri: currentVariant.afterImageUrl }}
                    style={styles.afterImage}
                    resizeMode="cover"
                  />
                  <View style={[styles.label, styles.afterLabel]}>
                    <Text style={styles.labelText}>{currentVariant.styleName}</Text>
                  </View>
                </View>
              )}

              {/* Style Selection Chips */}
              {currentItem?.variants?.length > 1 && (
                <View style={styles.chipsContainer}>
                  <Text style={[styles.chipsTitle, { color: colors.text }]}>
                    More Styles ({currentItem.variants.length})
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {currentItem.variants.map((variant: GalleryVariant, idx: number) => (
                      <TouchableOpacity
                        key={variant.id}
                        onPress={() =>
                          setSelectedVariantIndex({
                            ...selectedVariantIndex,
                            [currentItem.id]: idx,
                          })
                        }
                        style={[
                          styles.styleChip,
                          {
                            borderColor:
                              selectedVariantIndex[currentItem.id] === idx
                                ? colors.primary
                                : colors.border,
                            borderWidth: selectedVariantIndex[currentItem.id] === idx ? 2 : 1,
                          },
                        ]}
                      >
                        <Image
                          source={{ uri: variant.afterImageUrl }}
                          style={styles.styleChipImage}
                          resizeMode="cover"
                        />
                        <Text
                          style={[
                            styles.styleChipLabel,
                            {
                              color:
                                selectedVariantIndex[currentItem.id] === idx
                                  ? colors.primary
                                  : colors.muted,
                              fontWeight:
                                selectedVariantIndex[currentItem.id] === idx ? '600' : '400',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {variant.styleName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </Animated.View>

            {/* Navigation */}
            {items.length > 1 && (
              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentItemIndex((prev: number) => (prev - 1 + items.length) % items.length)
                  }
                  style={[styles.navButton, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.counterContainer}>
                  <Text style={[styles.counter, { color: colors.text }]}>
                    {currentItemIndex + 1} / {items.length}
                  </Text>
                  <View style={styles.dotsContainer}>
                    {items.map((_: GalleryItem, idx: number) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setCurrentItemIndex(idx)}
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              idx === currentItemIndex ? colors.primary : colors.border,
                            width: idx === currentItemIndex ? 24 : 8,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setCurrentItemIndex((prev: number) => (prev + 1) % items.length)}
                  style={[styles.navButton, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {/* Thumbnails Carousel */}
            {items.length > 1 && (
              <View style={styles.thumbnailsContainer}>
                <Text style={[styles.allItemsTitle, { color: colors.text }]}>
                  All Items ({items.length})
                </Text>
                <FlatList
                  data={items}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      onPress={() => setCurrentItemIndex(index)}
                      style={[
                        styles.thumbnail,
                        {
                          borderColor:
                            index === currentItemIndex ? colors.primary : colors.border,
                          borderWidth: index === currentItemIndex ? 2 : 1,
                          opacity: index === currentItemIndex ? 1 : 0.6,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: item.beforeImageUrl }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                      <Text
                        style={[styles.thumbnailLabel, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.title?.substring(0, 10) || `Item ${index + 1}`}
                      </Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                />
              </View>
            )}
          </ScrollView>
        </ScreenWrapper>

        <BottomNav active="gallery" animatedStyle={bottomNavStyle} />
      </View>
    );
  }

  // Fallback/loading screen - only shown during very initial load
  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <AppHeader title="Gallery" />
      <ScreenWrapper>
        <View style={[styles.loadingContainer, { flex: 1, justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted, marginTop: 16 }]}>Loading gallery...</Text>
        </View>
      </ScreenWrapper>
      <BottomNav active="gallery" animatedStyle={bottomNavStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flexGrow: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  historyList: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  columnWrapper: {
    gap: 8,
    paddingHorizontal: 8,
  },
  historyCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 8,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  cardTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  likeBtn: {
    position: 'absolute',
    top: 8,
    right: 48,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardBody: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 11,
  },
  cardPrompt: {
    fontSize: 10,
    marginTop: 4,
  },
  ctaBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  ctaBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  itemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  beforeImage: {
    width: '100%',
    height: '100%',
  },
  afterImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  beforeLabel: {
    backgroundColor: '#DC2626',
  },
  afterLabel: {
    backgroundColor: '#16A34A',
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  chipsContainer: {
    marginVertical: 16,
  },
  chipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  styleChip: {
    marginRight: 12,
    paddingBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    width: 80,
  },
  styleChipImage: {
    width: '100%',
    height: 60,
    marginBottom: 4,
  },
  styleChipLabel: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterContainer: {
    flex: 1,
    alignItems: 'center',
  },
  counter: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  thumbnailsContainer: {
    paddingVertical: 16,
  },
  allItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  thumbnail: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
  },
  thumbnailLabel: {
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});

export default GalleryScreen;
