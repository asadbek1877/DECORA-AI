import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { CustomCard } from '../../src/components/CustomCard';

const { width } = Dimensions.get('window');
const imageWidth = (width - 48) / 2;

type GalleryTab = 'inspiration' | 'mydesigns';

interface GalleryItemType {
  id: string;
  imageUrl: string;
  title?: string;
  liked?: boolean;
}

// Dummy data
const INSPIRATION_IMAGES: GalleryItemType[] = [
  { id: '1', imageUrl: 'https://via.placeholder.com/200x250?text=Modern+1', title: 'Modern Design' },
  { id: '2', imageUrl: 'https://via.placeholder.com/200x250?text=Luxury+1', title: 'Luxury Space' },
  { id: '3', imageUrl: 'https://via.placeholder.com/200x250?text=Japanese+1', title: 'Japanese Zen' },
  { id: '4', imageUrl: 'https://via.placeholder.com/200x250?text=Industrial+1', title: 'Industrial' },
  { id: '5', imageUrl: 'https://via.placeholder.com/200x250?text=Modern+2', title: 'Contemporary' },
  { id: '6', imageUrl: 'https://via.placeholder.com/200x250?text=Minimal+1', title: 'Minimal Tech' },
];

const MY_DESIGNS: GalleryItemType[] = [
  { id: '1', imageUrl: 'https://via.placeholder.com/200x250?text=My+Design+1', title: 'Bedroom Redesign', liked: false },
  { id: '2', imageUrl: 'https://via.placeholder.com/200x250?text=My+Design+2', title: 'Living Room', liked: true },
  { id: '3', imageUrl: 'https://via.placeholder.com/200x250?text=My+Design+3', title: 'Kitchen Modern', liked: false },
];

export default function GalleryScreenProduction() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<GalleryTab>('inspiration');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set(MY_DESIGNS.filter(d => d.liked).map(d => d.id)));
  const [loading, setLoading] = useState(false);

  const data = activeTab === 'inspiration' ? INSPIRATION_IMAGES : MY_DESIGNS;

  const handleLike = (itemId: string) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(itemId)) {
      newLiked.delete(itemId);
    } else {
      newLiked.add(itemId);
    }
    setLikedItems(newLiked);
  };

  const handleMenu = (itemId: string) => {
    if (activeTab === 'mydesigns') {
      // Show edit/delete menu
      console.log('Menu pressed for item', itemId);
    }
  };

  const renderGalleryItem = ({ item, index }: { item: GalleryItemType; index: number }) => {
    const isLeftColumn = index % 2 === 0;
    const marginRight = isLeftColumn ? 8 : 0;

    return (
      <View style={[styles.imageWrapper, { marginRight }]}>
        <CustomCard
          style={styles.galleryCard}
          padding={0}
          onPress={() => router.push(`/galleryBrowse?id=${item.id}` as any)}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.galleryImage}
              resizeMode="cover"
            />

            {/* Overlay */}
            <View style={styles.overlay}>
              {/* Like Button - Top Right */}
              <TouchableOpacity
                style={[styles.overlayButton, styles.likeButton]}
                onPress={() => handleLike(item.id)}
              >
                <Ionicons
                  name={likedItems.has(item.id) ? 'heart' : 'heart-outline'}
                  size={20}
                  color={likedItems.has(item.id) ? colors.error : colors.text}
                />
              </TouchableOpacity>

              {/* Menu Button - Bottom Right */}
              {activeTab === 'mydesigns' && (
                <TouchableOpacity
                  style={[styles.overlayButton, styles.menuButton]}
                  onPress={() => handleMenu(item.id)}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={18}
                    color={colors.text}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Title at bottom */}
            {item.title && (
              <View style={styles.titleOverlay}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
            )}
          </View>
        </CustomCard>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Galereya"
        showProfile={false}
        showHamburger={false}
      />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('inspiration')}
          style={[
            styles.tab,
            activeTab === 'inspiration' && styles.tabActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'inspiration' && styles.tabTextActive,
            ]}
          >
            Ilhom olish
          </Text>
          {activeTab === 'inspiration' && (
            <View style={styles.tabUnderline} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('mydesigns')}
          style={[
            styles.tab,
            activeTab === 'mydesigns' && styles.tabActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'mydesigns' && styles.tabTextActive,
            ]}
          >
            Mening dizaynlarim
          </Text>
          {activeTab === 'mydesigns' && (
            <View style={styles.tabUnderline} />
          )}
        </TouchableOpacity>
      </View>

      {/* Gallery Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="image-outline"
            size={48}
            color={colors.textSecondary}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyText}>
            {activeTab === 'inspiration'
              ? 'Ilhom oladighan rasmlar yo\'q'
              : 'Siz hali hech qanday dizayn yaratmadingiz'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderGalleryItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 16,
  },
  imageWrapper: {
    width: imageWidth,
  },
  galleryCard: {
    padding: 0,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 5,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 8,
    flexDirection: 'column',
  },
  overlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    alignSelf: 'flex-end',
  },
  menuButton: {
    alignSelf: 'flex-end',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
