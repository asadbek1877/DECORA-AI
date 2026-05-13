/**
 * Demo Data — Before/After image pairs & styles
 */

export interface BeforeAfterPair {
  id: string;
  before: string;
  after: string;
  label: string;
}

export interface StyleOption {
  name: string;
  label: string;
  icon: string;
  description: string;
}

export const STYLES: StyleOption[] = [
  { name: 'modern', label: 'Modern', icon: '🏙️', description: 'Clean lines, neutral tones, contemporary feel' },
  { name: 'luxury', label: 'Luxury', icon: '👑', description: 'Rich materials, gold accents, opulent design' },
  { name: 'minimal', label: 'Minimal', icon: '◻️', description: 'Less is more, whitespace, simplicity' },
  { name: 'japanese', label: 'Japanese', icon: '🏯', description: 'Zen aesthetics, natural materials, harmony' },
  { name: 'industrial', label: 'Industrial', icon: '🏭', description: 'Raw materials, exposed brick, metal accents' },
];

// Before/After pairs for the hero slider
export const BEFORE_AFTER_PAIRS: BeforeAfterPair[] = [
  {
    id: 'pair1',
    before: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
    after: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
    label: 'Living Room Transformation',
  },
  {
    id: 'pair2',
    before: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
    after: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
    label: 'Modern Bedroom Redesign',
  },
  {
    id: 'pair3',
    before: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
    after: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    label: 'Kitchen Revival',
  },
  {
    id: 'pair4',
    before: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
    after: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200&q=80',
    label: 'Scandinavian Studio',
  },
];

// Gallery fallback images
export const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80',
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500&q=80',
];
