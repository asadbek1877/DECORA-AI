import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

interface PremiumInputProps extends TextInputProps {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  label?: string;
  containerStyle?: ViewStyle;
}

export const PremiumInput = ({ icon, label, containerStyle, style, placeholder, value, ...props }: PremiumInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const { mode, colors: theme } = useThemeStore();
  const displayLabel = label || placeholder;
  const hasValue = value && value.length > 0;
  const isDark = mode === 'dark';

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Floating label */}
      {displayLabel && (hasValue || isFocused) && (
        <Text style={[styles.floatingLabel, { color: theme.primary, backgroundColor: theme.bg }]}>{displayLabel}</Text>
      )}
      <View
        style={[
          styles.container,
          {
            borderColor: isFocused ? theme.primary : theme.border,
            backgroundColor: theme.surface,
          },
          isFocused && styles.containerFocused,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={theme.primary}
            style={styles.icon}
          />
        )}
        <TextInput
          placeholder={hasValue || isFocused ? '' : placeholder}
          placeholderTextColor={theme.textSecondary}
          value={value}
          style={[
            styles.input,
            { color: theme.text },
            icon ? styles.inputWithIcon : null,
            style,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -8,
    left: 16,
    zIndex: 10,
    fontSize: 11,
    fontWeight: '600',
    color: '#1D1D1F',
    backgroundColor: '#F8FFFE',
    paddingHorizontal: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
  },
  containerFocused: {
    borderColor: '#1D1D1F',
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1D1D1F',
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
});
