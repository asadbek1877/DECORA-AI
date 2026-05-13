import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'motion/react';

interface ImageComparisonProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function ImageComparison({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
}: ImageComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const controls = useAnimation();

  // Auto-play Animation Loop
  useEffect(() => {
    let timeoutId: number;

    const runAutoPlay = async () => {
      if (isHovered || isInteracting) {
        controls.stop();
        return;
      }

      await controls.start({
        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`, // Move Right
        transition: { duration: 6, ease: "easeInOut" }
      });
      
      if (!isHovered && !isInteracting) {
        await controls.start({
          clipPath: `polygon(0 0, 0% 0, 0% 100%, 0 100%)`, // Move Left
          transition: { duration: 6, ease: "easeInOut" }
        });
      }

      timeoutId = window.setTimeout(runAutoPlay, 100);
    };

    if (!isHovered && !isInteracting) {
      runAutoPlay();
    }

    return () => {
      controls.stop();
      clearTimeout(timeoutId);
    };
  }, [isHovered, isInteracting, controls]);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    setIsInteracting(true);

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
    
    controls.stop();
    controls.set({
      clipPath: `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleInteractionEnd = () => {
    setIsInteracting(false);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-[2rem] cursor-ew-resize select-none group border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${className}`}
      style={{ aspectRatio: '16/9' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleInteractionEnd}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={() => { setIsHovered(true); setIsInteracting(true); }}
      onTouchEnd={handleInteractionEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* BEFORE Image (Base, Bottom Layer) */}
      <div className="absolute inset-0 w-full h-full z-[1]">
        <img src={beforeSrc} alt={beforeLabel} className="w-full h-full object-cover pointer-events-none" />
      </div>

      {/* AFTER Image (Top Layer, Revealed via Clip-Path) */}
      <motion.div
        className="absolute inset-0 w-full h-full z-[2] will-change-transform"
        initial={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
        animate={controls}
        style={isInteracting ? { clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` } : {}}
      >
        <img src={afterSrc} alt={afterLabel} className="w-full h-full object-cover pointer-events-none" />
        {/* Subtle border effect on the edge inside the clip */}
        <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-white/80 to-transparent" />
      </motion.div>

      {/* Before Label */}
      <motion.div
        className="absolute bottom-6 right-6 px-6 py-2.5 glass-panel bg-black/40 backdrop-blur-md text-white rounded-full font-label font-bold text-xs tracking-widest uppercase z-[10] border border-white/20 shadow-lg pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {beforeLabel}
      </motion.div>

      {/* After Label */}
      <motion.div
        className="absolute bottom-6 left-6 px-6 py-2.5 bg-primary/40 backdrop-blur-md text-white rounded-full font-label font-bold text-xs tracking-widest uppercase z-[10] border border-primary/50 shadow-[0_0_20px_rgba(204,151,255,0.4)] pointer-events-none"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {afterLabel}
      </motion.div>

      {/* Slider Handle (Liquid transparent effect) */}
      <motion.div
        className="absolute top-0 bottom-0 w-[4px] bg-gradient-to-b from-transparent via-white/50 to-transparent z-[20]"
        initial={{ left: '50%' }}
        animate={isInteracting ? { left: `${sliderPos}%` } : (() => {
          // When not interacting, we let the clip-path edge act as the divider.
          // To synchronize the handle perfectly with clip-path during auto-play requires complex hook mapping.
          // Instead, we fade the handle out slightly or track the visual edge via border-right on the clip path directly.
          return { opacity: 0 };
        })()}
        style={isInteracting ? { left: `${sliderPos}%`, x: '-50%' } : { display: 'none' }}
      >
        {/* Center Liquid Pill */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-24 bg-white/10 backdrop-blur-xl border border-white/30 rounded-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center overflow-hidden"
          animate={{
            scale: isHovered ? 1.1 : 1,
            height: isHovered ? 110 : 96,
            boxShadow: isHovered ? '0 0 40px rgba(255,255,255,0.4)' : '0 0 30px rgba(255,255,255,0.2)'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Inner details for liquid look */}
          <div className="flex gap-1.5 items-center">
            <div className="w-[3px] h-8 bg-white/60 rounded-full" />
            <div className="w-[3px] h-12 bg-white rounded-full shadow-[0_0_10px_white]" />
            <div className="w-[3px] h-8 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </motion.div>

      {/* Glow overlay effect when hovered */}
      <motion.div
        className="absolute inset-0 pointer-events-none mix-blend-overlay bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 z-[30]"
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
    </motion.div>
  );
}
