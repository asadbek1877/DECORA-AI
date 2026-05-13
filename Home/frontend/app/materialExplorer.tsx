import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { ScreenWrapper, FadeInView } from '../src/components/new-ui/ScreenWrapper';
import { useUI } from '../src/components/new-ui/designSystem';
import { AnimatedPressable } from '../src/components/new-ui/AnimatedPressable';

interface Material {
  id: string;
  name: string;
  category: string;
  colors: string[];
  quality: 'Budget' | 'Standard' | 'Premium';
  price: string;
  sources: string[];
  description: string;
}

const MATERIALS: Material[] = [
  {
    id: '1',
    name: 'Oak Wood',
    category: 'Wood',
    colors: ['#8B7355', '#D2B48C', '#A0826D'],
    quality: 'Standard',
    price: '\$50-200/unit',
    sources: ['IKEA', 'Home Depot', 'Lumber Yard'],
    description: 'Durable hardwood, perfect for furniture and flooring',
  },
  {
    id: '2',
    name: 'Marble',
    category: 'Stone',
    colors: ['#F5F5F5', '#D3D3D3', '#808080'],
    quality: 'Premium',
    price: '\$100-500/unit',
    sources: ['Marble Suppliers', 'Design Stores'],
    description: 'Elegant and durable, ideal for countertops',
  },
  {
    id: '3',
    name: 'Linen Fabric',
    category: 'Textile',
    colors: ['#F5DEB3', '#D2B48C', '#C19A6B'],
    quality: 'Standard',
    price: '\$10-30/meter',
    sources: ['Fabric Stores', 'Online', 'Wholesalers'],
    description: 'Comfortable and breathable fabric for upholstery',
  },
  {
    id: '4',
    name: 'Stainless Steel',
    category: 'Metal',
    colors: ['#C0C0C0', '#808080', '#A9A9A9'],
    quality: 'Premium',
    price: '\$80-300/sheet',
    sources: ['Metal Suppliers', 'Industrial Stores'],
    description: 'Corrosion-resistant, modern look',
  },
];

export default function MaterialExplorerScreen() {
  const { colors, isDark } = useUI();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const categories = [...new Set(MATERIALS.map(m => m.category))];
  const filteredMaterials = selectedCategory
    ? MATERIALS.filter(m => m.category === selectedCategory)
    : MATERIALS;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Budget':
        return '#10b981';
      case 'Standard':
        return '#f59e0b';
      case 'Premium':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={[s.safe, { backgroundColor: colors.bg }]}>
      <AppHeader title="Material Explorer" showBack />

      <ScreenWrapper>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* CATEGORIES */}
          <FadeInView delay={0}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.categoriesScroll}
              contentContainerStyle={s.categories}
            >
              <Pressable
                style={[
                  s.categoryFilter,
                  !selectedCategory && { backgroundColor: colors.primary },
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[
                  s.categoryFilterText,
                  !selectedCategory && { color: '#fff', fontWeight: '800' }
                ]}>
                  All
                </Text>
              </Pressable>

              {categories.map(cat => (
                <Pressable
                  key={cat}
                  style={[
                    s.categoryFilter,
                    selectedCategory === cat && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[
                    s.categoryFilterText,
                    selectedCategory === cat && { color: '#fff', fontWeight: '800' }
                  ]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </FadeInView>

          {/* MATERIALS GRID */}
          <FadeInView delay={100}>
            <View style={s.materialsGrid}>
              {filteredMaterials.map(material => (
                <AnimatedPressable
                  key={material.id}
                  style={[s.materialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setSelectedMaterial(material)}
                >
                  {/* Colors showcase */}
                  <View style={s.colorRow}>
                    {material.colors.map((color, idx) => (
                      <View
                        key={idx}
                        style={[s.colorSwatch, { backgroundColor: color }]}
                      />
                    ))}
                  </View>

                  <Text style={[s.materialName, { color: colors.text }]}>
                    {material.name}
                  </Text>

                  <View style={s.qualityBadge}>
                    <View
                      style={[
                        s.qualityDot,
                        { backgroundColor: getQualityColor(material.quality) },
                      ]}
                    />
                    <Text style={[s.qualityText, { color: getQualityColor(material.quality) }]}>
                      {material.quality}
                    </Text>
                  </View>

                  <Text style={[s.materialPrice, { color: colors.text }]}>
                    {material.price}
                  </Text>
                </AnimatedPressable>
              ))}
            </View>
          </FadeInView>

          {/* MATERIAL DETAIL */}
          {selectedMaterial && (
            <FadeInView delay={200}>
              <View style={[s.detailCard, { backgroundColor: colors.primary }]}>
                <View style={s.detailHeader}>
                  <View>
                    <Text style={s.detailName}>{selectedMaterial.name}</Text>
                    <Text style={s.detailCategory}>{selectedMaterial.category}</Text>
                  </View>
                  <Pressable
                    onPress={() => setSelectedMaterial(null)}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={24} color="#fff" />
                  </Pressable>
                </View>

                <Text style={s.detailDesc}>{selectedMaterial.description}</Text>

                <Text style={s.sourcesTitle}>Where to Buy:</Text>
                <View style={s.sourcesList}>
                  {selectedMaterial.sources.map((source, idx) => (
                    <View key={idx} style={s.sourceItem}>
                      <Ionicons name="location" size={14} color="#fff" />
                      <Text style={s.sourceText}>{source}</Text>
                    </View>
                  ))}
                </View>

                <View style={s.detailColors}>
                  <Text style={s.colorsTitle}>Available Colors:</Text>
                  <View style={s.colorRow}>
                    {selectedMaterial.colors.map((color, idx) => (
                      <View key={idx} style={s.largeColorSwatch}>
                        <View style={[s.colorSwatchLarge, { backgroundColor: color }]} />
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </FadeInView>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </ScreenWrapper>

      <BottomNav active="home" />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40, gap: 20 },
  categoriesScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  categories: { gap: 10 },
  categoryFilter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryFilterText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  materialsGrid: { gap: 16 },
  materialCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  colorRow: { flexDirection: 'row', gap: 8 },
  colorSwatch: { flex: 1, height: 40, borderRadius: 8 },
  materialName: { fontSize: 16, fontWeight: '800' },
  qualityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qualityDot: { width: 8, height: 8, borderRadius: 4 },
  qualityText: { fontSize: 12, fontWeight: '700' },
  materialPrice: { fontSize: 14, fontWeight: '700' },
  detailCard: { borderRadius: 20, padding: 20, gap: 16 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailName: { fontSize: 24, fontWeight: '900', color: '#fff' },
  detailCategory: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  detailDesc: { color: '#fff', fontSize: 14, fontWeight: '500', lineHeight: 20 },
  sourcesTitle: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  sourcesList: { gap: 8 },
  sourceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sourceText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  detailColors: { gap: 12 },
  colorsTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  largeColorSwatch: { flex: 1 },
  colorSwatchLarge: { height: 60, borderRadius: 12 },
});
