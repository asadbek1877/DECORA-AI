import { motion } from 'motion/react';
import { useDesignStore } from '../store/designStore';

export default function PromptInput() {
  const { customPrompt, setCustomPrompt } = useDesignStore();
  const maxLength = 500;

  return (
    <motion.section
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6 }}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text">Custom Prompt</h2>
          <span className="text-xs text-text-muted font-medium">Optional</span>
        </div>
        <p className="text-text-muted text-sm mt-1">
          Add specific details about your desired design
        </p>
      </div>

      <div className="relative">
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value.slice(0, maxLength))}
          placeholder="Describe your desired design... (e.g., 'Add warm oak flooring, a velvet navy sofa, and soft ambient lighting')"
          rows={3}
          className="w-full glass-input rounded-xl p-4 text-text placeholder:text-text-muted/50 resize-none outline-none focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all duration-300 text-sm leading-relaxed"
        />

        {/* Character count */}
        <div className="absolute bottom-3 right-3 text-xs text-text-muted/40 font-medium">
          {customPrompt.length}/{maxLength}
        </div>
      </div>
    </motion.section>
  );
}
