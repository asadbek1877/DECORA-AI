# React Native/Expo Component Analysis Report

## 1. BEFORE/AFTER IMAGE COMPARISON COMPONENTS

### 1.1 BeforeAfterSlider Component

**File:** [frontend/src/components/new-ui/BeforeAfterSlider.tsx](frontend/src/components/new-ui/BeforeAfterSlider.tsx)

**Description:** Interactive before/after image slider with pan gesture support and animated handle control. Features a manual drag slider with before image clipped on the left side and after image revealed from right.

**Key Features:**
- Drag gestures with `react-native-gesture-handler`
- Animated with `react-native-reanimated`
- Gallery layout with before/after image cards
- Interactive handle with chevron indicators
- White divider line with shadow effect
- "Before" and "After" badges

**Component Props:**
```typescript
interface Props {
  beforeImage: string | ImageSourcePropType;
  afterImage: string | ImageSourcePropType;
  height?: number;  // Default: 360
}
```

**Core Implementation:**
- **Slider Position:** Uses `useSharedValue(0)` for animated slider position
- **Pan Gesture:** Detects touch input and updates slider position with clamping between `EDGE_PADDING` (18px)
- **Clipping:** Before image is clipped using `Animated.View` with dynamic width
- **Handle Size:** 52px circular handle with material shadow
- **Line Width:** 2px white divider line

