"use client";

import { useState } from "react";

interface MessageRevealProps {
  opacity: number;
  y: number | string;
  isVisible: boolean;
}

export default function MessageReveal({ opacity, y, isVisible }: MessageRevealProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "45%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: opacity,
        y: y,
        zIndex: 10,
        pointerEvents: opacity > 0.1 ? "auto" : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
      className="w-full max-w-lg px-6 sm:px-0"
    >
      {/* Visual Instruction label */}
      <span
        className={`text-xs uppercase tracking-[0.3em] text-orange-200/60 mb-8 transition-opacity duration-500 select-none ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      >
        Click to open the letter
      </span>

      {/* 3D Envelope Container */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`envelope-wrapper hover:shadow-[0_40px_80px_rgba(254,180,123,0.25)] ${
          isOpen ? "open" : ""
        }`}
      >
        {/* Flap of the envelope */}
        <div className="envelope-flap" />

        {/* Back and side triangular folds of envelope */}
        <div className="envelope-back" />
        <div className="envelope-right" />

        {/* The Letter that slides out */}
        <div className="envelope-letter select-none">
          <div className="flex flex-col h-full justify-between pr-2 overflow-y-auto">
            <div className="space-y-4">
              <h5
                className="font-serif text-[#1c1813] text-lg font-bold border-b border-[#ebdcb9] pb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                My Dearest,
              </h5>
              <p className="text-sm font-serif text-[#2a2319] leading-relaxed">
                I hope you felt the magic of our journey. From the warmth of the sunset down to the silent whispers of the stars, everything was created to lead me to you.
              </p>
              <p className="text-sm font-serif text-[#2a2319] leading-relaxed">
                No matter where you are or how long it takes, I will wait. Every memory I gather is a gift waiting to be shared. Our tomorrow is already waiting.
              </p>
            </div>
            <div className="text-right mt-6">
              <span className="font-handwritten text-[#2a2319] text-2xl block" style={{ fontFamily: "var(--font-handwritten)" }}>
                Yours always,
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-500 block mt-1">
                Me
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
