import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useDesignStore } from '../store/designStore';
import { useLanguage } from '../i18n/useLanguage';
import { ImageComparison } from '../components/ImageComparison';

// Placeholder images for demo (from the Stitch mockup Results page)
const DEMO_RESULTS = [
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDanFAPn3vIA4FKoxhRcnRlh_AEitq-JQEFnXaASSPzjLrrun6YeHn-QveyDRSSqD5KhPv1aXQ-vwzpl-Zh0lniAa95wufN3REK7WwzC4iBC-7jtakMAk-Mh2kwq8TF2ljkx42jQ8YSMXTSQQu6335H4aukYiXke1ZjtfGMKDEFDovEQ_tW7lG_d3xEW50c-keTxnCtSXUgo-5nZ9MBw0RusVD23hpYTUCIAIhyjH916Ndnef7HZ31vBx8CzbhrcHzQ0B6aoHZbeAt-',
    name: 'Luminal Lounge',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOwU7Xd06FRxt74_KnnHbg07_FbfQLs2YQC5NaKk4uNWxJaTfUygBXWeZe0mWo9eeZIDn4Y2xHuJFZ6nqC3pG2vn9fbsEaT-lQHC7023ocKfk-jIS2hgmWRjyFuz0iolSpLPMuq7KL3Ymbd1t1IZK24l09qwm564bDVNHSuq9me2IdwjLkxD2dpK2vv2kb0yRiEMKejSjWCdJa0ZNVlGhUXgTvbgqgUTiOnJXiQJ_pdV_uEdOXBAFMR9zTqRSPDhdDUn3oMKwYF76E',
    name: 'Nocturnal Sanctuary',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5VIFpG6xTfk4Llvfrs8UnHXAQvG3SGY7n4di-qjLuZJdIa3dVPUxCtL4XnofWCSnrem53wC86IKlqEY6iDKHb4la9c8Do-J9aXPLr4_XdygyJ3gFZKsO00s3k2OByPW4MdI-lgngee1mFVNehK-46ReGPk96a_z0RdPXZp0NL2ExxAhHRtxyrLeIMqUNMnVTKSbbcwTZLKJ4GS0hVBAPxHAKYcfv8glDPjm3P33bEdjUbc_qIRbL-NlbzlAqIC8_3FLB8l0Y6OhWX',
    name: 'Culinary Atelier',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArR159xVzdKP0DXm-_jlpy3mRAgh-XCKMxP54zuEJsJV_sXfhERuaHDlu_4jS2SalZ3TZPqL18tJDH-X9jP9mOUtnGnNZ-nu4QqRkuwGvOSgV6ij9P9iWGDfxAEMyMrIZTWuqeyXa8Tp-rhsQ2zTVCNnKvrFtwUsuatDbCRKskhizH9WhpuUSNgMVvB2-LgqfhOhiXAeiTIbbGBUhZyW7FRlaryt4mG8s7lS03u0xI16XvExFtXeqmSiwh0gwHlSnpSlkJfnRQ1NJX',
    name: 'Zen Workspace',
  },
];

