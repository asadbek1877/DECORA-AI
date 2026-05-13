import React from "react";
import { ICONS } from "../lib/constants";

export default function Icon({
  name,
  className = "w-6 h-6",
}: {
  name: keyof typeof ICONS;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}
