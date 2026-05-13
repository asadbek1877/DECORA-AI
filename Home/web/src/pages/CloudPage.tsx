import React, { useState } from "react";
import Icon from "../components/Icon";
import { BEFORE_IMG, AFTER_IMG } from "../lib/constants";

function BeforeAfterSliderModal({
  beforeImg,
  afterImg,
}: {
  beforeImg: string;
  afterImg: string;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-96 w-full overflow-hidden rounded-2xl bg-black cursor-col-resize"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeImg}
          alt="Before"
          className="h-full w-full object-cover blur-[4px] brightness-75"
        />
        <div className="absolute left-4 top-4 rounded-full bg-black/60 px-4 py-2 text-xs font-black text-white backdrop-blur-sm">
          BEFORE
        </div>
      </div>

      <div
        className="absolute inset-y-0 right-0 overflow-hidden"
        style={{ width: `${100 - sliderPosition}%` }}
      >
        <img src={afterImg} alt="After" className="h-full w-full object-cover" />
        <div className="absolute right-4 top-4 rounded-full bg-white/20 px-4 py-2 text-xs font-black text-white backdrop-blur-sm border border-white/30">
          AFTER
        </div>
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-white to-transparent"
        style={{ left: `${sliderPosition}%` }}
      />

      <div
        className="absolute top-1/2 -translate-y-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-2xl"
        style={{ left: `${sliderPosition}%` }}
      >
        <Icon name="arrow" className="h-5 w-5 transform -scale-x-100" />
        <Icon name="arrow" className="h-5 w-5" />
      </div>
    </div>
  );
}