export default function Result() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { generatedImages, isGenerating, selectedStyle, reset } = useDesignStore();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(true);

  // Build display images — use real results if available, else demo
  const results = generatedImages.length > 0
    ? generatedImages.map((img, i) => ({ url: img.url, name: `Design ${i + 1}` }))
    : DEMO_RESULTS;

  const styleName = selectedStyle
    ? selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1) + ' Style'
    : 'Modern Style';

  const handleDownload = async (url: string, name: string) => {
    try {
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
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = `decora-ai-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
      
      // Append to body, click, and remove (required for some browsers)
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error: any) {
      console.error('Download error:', error);
      if (error.name === 'AbortError') {
        alert('Download timed out. Please try again.');
      } else {
        alert(`Failed to download image: ${error.message || 'Unknown error'}. Please try again.`);
      }
    }
  };

  const handleRegenerate = () => {
    navigate('/create');
  };

  const handleTryAnother = () => {
    reset();
    navigate('/create');
  };

  return (
    <>
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
        {/* ───── Processing Overlay (shown while generating) ───── */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/95 flex flex-col items-center justify-center px-6"
            >
              <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-dim/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px]" />
              </div>

              <div className="z-10 w-full max-w-3xl text-center flex flex-col items-center">
                <div className="w-full glass-panel rounded-[2rem] p-12 border border-white/5 shadow-2xl animate-pulse-soft mb-12">
                  <div className="mb-8 relative inline-block">
                    <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full" />
                    <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1", filter: 'drop-shadow(0 0 20px rgba(156, 72, 234, 0.4))' }}>
                      temp_preferences_custom
                    </span>
                  </div>
                  <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    AI is redesigning your room...
                  </h1>
                  <p className="text-on-surface-variant text-lg font-light max-w-lg mx-auto mb-10">
                    Analyzing spatial dynamics, furniture geometry, and lighting patterns to craft your perfect aesthetic.
                  </p>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden mb-4">
                    <div className="shimmer-bar h-full w-3/4 animate-shimmer rounded-full relative">
                      <div className="absolute right-0 top-0 h-full w-12 bg-white/30 blur-sm" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-label uppercase tracking-widest text-on-surface-variant font-medium">
                    <span>Rendering Textures</span>
                    <span className="text-primary">Processing...</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {[
                    { step: 'Step 1', title: 'Spatial Mapping', desc: '3D points successfully identified.', done: true },
                    { step: 'Step 2', title: 'Style Synthesis', desc: 'Applying design palettes to layout.', done: true },
                    { step: 'Processing', title: 'Final Render', desc: 'Interpolating lighting and shadows.', done: false },
                  ].map((item) => (
                    <div key={item.step} className={`p-6 rounded-2xl glass-panel border flex flex-col items-start gap-3 ${item.done ? 'border-white/5' : 'border-primary/20'}`}>
                      <div className="flex items-center gap-3">
                        {item.done ? (
                          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        ) : (
                          <div className="w-2 h-2 bg-tertiary rounded-full animate-pulse" />
                        )}
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${item.done ? 'text-on-surface-variant' : 'text-tertiary'}`}>{item.step}</span>
                      </div>
                      <h3 className="text-sm font-bold">{item.title}</h3>
                      <p className="text-xs text-on-surface-variant text-left leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───── Header ───── */}
        <motion.header
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-7xl font-extrabold font-headline tracking-tighter mb-4">
                Your AI <span className="ai-gradient-text">Designs</span>
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-xs font-label font-medium uppercase tracking-[0.2em] text-on-surface-variant">
                  {t('result.beforeAfter')}
                </span>
                <span className="px-3 py-1 bg-surface-container-high rounded-full text-primary font-label text-xs font-semibold border border-outline-variant/15">
                  {styleName}
                </span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container-low border border-outline-variant/15 hover:bg-surface-bright transition-all text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-lg">share</span>
              <span className="text-sm font-label font-medium">Share Collection</span>
            </button>
          </div>
        </motion.header>

        {/* ───── Before/After Comparison ───── */}
        {showComparison && generatedImages.length > 0 && (
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-on-surface dark:text-white">{t('result.title')}</h2>
              <button
                onClick={() => setShowComparison(false)}
                className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Hide
              </button>
            </div>
            <ImageComparison
              beforeSrc={DEMO_RESULTS[0].url}
              afterSrc={generatedImages[0]?.url || DEMO_RESULTS[1].url}
              beforeLabel="Before"
              afterLabel="After"
              className="mb-12"
            />
          </motion.section>
        )}

        {/* ───── Results Grid ───── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {results.map((item, i) => (
            <motion.div
              key={i}
              className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-surface-container-low border border-outline-variant/15 cursor-pointer shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              onClick={() => setLightboxIdx(i)}
            >
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <div className="flex justify-between items-center">
                  <p className="text-on-surface font-headline font-bold text-lg">{item.name}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(item.url, item.name); }}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all"
                  >
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* ───── Bottom Actions ───── */}
        <section className="flex flex-col md:flex-row items-center justify-center gap-6">
          <motion.button
            onClick={handleRegenerate}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full md:w-auto px-10 py-5 rounded-2xl bg-surface-container-high border border-outline-variant/15 hover:bg-surface-bright transition-all text-on-surface font-headline font-bold flex items-center justify-center gap-3 group"
          >
            <span className="material-symbols-outlined transition-transform group-hover:rotate-180 duration-500">refresh</span>
            Regenerate
          </motion.button>
          <motion.button
            onClick={handleTryAnother}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="primary-cta w-full md:w-auto px-12 py-5 rounded-2xl text-on-primary-fixed font-headline font-extrabold text-lg flex items-center justify-center gap-3 shadow-[0_20px_40px_-10px_rgba(204,151,255,0.3)] hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined">palette</span>
            Try Another Style
          </motion.button>
        </section>
      </main>

      {/* ───── Lightbox ───── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            className="fixed inset-0 z-[100] bg-surface-container-lowest/95 backdrop-blur-2xl flex items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}
          >
            <motion.div
              className="relative max-w-5xl w-full aspect-video rounded-3xl overflow-hidden border border-white/10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxIdx(null)}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white z-10 hover:bg-white/20 transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <img
                src={results[lightboxIdx].url}
                alt={results[lightboxIdx].name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