**Line Numbers:**
- Component definition: [Line 32](frontend/src/components/new-ui/BeforeAfterSlider.tsx#L32)
- Pan gesture setup: [Line 49-60](frontend/src/components/new-ui/BeforeAfterSlider.tsx#L49-L60)
- Render JSX: [Line 70-102](frontend/src/components/new-ui/BeforeAfterSlider.tsx#L70-L102)
- StyleSheet: [Line 125-250](frontend/src/components/new-ui/BeforeAfterSlider.tsx#L125-L250)

**Styling:**
```javascript
StyleSheet.create({
  wrap: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  line: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#fff',
  },
  handle: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  badgeLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardFull: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  }
});
```

**Usage in result.tsx:**
```tsx
<BeforeAfterSlider
  beforeImage={sourceUri(roomData.before)}
  afterImage={sourceUri(roomData.after)}
  height={360}
/>
```

---

### 1.2 PremiumHeroSlider Component

**File:** [frontend/src/components/PremiumHeroSlider.tsx](frontend/src/components/PremiumHeroSlider.tsx)

**Description:** Auto-playing before/after hero slider with image rotation. Features continuous auto-animation that reveals the "after" image from left to right, with manual drag override capability.

**Key Features:**
- Auto-playing animation with 6.5-second loop (3.25s forward, 3.25s backward)
- Manual drag gesture override with 2-second auto-resume delay
- Image rotation every 2 minutes (120,000ms)
- Fade transition effect during image rotation
- Pan responder for manual slider control
- Dynamic percentage-based slider position

**Component Props:**
```typescript
interface PremiumHeroSliderProps {
  height?: number;     // Default: 420
  autoPlay?: boolean;  // Default: true
}
```

**Animation Details:**
- **Auto-loop:** Animates from 0% → 100% → 0% continuously
- **Duration:** 3.25 seconds per direction (6.5s total cycle)
- **Easing:** `Easing.inOut(Easing.ease)` for smooth acceleration
- **Manual override:** Disables auto-animation on touch, resumes after 2 seconds

**Image Rotation System:**
```javascript
const imageGroups: BeforeAfterPair[] = [
  {
    id: 1,
    before: require('../../assets/images/demo/1/before.webp'),
    after: require('../../assets/images/demo/1/after.png'),
  },
  {
    id: 2,
    before: require('../../assets/images/demo/2/before.webp'),
    after: require('../../assets/images/demo/2/after.png'),
  },
  {
    id: 3,
    before: require('../../assets/images/demo/3/before.webp'),
    after: require('../../assets/images/demo/3/after.png'),
  },
];
```

**Line Numbers:**
- Image groups definition: [Line 9-25](frontend/src/components/PremiumHeroSlider.tsx#L9-L25)
- Component definition: [Line 33-39](frontend/src/components/PremiumHeroSlider.tsx#L33-L39)
- Image rotation effect: [Line 50-67](frontend/src/components/PremiumHeroSlider.tsx#L50-L67)
- Auto-animation setup: [Line 69-81](frontend/src/components/PremiumHeroSlider.tsx#L69-L81)
- Pan responder logic: [Line 83-116](frontend/src/components/PremiumHeroSlider.tsx#L83-L116)
- StyleSheet: [Line 160-214](frontend/src/components/PremiumHeroSlider.tsx#L160-L214)

**Styling:**
```javascript
StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#000',
  },
  afterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  fadeTransition: {
    opacity: 0.7,
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 10,
  },
  badge: {
    position: 'absolute',
    top: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    zIndex: 5,
  },
});
```

**Usage in homepage (index.tsx):**
```tsx
{/* HERO SECTION - BEFORE/AFTER SLIDER */}
<View style={[styles.sliderWrapper, { shadowColor: colors.primary }]}>
  <PremiumHeroSlider height={380} autoPlay={true} />
</View>
```

---

## 2. PROFILE/ACCOUNT INFORMATION EDITING

### 2.1 AccountInfo Screen

**File:** [frontend/app/accountInfo.tsx](frontend/app/accountInfo.tsx)

**Description:** User profile management screen with editable profile information, avatar upload, membership details, and account statistics.

**Line Numbers:**
- Screen component: [Line 39](frontend/app/accountInfo.tsx#L39)
- Profile state: [Line 43-51](frontend/app/accountInfo.tsx#L43-L51)
- Load profile from API: [Line 62-81](frontend/app/accountInfo.tsx#L62-L81)
- Avatar picker: [Line 83-96](frontend/app/accountInfo.tsx#L83-L96)
- Save profile handler: [Line 98-145](frontend/app/accountInfo.tsx#L98-L145)
- UI Render: [Line 147-285](frontend/app/accountInfo.tsx#L147-L285)
- StyleSheet: [Line 287-320](frontend/app/accountInfo.tsx#L287-L320)

**Profile State Structure:**
```typescript
const [profile, setProfile] = useState({
  name: user?.username || 'User',
  email: user?.email || 'email@example.com',
  phone: '+998 90 123 45 67',
  avatar: user?.avatarUrl || 'https://i.pravatar.cc/150?img=32'
});
```

**Key Functions:**

**1. Load User Profile:**
```typescript
const loadUserProfile = async () => {
  try {
    const response = await api.getProfile();
    if (response?.success && response.data) {
      setProfile({
        name: userData.username || 'User',
        email: userData.email || '',
        phone: '+998 90 123 45 67',
        avatar: userData.avatarUrl || 'https://i.pravatar.cc/150?img=32'
      });
    }
  } catch (error) { /* ... */ }
};
```

**2. Avatar Selection:**
```typescript
const handlePickAvatar = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return;
  
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  
  if (!result.canceled && result.assets[0]) {
    setProfile({ ...profile, avatar: result.assets[0].uri });
  }
};
```

**3. Save Profile with Validation:**
```typescript
const handleSaveProfile = async () => {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (profile.email && !emailRegex.test(profile.email)) {
    alert('Please enter a valid email address');
    return;
  }

  const payload = {
    username: profile.name,
    email: profile.email,
    phone: profile.phone,
    ...(isLocalFile && { avatarUri: profile.avatar }),
  };

  const response = await api.updateProfileInfo(payload);
  if (response?.success) {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }
};
```

**UI Sections:**

1. **Avatar Section** (Lines 165-177)
   - Editable avatar with camera badge
   - Button to pick avatar from library
   - Premium member badge

2. **Personal Info Card** (Lines 179-191)
   - Full Name (editable)
   - Email (editable with validation)
   - Phone (editable)
   - Member Since (read-only)

3. **Membership Section** (Lines 193-210)
   - Premium badge with diamond icon
   - Credits display (20)
   - Generate limit (∞)

4. **Account Statistics** (Lines 212-226)
   - Designs Generated (47)
   - Favorites (12)
   - Downloads (28)

5. **Save Button** (Lines 228-238)
   - Submit profile changes
   - Shows loading state with ActivityIndicator
   - Triggers confetti animation on success

**InfoRow Component Helper:**
```typescript
function InfoRow({ icon, label, value, colors, isLast, onChange }: {
  icon: string; label: string; value: string; colors: any; 
  isLast?: boolean; onChange?: (val: string) => void;
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
            style={[s.infoValue, { color: colors.text }]}
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
```

**Styling:**
```javascript
const s = StyleSheet.create({
  avatarSection: { 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 4 
  },
  avatarRing: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 3, 
    padding: 3 
  },
  avatar: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 50 
  },
  editAvatarBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: '#10b981', 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    borderWidth: 2, 
    borderColor: '#fff' 
  },
  card: { 
    borderRadius: 20, 
    borderWidth: 1, 
    overflow: 'hidden' 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14, 
    paddingHorizontal: 16, 
    paddingVertical: 16 
  },
  memberCard: { 
    borderRadius: 20, 
    padding: 20, 
    gap: 16 
  },
  saveBtnText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '800' 
  },
});
```

---

### 2.2 App Settings Screen

**File:** [frontend/app/appSettings.tsx](frontend/app/appSettings.tsx)

**Description:** Application-wide settings including theme, language, and notification preferences.

**Key Features:**
- Dark mode toggle with theme persistence
- Multi-language support (Uzbek, Russian, English, Japanese)
- Language flag selector inline UI
- Notification settings
- Cache management

**Line Numbers:**
- Screen component: [Line 38](frontend/app/appSettings.tsx#L38)
- Dark mode toggle: [Line 67-81](frontend/app/appSettings.tsx#L67-L81)
- Language selector: [Line 82-111](frontend/app/appSettings.tsx#L82-L111)
- Settings row renderer: [Line 18-36](frontend/app/appSettings.tsx#L18-L36)

**SettingRow Component:**
```typescript
function SettingRow({ icon, title, subtitle, onPress, trailing, colors, isLast }: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <Pressable 
      style={[s.row, !isLast && { borderBottomWidth: 1 }]} 
      onPress={onPress}
    >
      <View style={s.rowLeft}>
        <View style={[s.rowIcon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.rowTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={s.rowSub}>{subtitle}</Text>}
        </View>
      </View>
      {trailing || (onPress && <Ionicons name="chevron-forward" size={18} color={colors.muted} />)}
    </Pressable>
  );
}
```

---

## 3. IMAGE MANAGEMENT - ADMIN PANEL

### 3.1 Admin Screen

**File:** [frontend/app/admin.tsx](frontend/app/admin.tsx)

**Description:** Administrative panel for managing before/after images for different room styles. Allows uploading and deleting images with visual previews.

**Line Numbers:**
- Admin screen component: [Line 23](frontend/app/admin.tsx#L23)
- Image replacement function: [Line 31-44](frontend/app/admin.tsx#L31-L44)
- Delete image function: [Line 46-53](frontend/app/admin.tsx#L46-L53)
- Get image source function: [Line 55-61](frontend/app/admin.tsx#L55-L61)
- Admin panel render: [Line 63-120](frontend/app/admin.tsx#L63-L120)

**Key Features:**
- Multi-room image management
- Per-style image replacement
- Image preview with tap to view
- Upload and delete buttons
- Change indicator badge
- Expandable room sections

**Image State Management:**
```typescript
type OverrideMap = Record<string, Record<string, string>>;

const [overrides, setOverrides] = useState<OverrideMap>({});
const [expandedRoom, setExpandedRoom] = useState<number | null>(1);
const [viewUri, setViewUri] = useState('');
```

**Replace Image Function:**
```typescript
const replaceImage = async (roomId: number, styleName: string) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 5],
    quality: 0.9,
  });

  if (!result.canceled && result.assets[0]) {
    const uri = result.assets[0].uri;
    setOverrides((prev) => ({
      ...prev,
      [String(roomId)]: { 
        ...(prev[String(roomId)] || {}), 
        [styleName]: uri 
      },
    }));
    Alert.alert('Done', `Image replaced for ${styleName} style in Room ${roomId}`);
  }
};
```

---

## 4. RESULT SCREEN - FINAL OUTPUT

**File:** [frontend/app/result.tsx](frontend/app/result.tsx)

**Description:** Displays the final before/after comparison of generated room design with action buttons for download, regenerate, and share.

**Line Numbers:**
- Result screen: [Line 19](frontend/app/result.tsx#L19)
- BeforeAfterSlider usage: [Line 37-42](frontend/app/result.tsx#L37-L42)
- Download handler: [Line 24-26](frontend/app/result.tsx#L24-L26)
- Share handler: [Line 28-31](frontend/app/result.tsx#L28-L31)

**Component Integration:**
```tsx
<BeforeAfterSlider
  beforeImage={sourceUri(roomData.before)}
  afterImage={sourceUri(roomData.after)}
  height={360}
/>
```

---

## 5. SUMMARY TABLE

| Component | File | Type | Purpose |
|-----------|------|------|---------|
| **BeforeAfterSlider** | `src/components/new-ui/BeforeAfterSlider.tsx` | Interactive Slider | Manual before/after comparison with drag gesture |
| **PremiumHeroSlider** | `src/components/PremiumHeroSlider.tsx` | Auto-slider | Homepage hero section with auto-play & image rotation |
| **AccountInfo** | `app/accountInfo.tsx` | Screen | User profile editing & membership info |
| **AppSettings** | `app/appSettings.tsx` | Screen | Theme, language, notifications |
| **Admin** | `app/admin.tsx` | Screen | Image management for admin |
| **Result** | `app/result.tsx` | Screen | Display final design with comparison |

---

## 6. KEY TECHNICAL DETAILS

### Animation Libraries Used:
- **react-native-reanimated** - High-performance animations
- **react-native-gesture-handler** - Touch gesture detection
- **Expo Image Picker** - Image selection and cropping

### Color Themes:
- **Primary Color:** Dynamic from `useUI()` hook
- **Primary Color Accent:** `colors.primary + '15'` (15% opacity)
- **Badges:** `rgba(0,0,0,0.55)` semi-transparent black
- **Divider:** White `#fff` with shadow effects

### Responsive Design:
- Height properties are customizable props
- Percentage-based width calculations for animations
- Dynamic spacing and typography using theme colors

### State Management:
- `useUI()` - Design system colors
- `useLanguageStore()` - Internationalization
- `useAuthStore()` - Authentication state
- Local `useState()` - Component-level state

