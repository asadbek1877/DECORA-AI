import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { ScreenWrapper, FadeInView } from '../src/components/new-ui/ScreenWrapper';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { useScrollStore } from '../src/store/scrollStore';
import { BeforeAfterSlider } from '../src/components/GalleryBeforeAfter';
import { useDesignStore } from '../src/store/designStore';
import { AnimatedPressable, AnimatedCard } from '../src/components/new-ui/AnimatedPressable';
import { api } from '../src/api/client';

interface GalleryImage {
  id: string;
  itemId: string;
  type: 'before' | 'after';
  style?: string;
  path: string;
  order: number;
}

interface GalleryItem {
  id: string;
  title?: string;
  images: GalleryImage[];
}

const { width } = Dimensions.get('window');

export default function GalleryBrowseScreen() {
  const router = useRouter();
  const { colors, isDark } = useUI();
  const { t } = useLanguageStore();
  const { updateScroll } = useScrollStore();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getGallery();
      
      if (response.success) {
        // Group images by item
        const itemsMap = new Map<string, GalleryItem>();
        (response.data || []).forEach((item: any) => {
          if (!itemsMap.has(item.id)) {
            itemsMap.set(item.id, {
              id: item.id,
              title: item.title || `Sample #${item.id.slice(0, 8)}`,
              images: [],
            });
          }
          itemsMap.get(item.id)!.images.push(item);
        });
        setGalleryItems(Array.from(itemsMap.values()));
      }
    } catch (err) {
      console.error('Failed to load gallery:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gallery. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    updateScroll(scrollY);
  };

  const handleUseImage = (beforeImageUrl: string, afterImageUrl: string, style: string) => {
    // Show alert that the style was selected - in production, you could:
    // 1. Download the before image and use it as starting point
    // 2. Store style preference in design store
    // 3. Show preview of after image as example
    Alert.alert('Style Selected', `You selected ${style} style. Now take a photo to apply this design!`, [
      { text: 'Close' },
      {
        text: 'Take Photo',
        onPress: () => router.push('/createDesign' as any),
      },
    ]);
  };

  const getStyleImages = (item: GalleryItem, style: string) => {
    const beforeImage = item.images.find((img) => img.type === 'before');
    const afterImage = item.images.find((img) => img.type === 'after' && img.style === style);
    return { beforeImage, afterImage };
  };

  const getAllStyles = () => {
    const styles = new Set<string>();
    galleryItems.forEach((item) => {
      item.images.forEach((img) => {
        if (img.type === 'after' && img.style) {
          styles.add(img.style);
        }
      });
    });
    return Array.from(styles).sort();
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <AppHeader title={t.gallery || 'Gallery'} />
        <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <BottomNav active="gallery" />
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <AppHeader title={t.gallery || 'Gallery'} />
        <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <AnimatedPressable
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchGalleryItems}
          >
            <Text style={styles.buttonText}>{'Retry'}</Text>
          </AnimatedPressable>
        </View>
        <BottomNav active="gallery" />
      </ScreenWrapper>
    );
  }

  const allStyles = getAllStyles();
  const filteredItems = galleryItems.filter((item) =>
    !selectedStyle || item.images.some((img) => img.type === 'after' && img.style === selectedStyle)
  );

  return (
    <ScreenWrapper>
      <AppHeader title={t.gallery || 'Gallery'} />
      
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Style Filter Buttons */}
        <FadeInView delay={100}>
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              {t.filterByStyle || 'Filter by Style'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.styleButtons}
              contentContainerStyle={styles.styleButtonsContent}
            >
              <AnimatedPressable
                style={[
                  styles.styleButton,
                  {
                    backgroundColor: selectedStyle === null ? colors.primary : colors.card,
                  },
                ]}
                onPress={() => setSelectedStyle(null)}
              >
                <Text
                  style={[
                    styles.styleButtonText,
                    { color: selectedStyle === null ? '#fff' : colors.text },
                  ]}
                >
                  {t.all || 'All'}
                </Text>
              </AnimatedPressable>

              {allStyles.map((style) => (
                <AnimatedPressable
                  key={style}
                  style={[
                    styles.styleButton,
                    {
                      backgroundColor: selectedStyle === style ? colors.primary : colors.card,
                    },
                  ]}
                  onPress={() => setSelectedStyle(style)}
                >
                  <Text
                    style={[
                      styles.styleButtonText,
                      { color: selectedStyle === style ? '#fff' : colors.text },
                    ]}
                  >
                    {style}
                  </Text>
                </AnimatedPressable>
              ))}
            </ScrollView>
          </View>
        </FadeInView>

        {/* Gallery Items */}
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="image-off-outline"
              size={48}
              color={colors.muted}
            />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {'No samples available for this style'}
            </Text>
          </View>
        ) : (
          filteredItems.map((item, index) => (
            <FadeInView key={item.id} delay={200 + index * 50}>
              <AnimatedCard style={[styles.itemCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>
                  {item.title}
                </Text>

                {/* Style Showcase */}
                <View style={styles.styleSections}>
                  {allStyles.map((style) => {
                    const { beforeImage, afterImage } = getStyleImages(item, style);
                    if (!beforeImage || !afterImage) return null;

                    return (
                      <View key={style} style={styles.styleShowcase}>
                        <BeforeAfterSlider
                          beforeImage={beforeImage.path}
                          afterImage={afterImage.path}
                          style={style}
                          title={`${style} Style`}
                        />

                        {/* Use Button */}
                        <AnimatedPressable
                          style={[
                            styles.useButton,
                            { backgroundColor: colors.primary },
                          ]}
                          onPress={() =>
                            handleUseImage(beforeImage.path, afterImage.path, style)
                          }
                        >
                          <Ionicons name="arrow-forward" size={16} color="#fff" />
                          <Text style={styles.useButtonText}>
                            {'Use This Style'}
                          </Text>
                        </AnimatedPressable>
                      </View>
                    );
                  })}
                </View>
              </AnimatedCard>
            </FadeInView>
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNav active="gallery" />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  styleButtons: {
    marginHorizontal: -20, // Compensate padding
  },
  styleButtonsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  styleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  styleButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  styleSections: {
    gap: 20,
  },
  styleShowcase: {
    marginBottom: 12,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    marginVertical: 12,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
