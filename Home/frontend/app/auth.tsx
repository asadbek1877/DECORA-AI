import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import { safeRouterBack } from '../src/utils/navigation';

export default function AuthScreen() {
  const router = useRouter();
  const { register, login, isLoading, error, clearError } = useAuthStore();

  const [isLogin, setIsLogin] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const primaryScale = useRef(new Animated.Value(1)).current;
  const socialGoogleScale = useRef(new Animated.Value(1)).current;
  const socialAppleScale = useRef(new Animated.Value(1)).current;

  const pressIn = (value: Animated.Value) => {
    Animated.spring(value, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = (value: Animated.Value) => {
    Animated.spring(value, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const submit = async () => {
    clearError();

    if (isLogin) {
      await login(email.trim(), password);
    } else {
      await register(email.trim(), fullName.trim(), password);
    }

    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      // For new registrations, show onboarding
      if (!isLogin) {
        router.replace('/onboarding' as any);
      } else {
        router.replace('/' as any);
      }
    }
  };

  const switchMode = () => {
    setIsLogin((prev) => !prev);
    clearError();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable 
                style={styles.backButton} 
                onPress={() => {
                  safeRouterBack(router as any, '/');
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#1a1c1d" />
              </Pressable>
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.title}>
                {isLogin ? 'Welcome back' : 'Join the'}
                {!isLogin ? '\nAtelier' : ''}
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? 'Sign in to continue your interior design journey.'
                  : 'Design your dream space with artificial intelligence.'}
              </Text>
            </View>

            <View style={styles.formSection}>
              {!isLogin && (
                <View style={styles.fieldWrap}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#a0a0aa"
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>
              )}

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#a0a0aa"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrap}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                    placeholderTextColor="#a0a0aa"
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((v) => !v)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#8a8a94"
                    />
                  </Pressable>
                </View>
              </View>

              {!!error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#b42318" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Animated.View style={{ transform: [{ scale: primaryScale }] }}>
                <Pressable
                  style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                  onPress={submit}
                  onPressIn={() => pressIn(primaryScale)}
                  onPressOut={() => pressOut(primaryScale)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {isLogin ? 'Sign In' : 'Create Account'}
                    </Text>
                  )}
                </Pressable>
              </Animated.View>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialRow}>
                <Animated.View style={{ flex: 1, transform: [{ scale: socialGoogleScale }] }}>
                  <Pressable
                    style={[styles.socialButton, styles.socialLight]}
                    onPressIn={() => pressIn(socialGoogleScale)}
                    onPressOut={() => pressOut(socialGoogleScale)}
                  >
                    <Ionicons name="logo-google" size={18} color="#1a1c1d" />
                    <Text style={styles.socialLightText}>Google</Text>
                  </Pressable>
                </Animated.View>
                <Animated.View style={{ flex: 1, transform: [{ scale: socialAppleScale }] }}>
                  <Pressable
                    style={[styles.socialButton, styles.socialDark]}
                    onPressIn={() => pressIn(socialAppleScale)}
                    onPressOut={() => pressOut(socialAppleScale)}
                  >
                    <Ionicons name="logo-apple" size={18} color="#ffffff" />
                    <Text style={styles.socialDarkText}>Apple</Text>
                  </Pressable>
                </Animated.View>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <Pressable onPress={switchMode}>
                <Text style={styles.footerLink}>{isLogin ? 'Create Account' : 'Login'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f9f9fa',
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f0f0f3',
  },
  titleSection: {
    paddingTop: 8,
    paddingBottom: 28,
  },
  title: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '800',
    letterSpacing: -1.5,
    color: '#1a1c1d',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#474554',
    maxWidth: 320,
  },
  formSection: {
    gap: 12,
  },
  fieldWrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1c1d',
    paddingHorizontal: 4,
  },
  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f3f3f4',
    paddingHorizontal: 16,
    color: '#1a1c1d',
    fontSize: 15,
  },
  passwordWrap: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 18,
  },
  errorBox: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f2c8c4',
    backgroundColor: '#fff1ef',
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    flex: 1,
    color: '#b42318',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 8,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c5ce7',
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e1e7',
  },
  dividerText: {
    color: '#9a9aa4',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialRow: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#efeff3',
  },
  socialDark: {
    backgroundColor: '#1a1c1d',
  },
  socialLightText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1c1d',
  },
  socialDarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  footerText: {
    color: '#474554',
    fontSize: 14,
    fontWeight: '600',
  },
  footerLink: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '800',
  },
});
