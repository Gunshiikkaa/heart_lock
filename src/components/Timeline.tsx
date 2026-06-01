"use client";

interface MilestoneData {
  id: number;
  date: string;
  title: string;
  desc: string;
}

const milestones: MilestoneData[] = [
  {
    id: 1,
    date: "Chapter I",
    title: "The Quiet Hello",
    desc: "A simple word, an accidental glance, that would eventually rewrite the course of both our stories.",
  },
  {
    id: 2,
    date: "Chapter II",
    title: "The First Laugh",
    desc: "Finding someone who shares your weird sense of humor in a busy, rain-drizzled coffee shop.",
  },
  {
    id: 3,
    date: "Chapter III",
    title: "Midnight Conversations",
    desc: "Talking until 3 AM about nothing and everything, realizing the silence between us feels just like home.",
  },
  {
    id: 4,
    date: "Chapter IV",
    title: "Shared Sunsets",
    desc: "Silently watching the horizon paint itself in orange and lavender, knowing we'd never walk alone again.",
  },
];

interface TimelineProps {
  opacity: number;
  cardsRef: React.RefObject<(HTMLDivElement | null)[]>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isVisible: boolean;
}

export default function Timeline({ opacity, cardsRef, containerRef, isVisible }: TimelineProps) {
  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: opacity,
        zIndex: 8,
        pointerEvents: opacity > 0.1 ? "auto" : "none",
        perspective: 1500,
        transformStyle: "preserve-3d",
      }}
      className="flex items-center justify-center overflow-hidden"
    >
      {/* Background Soft Fog Grid Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0) 20%, rgba(20, 10, 28, 0.45) 100%)",
          backdropFilter: "blur(2px)",
          opacity: opacity,
        }}
      />

      {/* Floating Milestone Cards Container */}
      <div className="relative w-full max-w-2xl h-[500px] flex items-center justify-center transform-style-preserve-3d">
        {milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            ref={(el) => {
              if (cardsRef.current) cardsRef.current[index] = el;
            }}
            className="glass-panel-dark absolute w-[340px] sm:w-[440px] p-8 sm:p-10 text-center flex flex-col items-center justify-center select-none"
            style={{
              opacity: 0,
              filter: "blur(20px)",
              transform: "translate3d(0, 0, -400px) scale(0.6)",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            {/* Visual connector line indicator */}
            <div className="w-1 h-12 bg-gradient-to-b from-transparent to-[#feb47b] mb-4 opacity-75" />

            <span className="text-xs uppercase tracking-[0.25em] text-[#feb47b] font-medium mb-2">
              {milestone.date}
            </span>

            <h3
              className="text-2xl sm:text-3xl font-serif text-white font-semibold tracking-wide mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {milestone.title}
            </h3>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-[340px]">
              {milestone.desc}
            </p>

            <div className="w-1 h-12 bg-gradient-to-t from-transparent to-[#feb47b] mt-4 opacity-75" />
          </div>
        ))}
      </div>
    </div>
  );
}
