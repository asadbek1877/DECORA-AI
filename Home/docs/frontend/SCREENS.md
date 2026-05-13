# Frontend App Structure Analysis

## Overview
The frontend is an Expo React Native app with a modern design system. It uses Zustand for state management, Expo Router for navigation, and communicates with a backend API at `/api` endpoints.

---

## 1. PROFILE PAGE IMPLEMENTATION

### Location
**File:** [frontend/app/accountInfo.tsx](frontend/app/accountInfo.tsx)

### Default Image for New Users
- **Default Avatar URL:** `'https://i.pravatar.cc/150?img=32'`
- Used when `user?.avatarUrl` is undefined or empty
- Located in line ~22: `avatar: user?.avatarUrl || 'https://i.pravatar.cc/150?img=32'`

### Profile Data Flow
```
API GET /auth/profile 
  ↓ 
loadUserProfile() 
  ↓ 
setProfile() (local state update)
  ↓
Display in UI with avatar image, name, email, phone
```

### Avatar Structure (Line 163-180)
```typescript
- Avatar ring with border (size: 100x100, borderRadius: 50)
- Camera icon overlay badge for "pick new image"
- onPress: handlePickAvatar()
- Uses expo-image-picker for selection
- Aspect ratio: 1:1, quality: 0.8
```

### Profile Sections
1. **Avatar Section** - Editable profile picture
2. **Personal Info Card** - Full name, email, phone (all editable inline)
3. **Membership Section** - Premium badge, member since date, stats (20 credits, ∞ generate)
4. **Account Stats** - 3 stat cards showing:
   - 47 designs generated
   - 12 favorites
   - 28 downloads

### Profile Save Flow
```
handleSaveProfile() 
  ↓
Validate email format (regex check)
  ↓
Build payload:
  - username, email, phone (always)
  - avatarUri (only if local file: starts with 'file://' or 'content://')
  ↓
API PUT /auth/profile-info
  ↓
API GET /auth/profile (refresh)
  ↓
Update Zustand authStore.user
  ↓
Show confetti animation (3 seconds)
  ↓
Alert: "Profile saved successfully!"
```

### Key API Methods
- **`api.getProfile()`** - Fetch current user profile
- **`api.updateProfileInfo(data)`** - Update profile with optional avatar upload
  - If avatarUri provided: sends as FormData (multipart)
  - Otherwise: sends as JSON

### UI Features
- Loading spinner while fetching profile
- "Please log in to edit" screen for unauthenticated users
- Inline editable fields with bottom borders
- Success confirmation with confetti
- Bottom navigation with "profile" tab active

---

## 2. GALLERY & IMAGE UPLOAD PAGE

### Gallery Screen
**File:** [frontend/app/gallery.tsx](frontend/app/gallery.tsx)

#### Data Structure
```typescript
interface GalleryItem {
  id: string
  title?: string
  beforeImageUrl: string
  variants: GalleryVariant[]   // Multiple AI-generated style variations
}

interface GalleryVariant {
  id: string
  styleName: string
  styleCategory?: string
  afterImageUrl: string
  order: number
}
```

#### Gallery Fetch Logic
```
useEffect (on mount)
  ↓
fetchGallery()
  ↓
fetch('http://192.168.1.100:5000/api/gallery')  ⚠️ HARDCODED IP
  ↓
Parse response.data
  ↓
Initialize selectedVariantIndex for each item
  ↓
Display in UI (carousel style)
```

**⚠️ ISSUE:** Gallery fetches from hardcoded local IP `http://192.168.1.100:5000` instead of using the API client's SERVER_URL

#### Gallery UI Layout
- **Header:** "Before & After Gallery" with subtitle
- **Current Item Display:**
  - Before image (original room)
  - After image (AI-transformed in selected style)
  - Title (if available)
- **Style Selection:** Horizontal scrollable chips showing all variants
- **Empty State:** Message if no gallery items available
- **Bottom Nav:** Gallery tab active

### Upload Screen
**File:** [frontend/app/upload.tsx](frontend/app/upload.tsx)

