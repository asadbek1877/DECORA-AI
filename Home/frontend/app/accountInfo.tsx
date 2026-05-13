import React, { useState, useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, TextInput, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';     
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { BottomNav } from '../src/components/new-ui/BottomNav';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore } from '../src/store/languageStore';
import { useAuthStore } from '../src/store/authStore';
import { ScreenWrapper, FadeInView } from '../src/components/new-ui/ScreenWrapper';
import { AnimatedPressable } from '../src/components/new-ui/AnimatedPressable'; 
import { ConfettiCannon } from '../src/components/ConfettiCannon';
import { api } from '../src/api/client';
import { useScrollStore } from '../src/store/scrollStore';
import { useDesignStore } from '../src/store/designStore';

function InfoRow({ icon, label, value, colors, isLast, onChange }: {
  icon: string; label: string; value: string; colors: any; isLast?: boolean; onChange?: (val: string) => void;
}) {
  return (
    <View style={[s.infoRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <View style={[s.infoIcon, { backgroundColor: colors.primary + '15' }]}>   
        <Ionicons name={icon as any} size={18} color={colors.primary} />        
      </View>
      <View style={s.infoContent}>
        <Text style={[s.infoLabel, { color: colors.muted }]}>{label}</Text>     
        {onChange ? (
          <TextInput
            style={[s.infoValue, { color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.border, padding: 0, marginTop: -2 }]}
            value={value}
            onChangeText={onChange}
          />
        ) : (
          <Text style={[s.infoValue, { color: colors.text }]}>{value}</Text>    
        )}
      </View>
    </View>
  );
}

export default function AccountInfoScreen() {
  const { colors, isDark } = useUI();
  const { t } = useLanguageStore();
  const { token, user, isAuthenticated } = useAuthStore();
  const { updateScroll } = useScrollStore();
  const { loadCredits } = useDesignStore();
  const [profile, setProfile] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    avatar: user?.avatarUrl || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {    
    const scrollY = event.nativeEvent.contentOffset.y;
    updateScroll(scrollY);
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadUserProfile();
      loadCredits();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.getProfile();
      if (response?.success && response.data) {
        const userData = response.data;
        useAuthStore.setState({ user: userData });
        setProfile({
          name: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.avatarUrl || ''
        });
      }
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); 
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');       
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setProfile({ ...profile, avatar: result.assets[0].uri });
    }
  };

  const handleSaveProfile = async () => {
    if (!isAuthenticated || !token) return;

    setIsSaving(true);
    try {
      const isLocalFile = profile.avatar.startsWith('file://') || profile.avatar.startsWith('content://');
      const payload = {
        username: profile.name,
        email: profile.email,
        phone: profile.phone,
        ...(isLocalFile && { avatarUri: profile.avatar }),
      };

      const response = await api.updateProfileInfo(payload);
      if (!response || response?.success === false) {
        throw new Error('Failed to save profile');
      }

      await loadUserProfile();

      alert('Profile saved successfully!');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error: any) {
      alert(error?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Now';
  const roleName = user?.role === 'ADMIN' ? 'Admin' : 'Standard Member';
  const credits = user?.credits ?? 0;

  return (
    <View style={[s.safe, { backgroundColor: colors.bg }]}>
      <AppHeader title={t.accountInfo} showBack />
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !isAuthenticated ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="lock-closed" size={60} color={colors.muted} />        
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
            Please log in to edit your profile
          </Text>
        </View>
      ) : (
        <ScreenWrapper>
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <FadeInView delay={40}>
              <View style={s.avatarSection}>
                <Pressable onPress={handlePickAvatar}>
                  <View style={[s.avatarRing, { borderColor: colors.primary }]}>
                    {profile.avatar ? (
                      <Image
                        source={{ uri: profile.avatar }}
                        style={s.avatar}
                        onError={() => setProfile(p => ({ ...p, avatar: '' }))}
                      />
                    ) : (
                      <View style={[s.avatar, { backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person" size={40} color={colors.primary} />
                      </View>
                    )}
                    <View style={[s.editAvatarBadge, { borderColor: colors.bg }]}>
                      <Ionicons name="camera" size={16} color="#fff" />
                    </View>
                  </View>
                </Pressable>
                <TextInput
                  style={[s.name, { color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.border, padding: 0 }]}
                  value={profile.name}
                  onChangeText={(val) => setProfile({ ...profile, name: val })} 
                />
                <View style={[s.badge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[s.badgeText, { color: colors.primary }]}>{roleName}</Text>
                </View>
              </View>
            </FadeInView>

            <FadeInView delay={120}>
              <Text style={[s.sectionLabel, { color: colors.muted }]}>{t.personalInfo.toUpperCase()}</Text>
              <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <InfoRow icon="person-outline" label={t.fullName || 'Name'} value={profile.name} colors={colors} onChange={(val) => setProfile(p => ({ ...p, name: val }))} />
                <InfoRow icon="mail-outline" label={t.email || 'Email'} value={profile.email} colors={colors} />
                <InfoRow icon="calendar-outline" label={t.memberSince || 'Member Since'} value={memberSince} colors={colors} isLast />
              </View>
            </FadeInView>

            <FadeInView delay={200}>
              <Text style={[s.sectionLabel, { color: colors.muted }]}>{t.membership?.toUpperCase() || 'MEMBERSHIP'}</Text>
              <View style={[s.memberCard, { backgroundColor: colors.primary }]}>
                <View style={s.memberRow}>
                  <View>
                    <Text style={s.memberTitle}>{roleName}</Text>        
                    <Text style={s.memberSub}>{t.memberSince || 'Member Since'}: {memberSince}</Text>
                  </View>
                  <View style={s.memberBadge}>
                    <Ionicons name="diamond-outline" size={20} color="#FFD700" />
                  </View>
                </View>
                <View style={s.memberStats}>
                  <View style={s.memberStat}>
                    <Text style={s.memberStatNum}>{credits}</Text>
                    <Text style={s.memberStatLabel}>{t.credits || 'Credits'}</Text>
                  </View>
                </View>
              </View>
            </FadeInView>

            <FadeInView delay={360}>
              <AnimatedPressable
                style={[s.saveBtn, { backgroundColor: colors.primary }]}        
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={s.saveBtnContent}>
                    <Ionicons name="checkmark-done" size={18} color="#fff" />   
                    <Text style={s.saveBtnText}>{t.save || 'Save'}</Text>
                  </View>
                )}
              </AnimatedPressable>
            </FadeInView>
          </ScrollView>
        </ScreenWrapper>
      )}

      {showConfetti && <ConfettiCannon duration={3000} particles={60} />}       
      <BottomNav active="profile" />
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40, gap: 20 },
  avatarSection: { alignItems: 'center', gap: 8, marginBottom: 4 },
  avatarRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, padding: 3 },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  name: { fontSize: 26, fontWeight: '800', marginTop: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },      
  badgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, paddingLeft: 4 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 16 },
  infoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 16, fontWeight: '700' },
  memberCard: { borderRadius: 20, padding: 20, gap: 16 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  memberSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  memberBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  memberStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  memberStat: { alignItems: 'center', flex: 1 },
  memberStatNum: { color: '#fff', fontSize: 28, fontWeight: '800' },
  memberStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  memberStatDivider: { width: 1, height: 40 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 16, alignItems: 'center', gap: 8 },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  saveBtn: { borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, marginTop: 20 },
  saveBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },       
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#10b981', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }
});
