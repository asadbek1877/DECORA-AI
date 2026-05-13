import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { CustomCard } from './CustomCard';

interface DrawerItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

const DrawerItem: React.FC<DrawerItemProps> = ({
  icon,
  label,
  onPress,
  isLast,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.drawerItem,
      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
    ]}
    activeOpacity={0.7}
  >
    <Ionicons name={icon as any} size={22} color={colors.primary} />
    <Text style={styles.drawerItemText}>{label}</Text>
    <Ionicons
      name="chevron-forward"
      size={18}
      color={colors.textSecondary}
    />
  </TouchableOpacity>
);

export const DrawerContent: React.FC = () => {
  const router = useRouter();

  const handleLanguagePress = useCallback(() => {
    Alert.alert(
      'Til o\'zgartirish',
      "O'zbek, English, Русский orasidan tanlang"
    );
  }, []);

  const handleCameraPress = useCallback(() => {
    router.push('/upload' as any);
  }, [router]);

  const handleHelpPress = useCallback(() => {
    router.push('/admin' as any);
  }, [router]);

  const handleSupportPress = useCallback(() => {
    Alert.alert(
      'Biz bilan aloqa',
      'Savol yoki taklif bo\'lsa, support@decore.uz ga yozib boring',
      [
        { text: 'Yopish', onPress: () => {} },
        {
          text: 'Email ochdirish',
          onPress: () => {
            console.log('Opening email');
          },
        },
      ]
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>DECORE</Text>
        <Text style={styles.headerSubtitle}>Interior AI</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Secondary Actions Group */}
        <Text style={styles.groupTitle}>Qo'shimcha</Text>
        <CustomCard style={styles.drawerGroup} padding={0}>
          <DrawerItem
            icon="globe"
            label="Til o'zgartirish"
            onPress={handleLanguagePress}
            isLast={false}
          />
          <DrawerItem
            icon="camera"
            label="Tez kamera"
            onPress={handleCameraPress}
            isLast={false}
          />
          <DrawerItem
            icon="help-circle"
            label="Yordam / FAQ"
            onPress={handleHelpPress}
            isLast={false}
          />
          <DrawerItem
            icon="chatbox-ellipses"
            label="Biz bilan aloqa"
            onPress={handleSupportPress}
            isLast={true}
          />
        </CustomCard>

        {/* Info Section */}
        <CustomCard style={styles.infoCard} padding={16}>
          <View style={styles.infoContent}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.primary}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.infoTitle}>DECORE Haqida</Text>
            <Text style={styles.infoText}>
              Zamonaviy AI texnologiyasi bilan xonangizni qayta dizayn qiling. Premium
              interior dizayn hizmatiga kirish.
            </Text>
          </View>
        </CustomCard>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>DECORE v1.0.0</Text>
        <Text style={styles.footerSubtext}>© 2026 Barcha huquqlar himoyalangan</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  drawerGroup: {
    marginBottom: 24,
    padding: 0,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  drawerItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  infoCard: {
    marginBottom: 20,
  },
  infoContent: {
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  footerSubtext: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
