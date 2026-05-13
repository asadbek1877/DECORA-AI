import { motion } from 'motion/react';
import { STYLES } from '../data/rooms';
import { useDesignStore } from '../store/designStore';

export default function StyleChips() {
  const { selectedStyle, setSelectedStyle } = useDesignStore();

  return (
    <motion.section
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.85, duration: 0.6 }}
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-text">Choose Style</h2>
        <p className="text-text-muted text-sm mt-1">
          Select the design aesthetic you want
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {STYLES.map((style) => {
          const isActive = selectedStyle === style.name;
          return (
            <motion.button
              key={style.name}
              onClick={() => setSelectedStyle(style.name)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                isActive
                  ? 'text-white'
                  : 'glass-chip text-text-secondary hover:text-white hover:border-white/15'
              }`}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      boxShadow: '0 0 24px rgba(139, 92, 246, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.5)',
                    }
                  : undefined
              }
            >
              <span className="text-base">{style.icon}</span>
              <span>{style.label}</span>

              {/* Active glow ring */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                    pointerEvents: 'none',
                  }}
                  layoutId="style-highlight"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
