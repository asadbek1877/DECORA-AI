import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { BEFORE_IMG, AFTER_IMG } from "../lib/constants";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function BeforeAfterImage({
  src,
  alt,
  blur = false,
}: {
  src: string;
  alt: string;
  blur?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover ${
        blur ? "scale-110 blur-[8px] brightness-75" : ""
      }`}
    />
  );
}

function ImageCompare() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);
  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    updateSliderPosition(e.clientX, containerRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    updateSliderPosition(e.touches[0].clientX, containerRef.current);
  };

  const updateSliderPosition = (clientX: number, container: HTMLDivElement) => {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div
      className="relative mx-auto mt-14 max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/5 p-3 shadow-2xl shadow-violet-950/50"
      ref={containerRef}
      style={{ userSelect: "none" }}
    >
      <style>{`
        @keyframes slideGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.6); }
        }
        .slider-handle {
          animation: slideGlow 2s ease-in-out infinite;
        }
      `}</style>
      <div
        className="group relative h-[420px] cursor-col-resize overflow-hidden rounded-[2rem] bg-black md:h-[560px]"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            width: `${sliderPosition}%`,
            transition: isDragging ? "none" : "width 0.1s ease-out",
          }}
        >
          <BeforeAfterImage src={BEFORE_IMG} alt="Before empty room" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute left-8 top-8 rounded-full bg-black/60 px-5 py-3 text-xs font-black uppercase tracking-[.25em] text-white backdrop-blur-sm">
            Before
          </div>
        </div>

        <div
          className="absolute inset-y-0 right-0 overflow-hidden transition-all"
          style={{
            width: `${100 - sliderPosition}%`,
            transitionDuration: isDragging ? "0ms" : "0ms",
          }}
        >
          <div className="absolute inset-y-0 right-0 w-[120%]">
            <BeforeAfterImage src={AFTER_IMG} alt="After luxury bedroom" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            <div className="absolute right-8 top-8 rounded-full bg-white/20 px-5 py-3 text-xs font-black uppercase tracking-[.25em] text-white shadow-lg backdrop-blur-sm border border-white/20">
              After
            </div>
          </div>
        </div>

        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent"
          style={{
            left: `${sliderPosition}%`,
            transition: isDragging ? "none" : "left 0.1s ease-out",
          }}
        />

        <div
          className="slider-handle absolute top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-2xl backdrop-blur-xl"
          style={{
            left: `${sliderPosition}%`,
            transform: `translate(-50%, -50%)`,
            transition: isDragging ? "none" : "all 0.15s cubic-bezier(0.23, 1, 0.320, 1)",
          }}
        >
          <div className="flex gap-1">
            <Icon name="arrow" className="h-6 w-6 transform -scale-x-100" />
            <Icon name="arrow" className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Glow() {
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/30 blur-[130px]" />
      <div className="pointer-events-none absolute right-0 top-52 h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-0 top-[620px] h-[360px] w-[360px] rounded-full bg-cyan-400/10 blur-[110px]" />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
      <Glow />
      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <a
          href="/cloud"
          className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white/80 shadow-xl backdrop-blur-xl hover:bg-white/15"
        >
          <span className="rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 px-3 py-1 text-xs text-white">
            NEW
          </span>
          AI redesign engine is ready
        </a>
        <h1 className="mx-auto mt-9 max-w-5xl text-6xl font-black leading-[0.9] tracking-tight text-white sm:text-8xl lg:text-9xl">
          From Empty Room to Dream Space
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-xl font-medium leading-relaxed text-white/60 sm:text-2xl">
          Upload a room photo, choose a style, and generate a beautiful interior design preview with AI.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/cloud"
            className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-5 text-lg font-black text-slate-950 shadow-2xl shadow-white/10 transition hover:scale-[1.03]"
          >
            Explore Cloud <Icon name="arrow" />
          </Link>
          <Link
            to="/desktop"
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-8 py-5 text-lg font-black text-white backdrop-blur-xl transition hover:scale-[1.03]"
          >
            Explore Desktop
          </Link>
        </div>
        <ImageCompare />
      </div>
    </section>
  );
}

function SeenOn() {
  const logos = [
    "Digital Trends",
    "Make Use Of",
    "How-To Geek",
    "Y Combinator",
    "Beebom",
    "Medium",
    "Reddit",
    "Linux News",
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <p className="text-center text-xs font-black uppercase tracking-[.35em] text-white/35">
        As seen on
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
        {logos.map((logo) => (
          <div
            key={logo}
            className="rounded-2xl border border-white/10 bg-white/[.04] px-4 py-5 text-center text-sm font-black text-white/45"
          >
            {logo}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      <Hero />
      <SeenOn />
    </div>
  );
}
