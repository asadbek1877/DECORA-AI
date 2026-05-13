import React from "react";
import Icon from "../components/Icon";

export default function ReviewsPage() {
  const reviews = [
    [
      "Mira Studio",
      "This tool makes it easy to show a client how an empty room can look after redesign.",
    ],
    [
      "J. Laren",
      "The before-after preview is clear, modern and very useful for renovation planning.",
    ],
    [
      "Anirudh T.",
      "A great landing page style for interior AI products and design apps.",
    ],
    [
      "Pixel Lab",
      "The visual comparison section is the strongest part of the page.",
    ],
    [
      "Sarah Chen",
      "Amazing visualization tool that helps clients understand the transformation.",
    ],
    [
      "Marcus Design",
      "Professional, modern UI with perfect animations and smooth transitions.",
    ],
    [
      "Elena Rossi",
      "This is exactly what I was looking for in an interior design tool.",
    ],
    [
      "Alex Kumar",
      "Fastest room redesign comparison I've ever used. Highly recommended!",
    ],
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-black tracking-tight text-white sm:text-7xl">
          People love the magic
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-xl font-medium text-white/55">
          Read what our users say about PixelLift
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reviews.map(([name, text]) => (
          <div
            key={name}
            className="rounded-[2rem] border border-white/10 bg-white/[.04] p-7 hover:bg-white/[.06] hover:border-white/20 transition-all duration-300"
          >
            <div className="mb-5 h-14 w-14 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400" />
            <p className="text-lg font-medium leading-relaxed text-white/70">
              "{text}"
            </p>
            <p className="mt-6 font-black text-white">{name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
