import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { CustomCard } from '../../src/components/CustomCard';
import { GoldButton } from '../../src/components/GoldButton';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  isLast?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  trailing,
  isLast,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.settingItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {trailing || (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreenProduction() {
  const router = useRouter();
  const [darkModeEnabled] = useState(true); // Locked to dark mode
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [credits, setCredits] = useState(12);

  const handleBuyCredits = () => {
    Alert.alert(
      'Kreditlar Sotib Oling',
      'Kreditlar haqida ko\'proq ma\'lumot olish uchun Tariflar sahifasiga o\'ting',
      [
        { text: "Bekor qilish", onPress: () => {}, style: 'cancel' },
        {
          text: "Tariflar",
          onPress: () => {
            router.push('/admin' as any);
          },
        },
      ]
    );
  };

  const handleProfilePress = () => {
    router.push('/accountInfo' as any);
  };

  const handleLanguagePress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Bekor qilish', "O'zbek", 'English', 'Русский'],
          userInterfaceStyle: 'dark',
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            console.log('Language selected:', ['uz', 'en', 'ru'][buttonIndex - 1]);
          }
        }
      );
    } else {
      Alert.alert('Til o\'zgartirish', "O'zbek, English, Русский orasidan tanlang");
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Kesh o\'chirilsinmi?',
      'Barcha vaqtinchalik fayllar o\'chiriladi. Bu amalni bekor qilib bo\'lmaydi.',
      [
        { text: "Yo'q", onPress: () => {}, style: 'cancel' },
        {
          text: "Ha, o'chirish",
          onPress: () => {
            Alert.alert('Muvaffaqiyat', 'Kesh o\'chirildi');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Sozlamalar"
        showProfile={false}
        showHamburger={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Credit Card */}
        <CustomCard style={styles.creditCard} padding={20} glassmorphism={true}>
          <View style={styles.creditContent}>
            <View>
              <Text style={styles.creditLabel}>KREDIT BALANSI</Text>
              <Text style={styles.creditAmount}>{credits}</Text>
              <Text style={styles.creditUnit}>Kreditlar</Text>
            </View>
            <Ionicons
              name="card"
              size={48}
              color={colors.primary}
              style={{ opacity: 0.3 }}
            />
          </View>
          <GoldButton
            title="Tariflar"
            onPress={handleBuyCredits}
            style={styles.creditButton}
          />
        </CustomCard>

        {/* Account Section */}
        <Text style={styles.groupTitle}>Hisob</Text>
        <CustomCard style={styles.settingGroup} padding={0}>
          <SettingItem
            icon="person"
            title="Profil ma'lumotlari"
            subtitle="Sizning hisob ma'lumotlaringiz"
            onPress={handleProfilePress}
            isLast={false}
          />
          <SettingItem
            icon="mail"
            title="Email manzili"
            subtitle="user@example.com"
            onPress={() => Alert.alert('Email o\'zgartirilmaydi')}
            isLast={true}
          />
        </CustomCard>

        {/* Preferences Section */}
        <Text style={styles.groupTitle}>Tabiiylar</Text>
        <CustomCard style={styles.settingGroup} padding={0}>
          <SettingItem
            icon="contrast"
            title="Rejim"
            subtitle="Qora rejim (o'zgartirilmasi mumkin emas)"
            trailing={
              <Switch
                value={darkModeEnabled}
                onValueChange={() => {}} // Disabled
                disabled={true}
                trackColor={{ false: colors.border, true: colors.gold20 }}
                thumbColor={colors.primary}
              />
            }
            isLast={false}
          />
          <SettingItem
            icon="notifications"
            title="Xabarnomalar"
            subtitle={notificationsEnabled ? "Yoqilgan" : "O'chirilgan"}
            trailing={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.gold20 }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
              />
            }
            isLast={true}
          />
        </CustomCard>

        {/* Language & Region Section */}
        <Text style={styles.groupTitle}>Til va mintaqa</Text>
        <CustomCard style={styles.settingGroup} padding={0}>
          <SettingItem
            icon="globe"
            title="Til"
            subtitle="O'zbek"
            onPress={handleLanguagePress}
            isLast={false}
          />
          <SettingItem
            icon="location"
            title="Mintaqa"
            subtitle="Oʻzbekiston"
            isLast={true}
          />
        </CustomCard>

        {/* Data Section */}
        <Text style={styles.groupTitle}>Ma'lumotlar</Text>
        <CustomCard style={styles.settingGroup} padding={0}>
          <SettingItem
            icon="trash"
            title="Keshni tozalash"
            subtitle="Vaqtinchalik fayllarni o'chirish"
            onPress={handleClearCache}
            isLast={false}
          />
          <SettingItem
            icon="shield"
            title="Shaxsiylik siyosati"
            onPress={() => router.push('/admin' as any)}
            isLast={true}
          />
        </CustomCard>

        {/* Footer */}
        <Text style={styles.footerText}>
          DECORE v1.0.0 {'\n'} © 2026 Barcha huquqlar himoyalangan
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  creditCard: {
    marginBottom: 32,
    gap: 16,
  },
  creditContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  creditLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  creditAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 40,
  },
  creditUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  creditButton: {
    width: '100%',
  },
  settingGroup: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 18,
  },
});
