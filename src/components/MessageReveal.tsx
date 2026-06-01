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
      className="envelope-section-container"
    >
      {/* Visual Instruction label */}
      <span
        className={`envelope-instruction ${isOpen ? "fade-out" : ""}`}
      >
        Click to open the letter
      </span>

      {/* 3D Envelope Container */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`envelope-wrapper ${isOpen ? "open" : ""}`}
      >
        {/* Flap of the envelope */}
        <div className="envelope-flap" />

        {/* Back and side triangular folds of envelope */}
        <div className="envelope-back" />
        <div className="envelope-right" />

        {/* The Letter that slides out */}
        <div className="envelope-letter select-none">
          <div className="envelope-letter-inner">
            <div className="envelope-letter-content">
              <h5 className="envelope-letter-header">
                My Dearest,
              </h5>
              <p className="envelope-letter-p">
                I hope you felt the magic of our journey. From the warmth of the sunset down to the silent whispers of the stars, everything was created to lead me to you.
              </p>
              <p className="envelope-letter-p">
                No matter where you are or how long it takes, I will wait. Every memory I gather is a gift waiting to be shared. Our tomorrow is already waiting.
              </p>
            </div>
            <div className="envelope-letter-footer">
              <span className="envelope-letter-sig">
                Yours always,
              </span>
              <span className="envelope-letter-sig-sub">
                Me
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
