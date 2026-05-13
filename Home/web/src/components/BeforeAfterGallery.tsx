import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryVariant {
  id: string;
  styleName: string;
  styleCategory?: string;
  afterImageUrl: string;
  order: number;
}

interface GalleryItem {
  id: string;
  title?: string;
  beforeImageUrl: string;
  variants: GalleryVariant[];
}

interface BeforeAfterGalleryProps {
  showTitle?: boolean;
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export default function BeforeAfterGallery({
  showTitle = true,
  autoSlide = false,
  autoSlideInterval = 5000,
}: BeforeAfterGalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<Record<string, number>>({});
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // ═══════════════════════════════════════════
  // FETCH GALLERY ITEMS
  // ═══════════════════════════════════════════

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery');
        if (!res.ok) throw new Error('Failed to fetch gallery');
        const data = await res.json();
        setItems(data.data);

        // Initialize selected variant index for each item
        const defaultVariants: Record<string, number> = {};
        data.data.forEach((item: GalleryItem) => {
          defaultVariants[item.id] = 0;
        });
        setSelectedVariantIndex(defaultVariants);
      } catch (error) {
        console.error('Failed to load gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // ═══════════════════════════════════════════
  // AUTO SLIDE
  // ═══════════════════════════════════════════

  useEffect(() => {
    if (!autoSlide || items.length === 0) return;

    const timer = setInterval(() => {
      setCurrentItemIndex((prev) => (prev + 1) % items.length);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [autoSlide, autoSlideInterval, items.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-on-surface-variant">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-on-surface-variant text-lg">No gallery items available yet</p>
      </div>
    );
  }

  const currentItem = items[currentItemIndex];
  const currentVariant = currentItem.variants[selectedVariantIndex[currentItem.id] || 0];

  return (
    <div className="space-y-8">
      {showTitle && (
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-on-surface dark:text-white mb-2"
          >
            Before & After Gallery
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-on-surface-variant dark:text-gray-400"
          >
            Explore amazing transformation designs
          </motion.p>
        </div>
      )}

      {/* Main Gallery View */}
      <motion.div
        key={currentItem.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Title */}
        {currentItem.title && (
          <h3 className="text-2xl font-semibold text-on-surface dark:text-white text-center">
            {currentItem.title}
          </h3>
        )}

        {/* Before & After Comparison */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Before Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 group"
          >
            <img
              src={currentItem.beforeImageUrl}
              alt="Before"
              className="w-full h-80 md:h-96 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold">
              Before
            </div>
          </motion.div>

          {/* After Image */}
          {currentVariant && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 group"
            >
              <img
                src={currentVariant.afterImageUrl}
                alt={currentVariant.styleName}
                className="w-full h-80 md:h-96 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold">
                After - {currentVariant.styleName}
              </div>
            </motion.div>
          )}
        </div>

        {/* Style Variants Selection */}
        {currentItem.variants.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-on-surface dark:text-white">
              Available Styles ({currentItem.variants.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currentItem.variants.map((variant, idx) => (
                <motion.button
                  key={variant.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setSelectedVariantIndex({
                      ...selectedVariantIndex,
                      [currentItem.id]: idx,
                    })
                  }
                  className={`relative overflow-hidden rounded-xl transition-all ${
                    selectedVariantIndex[currentItem.id] === idx
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={variant.afterImageUrl}
                    alt={variant.styleName}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-end justify-start p-2">
                    <span className="text-white text-xs font-semibold truncate">
                      {variant.styleName}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Controls */}
      {items.length > 1 && (
        <div className="flex justify-between items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentItemIndex((prev) => (prev - 1 + items.length) % items.length)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Previous</span>
          </motion.button>

          {/* Item Counter */}
          <div className="text-center">
            <p className="text-sm text-on-surface-variant dark:text-gray-400">
              Gallery {currentItemIndex + 1} of {items.length}
            </p>
            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-2">
              {items.map((_, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentItemIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentItemIndex
                      ? 'bg-primary w-6'
                      : 'bg-gray-300 dark:bg-gray-700 w-2 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentItemIndex((prev) => (prev + 1) % items.length)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={20} />
          </motion.button>
        </div>
      )}

      {/* Thumbnails Grid (Optional) */}
      {items.length > 1 && (
        <div className="mt-12">
          <p className="text-sm font-semibold text-on-surface dark:text-white mb-4">
            All Items ({items.length})
          </p>
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {items.map((item, idx) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentItemIndex(idx)}
                className={`relative overflow-hidden rounded-lg transition-all ${
                  idx === currentItemIndex
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={item.beforeImageUrl}
                  alt={item.title}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {item.title?.substring(0, 15) || `Item ${idx + 1}`}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
