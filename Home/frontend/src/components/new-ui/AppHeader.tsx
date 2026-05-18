import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Image, Platform, StatusBar, Modal, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUI } from './designSystem';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore, LANGUAGE_FLAGS, LANGUAGE_NAMES } from '../../store/languageStore';
import { safeRouterBack } from '../../utils/navigation';

type AppHeaderProps = {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
  onBack?: () => void;
};

const ADMIN_PASSWORD = 'admin2024';

export function AppHeader({ title, showSearch = false, showBack = false, onBack }: AppHeaderProps) {
  const router = useRouter();
  const { colors, isDark } = useUI();
  const { user } = useAuthStore();
  const { t, lang, setLanguage } = useLanguageStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [langVisible, setLangVisible] = useState(false);
  const [adminPromptVisible, setAdminPromptVisible] = useState(false);
  const [adminPass, setAdminPass] = useState('');

  const displayTitle = title || 'Decora AI';

  const MENU_ITEMS = [
    { label: t.home || 'Home', icon: 'home-outline' as const, path: '/' },
    { label: t.createDesign || 'Create Design', icon: 'sparkles-outline' as const, path: '/upload' },
    { label: t.gallery || 'Gallery', icon: 'images-outline' as const, path: '/history' },    
    { label: t.settings || 'Settings', icon: 'settings-outline' as const, path: '/settings' },
  ];

  const LANGUAGES = ['uz', 'ru', 'en', 'jp'] as const;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    safeRouterBack(router as any, '/');
  };

  const openCamera = async () => {
    setMenuVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();       
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      router.push({ pathname: '/upload', params: { photo: result.assets[0].uri } } as any);
    }
  };

  const handleAdminAccess = () => {
    if (adminPass === ADMIN_PASSWORD) {
      setAdminPromptVisible(false);
      setAdminPass('');
      router.push('/admin' as any);
    } else {
      Alert.alert('Error', 'Wrong password');
    }
  };

  return (
    <>
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(14,17,23,0.95)' : 'rgba(248,249,250,0.95)' }]}>
        <View style={styles.left}>
          {showBack ? (
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.surfaceSoft }]} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />      
            </Pressable>
          ) : (
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.surfaceSoft }]} onPress={() => setMenuVisible(true)}>
              <Ionicons name="menu" size={20} color={colors.text} />
            </Pressable>
          )}
          <Text style={[styles.logo, { color: colors.text }]}>{displayTitle}</Text>
        </View>

        <View style={styles.right}>
          {showSearch && (
            <Pressable style={[styles.iconBtnSm, { backgroundColor: colors.surfaceSoft }]}>
              <Ionicons name="search" size={18} color={colors.text} />
            </Pressable>
          )}
          
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary + '30', alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
          )}
        </View>
      </View>

      {/* Main Menu */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>{t.menu || 'Menu'}</Text>
              <Pressable onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            {MENU_ITEMS.map((item) => (
              <Pressable key={item.label} style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push(item.path as any); }}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />  
                <Text style={[styles.menuItemText, { color: colors.text }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </Pressable>
            ))}
            <Pressable style={styles.menuItem} onPress={openCamera}>
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t.takePhoto || 'Take Photo'}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
            <Pressable style={[styles.menuItemAdmin, { borderTopColor: colors.border }]} onPress={() => { setMenuVisible(false); setLangVisible(true); }}>      
              <Text style={styles.flagText}>{LANGUAGE_FLAGS[lang as keyof typeof LANGUAGE_FLAGS]}</Text>       
              <Text style={[styles.menuItemText, { color: colors.text }]}>{t.language || 'Language'}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Language Picker */}
      <Modal visible={langVisible} transparent animationType="fade" onRequestClose={() => setLangVisible(false)}>
        <TouchableOpacity style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} activeOpacity={1} onPress={() => setLangVisible(false)}>
          <View style={[styles.langContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.langTitle, { color: colors.text }]}>{t.language || 'Language'}</Text>
            {LANGUAGES.map((l) => {
              const isActive = lang === l;
              return (
                <Pressable
                  key={l}
                  style={[styles.langItem, isActive && { backgroundColor: isDark ? 'rgba(108,92,231,0.15)' : 'rgba(53,37,205,0.08)' }]}
                  onPress={() => { setLanguage(l as any); setLangVisible(false); }}    
                >
                  <Text style={styles.langFlag}>{LANGUAGE_FLAGS[l as keyof typeof LANGUAGE_FLAGS]}</Text>      
                  <Text style={[styles.langName, { color: colors.text }]}>{LANGUAGE_NAMES[l as keyof typeof LANGUAGE_NAMES]}</Text>
                  {isActive && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Admin Password Prompt */}
      <Modal visible={adminPromptVisible} transparent animationType="fade" onRequestClose={() => setAdminPromptVisible(false)}>
        <TouchableOpacity style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} activeOpacity={1} onPress={() => setAdminPromptVisible(false)}>    
          <View style={[styles.adminPrompt, { backgroundColor: colors.surface }]}>
            <Text style={[styles.adminPromptTitle, { color: colors.text }]}>Admin Access</Text>
            <Text style={[styles.adminPromptSub, { color: colors.muted }]}>Enter admin password to continue</Text>
            <TextInput
              style={[styles.adminInput, { backgroundColor: colors.inputBg, color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={adminPass}
              onChangeText={setAdminPass}
              autoFocus
            />
            <View style={styles.adminBtns}>
              <Pressable style={[styles.adminCancelBtn, { backgroundColor: colors.surfaceSoft }]} onPress={() => { setAdminPromptVisible(false); setAdminPass(''); }}>
                <Text style={[styles.adminCancelText, { color: colors.text }]}>{t.cancel || 'Cancel'}</Text>
              </Pressable>
              <Pressable style={[styles.adminConfirmBtn, { backgroundColor: colors.primary }]} onPress={handleAdminAccess}>
                <Text style={styles.adminConfirmText}>{t.confirm || 'Confirm'}</Text>        
              </Pressable>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 50;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: STATUSBAR_HEIGHT + 8,
    paddingBottom: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  iconBtnSm: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  langBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  flagText: { fontSize: 20 },
  logo: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { width: '80%', borderRadius: 24, paddingVertical: 20, paddingHorizontal: 16 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, marginBottom: 16 },
  menuTitle: { fontSize: 20, fontWeight: '800' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, gap: 12 },
  menuItemText: { flex: 1, fontSize: 16, fontWeight: '600' },
  menuItemAdmin: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, gap: 12, borderTopWidth: 1, marginTop: 8, paddingTop: 16 },
  langContainer: { width: '80%', borderRadius: 24, padding: 20, gap: 8 },
  langTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8, paddingHorizontal: 8 },
  langItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, gap: 12 },
  langFlag: { fontSize: 24 },
  langName: { flex: 1, fontSize: 16, fontWeight: '600' },
  adminPrompt: { width: '85%', borderRadius: 24, padding: 24 },
  adminPromptTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  adminPromptSub: { fontSize: 13, marginBottom: 16 },
  adminInput: { height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, marginBottom: 20 },
  adminBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  adminCancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  adminCancelText: { fontWeight: '700' },
  adminConfirmBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  adminConfirmText: { color: '#fff', fontWeight: '700' },
});
