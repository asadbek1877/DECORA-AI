import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useDesignStore } from '../store/designStore';

export default function ResultGrid() {
  const navigate = useNavigate();
  const {
    generatedImages,
    isGenerating,
    selectedStyle,
    regenerate,
    reset,
    error,
    clearError,
  } = useDesignStore();

  const handleDownload = async (url: string, index: number) => {
    try {
      // Validate URL
      if (!url || !url.startsWith('http')) {
        alert('Invalid image URL. Please try again.');
        return;
      }

      // Fetch the image with timeout protection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      // Check for successful response
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      // Get the blob with proper error handling
      const blob = await response.blob();

      // Validate blob size
      if (blob.size === 0) {
        throw new Error('Image file is empty');
      }

      // Create and trigger download
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `decora-ai-${selectedStyle}-${index + 1}.png`;
      
      // Append to body, click, and remove (required for some browsers)
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
    } catch (error: any) {
      console.error('Download error:', error);
      
      if (error.name === 'AbortError') {
        alert('Download timed out. Please try again.');
      } else if (error.message.includes('HTTP')) {
        alert('Failed to download image. The image may no longer be available.');
        // Fallback: open in new tab
        window.open(url, '_blank');
      } else {
        alert(`Failed to download image: ${error.message || 'Unknown error'}. Trying to open in new tab...`);
        // Fallback: open in new tab
        window.open(url, '_blank');
      }
    }
  };

  const handleRegenerate = async () => {
    clearError();
    await regenerate();
  };

  const handleTryAnother = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text mb-2">
          Your AI Designs
        </h1>
        <p className="text-text-secondary text-base">
          Here are 4 variations in <span className="text-primary-light font-semibold capitalize">{selectedStyle}</span> style
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
          }}
        >
          <span>{error}</span>
          <button onClick={clearError} className="ml-auto text-text-muted hover:text-white">✕</button>
        </motion.div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {generatedImages.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: i * 0.15,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative group rounded-2xl overflow-hidden bg-bg-card border border-border"
          >
            {img.url ? (
              <img
                src={img.url}
                alt={`AI generated design ${i + 1}`}
                className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center bg-bg-card shimmer">
                <span className="text-text-muted text-sm">Generating...</span>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
              <motion.button
                onClick={() => handleDownload(img.url, i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download
              </motion.button>
            </div>

            {/* Variant number */}
            <div
              className="absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white/80"
              style={{
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {i + 1}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <motion.button
          onClick={handleRegenerate}
          disabled={isGenerating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.25)',
          }}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                ⏳
              </motion.span>
              Regenerating...
            </span>
          ) : (
            '🔄 Regenerate'
          )}
        </motion.button>

        <motion.button
          onClick={handleTryAnother}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-text-secondary text-sm glass-chip hover:text-white hover:border-white/15 transition-all"
        >
          ✨ Try Another Style
        </motion.button>
      </motion.div>
    </div>
  );
}
