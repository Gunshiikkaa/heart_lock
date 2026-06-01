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
      className="constellation-container"
    >
      <div className="constellation-grid">
        {/* Constellation lines layer */}
        <svg
          className="constellation-svg"
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
              className="constellation-star-node clickable-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
              }}
            >
              {/* Outer pulsing ring */}
              <div
                className="constellation-star-ping"
                style={{ animationDuration: `${2.5 + star.id}s` }}
              />

              {/* Glowing star core */}
              <div
                className={`constellation-star-core ${isActive ? "active" : ""}`}
              >
                <div className="constellation-star-dot" />
              </div>

              {/* Star Label */}
              <span className="constellation-star-label">
                {star.name}
              </span>
            </div>
          );
        })}

        {/* Constellation Memory Popup Modal Overlay */}
        {activeStar && (
          <div className="constellation-modal-overlay">
            <div className="glass-panel-dark constellation-modal-card">
              <button
                onClick={() => setActiveStar(null)}
                className="constellation-modal-close interactive-hover"
                aria-label="Close details"
              >
                <X size={18} />
              </button>

              <span className="constellation-modal-label">
                Constellation Connection
              </span>

              <h4 className="constellation-modal-title">
                {activeStar.title}
              </h4>

              <p className="constellation-modal-desc">
                {activeStar.desc}
              </p>

              <div className="constellation-modal-divider" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