#### Upload Flow
```
UploadScreen
  ↓
Takes params: photo (URI from camera) and roomId
  ↓
User selects:
  - Room type (Kitchen, Bedroom, Living Room, etc.)
  - Style (Modern, Minimalist, Industrial, etc.)
  - Optional image name
  - Custom design directives
  - Generate variations toggle
  ↓
Click "Generate Design"
  ↓
Navigate to /result with room, style, customImage params
```

#### Key Components
- **Preview Card** - Shows selected room or uploaded photo
- **Style Selection** - Horizontal scrollable STYLE_NAMES chips
- **Style Preview** - Displays visual preview of selected style
- **Name Input** - Optional name for the design
- **Directives Input** - Multiline custom instructions
- **Variations Toggle** - Switch for high-resolution rendering

**NOTE:** Upload is currently mock — no actual backend call. Uses 3.5 second simulated processing.

#### Processing States
```
'analyzing' (2.8s)
  ↓
'generating' (3.5s)
  ↓
Navigate to /result
```

### Image Save Logic
**⚠️ CURRENT STATUS: NOT FULLY IMPLEMENTED**

What's NOT happening:
- ❌ No images are automatically saved to phone gallery
- ❌ No CameraRoll or expo-image-save integration
- ❌ No persistence layer for generated images
- ❌ No download functionality implemented (just shows alert)

Result screen shows "Download Image" button:
```typescript
handleDownload() {
  Alert.alert('Download', 'Image saved to your gallery!');
}
```
This is a placeholder alert only — no actual image save occurs.

### Image API Flow (Theoretical - upload page param)
```
upload() 
  ↓
Takes imageUri from camera/gallery selection
  ↓
api.uploadImage(imageUri)
  ↓
Backend POST /api/design/upload
  ↓
Returns: { projectId, originalImageUrl, status }
```

**Location:** [frontend/src/api/client.ts](frontend/src/api/client.ts) line 169-187

---

## 3. BOTTOM NAVIGATION / MENU BAR IMPLEMENTATION

### Bottom Navigation Component
**File:** [frontend/src/components/new-ui/BottomNav.tsx](frontend/src/components/new-ui/BottomNav.tsx)

#### Navigation Tabs
```typescript
const TABS = [
  { key: 'home', icon: 'home-outline', activeIcon: 'home', path: '/' },
  { key: 'create', icon: 'sparkles-outline', activeIcon: 'sparkles', path: '/upload' },
  { key: 'gallery', icon: 'image-outline', activeIcon: 'image', path: '/history' },
  { key: 'profile', icon: 'person-outline', activeIcon: 'person', path: '/settings' },
];
```

⚠️ **MAPPING ISSUE:** Tab paths don't match screen names:
| Tab | Path | Screen |
|-----|------|--------|
| home | / | index.tsx |
| create | /upload | upload.tsx |
| gallery | /history | ❌ history.tsx (not gallery.tsx) |
| profile | /settings | ❌ settings.tsx (not accountInfo.tsx) |

#### Navigation Item Animation
- **Scale Animation:** 0.88 on press, spring back to 1
- **Color Animation:** Interpolates background from transparent to `#6C5CE7` (dark) or `#3525CD` (light)
- **Icon Change:** Active uses filled icon, inactive uses outline icon
- **Duration:** 80ms press, 200ms released

#### Positioning & Styling
```
Position: absolute bottom (iOS: 28px safe area, Android: 16px)
Width: Full screen - 120px horizontal padding (60px each side)
Height: 52px per item, 999px border radius (fully rounded)
Background: 
  - Light: rgba(255,255,255,0.95)
  - Dark: rgba(26,29,39,0.95)
Shadow: 
  - Offset: 0, 4
  - Opacity: 0.15
  - Radius: 20
  - Elevation: 12
```

#### Navigation Behavior
- Uses `router.replace()` instead of `push()` (prevents screen stacking)
- Prevents navigation if already on the same screen
- Accepts `active` prop: `Tab | 'result'`
- Special handling for result screen (maps to 'create' tab)

#### Usage in Screens
Every screen includes:
```typescript
<BottomNav active="home" />  // or "create", "gallery", "profile", "result"
```

