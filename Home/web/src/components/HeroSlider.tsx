import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BEFORE_AFTER_PAIRS } from '../data/rooms';

export default function HeroSlider() {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoAnimating, setIsAutoAnimating] = useState(true);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const autoResumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pair = BEFORE_AFTER_PAIRS[currentPairIndex];

  // ─── Auto animation (left → right → left, 6-7s per direction) ───
  useEffect(() => {
    if (!isAutoAnimating || isDragging) return;

    let start: number | null = null;
    let direction = 1; // 1 = going right, -1 = going left
    const DURATION = 6500; // ms per direction

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / DURATION, 1);

      // ease-in-out using sine
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * progress);

      if (direction === 1) {
        setSliderPos(15 + eased * 70); // 15% → 85%
      } else {
        setSliderPos(85 - eased * 70); // 85% → 15%
      }

      if (progress >= 1) {
        direction *= -1;
        start = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAutoAnimating, isDragging]);

  // ─── Image rotation every 2 minutes ───
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentPairIndex((prev) => (prev + 1) % BEFORE_AFTER_PAIRS.length);
        setIsFading(false);
      }, 600);
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  // ─── Drag handling ───
  const updatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(percent);
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setIsAutoAnimating(false);
      if (autoResumeTimeout.current) clearTimeout(autoResumeTimeout.current);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    // Resume auto animation after 5 seconds of inactivity
    if (autoResumeTimeout.current) clearTimeout(autoResumeTimeout.current);
    autoResumeTimeout.current = setTimeout(() => {
      setIsAutoAnimating(true);
    }, 5000);
  }, []);

  return (
    <section className="relative w-full max-w-4xl mx-auto">
      {/* Overlay text */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-white via-primary-light to-accent-light bg-clip-text text-transparent">
            Transform your room
          </span>
          <br />
          <span className="text-text-secondary text-2xl sm:text-3xl lg:text-4xl font-semibold">
            instantly with AI
          </span>
        </h1>
        <p className="text-text-muted text-base sm:text-lg max-w-lg mx-auto">
          Upload a photo of any room and watch AI redesign it in your preferred style
        </p>
      </motion.div>

      {/* Slider Container */}
      <motion.div
        ref={containerRef}
        className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-2xl shadow-black/40"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Before image (full, z-1) */}
        <AnimatePresence mode="wait">
          <motion.img
            key={`before-${pair.id}`}
            src={pair.before}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 1 }}
            initial={{ opacity: isFading ? 0 : 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            draggable={false}
          />
        </AnimatePresence>

        {/* After image (clipped, z-2) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`after-${pair.id}`}
            className="absolute inset-0"
            style={{
              zIndex: 2,
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
            }}
            initial={{ opacity: isFading ? 0 : 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={pair.after}
              alt="After"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Labels */}
        <div
          className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          Before
        </div>
        <div
          className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{
            background: 'rgba(139,92,246,0.6)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
          }}
        >
          After
        </div>

        {/* Divider handle */}
        <div
          className="absolute top-0 bottom-0 slider-handle"
          style={{
            left: `${sliderPos}%`,
            transform: 'translateX(-50%)',
            zIndex: 10,
            width: '3px',
            background: 'rgba(255,255,255,0.8)',
            boxShadow: '0 0 12px rgba(255,255,255,0.3)',
          }}
        >
          {/* Handle circle */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3), 0 0 20px rgba(139,92,246,0.2)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 3L2 8L5 13" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 3L14 8L11 13" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Gradient overlay at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            zIndex: 5,
            background: 'linear-gradient(to top, rgba(10,10,15,0.6) 0%, transparent 100%)',
          }}
        />

        {/* Pair label */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full text-sm font-medium text-white/70"
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {pair.label}
        </div>
      </motion.div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {BEFORE_AFTER_PAIRS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsFading(true);
              setTimeout(() => {
                setCurrentPairIndex(i);
                setIsFading(false);
              }, 400);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentPairIndex
                ? 'w-6 bg-primary'
                : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
