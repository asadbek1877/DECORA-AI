import React from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { BEFORE_IMG, AFTER_IMG } from "../lib/constants";

function MiniBeforeAfter() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="relative h-72 overflow-hidden rounded-3xl bg-black">
        <img
          src={BEFORE_IMG}
          alt="Before"
          className="h-full w-full object-cover scale-110 blur-[8px] brightness-75"
        />
        <span className="absolute left-4 top-4 rounded-full bg-black/55 px-4 py-2 text-xs font-black text-white">
          BEFORE
        </span>
      </div>
      <div className="relative h-72 overflow-hidden rounded-3xl bg-black">
        <img src={AFTER_IMG} alt="After" className="h-full w-full object-cover" />
        <span className="absolute right-4 top-4 rounded-full bg-white/20 px-4 py-2 text-xs font-black text-white backdrop-blur-xl">
          AFTER
        </span>
      </div>
    </div>
  );
}

export default function DesktopPage() {
  const features = [
    "Local workspace",
    "Save in high quality",
    "Models for every style",
    "Easy customization",
    "Batch previews",
    "Before-after compare",
  ];

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="order-2 rounded-[2.5rem] border border-white/10 bg-white/[.04] p-4 shadow-2xl lg:order-1">
          <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-violet-950 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Icon name="switchCamera" /> Desktop App
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white/60">
                Local
              </div>
            </div>
            <MiniBeforeAfter />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-5xl font-black tracking-tight text-white sm:text-7xl">
            The app you know and love
          </h2>
          <p className="mt-6 text-xl font-medium leading-relaxed text-white/55">
            A desktop experience for creating room redesign previews with flexible settings and clear before-after comparison.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-white/75"
              >
                <Icon name="check" className="h-5 w-5 text-violet-300" />
                <span className="font-black">{f}</span>
              </div>
            ))}
          </div>
          <Link
            to="/reviews"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-8 py-5 text-lg font-black text-slate-950"
          >
            See reviews <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
