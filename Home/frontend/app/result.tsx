import React from 'react';
import { ScrollView, StyleSheet, Text, View, Share, Alert, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { BeforeAfterSlider } from '../src/components/new-ui/BeforeAfterSlider'; 
import { ImageViewer } from '../src/components/new-ui/ImageViewer';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { ScreenWrapper, FadeInView } from '../src/components/new-ui/ScreenWrapper';
import { AnimatedPressable } from '../src/components/new-ui/AnimatedPressable';
import { useScrollStore } from '../src/store/scrollStore';
import { useDesignStore } from '../src/store/designStore';
import { useAuthStore } from '../src/store/authStore';
import { api } from '../src/api/client';

export default function ResultScreen() {
  const router = useRouter();
  const { colors, isDark } = useUI();
  const { t } = useLanguageStore();
  const { updateScroll } = useScrollStore();
  const params = useLocalSearchParams<{ style?: string; roomType?: string; designId?: string }>();
  const { style, roomType, designId } = params;
  
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [imageViewerUri, setImageViewerUri] = React.useState<string | null>(null);
  const [imageViewerType, setImageViewerType] = React.useState<'before' | 'after' | null>(null);
  const [projectDetail, setProjectDetail] = React.useState<any>(null);
  const [isLoadingProject, setIsLoadingProject] = React.useState(!!designId);
  const { user } = useAuthStore();
  
  const { originalImageUri, finalImageUrl, previews } = useDesignStore();

  // Load project details if designId is provided
  React.useEffect(() => {
    if (designId) {
      loadProjectDetail();
    }
  }, [designId]);

  const loadProjectDetail = async () => {
    if (!designId) {
      setIsLoadingProject(false);
      return;
    }
    try {
      setIsLoadingProject(true);
      const response = await (api as any).getProject(designId);
      if (response.success && response.data) {
        setProjectDetail(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load project:', error);
    } finally {
      setIsLoadingProject(false);
    }
  };

  // Use project detail if available, otherwise use store values
  const displayStyle = projectDetail?.style || style || 'Modern';
  const displayRoomType = projectDetail?.roomType || roomType || 'Room';
  const displayOriginalUrl = projectDetail?.originalImageUrl || originalImageUri;
  
  // Get the final image from previews or finalImageUrl
  let displayFinalUrl = projectDetail?.finalImageUrl || finalImageUrl;
  if (!displayFinalUrl && previews && previews.length > 0) {
    // Use the first preview image as the final image
    displayFinalUrl = previews[0]?.imageUrl || finalImageUrl;
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {    
    const scrollY = event.nativeEvent.contentOffset.y;
    updateScroll(scrollY);
  };

  const handleDownload = async () => {
    if (!displayFinalUrl) {
      Alert.alert('Error', 'No image available to download');
      return;
    }
    try {
      setIsDownloading(true);

      // ── Avoid AUDIO permissions by asking exactly for what we need or setting writeOnly for saves
      let { status } = await MediaLibrary.getPermissionsAsync(true);
      console.log('[Download] Initial permission status:', status);

      // Only request if not already granted
      if (status !== 'granted') {
        console.log('[Download] Requesting media library permissions...');
        const { status: requestStatus } = await MediaLibrary.requestPermissionsAsync(true);
        status = requestStatus;
        console.log('[Download] Permission request result:', status);
        
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'We need permission to save images to your photo library. Please enable storage permission in Settings.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => setIsDownloading(false) },
              { text: 'Try Again', onPress: () => handleDownload() }
            ]
          );
          return;
        }
      }

      // Ensure document directory exists
      const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory || '');
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory || '', { intermediates: true });
      }

      const timestamp = new Date().getTime();
      const fileName = `Decora_${displayStyle}_${timestamp}.jpg`;
      const localPath = `${FileSystem.documentDirectory}${fileName}`;

      // Download image
      console.log('[Download] Downloading image to:', localPath);
      await FileSystem.downloadAsync(displayFinalUrl, localPath);

      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (!fileInfo.exists) {
        throw new Error('Image file was not created');
      }

      // Save to media library
      console.log('[Download] Saving to media library...');
      const asset = await MediaLibrary.createAssetAsync(localPath);
      await MediaLibrary.createAlbumAsync('Decora', asset, false).catch(() => {
        // Album might already exist
      });

      // Cleanup temp file
      await FileSystem.deleteAsync(localPath).catch(() => {});

      Alert.alert('✅ Success', 'Your design has been saved to your photo gallery!');
      console.log('[Download] Image saved successfully');
    } catch (error: any) {
      console.error('[Download] Error:', error.message);
      Alert.alert(
        'Save Failed',
        `Could not save image: ${error.message || 'Unknown error'}`,
        [{ text: 'OK', onPress: () => setIsDownloading(false) }]
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (!displayFinalUrl) {
        Alert.alert('Error', 'No image to share');
        return;
      }

      // Ensure document directory exists
      const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory || '');
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory || '', { intermediates: true });
      }

      // Try to share with the image file
      const timestamp = new Date().getTime();
      const fileName = `Decora_${displayStyle}_${timestamp}.jpg`;
      const localPath = `${FileSystem.documentDirectory}${fileName}`;

      // Download image first with error handling
      try {
        await FileSystem.downloadAsync(displayFinalUrl, localPath);
      } catch (downloadError: any) {
        console.error('Share download failed:', downloadError);
        // Fallback to text-only share
        await Share.share({
          message: `Check out my ${displayStyle || 'AI'} room design made with Decora AI! 🎨`,
          title: `Decora AI - ${displayStyle} Design`,
        });
        return;
      }

      await Share.share({
        url: localPath,
        message: `Check out my ${displayStyle || 'AI'} room design made with Decora AI! 🎨`,
        title: `Decora AI - ${displayStyle} Design`,
      });

      // Clean up after share
      try {
        await FileSystem.deleteAsync(localPath).catch(() => {});
      } catch (e) {
        // Ignore cleanup errors
      }
    } catch (error: any) {
      // Fallback to text-only share
      try {
        console.error('Share error:', error);
        await Share.share({
          message: `Check out my ${displayStyle || 'AI'} room design made with Decora AI! 🎨`,
          title: `Decora AI - ${displayStyle} Design`,
        });
      } catch (e) {
        console.error('Fallback share error:', e);
        Alert.alert('Share Error', 'Could not share the image.');
      }
    }
  };

  const handleCopyImage = async () => {
    try {
      if (!displayFinalUrl) {
        Alert.alert('Error', 'No image to copy');
        return;
      }

      // Ensure document directory exists
      const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory || '');
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory || '', { intermediates: true });
      }

      const timestamp = new Date().getTime();
      const fileName = `Decora_${displayStyle}_${timestamp}.jpg`;
      const localPath = `${FileSystem.documentDirectory}${fileName}`;

      // Download image first with error handling
      try {
        await FileSystem.downloadAsync(displayFinalUrl, localPath);
      } catch (downloadError: any) {
        console.error('Copy download failed:', downloadError);
        Alert.alert('Error', 'Could not download image. Please check your connection.');
        return;
      }
      
      // Copy to clipboard
      await Clipboard.setStringAsync(localPath);
      Alert.alert('Copied!', 'Image copied to clipboard', [{ text: 'OK' }]);

      // Clean up
      await FileSystem.deleteAsync(localPath).catch(() => {});
    } catch (error: any) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy image. Please try again.');
    }
  };

  const handleCopyPrompt = async () => {
    const designPrompt = `Transform this ${displayRoomType || 'room'} in ${displayStyle || 'Modern'} style using AI`;
    await Clipboard.setStringAsync(designPrompt);
    Alert.alert('Copied!', 'Design prompt copied to clipboard', [{ text: 'OK' }]);
  };

  const handleViewBeforeImage = () => {
    if (displayOriginalUrl) {
      setImageViewerUri(displayOriginalUrl);
      setImageViewerType('before');
    }
  };

  const handleViewAfterImage = () => {
    if (displayFinalUrl) {
      setImageViewerUri(displayFinalUrl);
      setImageViewerType('after');
    }
  };

  const handleCloseImageViewer = () => {
    setImageViewerUri(null);
    setImageViewerType(null);
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <AppHeader showBack onBack={() => router.replace('/(tabs)/' as any)} />

      <ScreenWrapper>
        {isLoadingProject ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.muted }]}>Loading design...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
            <FadeInView delay={40}>
              <View style={{ gap: 8 }}>
                <Text style={[styles.title, { color: colors.text }]}>{t.yourNewSpace}</Text>
                <Text style={[styles.tag, { color: colors.muted }]}>{t.style}: {(displayStyle || 'Modern').toUpperCase()}</Text>
              </View>
            </FadeInView>

            <FadeInView delay={120}>
              {displayOriginalUrl ? (
                <View style={styles.sliderContainer}>
                  {displayFinalUrl ? (
                    // Show before/after slider
                    <Pressable onPress={handleViewBeforeImage}>
                      <BeforeAfterSlider
                        beforeImage={displayOriginalUrl}
                        afterImage={displayFinalUrl}
                        height={360}
                      />
                    </Pressable>
                  ) : (
                    // Show original image with placeholder
                    <View style={styles.imageDisplayContainer}>
                      <Image
                        source={{ uri: displayOriginalUrl }}
                        style={styles.displayImage}
                        resizeMode="cover"
                      />
                      <View style={[styles.generatingOverlay, { backgroundColor: colors.overlay }]}>
                        <ActivityIndicator color={colors.primary} size="large" />
                        <Text style={[styles.generatingText, { color: colors.text }]}>
                          Generating your design...
                        </Text>
                        <Text style={[styles.generatingSubtext, { color: colors.textSecondary }]}>
                          This may take a moment
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {/* View buttons for individual images */}
                  <View style={styles.imageButtonsRow}>
                    <AnimatedPressable
                      onPress={handleViewBeforeImage}
                      style={[styles.viewImageBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <Ionicons name="eye" size={16} color={colors.primary} />
                      <Text style={[styles.viewImageBtnText, { color: colors.primary }]}>Before</Text>
                    </AnimatedPressable>
                    {displayFinalUrl && (
                      <AnimatedPressable
                        onPress={handleViewAfterImage}
                        style={[styles.viewImageBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <Ionicons name="eye" size={16} color={colors.primary} />
                        <Text style={[styles.viewImageBtnText, { color: colors.primary }]}>After</Text>
                      </AnimatedPressable>
                    )}
                  </View>
                </View>
              ) : (
                <View style={[styles.noImageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="image-off" size={48} color={colors.textSecondary} />
                  <Text style={[styles.noImageText, { color: colors.text }]}>No image provided</Text>
                  <Text style={[styles.noImageSubtext, { color: colors.textSecondary }]}>
                    Please upload a photo first
                  </Text>
                </View>
              )}
            </FadeInView>

            <FadeInView delay={200}>
              <View style={styles.actions}>
                <AnimatedPressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                  onPress={handleDownload}
                  disabled={isDownloading || !displayFinalUrl}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.primaryText}>{t.downloadImage || 'Download Image'}</Text>     
                  )}
                </AnimatedPressable>
                
                <View style={styles.twoBtns}>
                  <AnimatedPressable style={[styles.softBtn, { backgroundColor: colors.surfaceSoft }]} onPress={() => router.replace('/createDesign' as any)}>
                    <Text style={[styles.softText, { color: colors.text }]}>{t.create || 'Create New'}</Text>
                  </AnimatedPressable>
                  <AnimatedPressable style={[styles.softBtn, { backgroundColor: colors.surfaceSoft }]} onPress={handleShare}>
                    <Ionicons name="share-social" size={16} color={colors.text} />
                    <Text style={[styles.softText, { color: colors.text }]}>{t.share}</Text>
                  </AnimatedPressable>
                </View>
                
                <View style={styles.twoBtns}>
                  <AnimatedPressable
                    style={[styles.copyBtn, { borderColor: colors.primary, backgroundColor: colors.surface }]}
                    onPress={handleCopyPrompt}
                  >
                    <Ionicons name="copy" size={16} color={colors.primary} />       
                    <Text style={[styles.copyText, { color: colors.primary }]}>Copy Prompt</Text>
                  </AnimatedPressable>
                  <AnimatedPressable
                    style={[styles.copyBtn, { borderColor: colors.primary, backgroundColor: colors.surface }]}
                    onPress={handleCopyImage}
                  >
                    <Ionicons name="image" size={16} color={colors.primary} />       
                    <Text style={[styles.copyText, { color: colors.primary }]}>Copy Image</Text>
                  </AnimatedPressable>
                </View>
              </View>
            </FadeInView>

            {!user && (
              <FadeInView delay={280}>
                <View style={[styles.cta, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.ctaTitle, { color: colors.text }]}>{t.happyWithResult}</Text>
                  <Text style={[styles.ctaSub, { color: colors.muted }]}>{t.registerDescription}</Text>
                  <AnimatedPressable style={[styles.ctaBtn, { backgroundColor: colors.text }]} onPress={() => router.push('/auth' as any)}>
                    <Text style={[styles.ctaBtnText, { color: colors.bg }]}>{t.registerNow}</Text>
                  </AnimatedPressable>
                </View>
              </FadeInView>
            )}
          </ScrollView>
        )}
      </ScreenWrapper>

      <BottomNav active="gallery" />

      <ImageViewer
        visible={!!imageViewerUri}
        uri={imageViewerUri || ''}
        onClose={handleCloseImageViewer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 140, gap: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  title: { fontSize: 32, lineHeight: 36, fontWeight: '800' },
  tag: { fontWeight: '700', letterSpacing: 1, fontSize: 12 },
  actions: { gap: 10 },
  primaryBtn: {
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  twoBtns: { flexDirection: 'row', gap: 10 },
  softBtn: { 
    flex: 1, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 8,
  },
  softText: { fontWeight: '700' },
  copyBtn: {
    flexDirection: 'row',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    gap: 8,
    flex: 1,
  },
  copyText: { fontWeight: '600', fontSize: 14 },
  cta: {
    marginTop: 8,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  ctaTitle: { fontSize: 20, fontWeight: '800' },
  ctaSub: { lineHeight: 20 },
  ctaBtn: { marginTop: 4, borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  ctaBtnText: { fontWeight: '700' },
  noImageContainer: { 
    height: 360, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1,
    gap: 12,
    paddingHorizontal: 20,
  },
  noImageText: {
    fontSize: 18,
    fontWeight: '700',
  },
  noImageSubtext: {
    fontSize: 14,
  },
  sliderContainer: {
    gap: 12,
  },
  imageDisplayContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 360,
    position: 'relative',
  },
  displayImage: {
    width: '100%',
    height: '100%',
  },
  generatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  generatingText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  generatingSubtext: {
    fontSize: 12,
  },
  imageButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  viewImageBtn: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
  },
  viewImageBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
});


