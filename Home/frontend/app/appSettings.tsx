import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { useUI } from '../src/components/new-ui/designSystem';
import { useLanguageStore, LANGUAGE_FLAGS, LANGUAGE_NAMES, Language } from '../src/store/languageStore';
import { useThemeStore } from '../src/store/themeStore';
import { ScreenWrapper, FadeInView } from '../src/components/new-ui/ScreenWrapper';
import { AnimatedPressable } from '../src/components/new-ui/AnimatedPressable';

function SettingRow({ icon, title, subtitle, onPress, trailing, colors, isLast }: {
  icon: string; title: string; subtitle?: string; onPress?: () => void;
  trailing?: React.ReactNode; colors: any; isLast?: boolean;
}) {
  return (
    <Pressable style={[s.row, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]} onPress={onPress}>
      <View style={s.rowLeft}>
        <View style={[s.rowIcon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.rowTitle, { color: colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[s.rowSub, { color: colors.muted }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {trailing || (onPress && <Ionicons name="chevron-forward" size={18} color={colors.muted} />)}
    </Pressable>
  );
}

const LANGUAGES: Language[] = ['uz', 'ru', 'en', 'jp'];

export default function AppSettingsScreen() {
  const { colors, isDark } = useUI();
  const { t, lang, setLanguage } = useLanguageStore();
  const { mode, toggleTheme } = useThemeStore();
  const [highRes, setHighRes] = useState(true);
  const [notifs, setNotifs] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleClearCache = () => {
    Alert.alert(t.clearCache, t.cacheCleared);
  };

  return (
    <View style={[s.safe, { backgroundColor: colors.bg }]}>
      <AppHeader title={t.appSettings} showBack />
      <ScreenWrapper>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Appearance */}
          <FadeInView delay={40}>
            <Text style={[s.sectionLabel, { color: colors.muted }]}>{t.appearance.toUpperCase()}</Text>
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SettingRow
                icon="moon-outline"
                title={t.darkMode}
                colors={colors}
                trailing={
                  <Switch
                    value={mode === 'dark'}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#e0e0e0', true: colors.primary }}
                    thumbColor="#fff"
                  />
                }
              />
              <SettingRow
                icon="language-outline"
                title={t.language}
                subtitle={LANGUAGE_FLAGS[lang] + ' ' + LANGUAGE_NAMES[lang]}
                colors={colors}
                isLast
                trailing={
                  <View style={s.langRow}>
                    {LANGUAGES.map((l) => (
                      <AnimatedPressable
                        key={l}
                        onPress={() => setLanguage(l)}
                        style={[s.langFlag, lang === l && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                        pressScale={0.9}
                        duration={80}
                      >
                        <Text style={s.langFlagText}>{LANGUAGE_FLAGS[l]}</Text>
                      </AnimatedPressable>
                    ))}
                  </View>
                }
              />
            </View>
          </FadeInView>

          {/* General */}
          <FadeInView delay={120}>
            <Text style={[s.sectionLabel, { color: colors.muted }]}>{t.general.toUpperCase()}</Text>
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SettingRow
                icon="notifications-outline"
                title={t.notifications}
                subtitle={t.notificationsDesc}
                colors={colors}
                trailing={
                  <Switch value={notifs} onValueChange={setNotifs} trackColor={{ false: '#e0e0e0', true: colors.primary }} thumbColor="#fff" />
                }
              />
              <SettingRow
                icon="image-outline"
                title={t.highResolution}
                subtitle={t.highResDesc}
                colors={colors}
                trailing={
                  <Switch value={highRes} onValueChange={setHighRes} trackColor={{ false: '#e0e0e0', true: colors.primary }} thumbColor="#fff" />
                }
              />
              <SettingRow
                icon="save-outline"
                title={t.autoSave}
                subtitle={t.autoSaveDesc}
                colors={colors}
                isLast
                trailing={
                  <Switch value={autoSave} onValueChange={setAutoSave} trackColor={{ false: '#e0e0e0', true: colors.primary }} thumbColor="#fff" />
                }
              />
            </View>
          </FadeInView>

          {/* Data & Storage */}
          <FadeInView delay={200}>
            <Text style={[s.sectionLabel, { color: colors.muted }]}>{t.dataAndStorage.toUpperCase()}</Text>
            <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <SettingRow
                icon="trash-outline"
                title={t.clearCache}
                subtitle={t.clearCacheDesc}
                colors={colors}
                onPress={handleClearCache}
                isLast
              />
            </View>
          </FadeInView>

          {/* App Version */}
          <FadeInView delay={260}>
            <View style={s.versionWrap}>
              <Text style={[s.versionLabel, { color: colors.muted }]}>{t.appVersion}</Text>
              <Text style={[s.versionText, { color: colors.muted }]}>Decora AI v2.4.0</Text>
            </View>
          </FadeInView>
        </ScrollView>
      </ScreenWrapper>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40, gap: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, paddingLeft: 4 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  langRow: { flexDirection: 'row', gap: 8 },
  langFlag: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  langFlagText: { fontSize: 22 },
  versionWrap: { alignItems: 'center', gap: 4, paddingVertical: 16 },
  versionLabel: { fontSize: 11, fontWeight: '700' },
  versionText: { fontSize: 13, fontWeight: '600' },
});
