import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useDesignStore } from '../store/designStore';
import { useDesignWorkflow } from '../hooks/useDesignWorkflow';

export default function GenerateButton() {
  const navigate = useNavigate();
  const {
    uploadedFile,
    isUploading,
    isGenerating,
    error,
    clearError,
  } = useDesignStore();
  const { uploadAndGenerate } = useDesignWorkflow();

  const isLoading = isUploading || isGenerating;
  const isDisabled = !uploadedFile || isLoading;

  const handleGenerate = async () => {
    clearError();
    try {
      await uploadAndGenerate();
      navigate('/result');
    } catch {
      // Error is set in store
    }
  };

  return (
    <motion.section
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.15, duration: 0.6 }}
    >
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl text-sm font-medium flex items-center gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-error">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{error}</span>
          <button onClick={clearError} className="ml-auto text-text-muted hover:text-white transition-colors">✕</button>
        </motion.div>
      )}

      {/* Generate button */}
      <motion.button
        onClick={handleGenerate}
        disabled={isDisabled}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        className={`relative w-full h-14 sm:h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 ${
          isDisabled
            ? 'bg-white/[0.05] text-text-muted cursor-not-allowed border border-white/[0.04]'
            : 'text-white cursor-pointer'
        }`}
        style={
          !isDisabled
            ? {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #8b5cf6 100%)',
                backgroundSize: '200% 200%',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.3), 0 8px 32px rgba(99, 102, 241, 0.2)',
              }
            : undefined
        }
      >
        {/* Shimmer overlay when loading */}
        {isLoading && (
          <div
            className="absolute inset-0 shimmer"
            style={{ zIndex: 1 }}
          />
        )}

        <span className="relative z-10 flex items-center gap-3">
          {isLoading ? (
            <>
              <motion.svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
              </motion.svg>
              <span>
                {isUploading ? 'Uploading image…' : 'AI is redesigning your room…'}
              </span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Generate Design</span>
            </>
          )}
        </span>
      </motion.button>

      {/* Hint text */}
      {!uploadedFile && (
        <p className="text-center text-text-muted text-xs mt-3">
          Upload an image above to get started
        </p>
      )}
    </motion.section>
  );
}
