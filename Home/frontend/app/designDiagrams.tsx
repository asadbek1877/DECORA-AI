import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { ScreenWrapper, FadeInView } from '../src/components/new-ui/ScreenWrapper';
import { useUI } from '../src/components/new-ui/designSystem';
import { AnimatedPressable } from '../src/components/new-ui/AnimatedPressable';
import { BeforeAfterSlider } from '../src/components/new-ui/BeforeAfterSlider';

export default function DesignDiagramsScreen() {
  const { colors, isDark } = useUI();
  const [selectedDiagram, setSelectedDiagram] = useState<number>(0);

  const diagrams = [
    {
      id: 1,
      name: 'Space Planning',
      description: 'Optimize your layout and flow',
      icon: 'grid' as const,
    },
    {
      id: 2,
      name: 'Color Scheme',
      description: 'Harmonious color combinations',
      icon: 'color-palette' as const,
    },
    {
      id: 3,
      name: 'Lighting Design',
      description: 'Perfect illumination strategy',
      icon: 'bulb' as const,
    },
    {
      id: 4,
      name: 'Furniture Layout',
      description: 'Optimal furniture placement',
      icon: 'cube' as const,
    },
  ];

  return (
    <View style={[s.safe, { backgroundColor: colors.bg }]}>
      <AppHeader title="Design Diagrams" showBack />

      <ScreenWrapper>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {/* DIAGRAM SELECTOR */}
          <FadeInView delay={0}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.tabsContainer}
            >
              {diagrams.map((diagram, idx) => (
                <Pressable
                  key={diagram.id}
                  style={[
                    s.tab,
                    selectedDiagram === idx && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedDiagram(idx)}
                >
                  <Ionicons
                    name={diagram.icon}
                    size={18}
                    color={selectedDiagram === idx ? '#fff' : colors.text}
                  />
                  <Text
                    style={[
                      s.tabText,
                      selectedDiagram === idx && { color: '#fff', fontWeight: '800' },
                    ]}
                  >
                    {diagram.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </FadeInView>

          {/* DIAGRAM CONTENT */}
          <FadeInView delay={100}>
            <View style={[s.diagramCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={s.diagramHeader}>
                <View>
                  <Text style={[s.diagramName, { color: colors.text }]}>
                    {diagrams[selectedDiagram].name}
                  </Text>
                  <Text style={[s.diagramDesc, { color: colors.muted }]}>
                    {diagrams[selectedDiagram].description}
                  </Text>
                </View>
                <View
                  style={[
                    s.diagramIcon,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Ionicons
                    name={diagrams[selectedDiagram].icon}
                    size={32}
                    color={colors.primary}
                  />
                </View>
              </View>

              {/* Different content based on selected diagram */}
              {selectedDiagram === 0 && <SpacePlanningContent colors={colors} />}
              {selectedDiagram === 1 && <ColorSchemeContent colors={colors} />}
              {selectedDiagram === 2 && <LightingDesignContent colors={colors} />}
              {selectedDiagram === 3 && <FurnitureLayoutContent colors={colors} />}
            </View>
          </FadeInView>

          {/* COMPARE BEFORE/AFTER */}
          <FadeInView delay={200}>
            <View style={s.comparisonSection}>
              <Text style={[s.sectionTitle, { color: colors.text }]}>
                Implementation Preview
              </Text>
              <View style={s.sliderWrapper}>
                <BeforeAfterSlider
                  beforeImage={{
                    uri: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=400',
                  }}
                  afterImage={{
                    uri: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400',
                  }}
                  height={300}
                />
              </View>
            </View>
          </FadeInView>

          {/* EXPORT DIAGRAM */}
          <FadeInView delay={300}>
            <AnimatedPressable
              style={[s.exportBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="download" size={18} color="#fff" />
              <Text style={s.exportBtnText}>Export Diagram as PDF</Text>
            </AnimatedPressable>
          </FadeInView>

          <View style={{ height: 60 }} />
        </ScrollView>
      </ScreenWrapper>

      <BottomNav active="home" />
    </View>
  );
}

// Content components
function SpacePlanningContent({ colors }: any) {
  return (
    <View style={s.contentContainer}>
      <View style={[s.gridPlanning, { borderColor: colors.border }]}>
        <View style={[s.gridItem, { backgroundColor: colors.primary + '20' }]}>
          <Text style={s.gridLabel}>Living Area</Text>
        </View>
        <View style={[s.gridItem, { backgroundColor: colors.primary + '15' }]}>
          <Text style={s.gridLabel}>Kitchen</Text>
        </View>
        <View style={[s.gridItem, { backgroundColor: colors.primary + '10' }]}>
          <Text style={s.gridLabel}>Bedroom</Text>
        </View>
        <View style={[s.gridItem, { backgroundColor: colors.primary + '05' }]}>
          <Text style={s.gridLabel}>Bathroom</Text>
        </View>
      </View>
      <Text style={[s.contentText, { color: colors.text }]}>
        Optimize your space with strategic furniture placement and clear traffic flow.
      </Text>
    </View>
  );
}

function ColorSchemeContent({ colors }: any) {
  const colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  return (
    <View style={s.contentContainer}>
      <View style={s.colorPalette}>
        {colorPalette.map((color, idx) => (
          <View key={idx} style={s.colorBox}>
            <View style={[s.colorSwatch, { backgroundColor: color }]} />
            <Text style={s.colorCode}>{color}</Text>
          </View>
        ))}
      </View>
      <Text style={[s.contentText, { color: colors.text }]}>
        Create harmony with complementary colors that work together beautifully.
      </Text>
    </View>
  );
}

function LightingDesignContent({ colors }: any) {
  return (
    <View style={s.contentContainer}>
      <View style={[s.lightingGrid, { borderColor: colors.border }]}>
        <View style={[s.lightingZone, { backgroundColor: colors.primary + '30' }]}>
          <Ionicons name="bulb" size={24} color={colors.primary} />
          <Text style={s.zoneLabel}>Ambient</Text>
        </View>
        <View style={[s.lightingZone, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="bulb" size={24} color={colors.primary} />
          <Text style={s.zoneLabel}>Task</Text>
        </View>
        <View style={[s.lightingZone, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="bulb" size={24} color={colors.primary} />
          <Text style={s.zoneLabel}>Accent</Text>
        </View>
      </View>
      <Text style={[s.contentText, { color: colors.text }]}>
        Layer your lighting for functionality and ambiance throughout your space.
      </Text>
    </View>
  );
}

function FurnitureLayoutContent({ colors }: any) {
  return (
    <View style={s.contentContainer}>
      <View style={[s.furnitureLayout, { borderColor: colors.border }]}>
        <View style={[s.furnitureItem, { backgroundColor: colors.primary + '25' }]}>
          <Text style={s.furnitureName}>Sofa</Text>
        </View>
        <View style={[s.furnitureItem, { backgroundColor: colors.primary + '20' }]}>
          <Text style={s.furnitureName}>Table</Text>
        </View>
        <View style={[s.furnitureItem, { backgroundColor: colors.primary + '15' }]}>
          <Text style={s.furnitureName}>Chair</Text>
        </View>
      </View>
      <Text style={[s.contentText, { color: colors.text }]}>
        Arrange furniture to maximize comfort and create natural conversation areas.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40, gap: 20 },
  tabsContainer: { gap: 10, paddingRight: 16 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  diagramCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 20 },
  diagramHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  diagramName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  diagramDesc: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  diagramIcon: { width: 60, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contentContainer: { gap: 16 },
  gridPlanning: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  gridItem: { padding: 12, gap: 4, paddingVertical: 16 },
  gridLabel: { fontSize: 12, fontWeight: '700', color: '#000' },
  colorPalette: { flexDirection: 'row', gap: 10 },
  colorBox: { flex: 1, alignItems: 'center', gap: 6 },
  colorSwatch: { width: '100%', height: 50, borderRadius: 8 },
  colorCode: { fontSize: 10, fontWeight: '700', color: '#666' },
  lightingGrid: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10, flexDirection: 'row' },
  lightingZone: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center', gap: 6 },
  zoneLabel: { fontSize: 11, fontWeight: '700' },
  furnitureLayout: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 },
  furnitureItem: { borderRadius: 10, paddingVertical: 20, paddingHorizontal: 12, alignItems: 'center' },
  furnitureName: { fontSize: 13, fontWeight: '700' },
  contentText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  comparisonSection: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  sliderWrapper: { borderRadius: 20, overflow: 'hidden' },
  exportBtn: { flexDirection: 'row', borderRadius: 12, paddingVertical: 14, gap: 8, alignItems: 'center', justifyContent: 'center' },
  exportBtnText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
});
