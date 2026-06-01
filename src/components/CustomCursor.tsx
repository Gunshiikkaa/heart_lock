"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;
    if (!cursorDot || !cursorRing) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setHidden(false);

      // Dot moves instantly
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    };

    const onMouseLeave = () => {
      setHidden(true);
    };

    const onMouseEnter = () => {
      setHidden(false);
    };

    // Smooth cursor ring animation using lerp (Linear Interpolation)
    const render = () => {
      const lerpFactor = 0.15; // smooth lag speed
      ringX += (mouseX - ringX) * lerpFactor;
      ringY += (mouseY - ringY) * lerpFactor;

      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;

      requestAnimationFrame(render);
    };

    const requestID = requestAnimationFrame(render);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Track all elements with hover action to add class
    const addHoverClass = () => document.body.classList.add("hover-interactive");
    const removeHoverClass = () => document.body.classList.remove("hover-interactive");

    const setupInteractiveHovers = () => {
      const hoverables = document.querySelectorAll(
        'a, button, [role="button"], .polaroid-card, .envelope-wrapper, .clickable-star, .interactive-hover'
      );
      hoverables.forEach((el) => {
        el.addEventListener("mouseenter", addHoverClass);
        el.addEventListener("mouseleave", removeHoverClass);
      });
    };

    // Setup initially and monitor changes
    setupInteractiveHovers();

    const observer = new MutationObserver(() => {
      setupInteractiveHovers();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(requestID);
      observer.disconnect();
      document.body.classList.remove("hover-interactive");
    };
  }, []);

  return (
    <>
      <div
        ref={cursorDotRef}
        className="custom-cursor"
        style={{ opacity: hidden ? 0 : 1 }}
      />
      <div
        ref={cursorRingRef}
        className="custom-cursor-ring"
        style={{ opacity: hidden ? 0 : 1 }}
      />
    </>
  );
}
