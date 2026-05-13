# DECORE - Complete Frontend Architecture & Components Guide

## 📱 Overview

DECORE is a premium interior design application built with **React Native + Expo** featuring:
- **Dark Mode Theme**: Deep Midnight Blue (#10141C) background with Gold (#D4AF37) accents
- **Sophisticated UI**: Glassmorphism effects, smooth animations, and premium design patterns
- **Navigation**: Drawer + Bottom Tab Navigation with seamless user experience
- **Production-Ready**: Clean, type-safe, and scalable code architecture

---

## 🎨 Global Theme & Colors

**Color Palette** (`src/theme/colors.ts`):
```
Primary Background: #10141C (Deep Midnight Blue/Charcoal)
Card/Surface: #1A1E29 (Slightly lighter shade)
Accent Color: #D4AF37 (Sophisticated Gold)
Primary Text: #FFFFFF (White)
Secondary Text: #AAB0C3 (Light Gray)
```

**Theme Features**:
- Glassmorphism (rgba borders with transparency)
- Premium shadow effects
- Gold glow effects for accents
- Smooth transitions and animations

---

## 📦 Reusable Components

### 1. **GoldButton** (`src/components/GoldButton.tsx`)
Premium button component with gold accent styling.

**Props**:
```typescript
interface GoldButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'filled' | 'outline';
}
```

**Usage**:
```typescript
<GoldButton
  title="Dizayn yaratish"
  onPress={() => console.log('clicked')}
  loading={false}
/>

// Outline variant
<GoldButton
  title="Cancel"
  onPress={() => {}}
  variant="outline"
/>
```

---

### 2. **CustomCard** (`src/components/CustomCard.tsx`)
Reusable card component with optional glassmorphism effect.

**Props**:
```typescript
interface CustomCardProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  glassmorphism?: boolean;
  padding?: number;
}
```

**Usage**:
```typescript
<CustomCard padding={16} glassmorphism={true}>
  <Text>Premium Card Content</Text>
</CustomCard>

// Clickable card
<CustomCard onPress={() => navigate()}>
  <Image source={...} />
</CustomCard>
```

---

### 3. **Header** (`src/components/Header.tsx`)
Custom header with optional hamburger menu and profile button.

**Props**:
```typescript
interface HeaderProps {
  title?: string;
  showHamburger?: boolean;
  showProfile?: boolean;
  onHamburgerPress?: () => void;
  onProfilePress?: () => void;
  style?: ViewStyle;
}
```

**Usage**:
```typescript
<Header
  title="Xonangizni yuklang"
  showHamburger={true}
  showProfile={true}
  onHamburgerPress={() => navigation.openDrawer()}
  onProfilePress={() => navigate('/accountInfo')}
/>
```

---

### 4. **BottomTabBar** (`src/components/BottomTabBar.tsx`)
Sleek bottom navigation with active state and badge support.

**Props**:
```typescript
interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabName: string) => void;
  style?: ViewStyle;
}

interface TabItem {
  name: string;
  label: string;
  icon: string;
  badge?: number;
}
```

**Usage**:
```typescript
const tabs = [
  { name: 'home', label: 'Asosiy', icon: 'home' },
  { name: 'create', label: 'Yaratish', icon: 'add-circle' },
  { name: 'gallery', label: 'Galereya', icon: 'images' },
  { name: 'settings', label: 'Sozlamalar', icon: 'settings' },
];

<BottomTabBar
  tabs={tabs}
  activeTab="home"
  onTabPress={(name) => navigate(name)}
/>
```

---

### 5. **DrawerContent** (`src/components/DrawerContent.tsx`)
Custom drawer navigation content with secondary actions.

**Drawer Items**:
- 🌐 Language Selection (Til o'zgartirish)
- 📷 Quick Camera (Tez kamera)
- ❓ Help/FAQ (Yordam)
- 💬 Support (Biz bilan aloqa)

**Usage**:
```typescript
<Drawer.Navigator
  drawerContent={(props) => <DrawerContent />}
>
  {/* Content */}
</Drawer.Navigator>
```

---

## 🖼️ Screen Components

### 1. **Home Screen** (`src/screens/UploadScreenProduction.tsx` - Complete Upload)
The first step of the generation flow with premium design.

**Features**:
- ✨ Animated pulsing camera icon (glow effect)
- 🎥 Camera capture functionality
- 🖼️ Gallery selection
- 📍 Location-based room upload
- Text: "POWERED BY GEMINI ✨"

**Key Elements**:
```
┌─────────────────────────────────┐
│        Xonangizni yuklang        │
├─────────────────────────────────┤
│                                 │
│     ◯◯◯◯◯◯◯◯◯◯◯◯◯◯            │
│     ◯ 📷(pulsing)  ◯            │
│     ◯◯◯◯◯◯◯◯◯◯◯◯◯◯            │
│                                 │
│    Xonangizning suratini oling   │
│                                 │
├─────────────────────────────────┤
│ [Kameradan olish] | [Tanlash]   │
├─────────────────────────────────┤
│     POWERED BY GEMINI ✨        │
└─────────────────────────────────┘
```

**Usage**:
```typescript
import { useRouter } from 'expo-router';
import UploadScreenProduction from '../src/screens/UploadScreenProduction';

// In your app routing
<Stack.Screen name="upload" component={UploadScreenProduction} />
```

---

### 2. **Create Design Screen** (`src/screens/CreateDesignScreenProduction.tsx`)
Comprehensive design creation form after image upload.

**Features**:
- 📸 Image preview with clear button
- 🎨 4 style options (Modern, Luxury, Japanese, Industrial)
- 🤖 AI Model selector (Google Gemini 1.5 Flash)
- ✏️ Project name & custom instructions inputs
- 🎚️ Design intensity slider (0-100%)
- 🔄 Generate variations toggle
- 💎 Large gold generate button

**Screen Layout**:
```
┌─────────────────────────────────┐
│     Dizayn yaratish              │
├─────────────────────────────────┤
│   [Uploaded Image Preview] [×]   │
├─────────────────────────────────┤
│ O'zingiz xohlaydigan uslubni     │
│ [Modern] [Luxury] [Japanese]     │
│ [Industrial]                     │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐  │
│ │ Google Gemini 1.5 Flash  →  │  │
│ │ ✨ Narxi: 1 Kredit          │  │
│ └─────────────────────────────┘  │
├─────────────────────────────────┤
│ Loyihangiz nomi                  │
│ [Texting Input Field]            │
├─────────────────────────────────┤
│ Design Intensivligi      [50%]   │
│ [═════════○═════════]            │
│ Oz | O'rtacha | Kuchli           │
├─────────────────────────────────┤
│ Turli variantlarni yaratish  [ON]│
├─────────────────────────────────┤
│       [Dizayn yaratish]          │
└─────────────────────────────────┘
```

---

### 3. **Gallery Screen** (`src/screens/GalleryScreenProduction.tsx`)
Beautiful masonry gallery with inspiration & personal designs.

**Features**:
- 📑 Tab switching (Inspiration | My Designs)
- 🖼️ 2-column masonry layout
- ❤️ Like button (heart icon)
- ⋯ Menu button (edit/delete) for personal designs
- 🏷️ Image titles with overlay
- 📱 Responsive image dimensions

**Tab Content**:
- **Inspiration**: Premium design images for inspiration
- **My Designs**: User's created designs with Like/Edit options

**Usage**:
```typescript
import GalleryScreenProduction from '../src/screens/GalleryScreenProduction';

<Stack.Screen name="gallery" component={GalleryScreenProduction} />
```

---

### 4. **Settings Screen** (`src/screens/SettingsScreenProduction.tsx`)
Comprehensive settings with account, preferences, and data management.

**Sections**:

1. **Credit Card** (Top):
   - Shows credit balance
   - "Tariflar" button to buy credits
   - Premium glassmorphism styling

2. **Account** (Hisob):
   - Profile information
   - Email display
   - Account management

3. **Preferences** (Tabiiylar):
   - Theme toggle (locked to Dark Mode)
   - Notifications toggle
   - App settings

4. **Language & Region**:
   - Language selector (Uz, En, Ru)
   - Region display

5. **Data**:
   - Clear cache option
   - Privacy policy
   - Terms of service

**Screen Layout**:
```
┌─────────────────────────────────┐
│        Sozlamalar               │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │ KREDIT BALANSI    💳      │  │
│  │ 12 Kreditlar             │  │
│  │        [Tariflar]        │  │
│  └───────────────────────────┘  │
├─────────────────────────────────┤
│ HISOB                            │
│ ┌─────────────────────────────┐  │
│ │ 👤 Profil ma'lumotlari   → │  │
│ │ ✉️  Email                 → │  │
│ └─────────────────────────────┘  │
├─────────────────────────────────┤
│ TABIIYLAR                        │
│ ┌─────────────────────────────┐  │
│ │ ◐ Rejim         [Locked ON] │  │
│ │ 📢 Xabarnomalar      [ON]  │  │
│ └─────────────────────────────┘  │
├─────────────────────────────────┤
│ TIL VA MINTAQA                   │
│ ┌─────────────────────────────┐  │
│ │ 🌐 Til (Uzbek)           → │  │
│ │ 📍 Mintaqa               → │  │
│ └─────────────────────────────┘  │
├─────────────────────────────────┤
│ MA'LUMOTLAR                      │
│ ┌─────────────────────────────┐  │
│ │ 🗑️  Keshni tozalash       → │  │
│ │ 🔒 Shaxsiylik siyosati   → │  │
│ └─────────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 🗂️ Navigation Architecture

### File Structure
```
frontend/
├── app/
│   ├── _layout.tsx (Root layout with RootNavigator)
│   ├── index.tsx (Home screen - maps to /home)
│   ├── upload.tsx (Upload screen)
│   ├── createDesign.tsx (Create design form)
│   ├── gallery.tsx (Gallery screen)
│   ├── settings.tsx (Settings screen)
│   └── ... (other screens)
│
├── src/
│   ├── components/
│   │   ├── GoldButton.tsx ⭐
│   │   ├── CustomCard.tsx ⭐
│   │   ├── Header.tsx ⭐
│   │   ├── BottomTabBar.tsx ⭐
│   │   └── DrawerContent.tsx ⭐
│   │
│   ├── screens/
│   │   ├── UploadScreenProduction.tsx ⭐
│   │   ├── CreateDesignScreenProduction.tsx ⭐
│   │   ├── GalleryScreenProduction.tsx ⭐
│   │   └── SettingsScreenProduction.tsx ⭐
│   │
│   ├── navigation/
│   │   └── RootNavigator.tsx ⭐
│   │
│   ├── theme/
│   │   └── colors.ts (Updated with exact specs)
│   │
│   └── ... (other directories)
```

⭐ = New/Updated files for this architecture

---

## 🚀 Integration Steps

### 1. Update Root Layout (`app/_layout.tsx`)
```typescript
import { RootNavigator } from '../src/navigation/RootNavigator';

export default function RootLayout() {
  return <RootNavigator />;
}
```

### 2. Install Required Dependencies
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/drawer
npm install react-native-reanimated react-native-gesture-handler
npm install @react-native-community/slider
```

### 3. Update Existing Screens
Map these production components to your Expo Router screens:

- `app/upload.tsx` → Import `UploadScreenProduction`
- `app/createDesign.tsx` → Import `CreateDesignScreenProduction`
- `app/gallery.tsx` → Import `GalleryScreenProduction`
- `app/settings.tsx` → Import `SettingsScreenProduction`

### 4. Testing
```bash
# Terminal 1
npm start

# Terminal 2 or Expo Go app
# Scan QR code and test navigation
```

---

## 🎯 Animation Features

### GoldButton
- Smooth press animation (activeOpacity: 0.7)
- Loading state with spinner
- Shadow effects for depth

### UploadScreen
- **Pulsing Camera Icon**: Animated scale effect (1.0 → 1.1)
- Glowing border with shadow
- Smooth transitions between states

### BottomTabBar
- Active tab highlight with gold background
- Icon animations on state change
- Badge notifications support

### DrawerContent
- Smooth drawer slide animation
- Organized section layout
- Gradient-like card styling

---

## 🔐 Design System Principles

1. **Dark Mode First**: All colors designed for dark backgrounds
2. **Gold Accents**: Primary actions and highlights use #D4AF37
3. **Glassmorphism**: Subtle backdrop blur effects on cards
4. **Consistent Spacing**: 8px grid system (8, 12, 16, 20, 24, 28, 32...)
5. **Clear Hierarchy**: Premium vs secondary text colors clearly defined
6. **Touch Targets**: Minimum 44x44pt for buttons
7. **Accessibility**: All icons include labels, good contrast ratios

---

## 📝 Customization Guide

### Change Primary Color
Edit `src/theme/colors.ts`:
```typescript
primary: '#YOUR_COLOR', // Replace #D4AF37
```

### Adjust Border Radius
Components use consistent `borderRadius: 12` - adjust in component styles.

### Modify Typography
Update font sizes in each component's `styles` object.

### Change Drawer Width
In `RootNavigator.tsx`:
```typescript
drawerStyle: {
  width: '70%', // Adjust percentage
}
```

---

## 🐛 Troubleshooting

**Components not appearing?**
- Check import paths (relative vs absolute)
- Ensure `src` folder is at correct level
- Run `npm start -- --clear`

**Animations not smooth?**
- Install `react-native-reanimated`
- Run `expo prebuild` if needed

**Navigation not working?**
- Verify `RootNavigator` is used in `_layout.tsx`
- Check tab/screen names match routing setup
- Use `useRouter` and `useNavigation` hooks correctly

---

## ✅ Quality Checklist

- ✅ Production-ready React Native code
- ✅ TypeScript interfaces for all props
- ✅ Consistent dark theme throughout
- ✅ Smooth animations and transitions
- ✅ Premium UI/UX design patterns
- ✅ Comprehensive navigation
- ✅ Reusable component system
- ✅ Responsive layouts
- ✅ Glassmorphism effects
- ✅ Gold accent styling
- ✅ Complete feature screens
- ✅ Uzbek language support

---

## 📞 API Integration Points

When connecting to backend, integrate in these locations:

1. **UploadScreen**: Image upload to storage service
2. **CreateDesignScreen**: Submit design parameters to AI service
3. **GalleryScreen**: Fetch user designs and inspiration gallery
4. **SettingsScreen**: Update user preferences and fetch credit balance

---

## 🎓 Best Practices Applied

- ✅ Component composition over inheritance
- ✅ Prop drilling minimized with context/store
- ✅ Separation of concerns (UI vs Logic)
- ✅ DRY principle (reusable components)
- ✅ Performance optimized (memoization where needed)
- ✅ Type-safe with TypeScript
- ✅ Consistent naming conventions
- ✅ Clear code documentation

---

**Build Date**: April 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