---

## 4. MAIN SCREEN LAYOUT & DESIGN

### Main Application Layout
**File:** [frontend/app/_layout.tsx](frontend/app/_layout.tsx)

#### Root Layout Structure
```
GestureHandlerRootView
  ↓
StatusBar (dark/light based on theme)
  ↓
Stack Navigator
  - All screens are stack children
  - Animation: default with 230ms duration
  - freezeOnBlur: true (prevents background updates)
  - gestureEnabled: true (swipe back)
```

#### Registered Screens
```
/ (index.tsx) - Home screen
/onboarding
/upload
/camera
/browseSamples
/history
/settings
/result
/accountInfo
/appSettings
/auth
/admin
/budgetPlanner
/quizStyle
/materialExplorer
/designDiagrams
```

### Home Screen (Index)
**File:** [frontend/app/index.tsx](frontend/app/index.tsx)

#### Header
- **Component:** `<AppHeader title="Decora AI" showSearch={false} />`
- Shows menu icon and profile avatar in top-right

#### Main Sections (scrollable)

##### 1. Hero Section - Before/After Slider
```
- Title: "Transform Your Space"
- Component: PremiumHeroSlider (height: 380, autoPlay: true)
- Shadow: Primary color based
- Animation: FadeInDown delay 0ms
```

##### 2. Style Selector
```
- Title: "Choose Style"  
- Component: StylePreviewChips
- Shows 5+ style options: Modern, Minimalist, Industrial, etc.
- Animation: FadeInDown delay 150ms
```

##### 3. Features Grid
```
- Title: "Explore Tools"
- 5 Feature Cards:
  1. Before/After (Blue #3B82F6) - "Featured" badge
  2. Budget Planner (Green #10B981)
  3. Quiz Style (Amber #F59E0B)
  4. Material Explorer (Purple #8B5CF6)
  5. Design Diagrams (Pink #EC4899)
- Animation: FadeInDown delay 280ms
- Each card has icon, title, description, onPress handler
```

##### 4. Showcase Cards
```
- Title: "See What You Can Do"
- Before/after transformation examples
- Cards with icons, before/after images, title, description
- Animation: FadeInDown delay 380ms
```

#### Bottom Navigation
- Active tab: 'home'
- Always visible at bottom

### App Header Component
**File:** [frontend/src/components/new-ui/AppHeader.tsx](frontend/src/components/new-ui/AppHeader.tsx)

#### Header Layout
```
┌─────────────────────────────┐
│ [☰] Decora AI    [🔍] [👤] │
└─────────────────────────────┘
```

#### Left Section
- Menu button (or back button if showBack=true)
- Title (default: "Decora AI")

#### Right Section
- Optional search icon (if showSearch=true)
- Profile avatar (hardcoded: `https://i.pravatar.cc/150?img=32`)

#### Background
```
Light: rgba(248,249,250,0.95)
Dark: rgba(14,17,23,0.95)
```

#### Menu Items (when menu opened)
```
- Home
- Create Design
- Gallery
- Settings
- Language selector
- Admin access (password protected)
```

---

## 5. DESIGN SYSTEM & THEME

### Theme Colors
**File:** [frontend/src/components/new-ui/designSystem.ts](frontend/src/components/new-ui/designSystem.ts)

#### Light Theme
```
bg: #F8F9FA (off-white)
surface: #FFFFFF (white)
surfaceSoft: #F3F4F5 (very light gray)
text: #191C1D (near-black)
muted: #6B7280 (medium gray)
primary: #3525CD (deep purple)
primary2: #4F46E5 (bright purple)
secondary: #712AE2 (violet)
border: rgba(0,0,0,0.08) (subtle black)
inputBg: #F3F3F4
overlay: rgba(0,0,0,0.4)
navBg: rgba(255,255,255,0.95)
```

