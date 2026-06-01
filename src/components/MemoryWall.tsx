"use client";

import Image from "next/image";
import { useRef } from "react";

interface PolaroidData {
  id: number;
  src: string;
  caption: string;
  alt: string;
}

const polaroidPhotos: PolaroidData[] = [
  {
    id: 1,
    src: "/images/coffee_shop.png",
    caption: "A cozy Tuesday, wondering if you also like the rain...",
    alt: "Cozy coffee mugs near window in rain",
  },
  {
    id: 2,
    src: "/images/beach_sunset.png",
    caption: "Silhouettes on the shore, waiting for the day we walk together...",
    alt: "Two figures walking on beach at sunset",
  },
  {
    id: 3,
    src: "/images/stargazing.png",
    caption: "Under a blanket of stars, reserving this campsite for us...",
    alt: "Cozy glowing tent under starry night sky",
  },
  {
    id: 4,
    src: "/images/forest_walk.png",
    caption: "Walking down golden paths, dreaming of holding your hand...",
    alt: "Sunbeams filtering through autumn forest pathway",
  },
];

interface MemoryWallProps {
  opacity: number;
  cardsRef: React.RefObject<(HTMLDivElement | null)[]>;
  onCardClick: (photo: PolaroidData) => void;
  isVisible: boolean;
}

export default function MemoryWall({ opacity, cardsRef, onCardClick, isVisible }: MemoryWallProps) {
  // Local card mouse-tracking hover effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const rotateY = ((x / rect.width) - 0.5) * 20; // max 10 degrees tilt
    const rotateX = -((y / rect.height) - 0.5) * 20;

    card.style.transform = `scale(1.08) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    // Animate reflection highlight
    const highlight = card.querySelector(".reflection-highlight") as HTMLDivElement;
    if (highlight) {
      highlight.style.opacity = "0.2";
      highlight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)`;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `scale(1) rotateX(0deg) rotateY(0deg)`;
    
    const highlight = card.querySelector(".reflection-highlight") as HTMLDivElement;
    if (highlight) {
      highlight.style.opacity = "0";
    }
  };

  if (!isVisible) return null;

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
        perspective: 1200,
      }}
      className="memory-wall-container"
    >
      <div className="memory-wall-grid">
        {polaroidPhotos.map((photo, index) => (
          <div
            key={photo.id}
            ref={(el) => {
              if (cardsRef.current) cardsRef.current[index] = el;
            }}
            onClick={() => onCardClick(photo)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onMouseLeave={handleMouseLeave}
            className="polaroid-card interactive-hover"
            style={{
              position: "absolute",
              width: "280px",
              maxWidth: "85vw",
              userSelect: "none",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
            }}
          >
            {/* Reflection Highlight overlay */}
            <div
              className="reflection-highlight"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                opacity: 0,
                borderRadius: "4px",
                mixBlendMode: "overlay",
                transition: "opacity 0.2s",
              }}
            />

            <div className="polaroid-image-container">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 240px, 280px"
                style={{ objectFit: "cover" }}
                draggable={false}
                priority
              />
            </div>
            <div className="polaroid-caption" style={{ fontFamily: "var(--font-handwritten)" }}>
              {photo.caption}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export type { PolaroidData };
