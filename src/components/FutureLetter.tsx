"use client";

import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface FutureLetterProps {
  charCount: number;
  opacity: number;
  y: number | string;
  scale: number;
  rotateX: number;
}

const letterText = `Dear Future Partner,

I don't know where you are right now, or what path you're walking. But I know that somehow, our steps are leading us closer. Every sunrise I watch, every warm coffee I sip, and every rain shower I walk through—I find myself wondering if you are experiencing the same details.

Perhaps we've crossed paths in a crowded room, or stood under the same station roof waiting for a train. Or perhaps our stories are still writing their individual chapters, preparing us for the moment they collide.

I am saving these fragments of time for you. Until then, keep walking, keep smiling, and know that I am already on my way.

With love,
Me.`;

export default function FutureLetter({ charCount, opacity, y, scale, rotateX }: FutureLetterProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Framer Motion values for spring 3D tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const tiltX = useSpring(useTransform(mouseY, [0, 1], [15, -15]), { stiffness: 100, damping: 20 });
  const tiltY = useSpring(useTransform(mouseX, [0, 1], [-15, 15]), { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseXVal = (e.clientX - rect.left) / width;
      const mouseYVal = (e.clientY - rect.top) / height;

      // Restrict mouse tracking to when mouse is near or in viewport
      if (e.clientY > rect.top - 200 && e.clientY < rect.bottom + 200) {
        mouseX.set(mouseXVal);
        mouseY.set(mouseYVal);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Cut text to currently visible characters
  const typedText = letterText.slice(0, charCount);

  return (
    <motion.div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        x: "-50%",
        y: y,
        scale: scale,
        rotateX: rotateX,
        opacity: opacity,
        zIndex: 10,
        perspective: 1000,
        transformStyle: "preserve-3d",
        width: "100%",
      }}
      className="letter-card-wrapper"
    >
      <motion.div
        ref={cardRef}
        style={{
          position: "relative",
          width: "100%",
          height: "600px",
          background: "linear-gradient(135deg, #fffdfa 0%, #f9f5ec 100%)",
          borderRadius: "4px",
          padding: "48px 32px",
          boxShadow: "0 30px 70px rgba(0,0,0,0.18), inset 0 0 24px rgba(0,0,0,0.03)",
          border: "1px solid #e8dfcf",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          rotateX: tiltX,
          rotateY: tiltY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Subtle Paper Texture Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.035,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Realistic Letter Text */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
            fontFamily: "var(--font-serif)",
            color: "#2a2319",
            lineHeight: 1.7,
            fontSize: "1.05rem",
            paddingRight: "8px",
            userSelect: "none",
          }}
        >
          {typedText}
          {charCount < letterText.length && charCount > 0 && <span className="cursor-blink" />}
        </div>

        {/* Paper fold line accents (watermarks) */}
        <div style={{ position: "absolute", top: "200px", left: 0, right: 0, height: "1px", backgroundColor: "rgba(140,110,80,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "400px", left: 0, right: 0, height: "1px", backgroundColor: "rgba(140,110,80,0.04)", pointerEvents: "none" }} />
      </motion.div>
    </motion.div>
  );
}
