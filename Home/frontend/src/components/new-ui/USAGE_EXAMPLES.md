# BeforeAfterSlider - Usage Examples

## Basic Example

### Single Before/After Comparison
```jsx
import { BeforeAfterSlider } from '../components/new-ui/BeforeAfterSlider';

export function MyScreen() {
  return (
    <BeforeAfterSlider
      imagePairs={[
        {
          before: require('../assets/room-before.jpg'),
          after: require('../assets/room-after.jpg'),
        }
      ]}
      height={360}
    />
  );
}
```

---

## Real-World Examples

### Example 1: Design Result Screen (result.tsx)
```jsx
// ✅ Already updated in your code
import { BeforeAfterSlider } from '../src/components/new-ui/BeforeAfterSlider';

export default function ResultScreen() {
  const { originalImageUri, finalImageUrl } = useDesignStore();

  return (
    <ScrollView>
      {/* Before/After Slider */}
      <Pressable onPress={handleViewBeforeImage}>
        <BeforeAfterSlider
          imagePairs={[
            {
              before: originalImageUri,
              after: finalImageUrl,
            }
          ]}
          height={360}
          autoPlay={true}
          animationDuration={4000}
        />
      </Pressable>
    </ScrollView>
  );
}
```

### Example 2: Design Diagrams (designDiagrams.tsx)
```jsx
// ✅ Already updated in your code
<BeforeAfterSlider
  imagePairs={[
    {
      before: {
        uri: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=400',
      },
      after: {
        uri: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400',
      },
    }
  ]}
  height={300}
  autoPlay={true}
  animationDuration={4000}
/>
```

### Example 3: Gallery with Multiple Before/After Pairs
```jsx
function GalleryScreen() {
  const rooms = [
    {
      title: 'Living Room',
      before: require('../assets/living-before.jpg'),
      after: require('../assets/living-after.jpg'),
    },
    {
      title: 'Bedroom',
      before: require('../assets/bedroom-before.jpg'),
      after: require('../assets/bedroom-after.jpg'),
    },
    {
      title: 'Kitchen',
      before: require('../assets/kitchen-before.jpg'),
      after: require('../assets/kitchen-after.jpg'),
    },
  ];

  return (
    <ScrollView>
      {rooms.map((room) => (
        <View key={room.title}>
          <Text style={styles.title}>{room.title}</Text>
          <BeforeAfterSlider
            imagePairs={[
              {
                before: room.before,
                after: room.after,
              }
            ]}
            height={300}
          />
        </View>
      ))}
    </ScrollView>
  );
}
```

### Example 4: Multiple Image Pairs with Auto-Rotation
```jsx
function PortfolioScreen() {
  const projects = [
    {
      before: require('../assets/project1-before.jpg'),
      after: require('../assets/project1-after.jpg'),
    },
    {
      before: require('../assets/project2-before.jpg'),
      after: require('../assets/project2-after.jpg'),
    },
    {
      before: require('../assets/project3-before.jpg'),
      after: require('../assets/project3-after.jpg'),
    },
    {
      before: require('../assets/project4-before.jpg'),
      after: require('../assets/project4-after.jpg'),
    },
  ];

  return (
    <View>
      <Text style={styles.heading}>Our Portfolio</Text>
      <BeforeAfterSlider
        imagePairs={projects}
        height={400}
        autoPlay={true}
        animationDuration={4000}      // 4 seconds per sweep
        imageRotationInterval={6000}   // Switch every 6 seconds
      />
      <Text style={styles.description}>
        Swipe to compare. Auto-rotates through multiple projects.
      </Text>
    </View>
  );
}
```

---

## Advanced Configuration Examples

### Example 5: Faster Animation
```jsx
// 2-second full sweep animation
<BeforeAfterSlider
  imagePairs={imagePairs}
  animationDuration={2000}  // Down from 4000
/>
```

### Example 6: Slower Animation
```jsx
// 6-second full sweep animation
<BeforeAfterSlider
  imagePairs={imagePairs}
  animationDuration={6000}  // Up from 4000
/>
```

### Example 7: Disable Auto-Animation (Touch Only)
```jsx
// User must drag manually
<BeforeAfterSlider
  imagePairs={imagePairs}
  autoPlay={false}  // No auto-animation
/>
```

### Example 8: Faster Image Rotation
```jsx
// Switch every 3 seconds instead of 4
<BeforeAfterSlider
  imagePairs={projects}
  imageRotationInterval={3000}
/>
```

### Example 9: Slow Image Rotation
```jsx
// Switch every 8 seconds
<BeforeAfterSlider
  imagePairs={projects}
  imageRotationInterval={8000}
/>
```

### Example 10: Custom Height
```jsx
// Taller slider
<BeforeAfterSlider
  imagePairs={imagePairs}
  height={500}  // Instead of default 360
/>
```

---

## API Reference Quick Lookup

### Props Table
```typescript
interface Props {
  // REQUIRED
  imagePairs: ImagePair[]  // Array of before/after pairs
  
  // OPTIONAL
  height?: number          // Default: 360
  autoPlay?: boolean       // Default: true
  imageRotationInterval?: number   // Default: 4000 (ms)
  animationDuration?: number       // Default: 4000 (ms)
}

interface ImagePair {
  before: string | ImageSourcePropType  // Left side
  after: string | ImageSourcePropType   // Right side
}
```

---

## Common Patterns

