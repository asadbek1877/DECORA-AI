# DECORE Quick Reference Card 🎯

## Components at a Glance

### 🔘 GoldButton
```tsx
import { GoldButton } from '../src/components/GoldButton';

// Basic
<GoldButton 
  title="Click me" 
  onPress={() => alert('Clicked!')} 
/>

// With states
<GoldButton 
  title="Loading..." 
  loading={true} 
/>

<GoldButton 
  title="Disabled" 
  disabled={true} 
/>

// Outline style
<GoldButton 
  title="Cancel" 
  variant="outline" 
  onPress={() => {}} 
/>
```

---

### 📦 CustomCard
```tsx
import { CustomCard } from '../src/components/CustomCard';

// Basic card
<CustomCard padding={16}>
  <Text>Content</Text>
</CustomCard>

// With glass effect
<CustomCard 
  glassmorphism={true}
  padding={20}
>
  <Text>Premium</Text>
</CustomCard>

// Clickable
<CustomCard 
  onPress={() => navigate()}
  padding={12}
>
  <Image source={...} />
</CustomCard>
```

---

### 🎫 Header
```tsx
import { Header } from '../src/components/Header';

// Simple
<Header title="Screen Title" />

// With controls
<Header
  title="DECORE"
  showHamburger={true}
  showProfile={true}
  onHamburgerPress={() => navigation.openDrawer()}
  onProfilePress={() => navigate('/profile')}
/>
```

---

### 📑 BottomTabBar
```tsx
import { BottomTabBar } from '../src/components/BottomTabBar';

const tabs = [
  { name: 'home', label: 'Home', icon: 'home' },
  { name: 'create', label: 'Create', icon: 'add-circle' },
  { name: 'gallery', label: 'Gallery', icon: 'images' },
  { name: 'settings', label: 'Settings', icon: 'settings' },
];

<BottomTabBar
  tabs={tabs}
  activeTab={activeTab}
  onTabPress={(name) => setActiveTab(name)}
/>
```

---

### 🛩️ DrawerContent
```tsx
import { DrawerContent } from '../src/components/DrawerContent';

<Drawer.Navigator
  drawerContent={() => <DrawerContent />}
>
  {/* Your screens */}
</Drawer.Navigator>
```

---

## Screens at a Glance

### 📱 Upload Screen
**File**: `src/screens/UploadScreenProduction.tsx`

Features:
- Animated camera icon with pulsing effect
- Camera capture & gallery selection
- Image uploading
- "POWERED BY GEMINI ✨" footer

```tsx
import UploadScreenProduction from '../src/screens/UploadScreenProduction';

// In your routing
<Stack.Screen name="upload" component={UploadScreenProduction} />
```

---

### ✏️ Create Design Screen
**File**: `src/screens/CreateDesignScreenProduction.tsx`

Features:
- Image preview with clear button
- 4 style options
- AI model selector
- Intensity slider
- Generate button

```tsx
import CreateDesignScreenProduction from '../src/screens/CreateDesignScreenProduction';

<Stack.Screen name="createDesign" component={CreateDesignScreenProduction} />
```

---

### 🖼️ Gallery Screen
**File**: `src/screens/GalleryScreenProduction.tsx`

Features:
- Dual tabs (Inspiration / My Designs)
- 2-column masonry
- Like button
- Edit/Delete menu

```tsx
import GalleryScreenProduction from '../src/screens/GalleryScreenProduction';

<Stack.Screen name="gallery" component={GalleryScreenProduction} />
```

---

### ⚙️ Settings Screen
**File**: `src/screens/SettingsScreenProduction.tsx`

Features:
- Credit balance card
- Account settings
- Preferences (theme locked)
- Language selection
- Data management

```tsx
import SettingsScreenProduction from '../src/screens/SettingsScreenProduction';

<Stack.Screen name="settings" component={SettingsScreenProduction} />
```

---

## Color System

```tsx
import { colors } from '../src/theme/colors';

// Primary colors
colors.primary        // #D4AF37 Gold
colors.background     // #10141C Midnight Blue
colors.surface        // #1A1E29 Card Color

// Text colors
colors.text           // #FFFFFF White
colors.textSecondary  // #AAB0C3 Light Gray
colors.textMuted      // #808090 Dark Gray

// States
colors.success        // #4ADE80 Green
colors.error          // #F87171 Red
colors.warning        // #FBBF24 Orange
colors.info           // #60A5FA Blue

// Transparency
colors.gold10         // Gold with 10% opacity
colors.white20        // White with 20% opacity
```

---

## Installation

