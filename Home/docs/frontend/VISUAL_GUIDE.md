# 📱 DECORA AI - ГЛАВНЫЙ ЭКРАН - ВИЗУАЛЬНЫЙ ГАЙД

## ГЛАВНЫЙ ЭКРАН - ПОЛНЫЙ LAYOUT

```
┌─────────────────────────────────────────────┐
│  HEADER (AppHeader)                         │
│  "Decora AI" | [Search]                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│                                             │
│  HERO TITLE (FadeInDown)                    │
│  "Transform Your Space"                     │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  BEFORE/AFTER HERO SLIDER                   │
│  ┌───────────────────────────────────────┐  │
│  │ [BEFORE IMAGE] | [AFTER IMAGE]        │  │
│  │ ◄─────────────── | ───────────────►  │  │
│  │ Move slider left and right            │  │
│  └───────────────────────────────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  STYLE SELECTOR                             │
│  "Choose Style"                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │Modern Classic Industrial Minimalist...   │
│  │ ✓   │ │    │ │    │ │    │ │    │       │
│  └────┘ └────┘ └────┘ └────┘ └────┘        │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  FEATURES GRID - "Explore Tools"            │
│  (2 колонки)                                │
│  ┌──────────────┐ ┌──────────────┐         │
│  │ 🎨 Before/   │ │ 💰 Budget    │         │
│  │    After     │ │    Planner   │         │
│  │ Transform... │ │ Track..      │         │
│  │ [OPEN]       │ │ [OPEN]       │         │
│  └──────────────┘ └──────────────┘         │
│  ┌──────────────┐ ┌──────────────┐         │
│  │ 🎯 Style     │ │ 🎨 Materials │         │
│  │    Quiz      │ │    Explorer  │         │
│  │ Find your... │ │ Discover..   │         │
│  │ [OPEN]       │ │ [OPEN]       │         │
│  └──────────────┘ └──────────────┘         │
│  ┌──────────────┐                          │
│  │ 📐 Design    │                          │
│  │    Diagrams  │                          │
│  │ Plan the...  │                          │
│  │ [OPEN]       │                          │
│  └──────────────┘                          │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  SHOWCASE CARDS - "See What You Can Do"    │
│  (Каждая функция с примерами)              │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ ⭐ AI TRANSFORM      [🪲 badge]        │  │
│  │ Transform any room instantly           │  │
│  │ ┌──────────────┬───┬──────────────┐   │  │
│  │ │  BEFORE      │ → │     AFTER    │   │  │
│  │ │ [комната до] │   │ [комната с...│   │  │
│  │ │              │   │  новым див]  │   │  │
│  │ │              │   │              │   │  │
│  │ └──────────────┴───┴──────────────┘   │  │
│  │ [↪ Try it now]                        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 💰 BUDGET PLANNER                      │  │
│  │ Track materials & expenses             │  │
│  │ ┌──────────────┬───┬──────────────┐   │  │
│  │ │  РАСХОДЫ     │ → │   СТАТЫСЫ    │   │  │
│  │ │ ○ Material   │   │ Income: 5000 │   │  │
│  │ │ ○ Labor      │   │ Expense: 2000│   │  │
│  │ │              │   │ Balance: 3000│   │  │
│  │ └──────────────┴───┴──────────────┘   │  │
│  │ [↪ Try it now]                        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 🎯 STYLE QUIZ                          │  │
│  │ Find your perfect aesthetic            │  │
│  │ ┌──────────────┬───┬──────────────┐   │  │
│  │ │  ВОПРОСЫ     │ → │   РЕЗУЛЬТАТ  │   │  │
│  │ │ Q1: What'... │   │ Your style:  │   │  │
│  │ │ Q2: How...   │   │ ✓ Modern     │   │  │
│  │ │              │   │ ✓ Minimalist │   │  │
│  │ └──────────────┴───┴──────────────┘   │  │
│  │ [↪ Try it now]                        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 🎨 MATERIAL EXPLORER                   │  │
│  │ Explore colors & textures              │  │
│  │ ┌──────────────┬───┬──────────────┐   │  │
│  │ │  ВАРИАНТ 1   │ → │  ВАРИАНТ 2   │   │  │
│  │ │ [Oak Wood]   │   │ [Marble]     │   │  │
│  │ │ ■ ■ ■        │   │ ■ ■ ■        │   │  │
│  │ │ Budget       │   │ Premium      │   │  │
│  │ └──────────────┴───┴──────────────┘   │  │
│  │ [↪ Try it now]                        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 📐 DESIGN DIAGRAMS                     │  │
│  │ Plan perfect space flow                │  │
│  │ ┌──────────────┬───┬──────────────┐   │  │
│  │ │  ПЛАН 1      │ → │  ПЛАН 2      │   │  │
│  │ │ ┌──┐ ┌──┐    │   │ ┌──┐ ┌──┐    │   │  │
│  │ │ │  │ │  │    │   │ │  │ │  │    │   │  │
│  │ │ └──┘ └──┘    │   │ └──┘ └──┘    │   │  │
│  │ │              │   │              │   │  │
│  │ └──────────────┴───┴──────────────┘   │  │
│  │ [↪ Try it now]                        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [PADDING FOR SPACING]                      │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  FLOATING CTA                               │
│  [✨ Start redesign]                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  BOTTOM NAVIGATION                          │
│  [🏠 Home] [📸 Camera] [📋 History]        │
│  [👤 Account] [⚙️ More]                    │
└─────────────────────────────────────────────┘
```

---

## ONBOARDING SCREEN - 5 СЛАЙДОВ