export default function CloudPage() {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      title: "Unmatched Speed",
      description: "Generate designs instantly with cloud processing.",
      longDescription:
        "Our cloud infrastructure processes your room photos in real-time, delivering AI-generated designs in less than a second. No waiting, no delays – pure speed.",
      icon: "cloud",
      gradient: "from-violet-500 to-purple-500",
      benefits: [
        "< 1 second processing time",
        "Real-time cloud rendering",
        "Parallel computation",
        "Auto-scaling infrastructure",
        "Global CDN distribution",
        "Zero latency design delivery",
      ],
      stats: [
        { value: "0.8s", label: "Avg. Speed" },
        { value: "99.9%", label: "Uptime" },
        { value: "10M+", label: "Daily Renders" },
      ],
    },
    {
      title: "Style Accuracy",
      description: "Keep a consistent visual direction for each room.",
      longDescription:
        "Our advanced AI understands design principles and ensures every generated concept maintains visual consistency while adapting to your specific style preferences.",
      icon: "sparkles",
      gradient: "from-cyan-500 to-blue-500",
      benefits: [
        "AI style consistency engine",
        "Design principle enforcement",
        "Aesthetic matching algorithm",
        "Color harmony analysis",
        "Spatial composition optimization",
        "Professional grade output",
      ],
      stats: [
        { value: "98%", label: "Accuracy Rate" },
        { value: "50+", label: "Design Styles" },
        { value: "1000+", label: "Color Palettes" },
      ],
    },
    {
      title: "Multiple Concepts",
      description: "Try modern, luxury, minimal and other design styles.",
      longDescription:
        "Explore unlimited design possibilities with our diverse style library. From minimalist to luxury, contemporary to classic – we've got every aesthetic covered.",
      icon: "image",
      gradient: "from-pink-500 to-rose-500",
      benefits: [
        "50+ design styles available",
        "Unlimited style combinations",
        "Trend-aware suggestions",
        "Personalized recommendations",
        "Style blending capability",
        "Seasonal design updates",
      ],
      stats: [
        { value: "50+", label: "Design Styles" },
        { value: "∞", label: "Combinations" },
        { value: "24/7", label: "New Trends" },
      ],
    },
    {
      title: "Cloud Storage",
      description: "Keep generated room concepts in one place.",
      longDescription:
        "Securely store all your generated designs in the cloud with unlimited storage, perfect organization, and easy sharing with clients and collaborators.",
      icon: "cloud",
      gradient: "from-indigo-500 to-purple-500",
      benefits: [
        "Unlimited cloud storage",
        "Automatic backup system",
        "Easy sharing & collaboration",
        "Version history tracking",
        "Team workspace support",
        "Enterprise-grade security",
      ],
      stats: [
        { value: "∞", label: "Storage" },
        { value: "256-bit", label: "Encryption" },
        { value: "5GB", label: "Per Project" },
      ],
    },
    {
      title: "Batch Generation",
      description: "Create several design options for one room.",
      longDescription:
        "Generate multiple design variations simultaneously. Compare, contrast, and choose the perfect concept for your space without waiting between generations.",
      icon: "sparkles",
      gradient: "from-orange-500 to-red-500",
      benefits: [
        "Generate 10+ designs at once",
        "Parallel batch processing",
        "Quick comparison tools",
        "Selective refinement options",
        "Bulk export capabilities",
        "Advanced filtering options",
      ],
      stats: [
        { value: "10+", label: "Designs/Batch" },
        { value: "50%", label: "Time Saved" },
        { value: "All", label: "Styles Together" },
      ],
    },
    {
      title: "High Quality Preview",
      description: "Show the final room idea clearly before renovation.",
      longDescription:
        "Crystal-clear, photorealistic previews that showcase every design detail. See your room transformation before making any decisions with stunning visual quality.",
      icon: "image",
      gradient: "from-green-500 to-emerald-500",
      benefits: [
        "4K resolution output",
        "Photorealistic rendering",
        "Multi-angle perspectives",
        "Lighting simulation",
        "Material accuracy",
        "Detail-rich visualization",
      ],
      stats: [
        { value: "4K", label: "Resolution" },
        { value: "100%", label: "Photo Real" },
        { value: "8MP", label: "File Size" },
      ],
    },
    {
      title: "Universal Compatibility",
      description: "Use it on desktop, tablet and mobile.",
      longDescription:
        "Access PixelLift Cloud from any device, anywhere. Seamlessly switch between desktop, tablet, and mobile without losing your progress or design quality.",
      icon: "cloud",
      gradient: "from-teal-500 to-cyan-500",
      benefits: [
        "Desktop, tablet & mobile apps",
        "Cloud sync across devices",
        "Offline work capability",
        "Progressive web app support",
        "Native iOS/Android apps",
        "Web browser compatibility",
      ],
      stats: [
        { value: "3", label: "Platforms" },
        { value: "100%", label: "Sync" },
        { value: "0ms", label: "Latency" },
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .modal-backdrop {
          animation: modalFadeIn 0.3s ease-out;
        }
      `}</style>

      <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center mb-16">
        <div>
          <p className="text-sm font-black uppercase tracking-[.35em] text-violet-300">
            Meet
          </p>
          <h2 className="mt-4 text-6xl font-black tracking-tight text-white sm:text-8xl">
            PixelLift Cloud.
          </h2>
          <p className="mt-6 text-xl font-medium leading-relaxed text-white/55">
            A cloud workspace for fast room redesign, before-after previews and interior style experiments.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[.07] to-white/[.02] p-6 transition-all duration-300 hover:border-white/30 cursor-pointer"
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => setSelectedFeature(idx)}
            style={{
              boxShadow:
                hoveredCard === idx
                  ? "0 0 30px rgba(168, 85, 246, 0.2)"
                  : "none",
            }}
          >
            <Icon
              name={feature.icon as keyof typeof import("../lib/constants").ICONS}
              className="h-8 w-8 text-violet-300 mb-4"
            />
            <h3 className="text-xl font-black text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm font-medium text-white/50 mb-6 flex-grow">
              {feature.description}
            </p>

            <button className="inline-flex items-center gap-2 text-sm font-black text-violet-300 hover:text-violet-200 transition-colors group/btn">
              Learn more
              <Icon
                name="arrow"
                className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
              />
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedFeature !== null && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setSelectedFeature(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/90 via-violet-950/40 to-fuchsia-950/30 rounded-3xl border border-white/15 backdrop-blur-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "modalFadeIn 0.3s ease-out",
            }}
          >
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200 text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="relative h-32 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-cyan-500/20 border-b border-white/10 overflow-hidden">
              <div className="relative h-full flex items-center px-8">
                <div
                  className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${features[selectedFeature].gradient} shadow-lg mb-4`}
                >
                  <Icon
                    name={
                      features[selectedFeature]
                        .icon as keyof typeof import("../lib/constants").ICONS
                    }
                    className="h-8 w-8 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-12">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-2">
                {features[selectedFeature].title}
              </h2>
              <p className="text-lg text-white/60 mb-8">
                {features[selectedFeature].longDescription}
              </p>

              <div className="mb-12">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">
                  Visual Example
                </h3>
                <BeforeAfterSliderModal
                  beforeImg={BEFORE_IMG}
                  afterImg={AFTER_IMG}
                />
              </div>

              <div className="mb-12">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-4">
                  Key Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features[selectedFeature].benefits.map(
                    (benefit: string, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-white/[.05] border border-white/10 hover:bg-white/[.08] hover:border-white/20 transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-r ${features[selectedFeature].gradient} mt-2`}
                          />
                          <span className="text-sm font-medium text-white/80">
                            {benefit}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mb-12 grid grid-cols-3 gap-4 py-6 border-t border-b border-white/10">
                {features[selectedFeature].stats.map((stat: any, i: number) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedFeature(null)}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black text-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105"
              >
                Get Started with {features[selectedFeature].title}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
