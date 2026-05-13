import React from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function ExplorePage() {
  const features = [
    {
      category: "Cloud Features",
      items: [
        "Unmatched Speed",
        "Style Accuracy",
        "Multiple Concepts",
        "Cloud Storage",
        "Batch Generation",
        "High Quality Preview",
        "Universal Compatibility",
      ],
      link: "/cloud",
    },
    {
      category: "Desktop App",
      items: [
        "Local workspace",
        "Save in high quality",
        "Models for every style",
        "Easy customization",
        "Batch previews",
        "Before-after compare",
      ],
      link: "/desktop",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black tracking-tight text-white sm:text-7xl">
          Explore All Features
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-xl font-medium text-white/55">
          Discover everything PixelLift can do for your design workflow
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {features.map((section) => (
          <div
            key={section.category}
            className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[.07] to-white/[.02] p-8 hover:border-white/20 transition-all duration-300"
          >
            <h3 className="text-3xl font-black text-white mb-8">
              {section.category}
            </h3>

            <div className="space-y-4 mb-8">
              {section.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/[.04] hover:bg-white/[.07] transition-all duration-200"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" />
                  <span className="text-lg font-medium text-white/80">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to={section.link}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-4 text-lg font-black text-white hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105"
            >
              Explore {section.category} <Icon name="arrow" />
            </Link>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-16 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[.07] to-white/[.02] p-8">
        <h3 className="text-2xl font-black text-white mb-6">Why Choose PixelLift?</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "AI-Powered",
              description:
                "Advanced artificial intelligence that understands design principles and creates realistic room transformations.",
            },
            {
              title: "Lightning Fast",
              description:
                "Generate room designs in seconds with our optimized cloud infrastructure and processing pipeline.",
            },
            {
              title: "Beautiful UI",
              description:
                "Modern, intuitive interface with smooth animations and delightful interactions.",
            },
            {
              title: "Professional Results",
              description:
                "High-quality 4K previews perfect for presenting to clients and stakeholders.",
            },
          ].map((item) => (
            <div key={item.title} className="p-4">
              <h4 className="font-black text-white mb-2">{item.title}</h4>
              <p className="text-white/60">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