```bash
# Install new navigation dependencies
npm install @react-navigation/drawer @react-navigation/bottom-tabs

# Install slider component
npm install @react-native-community/slider

# If peer dependency issues
npm install --legacy-peer-deps
```

---

## Setup

### 1. Update Root Layout
```tsx
// app/_layout.tsx
import { RootNavigator } from '../src/navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
```

### 2. Map Screens
```tsx
// app/upload.tsx
export { default } from '../src/screens/UploadScreenProduction';

// app/createDesign.tsx
export { default } from '../src/screens/CreateDesignScreenProduction';

// app/gallery.tsx
export { default } from '../src/screens/GalleryScreenProduction';

// app/settings.tsx
export { default } from '../src/screens/SettingsScreenProduction';
```

---

## Common Patterns

### Using Router
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate
router.push('/upload');
router.back();

// With params
router.push({
  pathname: '/createDesign',
  params: { uploadedImage: imageUri }
});
```

### Using Navigation
```tsx
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

// Open drawer
navigation.openDrawer?.();

// Close drawer
navigation.closeDrawer?.();
```

### Alert Dialog
```tsx
import { Alert } from 'react-native';

Alert.alert(
  'Title',
  'Message',
  [
    { text: 'Cancel', onPress: () => {}, style: 'cancel' },
    { text: 'Delete', onPress: () => {}, style: 'destructive' },
  ]
);
```

---

## Styling Quick Tips

### Add Custom Styles
```tsx
import { StyleSheet } from 'react-native';
import { colors } from '../src/theme/colors';

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
  }
});
```

### Spacing Grid
```
4px  = xs
8px  = sm
12px = md
16px = lg
20px = xl
24px = 2xl
```

### Border Radius
```
8px   = small components
12px  = medium cards/buttons
16px  = large sections
20px+ = rounded circles
```

---

## Animation Examples

### Fade In
```tsx
import Animated, { FadeInDown } from 'react-native-reanimated';

<Animated.View entering={FadeInDown}>
  <Text>Fades in</Text>
</Animated.View>
```

### Scale Effect
```tsx
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';

const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));

// Update scale
scale.value = withTiming(1.1, { duration: 300 });
```

---

## TypeScript Prop Types

### GoldButtonProps
```tsx
{
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'filled' | 'outline';
}
```

### CustomCardProps
```tsx
{
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  glassmorphism?: boolean;
  padding?: number;
}
```

### HeaderProps
```tsx
{
  title?: string;
  showHamburger?: boolean;
  showProfile?: boolean;
  onHamburgerPress?: () => void;
  onProfilePress?: () => void;
  style?: ViewStyle;
}
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Module not found" | Check import paths start with `../src/` |
| Colors not showing | Verify `colors.ts` exists in `src/theme/` |
| Navigation broken | Ensure `RootNavigator` in `_layout.tsx` |
| Animations laggy | Install `react-native-reanimated` & rebuild |
| TypeScript errors | Run `npm run test-ts` to check |

---

## File Locations

```
✅ Components:  src/components/
✅ Screens:    src/screens/
✅ Navigation: src/navigation/
✅ Theme:      src/theme/
✅ Routes:     app/
```

---

## Testing

### Test Navigation
```bash
npm start
# Scan QR code in Expo Go
# Test tab switching
# Test drawer open/close
# Test screen navigation
```

### Test Styling
- Verify dark theme applied
- Check gold accents visible
- Confirm text readable
- Test at different zoom levels

### Test Performance
- Check animations smooth
- Monitor memory usage
- Test with large images
- Test slow network

---

## Production Checklist

- [ ] All imports correct
- [ ] No console errors/warnings
- [ ] Dark theme throughout
- [ ] Gold accents applied
- [ ] Navigation working
- [ ] All screens render
- [ ] Buttons responsive
- [ ] Images load
- [ ] Forms accept input
- [ ] No TypeScript errors

---

## Resources

- 📖 ARCHITECTURE_GUIDE.md - Detailed docs
- 🚀 IMPLEMENTATION_GUIDE.md - Setup guide
- 📋 IMPLEMENTATION_COMPLETE.md - Full summary
- 🎥 Expo documentation
- 📱 React Native docs
- 🎨 Design system specs

---

## Support

**Quick Links**:
- Component props: See individual `.tsx` files
- Examples: Review IMPLEMENTATION_GUIDE.md
- Troubleshooting: ARCHITECTURE_GUIDE.md has FAQ section

---

**Version**: 1.0.0
**Status**: Production Ready ✅
**Last Updated**: April 10, 2026

---