### Pattern 1: API Data Loading
```jsx
function ApiExample() {
  const [rooms, setRooms] = useState<ImagePair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await fetch('https://api.example.com/before-after');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <BeforeAfterSlider
      imagePairs={rooms}
      height={360}
      autoPlay={true}
    />
  );
}
```

### Pattern 2: State Management
```jsx
import { useDesignStore } from '../src/store/designStore';

export function ResultScreen() {
  const { originalImage, generatedImage } = useDesignStore();

  const imagePairs: ImagePair[] = [
    {
      before: originalImage,
      after: generatedImage,
    }
  ];

  return (
    <BeforeAfterSlider
      imagePairs={imagePairs}
      height={360}
    />
  );
}
```

### Pattern 3: Conditional Rendering
```jsx
function ConditionalExample() {
  const [imagePairs, setImagePairs] = useState<ImagePair[]>([]);
  const [hasImages, setHasImages] = useState(false);

  useEffect(() => {
    // Load images
    if (imagePairs.length > 0) {
      setHasImages(true);
    }
  }, [imagePairs]);

  return (
    <View>
      {hasImages ? (
        <BeforeAfterSlider imagePairs={imagePairs} height={360} />
      ) : (
        <Text>No images available</Text>
      )}
    </View>
  );
}
```

### Pattern 4: Dynamic Styling
```jsx
function StyledExample() {
  const { colors } = useUI();
  const dynamicHeight = Math.min(SCREEN_WIDTH * 0.9, 600);

  return (
    <View style={{ backgroundColor: colors.bg }}>
      <BeforeAfterSlider
        imagePairs={imagePairs}
        height={dynamicHeight}
        autoPlay={true}
      />
    </View>
  );
}
```

---

## Error Handling

### Pattern: Safe Image Loading
```jsx
function SafeBeforeAfterSlider() {
  const [imagePairs, setImagePairs] = useState<ImagePair[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      // Load from API
      const response = await fetch('https://...');
      if (!response.ok) throw new Error('Failed to load images');
      
      const data = await response.json();
      setImagePairs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (error) {
    return <ErrorBoundary message={error} />;
  }

  if (imagePairs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <BeforeAfterSlider
      imagePairs={imagePairs}
      height={360}
      autoPlay={true}
    />
  );
}
```

---

## Performance Tips

### Tip 1: Memoize Image Pairs
```jsx
const imagePairs = useMemo(() => [
  {
    before: require('../assets/1-before.jpg'),
    after: require('../assets/1-after.jpg'),
  },
  // ...
], []);

return <BeforeAfterSlider imagePairs={imagePairs} />;
```

### Tip 2: Preload Images
```jsx
useEffect(() => {
  imagePairs.forEach((pair) => {
    Image.prefetch(typeof pair.before === 'string' ? pair.before : '');
    Image.prefetch(typeof pair.after === 'string' ? pair.after : '');
  });
}, [imagePairs]);
```

### Tip 3: Lazy Load Image Pairs
```jsx
const [displayPairs, setDisplayPairs] = useState<ImagePair[]>([]);

useEffect(() => {
  // Only load images when screen is focused
  if (isFocused) {
    loadImagePairs();
  }
}, [isFocused]);
```

---

## Complete Working Example

```jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { BeforeAfterSlider, ImagePair } from '../src/components/new-ui/BeforeAfterSlider';
import { useDesignStore } from '../src/store/designStore';
import { useUI } from '../src/components/new-ui/designSystem';

export default function ResultScreen() {
  const { colors } = useUI();
  const { originalImageUri, finalImageUrl } = useDesignStore();
  const [isLoading, setIsLoading] = useState(false);

  // Create image pairs
  const imagePairs = useMemo<ImagePair[]>(() => {
    if (!originalImageUri || !finalImageUrl) {
      return [];
    }
    return [
      {
        before: originalImageUri,
        after: finalImageUrl,
      }
    ];
  }, [originalImageUri, finalImageUrl]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (imagePairs.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: colors.text }}>No images available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView>
        <View style={styles.container}>
          {/* Header */}
          <Text style={[styles.title, { color: colors.text }]}>
            Your Design
          </Text>

          {/* Before/After Comparison */}
          <BeforeAfterSlider
            imagePairs={imagePairs}
            height={400}
            autoPlay={true}
            animationDuration={4000}
          />

          {/* Description */}
          <Text style={[styles.description, { color: colors.muted }]}>
            Drag the slider to compare your original space with the AI-generated design.
            {imagePairs.length > 1 && ' Images auto-rotate every few seconds.'}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Save Button */}
            <Pressable style={[styles.button, { backgroundColor: colors.primary }]}>
              <Text style={styles.buttonText}>Save Design</Text>
            </Pressable>

            {/* Share Button */}
            <Pressable style={[styles.button, { backgroundColor: colors.secondary }]}>
              <Text style={styles.buttonText}>Share</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## Testing Your Implementation

### Checklist
- [ ] Component renders without errors
- [ ] Slider animates smoothly left to right
- [ ] Divider line travels full width
- [ ] Labels stay fixed in corners
- [ ] User can drag divider
- [ ] Animation resumes after drag
- [ ] Multiple images rotate smoothly
- [ ] No flickering or jank
- [ ] Works on different screen sizes

---

## Next Steps

1. ✅ Update any other usages of `BeforeAfterSlider` in your app
2. ✅ Test on actual device (not just emulator)
3. ✅ Configure animation speeds as needed
4. ✅ Deploy to production

---

## Questions?

Review the `BEFORE_AFTER_REWRITE_GUIDE.md` for complete documentation.
