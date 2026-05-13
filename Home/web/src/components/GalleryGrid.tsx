import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDesignStore } from '../store/designStore';

const FILTERS = ['All', 'Modern', 'Luxury', 'Minimal', 'Japanese', 'Industrial'];

export default function GalleryGrid() {
  const { gallery } = useDesignStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredGallery = activeFilter === 'All'
    ? gallery
    : gallery.filter((item) => item.style.toLowerCase() === activeFilter.toLowerCase());

  // Flatten to individual images
  const allImages = filteredGallery.flatMap((item) =>
    item.generatedImages.map((img) => ({
      ...img,
      originalUrl: item.originalUrl,
      parentStyle: item.style,
    }))
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text mb-2">
          Your Gallery
        </h1>
        <p className="text-text-secondary text-base">
          All your AI-generated interior designs
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex gap-2.5 mb-8 overflow-x-auto no-scrollbar pb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {FILTERS.map((filter) => (
          <motion.button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeFilter === filter
                ? 'text-white'
                : 'glass-chip text-text-secondary hover:text-white'
            }`}
            style={
              activeFilter === filter
                ? {
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.25)',
                  }
                : undefined
            }
          >
            {filter}
          </motion.button>
        ))}
      </motion.div>

      {/* Grid */}
      {allImages.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-20 h-20 rounded-2xl glass-chip flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <h3 className="text-text font-semibold text-lg mb-1">No designs yet</h3>
          <p className="text-text-muted text-sm">
            Generate your first AI design to see it here
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        >
          {allImages.map((img, i) => (
            <motion.div
              key={`${img.id}-${i}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="relative group rounded-2xl overflow-hidden cursor-pointer bg-bg-card border border-border"
              onClick={() => setSelectedImage(img.url)}
            >
              <img
                src={img.url}
                alt={`${img.style} design`}
                className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute bottom-3 left-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide"
                    style={{
                      background: 'rgba(139, 92, 246, 0.6)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {img.parentStyle}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              src={selectedImage}
              alt="Full size"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
