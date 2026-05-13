import { useEffect, useMemo, useRef, useState } from "react";
import {
  Aperture,
  ArrowRight,
  BadgeCheck,
  Brain,
  Check,
  ImageUp,
  Layers3,
  Maximize2,
  ScanLine,
  Wand2,
  X,
} from "lucide-react";

const demoImages = {
  before: "/images/demo/room-before.webp",
  after: "/images/demo/room-after.png",
  studioBefore: "/images/demo/studio-before.webp",
  studioAfter: "/images/demo/studio-after.png",
  loftBefore: "/images/demo/loft-before.webp",
  loftAfter: "/images/demo/loft-after.png",
};

const processingSteps = [
  { label: "Upload", icon: ImageUp },
  { label: "AI Scanning", icon: ScanLine },
  { label: "Style Generation", icon: Wand2 },
  { label: "Final Result", icon: BadgeCheck },
];

const features = [
  {
    title: "Room DNA Scan",
    icon: ScanLine,
    accent: "from-cyan-400 to-blue-500",
    image: demoImages.before,
    before: demoImages.before,
    after: demoImages.after,
    text: "PixelLift reads layout, lighting, furniture scale, floor lines, windows, and spatial constraints before generating a redesign that still feels physically believable.",
  },
  {
    title: "Style Memory",
    icon: Brain,
    accent: "from-violet-400 to-fuchsia-500",
    image: demoImages.studioAfter,
    before: demoImages.studioBefore,
    after: demoImages.studioAfter,
    text: "Save a design direction once and apply the same taste profile across bedrooms, studios, kitchens, and rental units without rebuilding prompts every time.",
  },
  {
    title: "Instant Variants",
    icon: Layers3,
    accent: "from-emerald-300 to-teal-500",
    image: demoImages.loftAfter,
    before: demoImages.loftBefore,
    after: demoImages.loftAfter,
    text: "Generate multiple redesign paths from one upload: warmer lighting, premium minimalism, bold accents, or resale-ready neutral staging.",
  },
  {
    title: "Commercial Polish",
    icon: Aperture,
    accent: "from-amber-300 to-orange-500",
    image: demoImages.after,
    before: demoImages.before,
    after: demoImages.after,
    text: "Create polished listing-ready visuals for landing pages, ads, client decks, and renovation previews with clean composition and elevated material choices.",
  },
];

type ProcessingState = "idle" | "processing" | "done";