#### Dark Theme
```
bg: #0E1117 (nearly black)
surface: #1A1D27 (dark gray)
surfaceSoft: #252836 (darker gray)
text: #F5F5F7 (off-white)
muted: #9CA3AF (light gray)
primary: #6C5CE7 (light purple)
primary2: #7C6DF0 (lighter purple)
secondary: #8B5CF6 (brighter purple)
border: rgba(255,255,255,0.08) (subtle white)
inputBg: #252836
overlay: rgba(0,0,0,0.6)
navBg: rgba(14,17,23,0.95)
```

### Spacing Scale
```
xs: 6px
sm: 10px
md: 16px
lg: 24px
xl: 32px
```

### Border Radius Scale
```
sm: 12px
md: 16px
lg: 24px
xl: 32px
```

---

## 6. STATE MANAGEMENT (Zustand Stores)

### Files
**Location:** [frontend/src/store/](frontend/src/store/)

#### Auth Store
- **File:** authStore.ts
- **User Interface:**
```typescript
interface User {
  id: string
  email: string
  username: string
  credits: number
  avatarUrl?: string
}
```
- **Actions:** login, register, logout, setAuth, setUser, loadStoredAuth
- **Storage:** Expo SecureStore (secure token storage)

#### Theme Store
- Manages dark/light mode
- Persisted theme preference

#### Language Store
- Manages i18n translations
- Supported languages: uz, ru, en, jp

#### AI Store
- Manages AI-related state

#### Design Store
- Manages design project state

#### Admin Store
- Manages admin password verification

---

## 7. KEY API ENDPOINTS

### Auth-Related
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
PUT /api/auth/profile-info (with optional image)
PUT /api/auth/password
GET /api/auth/users/search?q=
GET /api/auth/users/{userId}/profile
```

### Design-Related
```
POST /api/design/upload (image upload)
GET /api/design/styles
POST /api/design/analyze-room
POST /api/design/suggest-prompt
POST /api/design/generate-preview
POST /api/design/generate-final
GET /api/design/history
GET /api/design/project/{projectId}
DELETE /api/design/image/{projectId}
POST /api/design/share
POST /api/design/project/{projectId}/like
GET /api/design/credits
GET /api/design/community
```

### Admin-Related
```
GET /api/admin/dashboard
GET /api/admin/users
GET /api/admin/users/{userId}
PATCH /api/admin/users/{userId}
POST /api/admin/users/{userId}/credits
POST /api/admin/users/{userId}/status
DELETE /api/admin/users/{userId}
POST /api/admin/verify
```

---

## 8. KEY FILES SUMMARY

| Path | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout with Stack navigator |
| `app/index.tsx` | Home screen with hero slider and features |
| `app/accountInfo.tsx` | Profile page with editable info and avatar |
| `app/upload.tsx` | Image upload and style selection screen |
| `app/gallery.tsx` | Before/after gallery display |
| `app/result.tsx` | Result screen with download/share options |
| `src/components/new-ui/BottomNav.tsx` | Bottom navigation bar |
| `src/components/new-ui/AppHeader.tsx` | Top header with menu |
| `src/components/new-ui/designSystem.ts` | Color theme and design tokens |
| `src/api/client.ts` | API client with all endpoints |
| `src/store/authStore.ts` | Authentication state management |
| `src/types/index.ts` | TypeScript interfaces |

---

## 9. ISSUES & GAPS IDENTIFIED

### 🔴 Critical Issues
1. **Gallery API:** Fetches from hardcoded IP `http://192.168.1.100:5000` instead of dynamic SERVER_URL
2. **Image Download:** Not implemented — only shows placeholder alert
3. **Image Persistence:** No images saved to device gallery
4. **Navigation Mapping:** BottomNav paths don't match actual screen files

### 🟡 Issues to Fix
1. **Profile Avatar Path:** Hardcoded in AppHeader as `https://i.pravatar.cc/150?img=32` — should use logged-in user's actual avatar
2. **Upload Mock:** No real backend integration (3.5s fake processing)
3. **Gallery Fetch Error Handling:** Basic console.error only

### 🟢 Working Well
- Modern design system with light/dark theme
- Smooth animations (FadeIn, scale, interpolation)
- Zustand state management
- Secure token storage with SecureStore
- Responsive layout
- Multi-language support (i18n)

