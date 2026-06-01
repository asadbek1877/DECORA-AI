import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useDesignStore } from '../store/designStore';
import { useDesignWorkflow } from '../hooks/useDesignWorkflow';
import { useGenerationLimit } from '../hooks/useGenerationLimit';

const STYLES = [
  { name: 'modern', label: 'Modern' },
  { name: 'luxury', label: 'Luxury' },
  { name: 'minimal', label: 'Minimalist' },
  { name: 'japanese', label: 'Japanese' },
  { name: 'industrial', label: 'Industrial' },
];

const WORKSPACE_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWeifhjf5wFbyvs9x2vr0jLjQfDp-J63LhClIqpc_oZ3ng6abrzmc8Cjh5lwMB7CJ_wy1vUd8ycB1LtV3gbv3aJccTbKojjf7q0rzg7uNori6Qk3-stRC6P1bibJBbpi9B7MeyF8T6Rj9GOHKWxadkgfKSMzLMpDrBNhTrl-CxvI5_q7j_pxikCjd_Iw17jKY0ncSKKK47-BNFdSl-l5jkQQn8SmKsVdXyOk495JpthAFC6mWm2UHij09dj2QqlmdTQM7AzZffkxWR';

const RECENT = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB-hdhJh4lN5tkDh_0hhYzOHlCtezKbaKprv7bzS9gpefa3cHksUkomGDdCkCNFs0lHdPtuaTD16XXptU7Ypy6nnd5B0TMFwTrdbTQyIyNuWdLWBUF566A2R6WcULCmiV9CV9zsQo3prCfa0kZkD9fcaVK1GMRwqcEGtL7SUxhwELLnW1wyPTIeE-X5IDhTG7AHNHaVWnuC300KFjcOW6C50bBgm_sv30X76COWkcFiqbueMicqu134631GLQq8jgKc1UaCLN6C7WT1',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB-Lj7FQXf1H4tskOB89rZBFKE1V0UwpPimNL3bEFY4RLmdKes8_YQxB6ZyKPfX8wb86EqqQ-sRkUYArvtz9RJ9ybYQit0wKE25_fND5i4zHMzXSQkqTGyX_oIQUrre5i1g31mN0ofLTUfmzAQJBUY-3yDy8UcpMxdJ0KBLRiUPL4HDQYXBP8-bfQ-hiX53trGP31PAp-6_NublTtRwz339ACMCGmCiGvX1E94rmCWm8Ygy7H8NZFiuiIqTu9DhGav-7H7cAIy0gmLj',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBD5qvPShn_oTHSx0I1phDEPpKnpMbgHEjohZjt8S0Cz-mW6Kezo0ekFjspH82DqgMcZLyAaf987ZwMKfxcVPh6etf9SDVhSws4_2wMso-jfKaytJXrzIGC_7FBjPYo573XJTWkHj9zSEKJ0ud-JIOsHDPeYd4df5oBX9KJe96_6Y7TLZQD9apVJaHqhwdv5LHu54haj_onxE9JrZJhoyYPeten9JxZq9fG8Wu_QlYOSmaLhK9F3ywIXXGWXdknNrz1qN7ToFV_Qw6F',
];

