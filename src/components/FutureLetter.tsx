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
      }}
      className="w-full max-w-[480px] px-6 sm:px-0"
    >
      <motion.div
        ref={cardRef}
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-[600px] bg-gradient-to-br from-[#fffdfa] to-[#f9f5ec] rounded-sm p-8 sm:p-12 shadow-[0_30px_70px_rgba(0,0,0,0.18),_inset_0_0_24px_rgba(0,0,0,0.03)] border border-[#e8dfcf] flex flex-col justify-between overflow-hidden"
      >
        {/* Subtle Paper Texture Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Realistic Letter Text */}
        <div className="flex-1 overflow-y-auto whitespace-pre-wrap font-serif text-[#2a2319] leading-relaxed text-[0.95rem] sm:text-[1.05rem] pr-2 select-none" style={{ fontFamily: "var(--font-serif)" }}>
          {typedText}
          {charCount < letterText.length && charCount > 0 && <span className="cursor-blink" />}
        </div>

        {/* Paper fold line accents (watermarks) */}
        <div className="absolute top-[200px] left-0 right-0 h-[1px] bg-[rgba(140,110,80,0.04)] pointer-events-none" />
        <div className="absolute top-[400px] left-0 right-0 h-[1px] bg-[rgba(140,110,80,0.04)] pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}
