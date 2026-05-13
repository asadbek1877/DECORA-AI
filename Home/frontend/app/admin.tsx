import React, { useRef, useEffect } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../src/components/new-ui/AppHeader';
import { ui } from '../src/components/new-ui/designSystem';
import { Ionicons } from '@expo/vector-icons';

function FadeIn({ delay = 0, children, style }: { delay?: number; children: React.ReactNode; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[{ opacity, transform: [{ translateY: ty }] }, style]}>{children}</Animated.View>;
}

export default function AdminScreen() {
  const router = useRouter();

  return (
    <View style={s.safe}>
      <AppHeader title="Admin Panel" showBack />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <FadeIn delay={20}>
          <View style={s.activityCard}>
            <Text style={s.activityHeading}>Recent Activity</Text>
            <View style={s.activityRow}>
              <View style={s.activityDot} />
              <View>
                <Text style={s.activityUser}>Alex Thompson</Text>
                <Text style={s.activityAction}>Uploaded new minimal design</Text>
                <Text style={s.activityTime}>10 minutes ago</Text>
              </View>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={50}>
          <Text style={s.heading}>System Administration</Text>
          <Text style={s.sub}>View and manage system settings, users, and API keys.</Text>
        </FadeIn>

        <FadeIn delay={150}>
          <View style={s.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={ui.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.infoTitle}>Welcome Admin</Text>
              <Text style={s.infoText}>Advanced admin panels will be activated when back-office metrics integrate fully.</Text>
            </View>
          </View>
        </FadeIn>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ui.colors.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 60, gap: 16 },

  activityCard: {
    backgroundColor: ui.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ui.colors.border,
    padding: 16,
    marginBottom: 8,
  },
  activityHeading: { fontSize: 16, fontWeight: '700', color: ui.colors.text, marginBottom: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: ui.colors.border },
  activityDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ui.colors.primary },
  activityUser: { fontSize: 13, fontWeight: '700', color: ui.colors.text },     
  activityAction: { fontSize: 13, color: ui.colors.text, marginVertical: 2 },   
  activityTime: { fontSize: 11, color: ui.colors.muted },

  heading: { fontSize: 24, fontWeight: '800', color: ui.colors.text },
  sub: { fontSize: 14, color: ui.colors.muted, marginTop: 4, lineHeight: 20 },  

  infoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#1e3a8a', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#1e3a8a', lineHeight: 18 },
});
