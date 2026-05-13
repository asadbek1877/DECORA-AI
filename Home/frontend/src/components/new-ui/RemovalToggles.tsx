import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUI } from './designSystem';
import { RemovalOptions } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RemovalTogglesProps {
  options: RemovalOptions;
  onChange: (options: RemovalOptions) => void;
}

interface ToggleOption {
  key: keyof RemovalOptions;
  label: string;
  description: string;
  icon: string;
}

const TOGGLE_OPTIONS: ToggleOption[] = [
  {
    key: 'furniture',
    label: 'Remove Furniture',
    description: 'Clear all furniture from the room',
    icon: 'chair-rolling',
  },
  {
    key: 'decor',
    label: 'Remove Decor',
    description: 'Remove decorative items & accessories',
    icon: 'palette',
  },
  {
    key: 'electronics',
    label: 'Remove Electronics',
    description: 'Remove TVs, lights, appliances',
    icon: 'power-plug',
  },
  {
    key: 'emptyRoom',
    label: 'Empty Room',
    description: 'Keep only walls, floor, windows',
    icon: 'home-outline',
  },
];

export const RemovalToggles: React.FC<RemovalTogglesProps> = ({ options, onChange }) => {
  const { colors, isDark } = useUI();

  const handleToggle = (key: keyof RemovalOptions) => {
    onChange({
      ...options,
      [key]: !options[key],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>🧹 Object Removal</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Remove specific elements from the room
        </Text>
      </View>

      <View style={styles.togglesGrid}>
        {TOGGLE_OPTIONS.map((option) => {
          const isActive = options[option.key];
          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleToggle(option.key)}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: isActive ? colors.primary + '20' : isDark ? '#1a1a1a' : '#f5f5f5',
                  borderColor: isActive ? colors.primary : colors.border,
                  borderWidth: isActive ? 2 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.checkboxContainer,
                  {
                    backgroundColor: isActive ? colors.primary : 'transparent',
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                {isActive && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="#ffffff"
                  />
                )}
              </View>

              <View style={styles.toggleContent}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.toggleDescription, { color: colors.muted }]}>
                  {option.description}
                </Text>
              </View>

              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={24}
                  color={isActive ? colors.primary : colors.muted}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Show applied removals summary */}
      {Object.values(options).some((v) => v) && (
        <View style={[styles.summary, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.summaryTitle, { color: colors.primary }]}>
            Applied Removals:
          </Text>
          <Text style={[styles.summaryText, { color: colors.text }]}>
            {[
              options.furniture && '❌ Furniture',
              options.decor && '❌ Decor',
              options.electronics && '❌ Electronics',
              options.emptyRoom && '📦 Empty Room',
            ]
              .filter(Boolean)
              .join(' • ')}
          </Text>
        </View>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  togglesGrid: {
    gap: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 12,
  },
  iconContainer: {
    marginLeft: 8,
  },
  summary: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