function useRevealAnimations() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function ScrollVelocityMarquee() {
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const offsets = useRef([0, 0, 0]);
  const velocity = useRef(0);
  const targetVelocity = useRef(0);
  const lastScrollY = useRef(0);
  const frameRef = useRef<number | null>(null);
  const itemWidth = useRef(1200);
  const marqueeText = "PIXELLIFT AI ROOM REDESIGN";

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const measure = () => {
      const firstTrack = rowRefs.current[0]?.querySelector<HTMLElement>(".scroll-marquee__item");
      if (firstTrack) itemWidth.current = firstTrack.offsetWidth;
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const baseSpeed = prefersReducedMotion ? 0 : 0.42;

    const pushVelocity = (delta: number) => {
      // Scroll gives a temporary boost; the multiplier is calmer than the previous fast marquee.
      targetVelocity.current += delta * 1.75;
    };

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      pushVelocity(nextScrollY - lastScrollY.current);
      lastScrollY.current = nextScrollY;
    };

    const handleWheel = (event: WheelEvent) => {
      pushVelocity(event.deltaY);
    };

    const animate = () => {
      velocity.current += (targetVelocity.current - velocity.current) * 0.075;
      targetVelocity.current *= 0.91;

      rowRefs.current.forEach((row, index) => {
        if (!row) return;
        const direction = index === 1 ? -1 : 1;
        offsets.current[index] += (baseSpeed + velocity.current * 0.012) * direction;
        offsets.current[index] = ((offsets.current[index] % itemWidth.current) + itemWidth.current) % itemWidth.current;
        row.style.transform = `translate3d(${-offsets.current[index]}px, 0, 0)`;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <section className="scroll-marquee reveal reveal-blur" aria-label="PixelLift motion headline">
      {[0, 1, 2].map((rowIndex) => (
        <div className="scroll-marquee__viewport" key={rowIndex}>
          <div
            className="scroll-marquee__track"
            ref={(node) => {
              rowRefs.current[rowIndex] = node;
            }}
          >
            {Array.from({ length: 6 }).map((_, itemIndex) => (
              <span className="scroll-marquee__item" key={itemIndex}>
                {marqueeText}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function BeforeAfterSlider({
  before,
  after,
  beforeLabel = "Original / Before",
  afterLabel = "Redesigned / After",
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const latestX = useRef(50);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = (clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    latestX.current = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));

    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(() => {
        setPosition(latestX.current);
        frameRef.current = null;
      });
    }
  };

  useEffect(() => {
    const stopDrag = () => setDragging(false);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);

    return () => {
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      ref={sliderRef}
      className="reveal reveal-mask group relative aspect-[16/10] w-full touch-none overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl shadow-black/50"
      onPointerDown={(event) => {
        setDragging(true);
        updateFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (dragging || event.pointerType === "mouse") updateFromClientX(event.clientX);
      }}
    >
      <img
        src={after}
        alt={afterLabel}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={before}
          alt={beforeLabel}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
        />
      </div>

      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur-xl">
        {beforeLabel}
      </div>
      <div className="absolute right-4 top-4 rounded-full border border-cyan-300/25 bg-cyan-400/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-xl">
        {afterLabel}
      </div>

      <div
        className="absolute bottom-0 top-0 z-20 w-px bg-white/90 shadow-[0_0_28px_rgba(103,232,249,0.9)]"
        style={{ left: `${position}%` }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/15 shadow-[0_0_36px_rgba(139,92,246,0.55)] backdrop-blur-2xl">
          <Maximize2 className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ProcessingAnimation({
  state,
  progress,
  activeStep,
}: {
  state: ProcessingState;
  progress: number;
  activeStep: number;
}) {
  return (
    <div className="reveal reveal-scale relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
      <div className="premium-scan-lines" />
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200/80">
            AI Processing
          </p>
          <h3 className="mt-1 text-2xl font-black text-white">
            {state === "done" ? "Final redesign is ready" : processingSteps[activeStep].label}
          </h3>
        </div>
        <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100">
          {Math.round(progress)}%
        </div>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 shadow-[0_0_26px_rgba(34,211,238,0.7)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="reveal reveal-stagger mt-6 grid gap-3 sm:grid-cols-4">
        {processingSteps.map((step, index) => {
          const Icon = step.icon;
          const complete = progress >= ((index + 1) / processingSteps.length) * 100;
          const current = index === activeStep && state === "processing";

          return (
            <div
              key={step.label}
              className={`relative rounded-2xl border p-4 transition-all duration-300 ${
                complete || current
                  ? "border-cyan-300/35 bg-cyan-300/10 text-white"
                  : "border-white/10 bg-white/[0.035] text-white/45"
              }`}
            >
              <Icon className={current ? "premium-pulse mb-3 h-6 w-6" : "mb-3 h-6 w-6"} />
              <p className="text-sm font-bold">{step.label}</p>
              {complete && <Check className="absolute right-3 top-3 h-4 w-4 text-emerald-300" />}
            </div>
          );
        })}
      </div>

      {state === "processing" && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index} className="premium-particle" style={{ "--i": index } as React.CSSProperties} />
          ))}
        </div>
      )}
    </div>
  );
}

function LiveDemoUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState(demoImages.before);
  const [fileName, setFileName] = useState("Demo room photo");
  const [state, setState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const activeStep = Math.min(processingSteps.length - 1, Math.floor(progress / 25));

  const startProcessing = (file?: File) => {
    if (file) {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = URL.createObjectURL(file);
      setFileName(file.name);
      setPreview(previewUrlRef.current);
    }

    setState("processing");
    setProgress(0);

    const startedAt = performance.now();
    const duration = 3600;

    const tick = (now: number) => {
      const nextProgress = Math.min(100, ((now - startedAt) / duration) * 100);
      setProgress(nextProgress);

      if (nextProgress < 100) {
        requestAnimationFrame(tick);
      } else {
        setState("done");
      }
    };

    requestAnimationFrame(tick);
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    startProcessing(file);
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  return (
    <section className="reveal mx-auto grid max-w-7xl gap-8 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="flex flex-col justify-center">
        <p className="reveal reveal-up mb-4 w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
          Live Demo Upload
        </p>
        <h2 className="reveal reveal-up reveal-blur max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
          Try PixelLift AI on a room photo
        </h2>
        <p className="reveal reveal-up mt-5 max-w-xl text-lg text-white/64">
          Drop a room image, watch the AI pipeline, then compare the uploaded room with a premium demo redesign.
        </p>

        <div
          className="reveal reveal-scale mt-8 cursor-pointer rounded-3xl border border-dashed border-white/20 bg-white/[0.045] p-6 text-center shadow-2xl shadow-black/25 backdrop-blur-2xl transition-all duration-300 hover:border-cyan-300/45 hover:bg-cyan-300/[0.075] hover:shadow-cyan-500/20"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFiles(event.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <div className="reveal reveal-icon mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 shadow-[0_0_34px_rgba(34,211,238,0.35)]">
            <ImageUp className="h-8 w-8 text-white" />
          </div>
          <h3 className="mt-5 text-xl font-black text-white">Drag & drop room image</h3>
          <p className="mt-2 text-sm text-white/50">or click to choose a file from your device</p>
          <p className="mt-4 truncate rounded-full bg-black/25 px-4 py-2 text-sm font-bold text-cyan-100">
            {fileName}
          </p>
        </div>

        <button
          onClick={() => startProcessing()}
          className="reveal reveal-button mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-black text-[#070511] shadow-[0_0_34px_rgba(255,255,255,0.22)] hover:scale-[1.01] sm:w-fit"
        >
          Run demo generation <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-5">
        <ProcessingAnimation state={state} progress={state === "idle" ? 0 : progress} activeStep={activeStep} />
        {state === "done" ? (
          <BeforeAfterSlider before={preview} after={demoImages.after} />
        ) : (
          <div className="reveal reveal-scale relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
            <img src={preview} alt="Uploaded room preview" className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
              <p className="text-sm font-bold text-white/70">Upload preview</p>
              <p className="mt-1 text-xl font-black text-white">Result appears here after processing</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FeatureCards() {
  const [activeFeature, setActiveFeature] = useState<(typeof features)[number] | null>(null);

  return (
    <section className="reveal mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="reveal reveal-up mb-4 w-fit rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-violet-100">
            Interactive Feature Cards
          </p>
          <h2 className="reveal reveal-up reveal-blur max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            Premium AI features built for visual decisions
          </h2>
        </div>
        <p className="reveal reveal-up max-w-md text-white/58">
          Hover for glow and tilt, click any card for a feature modal with richer previews.
        </p>
      </div>

      <div className="reveal reveal-stagger grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <button
              key={feature.title}
              onClick={() => setActiveFeature(feature)}
              className="reveal reveal-scale premium-feature-card group text-left"
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
                const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
                event.currentTarget.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg) scale(1.03)`;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
              }}
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} shadow-lg shadow-violet-500/20`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <img src={feature.image} alt="" className="mb-5 h-40 w-full rounded-2xl object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.03]" />
              <h3 className="text-2xl font-black text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{feature.text}</p>
            </button>
          );
        })}
      </div>

      {activeFeature && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-xl" onClick={() => setActiveFeature(null)}>
          <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[32px] border border-white/12 bg-[#0b0a18]/95 p-5 shadow-2xl shadow-black" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/70">Feature detail</p>
                <h3 className="mt-1 text-3xl font-black text-white">{activeFeature.title}</h3>
              </div>
              <button
                onClick={() => setActiveFeature(null)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/20"
                aria-label="Close feature modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                <img src={activeFeature.image} alt="" className="h-full min-h-[320px] w-full object-cover" />
              </div>
              <div className="space-y-5">
                <BeforeAfterSlider before={activeFeature.before} after={activeFeature.after} beforeLabel="Before" afterLabel="After" />
                <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-6">
                  <p className="text-lg leading-8 text-white/72">{activeFeature.text}</p>
                  <button className="mt-6 rounded-2xl bg-white px-6 py-3 font-black text-[#070511] hover:scale-[1.02]">
                    Preview this workflow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function HomePageTest() {
  useRevealAnimations();

  const heroSlider = useMemo(
    () => <BeforeAfterSlider before={demoImages.before} after={demoImages.after} />,
    [],
  );

  return (
    <div className="premium-landing relative min-h-screen overflow-hidden bg-[#070511] text-white">
      <div className="premium-animated-bg" />
      <div className="premium-noise" />

      <section className="reveal relative mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:py-24 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="reveal reveal-up mb-5 w-fit rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100 backdrop-blur-xl">
            AI room redesign website
          </p>
          <h1 className="reveal reveal-up reveal-blur max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl">
            PixelLift redesigns rooms before you renovate.
          </h1>
          <p className="reveal reveal-up mt-6 max-w-2xl text-lg leading-8 text-white/64">
            Upload a room, choose a mood, and preview a premium AI transformation with cinematic before/after controls, live processing, and polished design intelligence.
          </p>
          <div className="reveal reveal-stagger mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#try" className="rounded-2xl bg-white px-7 py-4 text-center font-black text-[#070511] shadow-[0_0_34px_rgba(255,255,255,0.22)] hover:scale-[1.02]">
              Try PixelLift AI
            </a>
            <a href="#features" className="rounded-2xl border border-white/14 bg-white/[0.06] px-7 py-4 text-center font-black text-white backdrop-blur-xl hover:border-cyan-300/35 hover:bg-cyan-300/10">
              Explore features
            </a>
          </div>
        </div>

        <div className="reveal reveal-scale relative">
          <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-r from-cyan-400/20 via-violet-500/20 to-fuchsia-400/20 blur-2xl" />
          {heroSlider}
        </div>
      </section>

      <ScrollVelocityMarquee />

      <div id="try">
        <LiveDemoUpload />
      </div>

      <section className="reveal mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-8 text-center">
          <p className="reveal reveal-up mx-auto mb-4 w-fit rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
            Before / After Slider
          </p>
          <h2 className="reveal reveal-up reveal-blur text-4xl font-black tracking-tight text-white sm:text-5xl">
            Drag the divider. Feel the redesign.
          </h2>
        </div>
        <BeforeAfterSlider before={demoImages.loftBefore} after={demoImages.loftAfter} />
      </section>

      <div id="features">
        <FeatureCards />
      </div>
    </div>
  );
}
