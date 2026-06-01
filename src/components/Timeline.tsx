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
      className="timeline-container"
    >
      {/* Background Soft Fog Grid Layer */}
      <div
        className="timeline-fog"
        style={{
          opacity: opacity,
        }}
      />

      {/* Floating Milestone Cards Container */}
      <div className="timeline-cards-track">
        {milestones.map((milestone, index) => (
          <div
            key={milestone.id}
            ref={(el) => {
              if (cardsRef.current) cardsRef.current[index] = el;
            }}
            className="glass-panel-dark timeline-card"
            style={{
              opacity: 0,
              filter: "blur(20px)",
              transform: "translate3d(0, 0, -400px) scale(0.6)",
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            {/* Visual connector line indicator */}
            <div className="timeline-connector-top" />

            <span className="timeline-chapter-label">
              {milestone.date}
            </span>

            <h3 className="timeline-card-title">
              {milestone.title}
            </h3>

            <p className="timeline-card-desc">
              {milestone.desc}
            </p>

            <div className="timeline-connector-bottom" />
          </div>
        ))}
      </div>
    </div>
  );
}
