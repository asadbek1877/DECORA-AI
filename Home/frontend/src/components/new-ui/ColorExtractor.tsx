import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useUI } from './designSystem';
import { ColorAnalysis } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ColorExtractorProps {
  colorAnalysis: ColorAnalysis | null;
  isLoading?: boolean;
}

export const ColorExtractor: React.FC<ColorExtractorProps> = ({
  colorAnalysis,
  isLoading = false,
}) => {
  const { colors, isDark } = useUI();

  if (!colorAnalysis) {
    return null;
  }

  const handleShareColors = async () => {
    let shareText = 'Generated Design Color Palette:\n\n';
    shareText += `Primary: ${colorAnalysis.hexCodes.primary || colorAnalysis.primaryColor}\n`;
    shareText += `Secondary: ${colorAnalysis.hexCodes.secondary || colorAnalysis.secondaryColor}\n`;
    shareText += `Accent: ${colorAnalysis.hexCodes.accent || colorAnalysis.accentColor}\n\n`;
    shareText += `All Colors: ${colorAnalysis.palette.join(', ')}`;

    try {
      await Share.share({
        message: shareText,
      });
    } catch (error) {
      console.error('Error sharing colors:', error);
    }
  };

  const handleCopyColor = (color: string) => {
    // In a real app, you'd use react-native-clipboard
    console.log('Copied color:', color);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>🎨 Extracted Colors</Text>
        <TouchableOpacity onPress={handleShareColors}>
          <MaterialCommunityIcons
            name="share-variant"
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Main Color Swatches */}
      <View style={styles.mainColorsContainer}>
        {/* Primary */}
        <TouchableOpacity
          onPress={() => handleCopyColor(colorAnalysis.primaryColor)}
          style={[
            styles.mainColorBox,
            { backgroundColor: colorAnalysis.primaryColor },
          ]}
        >
          <View style={styles.colorLabel}>
            <Text style={styles.colorLabelText}>Primary</Text>
            <Text style={styles.colorCode}>
              {colorAnalysis.hexCodes.primary || colorAnalysis.primaryColor}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Secondary */}
        <TouchableOpacity
          onPress={() => handleCopyColor(colorAnalysis.secondaryColor)}
          style={[
            styles.mainColorBox,
            { backgroundColor: colorAnalysis.secondaryColor },
          ]}
        >
          <View style={styles.colorLabel}>
            <Text style={styles.colorLabelText}>Secondary</Text>
            <Text style={styles.colorCode}>
              {colorAnalysis.hexCodes.secondary || colorAnalysis.secondaryColor}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Accent */}
        <TouchableOpacity
          onPress={() => handleCopyColor(colorAnalysis.accentColor)}
          style={[
            styles.mainColorBox,
            { backgroundColor: colorAnalysis.accentColor },
          ]}
        >
          <View style={styles.colorLabel}>
            <Text style={styles.colorLabelText}>Accent</Text>
            <Text style={styles.colorCode}>
              {colorAnalysis.hexCodes.accent || colorAnalysis.accentColor}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Full Palette */}
      {colorAnalysis.palette.length > 0 && (
        <View style={styles.paletteSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Full Palette ({colorAnalysis.palette.length} colors)
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.paletteScroll}
          >
            <View style={styles.paletteRow}>
              {colorAnalysis.palette.map((color, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleCopyColor(color)}
                  style={styles.colorSwatchWrapper}
                >
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                    ]}
                  />
                  <Text
                    style={[styles.colorSwatchLabel, { color: colors.muted }]}
                    numberOfLines={1}
                  >
                    {color}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* RGB Codes (if available) */}
      {colorAnalysis.rgbCodes && (
        <View style={styles.rgbSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>RGB Values</Text>
          {Object.entries(colorAnalysis.rgbCodes).map(([name, rgb]) => (
            <View key={name} style={styles.rgbRow}>
              <Text style={[styles.rgbLabel, { color: colors.text }]}>
                {name.charAt(0).toUpperCase() + name.slice(1)}:
              </Text>
              <Text style={[styles.rgbValue, { color: colors.muted }]}>
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Copy Hint */}
      <View style={styles.hint}>
        <Text style={[styles.hintText, { color: colors.muted }]}>
          💡 Tap any color to copy it
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  mainColorsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  mainColorBox: {
    flex: 1,
    height: 100,
    borderRadius: 8,
    justifyContent: 'flex-end',
    padding: 10,
  },
  colorLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 6,
    padding: 6,
  },
  colorLabelText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  colorCode: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  paletteSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  paletteScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatchWrapper: {
    alignItems: 'center',
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
  },
  colorSwatchLabel: {
    fontSize: 9,
    maxWidth: 60,
    textAlign: 'center',
  },
  rgbSection: {
    marginBottom: 16,
  },
  rgbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rgbLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  rgbValue: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  hint: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 6,
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
