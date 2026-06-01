"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface StarData {
  id: number;
  name: string;
  x: number; // percentage
  y: number; // percentage
  title: string;
  desc: string;
}

const constellationStars: StarData[] = [
  {
    id: 1,
    name: "Hope",
    x: 20,
    y: 35,
    title: "The Star of Hope",
    desc: "The quiet faith that someone, somewhere, was searching for the exact same kind of love.",
  },
  {
    id: 2,
    name: "Chemistry",
    x: 38,
    y: 60,
    title: "The Star of Chemistry",
    desc: "The inexplicable spark where conversation flows like water and laughter feels effortless.",
  },
  {
    id: 3,
    name: "Trust",
    x: 52,
    y: 25,
    title: "The Star of Trust",
    desc: "A safe haven where we can speak of our deepest fears and know they are held gently.",
  },
  {
    id: 4,
    name: "Joy",
    x: 68,
    y: 55,
    title: "The Star of Joy",
    desc: "Finding pure happiness in the quietest moments—holding hands in a crowd, sipping tea.",
  },
  {
    id: 5,
    name: "Destiny",
    x: 82,
    y: 30,
    title: "The Star of Destiny",
    desc: "The beautiful realization that every step we took separately was leading us to this junction.",
  },
];

interface ConstellationProps {
  opacity: number;
  lineProgress: number; // 0 to 1, maps to SVG line drawing
  isVisible: boolean;
}

export default function Constellation({ opacity, lineProgress, isVisible }: ConstellationProps) {
  const [activeStar, setActiveStar] = useState<StarData | null>(null);

  if (!isVisible) return null;

  // Render SVG lines connecting the stars in sequence
  const renderLines = () => {
    const lines = [];
    for (let i = 0; i < constellationStars.length - 1; i++) {
      const s1 = constellationStars[i];
      const s2 = constellationStars[i + 1];
      
      // Calculate length of the line to animate dashoffset
      const dx = ((s2.x - s1.x) / 100) * 800; // Reference size coordinate system (e.g. 800x600)
      const dy = ((s2.y - s1.y) / 100) * 600;
      const length = Math.sqrt(dx * dx + dy * dy);

      // Interpolate lines drawing sequencing based on global lineProgress (0 to 1)
      const segmentStart = i / (constellationStars.length - 1);
      const segmentEnd = (i + 1) / (constellationStars.length - 1);
      
      let progress = 0;
      if (lineProgress > segmentStart) {
        progress = Math.min(1, (lineProgress - segmentStart) / (segmentEnd - segmentStart));
      }
      
      const dashOffset = length * (1 - progress);

      lines.push(
        <line
          key={`line-${i}`}
          x1={`${s1.x}%`}
          y1={`${s1.y}%`}
          x2={`${s2.x}%`}
          y2={`${s2.y}%`}
          stroke="rgba(254, 180, 123, 0.45)"
          strokeWidth="1.5"
          strokeDasharray={length}
          strokeDashoffset={dashOffset}
          style={{
            filter: "drop-shadow(0 0 4px rgba(254, 180, 123, 0.6))",
          }}
        />
      );
    }
    return lines;
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: opacity,
        zIndex: 9,
        pointerEvents: opacity > 0.1 ? "auto" : "none",
      }}
      className="flex items-center justify-center"
    >
      <div className="relative w-full h-full max-w-5xl mx-auto flex items-center justify-center">
        {/* Constellation lines layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        >
          {renderLines()}
        </svg>

        {/* Stars Nodes */}
        {constellationStars.map((star) => {
          const isActive = activeStar?.id === star.id;
          return (
            <div
              key={star.id}
              onClick={() => setActiveStar(star)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer clickable-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
              }}
            >
              {/* Outer pulsing ring */}
              <div
                className="absolute inset-0 w-12 h-12 -left-6 -top-6 rounded-full border border-orange-200/20 animate-ping opacity-60"
                style={{ animationDuration: `${2.5 + star.id}s` }}
              />

              {/* Glowing star core */}
              <div
                className={`w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? "bg-[#fff] scale-150 shadow-[0_0_20px_#fff,_0_0_30px_#feb47b]"
                    : "bg-[#feb47b] hover:bg-[#fff] hover:scale-125 shadow-[0_0_10px_#feb47b]"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Star Label */}
              <span className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium uppercase tracking-[0.2em] text-orange-200/70 select-none pointer-events-none whitespace-nowrap">
                {star.name}
              </span>
            </div>
          );
        })}

        {/* Constellation Memory Popup Modal Overlay */}
        {activeStar && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center px-6">
            <div className="glass-panel-dark max-w-sm w-full p-8 relative border border-orange-200/10 text-center shadow-2xl animate-fade-in">
              <button
                onClick={() => setActiveStar(null)}
                className="absolute top-4 right-4 text-orange-200/60 hover:text-white transition-colors interactive-hover"
                aria-label="Close details"
              >
                <X size={18} />
              </button>

              <span className="text-[10px] tracking-[0.3em] uppercase text-[#feb47b] font-medium block mb-2">
                Constellation Connection
              </span>

              <h4
                className="text-2xl font-serif text-white font-semibold mb-4"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {activeStar.title}
              </h4>

              <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                {activeStar.desc}
              </p>

              <div
                className="w-12 h-[1px] bg-[#feb47b]/40 mx-auto mt-6"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
