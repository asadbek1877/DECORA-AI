# Decora AI - Developer Quick Reference

## 🚀 Quick Start

### Start Development Server
```bash
cd d:\Projects\Home\Home\web
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## 🌐 Using Translations (i18n)

### Import and Use in Components
```typescript
import { useLanguage } from '../i18n/useLanguage';

export function MyComponent() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('nav.gallery')}</h1>
      <p>{t('landing.subtitle')}</p>
      <button onClick={() => setLanguage('ru')}>
        Switch to Russian
      </button>
    </div>
  );
}
```

### Translation Structure
Translations follow a hierarchical structure:
- `nav.gallery` → Navigation > Gallery
- `create.styles.modern` → Create > Styles > Modern
- `admin.uploadImages` → Admin > Upload Images

### Available Languages
- `'en'` - English
- `'ru'` - Русский (Russian)
- `'uz'` - Oʻzbekcha (Uzbek)
- `'ja'` - 日本語 (Japanese)

---

## 🌓 Using Dark Mode Theme

### Import and Use Theme
```typescript
import { useTheme } from '../store/themeStore';

export function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-900">
      <button onClick={toggleTheme}>
        Toggle Theme (Current: {theme})
      </button>
      <button onClick={() => setTheme('dark')}>
        Set Dark Mode
      </button>
    </div>
  );
}
```

### TailwindCSS Dark Mode Classes
```typescript
// Light mode: default
// Dark mode: add 'dark:' prefix
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content changes based on theme
</div>
```

### CSS Variables for Dark Mode
Use CSS variables for consistency:
```css
.my-element {
  background-color: var(--color-background);
  color: var(--color-on-background);
}
```

---

## 🖼️ Using Image Comparison Component

### Basic Usage
```typescript
import { ImageComparison } from '../components/ImageComparison';

export function MyPage() {
  return (
    <ImageComparison
      beforeSrc="path/to/before.jpg"
      afterSrc="path/to/after.jpg"
      beforeLabel="Original"
      afterLabel="Redesigned"
      className="mb-12"
    />
  );
}
```

### Features
- Drag to compare images
- Touch support on mobile
- Smooth spring animations
- Transparent overlays
- Labels with glass-morphism effect

---

## 🎨 Theme Colors & Variables

### Available CSS Variables
```css
/* Primary Colors */
--color-primary: #cc97ff;
--color-secondary: #9093ff;
--color-tertiary: #ec63ff;

/* Surface & Background */
--color-background: /* changes with theme */
--color-surface: /* changes with theme */
--color-on-background: /* changes with theme */
--color-on-surface: /* changes with theme */

/* For use in your styles */
background-color: var(--color-background);
color: var(--color-on-surface);
```

---

## ✨ Using Glass-Morphism Effects

### Available Classes
```tsx
// Glass effect with blur
<div className="glass-nav">Navigation</div>
<div className="glass-card">Card</div>
<div className="glass-panel">Panel</div>

// Gradient text
<span className="ai-gradient-text">Gradient Text</span>
<span className="hero-gradient-text">Hero Text</span>

// Glow effects
<button className="neon-glow">Glow Button</button>
```

### Custom Glass Effect
```css
.my-glass-element {
  background: rgba(14, 14, 19, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

---

## 🎬 Animation Examples

### Using Motion Components
```typescript
import { motion } from 'motion/react';

// Fade in animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  Fades in
</motion.div>

// Stagger children
<motion.div
  initial="hidden"
  animate="show"
  variants={{
    show: { transition: { staggerChildren: 0.1 } }
  }}
>
  <motion.span variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
    Item 1
  </motion.span>
</motion.div>

// Hover effects
<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  Interactive
</motion.button>
```

---

## 📝 File Organization

### Where to Add New Translations
Edit `src/i18n/translations.ts` and add to all language objects:
```typescript
export const translations = {
  en: { mySection: { myKey: 'English text' } },
  ru: { mySection: { myKey: 'Русский текст' } },
  uz: { mySection: { myKey: 'Oʻzbekcha matn' } },
  ja: { mySection: { myKey: '日本語テキスト' } },
};
```

### Where to Add New Routes
Edit `src/App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

Edit `src/components/Navbar.tsx` to add navigation link.

---

## 🔧 Customizing Themes

### Add New Theme Color
Update `tailwind.config.ts`:
```typescript
colors: {
  myColor: '#ff0000',
}
```

Use in component:
```tsx
<div className="bg-myColor dark:bg-myColor-dark">
  Custom Color
</div>
```

---

## 📱 Responsive Design

### TailwindCSS Breakpoints
```tsx
// Mobile first approach
<div className="text-sm md:text-lg lg:text-xl">
  Responsive text
</div>

// Mobile menu example
<button className="md:hidden">
  Mobile only
</button>
```

---

## 🐛 Common Issues & Solutions

### Dark Mode Not Applying
- Ensure ThemeProvider wraps your app in App.tsx
- Check that html element has `dark` class
- Verify tailwind.config.ts has darkMode: 'class'

### Translations Not Showing
- Verify key path is correct (e.g., 'nav.gallery')
- Check all 4 languages have the key
- Ensure useLanguage hook is imported correctly

### Animations Stuttering
- Reduce animation duration
- Use `will-change` CSS on animated elements
- Check device performance

---

## 📚 Additional Resources

### Motion.js Documentation
```
https://motion.dev/
```

### TailwindCSS Dark Mode
```
https://tailwindcss.com/docs/dark-mode
```

### Zustand State Management
```
https://github.com/pmndrs/zustand
```

---

## ✅ Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] No TypeScript errors
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test all language options
- [ ] Test on mobile device
- [ ] Test image comparison on touch
- [ ] Verify admin panel routes
- [ ] Check performance metrics

---

## 🎯 Performance Tips

1. **Code Splitting:** Use React.lazy() for route components
2. **Images:** Optimize and compress before upload
3. **Animations:** Use `will-change` sparingly
4. **Bundle:** Monitor with `npm run build`
5. **Lighthouse:** Run regularly in DevTools

---

**Last Updated:** March 2026
**Version:** 1.0.0