```
SLIDE 1: Welcome
┌─────────────────────────────────────┐
│            [PROGRESS: ▓░░░░]  [Skip]│
│                                     │
│  ┌─────────────────────────────┐   │
│  │    [WELCOME IMAGE]          │   │
│  │                             │   │
│  │         ✨ (badge)          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Welcome to Decora AI               │
│                                     │
│  Transform any space with           │
│  AI-powered interior design         │
│  suggestions                        │
│                                     │
│                     [◀] [Next →]    │
│                     [● ○ ○ ○ ○]    │
└─────────────────────────────────────┘

SLIDE 2: Before/After
┌─────────────────────────────────────┐
│            [PROGRESS: ▓▓░░░]  [Skip]│
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [BEFORE/AFTER IMAGE]       │   │
│  │                             │   │
│  │    📸 (badge)               │   │
│  └─────────────────────────────┘   │
│                                     │
│  See Before & After                 │
│                                     │
│  Upload a photo and instantly       │
│  see how different styles can       │
│  transform your room                │
│                                     │
│                     [◀] [Next →]    │
│                     [○ ● ○ ○ ○]    │
└─────────────────────────────────────┘

SLIDE 3: Budget
┌─────────────────────────────────────┐
│            [PROGRESS: ▓▓▓░░]  [Skip]│
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [BUDGET/EXPENSE IMAGE]     │   │
│  │                             │   │
│  │    💰 (badge)               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Plan Your Budget                   │
│                                     │
│  Track materials, labor costs,      │
│  and stay within your design        │
│  budget                             │
│                                     │
│                     [◀] [Next →]    │
│                     [○ ○ ● ○ ○]    │
└─────────────────────────────────────┘

SLIDE 4: Style Quiz
┌─────────────────────────────────────┐
│            [PROGRESS: ▓▓▓▓░]  [Skip]│
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [STYLE OPTIONS IMAGE]      │   │
│  │                             │   │
│  │    🎯 (badge)               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Find Your Style                    │
│                                     │
│  Take our quiz to discover the      │
│  perfect design style for you       │
│                                     │
│                     [◀] [Next →]    │
│                     [○ ○ ○ ● ○]    │
└─────────────────────────────────────┘

SLIDE 5: Materials (Last)
┌─────────────────────────────────────┐
│            [PROGRESS: ▓▓▓▓▓]  [Skip]│
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [MATERIALS IMAGE]          │   │
│  │                             │   │
│  │    🎨 (badge)               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Explore Materials                  │
│                                     │
│  Browse colors, textures, and       │
│  find the perfect materials for     │
│  your project                       │
│                                     │
│                     [◀] [Get Started]│
│                     [○ ○ ○ ○ ●]    │
└─────────────────────────────────────┘
```

---

## COLOR BREAKDOWN

### Before/After (Showcase Card)
```
┌───────────────────────────────┐
│ 🔵 AI TRANSFORM  [Featured]    │  ← Header с иконкой
│ Transform any room instantly   │  ← Описание
├───────────────────────────────┤
│ ┌─────────────┬───┬──────────┐ │
│ │  BEFORE     │ → │  AFTER   │ │  ← Before/After примеры
│ │ [img 100px] │   │ [img...]│ │
│ └─────────────┴───┴──────────┘ │
│                               │
│ ↪ Try it now                  │  ← CTA
└───────────────────────────────┘
```

### Color Palette
```
🔵 Blue     (#3B82F6)  - Before/After Transform
🟢 Green    (#10B981)  - Budget Planner
🟡 Yellow   (#F59E0B)  - Quiz Style
🟣 Purple   (#8B5CF6)  - Material Explorer
🌸 Pink     (#EC4899)  - Design Diagrams
```

---

## RESPONSIVE BREAKDOWN

### Mobile (320px - 480px) - Current
```
┌─────────────┐
│ Full Width  │
│ 1 Column    │
│ Cards Stack │
│ Vertically  │
└─────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────────────────────┐
│ 2-3 Columns              │
│ Wider Cards              │
│ More Spacing             │
└──────────────────────────┘
```

### Desktop (1024px+)
```
┌─────────────────────────────────┐
│ 3-4 Columns                     │
│ Large Preview Images            │
│ Side-by-side Showcase           │
└─────────────────────────────────┘
```

---

## ANIMATION FLOWS

### Page Load
```
1. Header → FadeInDown (instant)
2. Hero Title → FadeInDown (500ms)
3. Slider → FadeInUp (300ms)
4. Style Chips → FadeInUp (150ms delay)
5. Features Grid → FadeInUp (280ms delay)
6. Showcase Cards → FadeInUp (380ms+ delay staggered)
```

### Showcase Card Animation
```
Card 1 → delay: 0ms
Card 2 → delay: 100ms
Card 3 → delay: 200ms
Card 4 → delay: 300ms
Card 5 → delay: 400ms

Each: FadeInUp duration 400ms
```

### Onboarding Slide Transition
```
Slide Out (Current) → FadeOutDown 200ms
Slide In (Next) → FadeInUp 300ms
```

---

## 🎉 ИТОГО

Главный экран теперь имеет:
- ✅ Hero Before/After (главный фокус)
- ✅ Style Selector (быстрый выбор)
- ✅ Features Grid (что есть)
- ✅ **NEW:** Showcase Cards (примеры каждой функции)
- ✅ Smooth Animations (400ms transitions)
- ✅ Dark/Light Mode Support (адаптивный)
- ✅ Responsive Layout (мобильный-first)
- ✅ Onboarding для новых пользователей
