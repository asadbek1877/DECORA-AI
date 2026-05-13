import React from 'react';
import { View, Text, StyleSheet, Dimensions, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { TopNav } from '../components/TopNav';
import { StatsCard } from '../components/StatsCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { PaginationDots } from '../components/PaginationDots';
import { FooterLinks } from '../components/FooterLinks';
import { BackgroundBlobs } from '../components/BackgroundBlobs';
import { ChairImage } from '../components/ChairImage';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const { width } = Dimensions.get('window');

export const RedefineSpaceScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Abstract Liquid Background */}
      <BackgroundBlobs />
      
      <View style={styles.container}>
        <TopNav />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.mainContent}>
            {/* Left Text Content */}
            <View style={styles.textContent}>
              <Text style={styles.heading}>
                Redefine{'\n'}Your{'\n'}Space
              </Text>
              <Text style={styles.subtitle}>
                Start designing your dream interior with our advanced AI tools and creative insights.
              </Text>
              <PrimaryButton />
            </View>

            {/* Right Stats Card */}
            <View style={styles.rightContent}>
              <StatsCard />
            </View>
          </View>

          {/* 3D Chair Hero Image */}
          <View style={styles.heroImageContainer}>
            <ChairImage />
          </View>

          {/* Bottom Footer Area */}
          <View style={styles.bottomSection}>
            <PaginationDots />
            <FooterLinks />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  mainContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: spacing.lg,
    zIndex: 2,
  },
  textContent: {
    width: '55%',
    zIndex: 3,
  },
  heading: {
    ...typography.h1,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textDark,
    opacity: 0.7,
    marginBottom: spacing.xl,
    paddingRight: spacing.xs,
  },
  rightContent: {
    width: '45%',
    alignItems: 'flex-end',
    paddingTop: spacing.md,
    zIndex: 1,
  },
  heroImageContainer: {
    position: 'absolute',
    right: -30,
    top: 200,
    zIndex: 4,
    shadowColor: '#4A6080',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 10,
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: 200,
    zIndex: 5,
  },
});
