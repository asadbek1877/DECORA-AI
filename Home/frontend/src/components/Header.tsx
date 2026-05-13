import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';

interface HeaderProps {
  title?: string;
  showHamburger?: boolean;
  showProfile?: boolean;
  onHamburgerPress?: () => void;
  onProfilePress?: () => void;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'DECORE',
  showHamburger = false,
  showProfile = false,
  onHamburgerPress,
  onProfilePress,
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      {/* Left - Hamburger Menu */}
      {showHamburger ? (
        <TouchableOpacity
          onPress={onHamburgerPress}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="menu"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      {/* Center - Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Right - Profile */}
      {showProfile ? (
        <TouchableOpacity
          onPress={onProfilePress}
          style={[styles.iconButton, styles.profileButton]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-circle"
            size={32}
            color={colors.primary}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1.5,
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    padding: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  spacer: {
    width: 44,
  },
});