export default function Create() {
  const navigate = useNavigate();
  const {
    uploadedPreview,
    selectedStyle,
    customPrompt,
    isUploading,
    isGenerating,
    error,
    setSelectedStyle,
    setCustomPrompt,
    clearError,
  } = useDesignStore();
  const { setFileWithPreview, uploadAndGenerate } = useDesignWorkflow();
  const { canGenerate, trackGeneration, rollbackGeneration } = useGenerationLimit();

  const [isDragOver, setIsDragOver] = useState(false);
  const [promptLen, setPromptLen] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const isLoading = isUploading || isGenerating;

  const handleFile = useCallback((file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/)) return;
    setFileWithPreview(file);
  }, [setFileWithPreview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleGenerate = async () => {
    if (!canGenerate()) {
      setShowPremiumModal(true);
      return;
    }

    clearError();
    try {
      trackGeneration();
      await uploadAndGenerate();
      navigate('/result');
    } catch (err) {
      rollbackGeneration();
    }
  };

  return (
    <main className="flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* ───── Left Column: Controls ───── */}
      <motion.div
        className="lg:col-span-5 flex flex-col gap-10"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <header>
          <h1 className="font-headline text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Refine Your{' '}
            <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">Vision.</span>
          </h1>
          <p className="text-on-surface-variant font-light text-lg max-w-md">
            Upload your space and let our AI atelier transform it into a masterpiece.
          </p>
        </header>

        {/* Upload Zone */}
        <AnimatePresence mode="wait">
          {uploadedPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative rounded-3xl overflow-hidden group"
            >
              <img src={uploadedPreview} alt="Uploaded room" className="w-full aspect-video object-cover rounded-3xl" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <button
                  onClick={() => setFileWithPreview(null)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-error/70 backdrop-blur"
                >
                  ✕ Remove
                </button>
              </div>
              <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur px-3 py-1 rounded-full text-xs font-label tracking-widest uppercase text-on-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Uploaded
              </div>
            </motion.div>
          ) : (
            <motion.label
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              htmlFor="file-upload"
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              className={`relative group cursor-pointer dashed-border w-full aspect-video rounded-3xl flex flex-col items-center justify-center p-8 transition-all duration-500 ${
                isDragOver ? 'bg-primary/10' : 'bg-surface-container-low/30 hover:bg-surface-container-low/50'
              }`}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                className="hidden"
              />
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
              </div>
              <span className="font-headline font-bold text-lg mb-1">Upload Photo</span>
              <span className="text-on-surface-variant text-sm font-light">Drag and drop or click to browse</span>
              <span className="mt-4 text-[10px] font-label tracking-widest text-primary/60 uppercase">
                Maximum file size: 25MB
              </span>
            </motion.label>
          )}
        </AnimatePresence>

        {/* Style Chips */}
        <section>
          <label className="font-label text-[11px] font-medium tracking-[0.2em] text-on-surface-variant uppercase mb-6 block">
            Select Aesthetic
          </label>
          <div className="flex flex-wrap gap-3">
            {STYLES.map((style) => (
              <motion.button
                key={style.name}
                onClick={() => setSelectedStyle(style.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-full font-headline font-bold text-sm transition-all ${
                  selectedStyle === style.name
                    ? 'glass-card border border-primary/40 text-primary neon-glow-primary'
                    : 'bg-surface-container-high/40 border border-white/5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                {style.label}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Prompt Input */}
        <section className="flex flex-col gap-4">
          <label className="font-label text-[11px] font-medium tracking-[0.2em] text-on-surface-variant uppercase block">
            Personalized Requests
          </label>
          <div className="relative">
            <textarea
              value={customPrompt}
              onChange={(e) => {
                const val = e.target.value.slice(0, 200);
                setCustomPrompt(val);
                setPromptLen(val.length);
              }}
              className="w-full bg-surface-container-lowest/40 border border-white/5 rounded-2xl p-5 text-on-surface font-body font-light placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/50 backdrop-blur-md transition-all h-32 resize-none"
              placeholder="Add a green sofa, or maybe more natural light..."
            />
            <div className="absolute bottom-4 right-4 text-xs text-on-surface-variant/40 font-label">
              {promptLen}/200
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl text-sm font-medium flex items-center gap-3 bg-error-container/20 border border-error/20 text-on-error-container"
          >
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="text-on-surface-variant hover:text-on-surface">✕</button>
          </motion.div>
        )}

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={!uploadedPreview || isLoading}
          whileHover={uploadedPreview && !isLoading ? { y: -2 } : {}}
          whileTap={uploadedPreview && !isLoading ? { scale: 0.98 } : {}}
          className={`w-full py-6 rounded-2xl font-headline font-extrabold text-xl tracking-tight flex items-center justify-center gap-3 transition-all duration-300 ${
            !uploadedPreview || isLoading
              ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
              : 'bg-gradient-to-r from-primary via-tertiary to-secondary text-on-primary shadow-[0_20px_40px_-10px_rgba(204,151,255,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(204,151,255,0.6)]'
          }`}
        >
          {isLoading ? (
            <>
              <motion.span
                className="material-symbols-outlined"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                progress_activity
              </motion.span>
              {isUploading ? 'Uploading...' : 'AI is redesigning your room...'}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Generate Design
            </>
          )}
        </motion.button>
      </motion.div>

      {/* ───── Right Column: Canvas/Preview ───── */}
      <motion.div
        className="lg:col-span-7 flex flex-col gap-8"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Main Canvas */}
        <div className="relative rounded-[2rem] overflow-hidden bg-surface-container-lowest aspect-[4/5] shadow-2xl border border-white/5 flex items-center justify-center group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-tertiary/10 opacity-50" />

          {uploadedPreview ? (
            <img
              src={uploadedPreview}
              alt="Your room"
              className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-700"
            />
          ) : (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={WORKSPACE_IMAGE}
                alt="Workspace canvas"
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
              />
            </div>
          )}

          {/* Empty State */}
          {!uploadedPreview && (
            <div className="relative z-10 text-center flex flex-col items-center max-w-sm px-8">
              <div className="w-24 h-24 rounded-full bg-surface-container-highest/60 backdrop-blur-2xl flex items-center justify-center mb-6 shadow-2xl border border-white/10">
                <span className="material-symbols-outlined text-4xl text-primary/40">imagesmode</span>
              </div>
              <h3 className="font-headline font-bold text-2xl mb-2">Workspace Canvas</h3>
              <p className="text-on-surface-variant font-light text-center leading-relaxed">
                Your AI-generated transformation will appear here. Start by uploading a photo of your current space.
              </p>
            </div>
          )}

          {/* AI Status Badge */}
          <div className="absolute top-8 right-8 z-20 flex gap-3">
            <div className="glass-card px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(204,151,255,1)]" />
              <span className="font-label text-[10px] tracking-widest uppercase font-bold text-on-surface">
                AI Rendering Engine Ready
              </span>
            </div>
          </div>
        </div>

        {/* Recent Creations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RECENT.map((src, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden glass-card border border-white/5 hover:border-primary/30 transition-all cursor-pointer">
              <img src={src} alt={`Recent design ${i + 1}`} className="w-full h-full object-cover opacity-80" />
            </div>
          ))}
          <div className="aspect-square rounded-2xl overflow-hidden glass-card border border-white/5 hover:border-primary/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-primary/40">auto_stories</span>
            <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant">View All</span>
          </div>
        </div>
      </motion.div>

      {/* Premium Modal (Free Demo Limit Reached) */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-surface-container-low rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10 relative overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[50px] rounded-full" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 blur-[50px] rounded-full" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center mb-6 shadow-lg">
                  <span className="material-symbols-outlined text-white text-3xl">workspace_premium</span>
                </div>
                <h2 className="text-2xl font-headline font-bold mb-3">Free Limit Reached</h2>
                <p className="text-on-surface-variant font-light mb-8">
                  You've used up your free generation. To unlock unlimited AI redesigns and premium features, please log in or purchase an access plan.
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <button className="w-full py-4 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">login</span>
                    Log in / Register
                  </button>
                  <button onClick={() => setShowPremiumModal(false)} className="w-full py-4 rounded-xl font-bold bg-surface-container-highest text-on-surface hover:bg-white/5 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
