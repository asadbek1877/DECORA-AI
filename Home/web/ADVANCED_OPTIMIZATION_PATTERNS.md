# 🎯 Advanced Performance Patterns for Remaining Components

## Pattern 1: Memoized List Items (Like Gallery)

Apply this pattern to any scrollable list:

```typescript
import { memo, useCallback } from 'react';
import { motion } from 'motion/react';

interface ItemProps {
  item: any;
  index: number;
  onClick: (id: string) => void;
}

// CRITICAL: Wrap in memo to prevent re-renders when parent updates
const ListItem = memo(function ListItem({ item, index, onClick }: ItemProps) {
  const handleClick = useCallback(() => onClick(item.id), [item.id, onClick]);

  return (
    <motion.div
      className="cursor-pointer group"
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
    >
      {/* Content */}
    </motion.div>
  );
});

export default function List({ items }: { items: any[] }) {
  const [selected, setSelected] = useCallback((id: string) => {
    // Handle selection
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <ListItem key={item.id} item={item} index={i} onClick={setSelected} />
      ))}
    </div>
  );
}
```

---

## Pattern 2: Virtualized Long Lists (1000+ items)

For massive lists, use react-window:

```bash
npm install react-window
```

```typescript
import { FixedSizeList as List } from 'react-window';

interface Row {
  index: number;
  style: React.CSSProperties;
}

const Row = ({ index, style }: Row) => (
  <div style={style} className="p-4 border-b">
    Item {index}
  </div>
);

export default function VirtualizedList({ items }: { items: any[] }) {
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

---

## Pattern 3: Optimized Form Components

Prevent re-renders on every keystroke:

```typescript
import { memo, useCallback, useState } from 'react';
import { useDesignStore } from '../store/designStore';

const FormInput = memo(function FormInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition-ring duration-200"
    />
  );
});

export default function DesignForm() {
  const { customPrompt, setCustomPrompt } = useDesignStore();
  
  // useCallback prevents re-creating function on every render
  const handlePromptChange = useCallback((newPrompt: string) => {
    setCustomPrompt(newPrompt);
  }, [setCustomPrompt]);

  return (
    <FormInput
      value={customPrompt}
      onChange={handlePromptChange}
      placeholder="Enter your design prompt..."
    />
  );
}
```

---

## Pattern 4: Intersection Observer for Lazy Loading

Better than scroll events:

```typescript
import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Optional: Stop observing after visible
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
}

// Usage:
export default function LazyImage({ src }: { src: string }) {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div ref={ref}>
      {isVisible && (
        <img src={src} alt="" className="w-full" loading="lazy" />
      )}
    </div>
  );
}
```

---

## Pattern 5: Debounced Event Handlers

Prevent handler spam (scroll, resize, search):

```typescript
import { useCallback, useRef, useEffect } from 'react';

function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay]
  );
}

// Usage:
export default function SearchComponent() {
  const [query, setQuery] = useState('');

  const handleSearch = useDebounce((searchTerm: string) => {
    // API call happens here, only after user stops typing
    console.log('Searching for:', searchTerm);
  }, 300); // 300ms delay

  return (
    <input
      type="text"
      onChange={(e) => {
        setQuery(e.target.value);
        handleSearch(e.target.value);
      }}
      placeholder="Search..."
    />
  );
}
```

---

## Pattern 6: Image Preloading

Load next hero image before user navigates:

```typescript
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Usage in HeroSlider:
useEffect(() => {
  const nextIndex = (currentPairIndex + 1) % BEFORE_AFTER_PAIRS.length;
  const nextPair = BEFORE_AFTER_PAIRS[nextIndex];
  
  // Preload next images
  Promise.all([
    preloadImage(nextPair.before),
    preloadImage(nextPair.after),
  ]).catch(console.error);
}, [currentPairIndex]);
```

---

## Pattern 7: Conditional Rendering (Don't Render Hidden Components)

```typescript
// ❌ WRONG: Component renders but display:none (wastes CPU)
export default function Modal({ isOpen }: { isOpen: boolean }) {
  return (
    <div style={{ display: isOpen ? 'block' : 'none' }}>
      {/* Expensive modal content */}
    </div>
  );
}

// ✅ RIGHT: Component doesn't render if not visible
export default function Modal({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;
  
  return (
    <div>
      {/* Only renders when isOpen=true */}
    </div>
  );
}
```

---

## Pattern 8: Memoized Selectors (Zustand)

Prevent re-renders when unrelated store state changes:

```typescript
// ❌ WRONG: Re-renders whenever store updates
const query = useDesignStore((state) => state.customPrompt);

// ✅ RIGHT: Only re-render if customPrompt actually changed
const query = useDesignStore(
  (state) => state.customPrompt,
  (prev, next) => prev === next // Shallow equality check
);

// ✅ EVEN BETTER: Create selector function
const selectPrompt = (state: DesignState) => state.customPrompt;
const query = useDesignStore(selectPrompt);
```

---

## Performance Checklist for New Features

When adding new components:

- [ ] Wrap in `React.memo()` if rendered in lists
- [ ] Use `useCallback()` for event handlers
- [ ] Use `useMemo()` for expensive calculations
- [ ] Only animate `transform` and `opacity`
- [ ] Lazy load images with `loading="lazy"`
- [ ] Lazy load routes with `React.lazy()` + `Suspense`
- [ ] Test with DevTools Profiler (React → Profiler)
- [ ] Check Lighthouse score (target: 90+)

---

## Testing Performance

```typescript
// React Profiler
import { Profiler } from 'react';

export default function App() {
  const onRenderCallback = (id, phase, actualDuration) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  };

  return (
    <Profiler id="App" onRender={onRenderCallback}>
      {/* Your app */}
    </Profiler>
  );
}
```

Or use Chrome DevTools:
1. Open DevTools → Performance tab
2. Click Record
3. Interact with page
4. Stop recording
5. Analyze frame times (target: 16.67ms for 60fps)

---

**Last Updated:** May 14, 2026
