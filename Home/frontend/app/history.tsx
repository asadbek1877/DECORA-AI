import React, { useState, useEffect } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { useDesignStore } from '../src/store/designStore';
import { useAuthStore } from '../src/store/authStore';
import { ScreenWrapper, FadeInView } from '../src/components/new-ui/ScreenWrapper';
import { AnimatedPressable, AnimatedCard } from '../src/components/new-ui/AnimatedPressable';

export default function HistoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useUI();
  const { t } = useLanguageStore();
  const { isAuthenticated } = useAuthStore();
  const { history, loadHistory, historyLoaded } = useDesignStore();
  const [filterStyle, setFilterStyle] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated]);

  const STYLES = ['All', ...Array.from(new Set(history.map(item => item.styleName || 'Modern')))];

  const filteredHistory = filterStyle === 'All' 
    ? history 
    : history.filter(item => item.styleName === filterStyle);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHistory();
    setIsRefreshing(false);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <FadeInView delay={index * 50}>
      <AnimatedCard
        style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => router.push({ pathname: '/result', params: { designId: item.id } } as any)}
      >
        {item.finalImageUrl ? (
          <Image source={{ uri: item.finalImageUrl }} style={s.cardImg} resizeMode="cover" />
        ) : (
          <View style={[s.cardImg, { backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="image-outline" size={32} color={colors.muted} />
          </View>
        )}
        <View style={[s.tagMap, { backgroundColor: colors.primary }]}>
          <Text style={s.tagText}>{item.styleName || 'Generated'}</Text>
        </View>
        <View style={s.cardBody}>
          <Text style={[s.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.roomType || 'Room Design'}</Text>
          <Text style={[s.cardSub, { color: colors.muted }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </AnimatedCard>
    </FadeInView>
  );

  return (
    <View style={[s.safe, { backgroundColor: colors.bg }]}>
      <AppHeader title={t.gallery || 'Gallery'} />

      {!isAuthenticated ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="images-outline" size={60} color={colors.muted} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
            Please log in to view your designs
          </Text>
        </View>
      ) : !historyLoaded ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScreenWrapper>
          <View style={s.headerWrap}>
             <FlatList
               data={STYLES}
               horizontal
               showsHorizontalScrollIndicator={false}
               style={s.filters}
               contentContainerStyle={s.filtersContent}
               keyExtractor={(it) => it}
               renderItem={({ item }) => {
                 const active = filterStyle === item;
                 return (
                   <AnimatedPressable
                     onPress={() => setFilterStyle(item)}
                     style={[
                       s.filterChip,
                       { backgroundColor: isDark ? '#252836' : '#ececf0' },
                       active && { backgroundColor: colors.primary }
                     ]}
                     pressScale={0.94}
                   >
                     <Text style={[
                       s.filterText,
                       { color: isDark ? '#9CA3AF' : '#555468' },
                       active && { color: '#fff' }
                     ]}>{item}</Text>
                   </AnimatedPressable>
                 );
               }}
             />
          </View>

          {filteredHistory.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="image-outline" size={64} color={colors.muted} />
              <Text style={[s.emptyTitle, { color: colors.text }]}>No Designs Yet</Text>
              <Text style={[s.emptySub, { color: colors.muted }]}>Create your first AI room design to see it here.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredHistory}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              contentContainerStyle={s.grid}
              columnWrapperStyle={s.gridRow}
              showsVerticalScrollIndicator={false}
              renderItem={renderItem}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          )}
        </ScreenWrapper>
      )}

      <BottomNav active="gallery" />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  headerWrap: { marginBottom: 12 },
  filters: { flexGrow: 0 },
  filtersContent: { paddingHorizontal: 24, paddingVertical: 10, gap: 8 },
  filterChip: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  filterText: { fontWeight: '700', fontSize: 13 },
  grid: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 4 },
  gridRow: { gap: 16, marginBottom: 16 },
  card: { flex: 1, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  cardImg: { width: '100%', height: 160 },
  tagMap: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  cardSub: { fontSize: 11, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22 }
});

