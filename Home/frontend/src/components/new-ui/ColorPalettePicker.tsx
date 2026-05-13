import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useUI } from './designSystem';
import { ColorPalette } from '../../types';

interface ColorPalettePickerProps {
  palettes: ColorPalette[];
  selectedPalette: ColorPalette | null;
  onSelectPalette: (palette: ColorPalette) => void;
  onLoadPalettes?: () => Promise<void>;
  isLoading?: boolean;
  showCustomOption?: boolean;
}

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({
  palettes,
  selectedPalette,
  onSelectPalette,
  onLoadPalettes,
  isLoading = false,
  showCustomOption = true,
}) => {
  const { colors, isDark } = useUI();
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    onLoadPalettes?.();
  }, [onLoadPalettes]);

  const displayedPalettes = showMore ? palettes : palettes.slice(0, 3);

  const renderPaletteCard = (palette: ColorPalette) => {
    const isSelected = selectedPalette?.id === palette.id;
    return (
      <TouchableOpacity
        key={palette.id}
        onPress={() => onSelectPalette(palette)}
        style={[
          styles.paletteCard,
          {
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          },
        ]}
      >
        {/* Color Swatches */}
        <View style={styles.swatchesContainer}>
          {palette.colors.map((color, idx) => (
            <View
              key={idx}
              style={[
                styles.swatch,
                { backgroundColor: color },
                idx === palette.colors.length - 1 && styles.swatchLast,
              ]}
            />
          ))}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.paletteName, { color: colors.text }]}>{palette.name}</Text>
          {palette.category && (
            <Text style={[styles.category, { color: colors.muted }]}>
              {palette.category.charAt(0).toUpperCase() + palette.category.slice(1)}
            </Text>
          )}
          {palette.likes !== undefined && (
            <Text style={[styles.likes, { color: colors.muted }]}>❤️ {palette.likes}</Text>
          )}
        </View>

        {/* Selection Indicator */}
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>🎨 Color Palettes</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {selectedPalette ? `Selected: ${selectedPalette.name}` : 'Choose a palette'}
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.paletteList}
          contentContainerStyle={styles.paletteListContent}
        >
          {displayedPalettes.map(renderPaletteCard)}
        </ScrollView>
      )}

      {/* Show More Button */}
      {palettes.length > 3 && (
        <TouchableOpacity
          onPress={() => setShowMore(!showMore)}
          style={[styles.showMoreBtn, { borderColor: colors.primary }]}
        >
          <Text style={[styles.showMoreText, { color: colors.primary }]}>
            {showMore ? 'Show Less' : `Show ${palettes.length - 3} More`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Custom Colors Option */}
      {showCustomOption && (
        <TouchableOpacity
          style={[
            styles.customOption,
            { borderColor: colors.border, backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9' },
          ]}
        >
          <Text style={[styles.customText, { color: colors.primary }]}>+ Custom Colors</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  paletteList: {
    marginBottom: 12,
  },
  paletteListContent: {
    gap: 12,
    paddingRight: 16,
  },
  paletteCard: {
    width: 200,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  swatchesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    height: 60,
  },
  swatch: {
    flex: 1,
  },
  swatchLast: {
    marginRight: 0,
  },
  info: {
    marginTop: 8,
  },
  paletteName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  category: {
    fontSize: 11,
    marginBottom: 4,
  },
  likes: {
    fontSize: 11,
  },
  checkmark: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  showMoreBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  customOption: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  customText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
