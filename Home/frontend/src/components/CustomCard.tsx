import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { colors } from '../theme/colors';

interface CustomCardProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  glassmorphism?: boolean;
  padding?: number;
}

export const CustomCard: React.FC<CustomCardProps> = ({
  children,
  onPress,
  style,
  glassmorphism = true,
  padding = 16,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      style={[
        styles.card,
        glassmorphism && styles.glassmorphism,
        { padding },
        style,
      ]}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  glassmorphism: {
    backgroundColor: colors.gold10,
    borderColor: colors.gold20,
    backdropFilter: 'blur(10px)',
  },
});
