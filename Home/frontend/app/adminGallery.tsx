import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { ScreenWrapper } from '../src/components/new-ui/ScreenWrapper';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { useAuthStore } from '../src/store/authStore';
import { AnimatedPressable, AnimatedCard } from '../src/components/new-ui/AnimatedPressable';
import { safeRouterBack } from '../src/utils/navigation';
import { api } from '../src/api/client';

interface GalleryImage {
  id: string;
  itemId: string;
  type: 'before' | 'after';
  style?: string;
  path: string;
}

interface GalleryItem {
  id: string;
  title?: string;
  images: GalleryImage[];
}

const STYLE_OPTIONS = [
  'Modern',
  'Minimalist',
  'Scandinavian',
  'Luxury',
  'Industrial',
  'Bohemian',
  'Rustic',
  'Contemporary',
  'Traditional',
  'Classical',
];

export default function AdminGalleryScreen() {
  const router = useRouter();
  const { colors, isDark } = useUI();
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const [isUploading, setIsUploading] = useState(false);

  // Check admin access
  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      Alert.alert('Access Denied', 'Only admins can manage the gallery.', [
        { text: 'OK', onPress: () => safeRouterBack(router as any, '/') },
      ]);
    } else {
      fetchGalleryItems();
    }
  }, [user]);

  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const response = await api.getGallery();
      
      if (response.success) {
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
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load gallery items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter a gallery item title');
      return;
    }

    try {
      setIsUploading(true);
      const response = await api.createGalleryItem({ title: newTitle });

      if (response.success) {
        Alert.alert('Success', 'Gallery item created. You can now upload images.');
        setShowCreateModal(false);
        setNewTitle('');
        fetchGalleryItems();
      } else {
        throw new Error(response.error || 'Failed to create');
      }
    } catch (err) {
      console.error('Create gallery error:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create gallery item');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickImage = async (type: 'before' | 'after') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.95,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Create FormData with image
        const formData = new FormData();
        formData.append('image', {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `${type}-${Date.now()}.jpg`,
        } as any);

        if (type === 'after' && selectedItem) {
          formData.append('style', selectedStyle);
        }

        await handleImageUpload(type, formData);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleImageUpload = async (type: 'before' | 'after', formData: FormData) => {
    if (!selectedItem) {
      Alert.alert('Error', 'No gallery item selected');
      return;
    }

    try {
      setIsUploading(true);
      let response;
      
      if (type === 'before') {
        response = await api.uploadGalleryBeforeImage(selectedItem.id, (formData.get('image') as any).uri);
      } else {
        response = await api.uploadGalleryAfterImage(selectedItem.id, (formData.get('image') as any).uri, selectedStyle);
      }

      if (response.success) {
        Alert.alert('Success', `${type} image uploaded successfully`);
        fetchGalleryItems();
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert('Delete Item', 'Are you sure? This will delete all associated images.', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => deleteGalleryItem(itemId),
        style: 'destructive',
      },
    ]);
  };

  const deleteGalleryItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      const response = await api.deleteGalleryItem(itemId);

      if (response.success) {
        Alert.alert('Deleted', 'Gallery item deleted');
        fetchGalleryItems();
      } else {
        throw new Error(response.error || 'Failed to delete');
      }
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <AppHeader title="Manage Gallery" />
        <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <AppHeader title="Manage Gallery" />
      
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Create New Button */}
        <AnimatedPressable
          style={[styles.createButton, { backgroundColor: '#34d399' }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create New Gallery Item</Text>
        </AnimatedPressable>

        {/* Gallery Items List */}
        {galleryItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="image-off-outline"
              size={48}
              color={colors.muted}
            />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No gallery items yet. Create one to get started!
            </Text>
          </View>
        ) : (
          galleryItems.map((item) => (
            <AnimatedCard
              key={item.id}
              style={[styles.itemCard, { backgroundColor: colors.card }]}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleSection}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.itemMeta, { color: colors.muted }]}>
                    {item.images.length} images
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <Pressable
                    onPress={() => {
                      setSelectedItem(item);
                      setShowEditModal(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </Pressable>
                  <Pressable onPress={() => handleDeleteItem(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </Pressable>
                </View>
              </View>

              {/* Images Preview */}
              <View style={styles.imagesGrid}>
                {item.images.map((image) => (
                  <View
                    key={image.id}
                    style={[styles.imagePreview, { backgroundColor: colors.muted }]}
                  >
                    <Image
                      source={{ uri: image.path }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    <View
                      style={[
                        styles.imageLabel,
                        {
                          backgroundColor:
                            image.type === 'before'
                              ? 'rgba(58, 58, 60, 0.6)'
                              : 'rgba(52, 211, 153, 0.6)',
                        },
                      ]}
                    >
                      <Text style={styles.imageLabelText}>
                        {image.type === 'before' ? 'Before' : image.style || 'After'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </AnimatedCard>
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <AnimatedCard style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create New Gallery Item
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter gallery item title"
              placeholderTextColor={colors.muted}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.muted }]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewTitle('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                  isUploading && { opacity: 0.6 },
                ]}
                onPress={handleCreateNew}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Create</Text>
                )}
              </Pressable>
            </View>
          </AnimatedCard>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal && !!selectedItem} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <AnimatedCard style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Upload Images to: {selectedItem?.title}
            </Text>

            {/* Upload Before Image */}
            <View style={styles.uploadSection}>
              <Text style={[styles.uploadLabel, { color: colors.text }]}>
                Before Image
              </Text>
              <AnimatedPressable
                style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                onPress={() => handlePickImage('before')}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>Upload Before Image</Text>
              </AnimatedPressable>
            </View>

            {/* Upload After Image */}
            <View style={styles.uploadSection}>
              <Text style={[styles.uploadLabel, { color: colors.text }]}>
                After Image
              </Text>
              <Text style={[styles.styleLabel, { color: colors.muted }]}>
                Select Style:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.styleList}
              >
                {STYLE_OPTIONS.map((style) => (
                  <Pressable
                    key={style}
                    style={[
                      styles.styleOption,
                      {
                        backgroundColor:
                          selectedStyle === style
                            ? colors.primary
                            : colors.bg,
                      },
                    ]}
                    onPress={() => setSelectedStyle(style)}
                  >
                    <Text
                      style={[
                        styles.styleOptionText,
                        {
                          color:
                            selectedStyle === style
                              ? '#fff'
                              : colors.text,
                        },
                      ]}
                    >
                      {style}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <AnimatedPressable
                style={[styles.uploadButton, { backgroundColor: '#34d399' }]}
                onPress={() => handlePickImage('after')}
              >
                <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>
                  Upload {selectedStyle} Image
                </Text>
              </AnimatedPressable>
            </View>

            <Pressable
              style={[styles.closeButton, { backgroundColor: colors.muted }]}
              onPress={() => {
                setShowEditModal(false);
                setSelectedItem(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </AnimatedCard>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitleSection: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePreview: {
    width: '30%',
    aspectRatio: 4 / 5,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  imageLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  styleLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  styleList: {
    marginBottom: 12,
  },
  styleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  styleOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
