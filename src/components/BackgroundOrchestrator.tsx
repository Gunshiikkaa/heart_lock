"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface BackgroundOrchestratorProps {
  progressRef: React.RefObject<number | null>;
  mouseRef: React.RefObject<{ x: number; y: number } | null>;
}

// HSL color representer
interface HSL {
  h: number;
  s: number;
  l: number;
}

interface SkyKeyframe {
  progress: number;
  top: HSL;
  mid: HSL;
  bot: HSL;
}

// Define the color shifts for our cinematic sky
const skyKeyframes: SkyKeyframe[] = [
  {
    progress: 0.0, // Hero Intro
    top: { h: 22, s: 95, l: 68 }, // Warm orange
    mid: { h: 338, s: 85, l: 65 }, // Soft pink
    bot: { h: 268, s: 60, l: 62 }, // Lavender
  },
  {
    progress: 0.25, // Letter Writing (Deep sunset)
    top: { h: 16, s: 90, l: 56 }, // Deeper orange
    mid: { h: 330, s: 80, l: 52 }, // Magenta
    bot: { h: 260, s: 50, l: 45 }, // Deep violet
  },
  {
    progress: 0.55, // Memory Transition / Wall (Twilight)
    top: { h: 245, s: 45, l: 24 }, // Dusk blue
    mid: { h: 280, s: 45, l: 20 }, // Purple-violet
    bot: { h: 12, s: 85, l: 58 }, // Horizon glow orange
  },
  {
    progress: 0.75, // Constellation (Night Sky)
    top: { h: 235, s: 60, l: 10 }, // Night indigo
    mid: { h: 250, s: 45, l: 14 }, // Night violet
    bot: { h: 275, s: 30, l: 16 }, // Dim violet horizon
  },
  {
    progress: 1.0, // Ending (Deep Cinematic Night)
    top: { h: 235, s: 65, l: 7 }, // Ink indigo
    mid: { h: 250, s: 50, l: 11 }, // Dark indigo
    bot: { h: 265, s: 35, l: 13 }, // Deep horizon tint
  },
];

// Helper to interpolate between two numbers
const lerp = (start: number, end: number, amt: number) => {
  return start + (end - start) * amt;
};

// Interpolate HSL colors
const lerpHsl = (c1: HSL, c2: HSL, amt: number): HSL => {
  // Handle hue wrapping correctly
  let h1 = c1.h;
  let h2 = c2.h;
  if (Math.abs(h2 - h1) > 180) {
    if (h2 > h1) {
      h1 += 360;
    } else {
      h2 += 360;
    }
  }
  const h = (lerp(h1, h2, amt) + 360) % 360;
  const s = lerp(c1.s, c2.s, amt);
  const l = lerp(c1.l, c2.l, amt);
  return { h, s, l };
};

// Particle definition
class Particle {
  x: number = 0;
  y: number = 0;
  size: number = 0;
  speedX: number = 0;
  speedY: number = 0;
  opacity: number = 0;
  maxOpacity: number = 0;
  type: "petal" | "firefly" = "petal";
  angle: number = 0;
  spin: number = 0;
  swingSpeed: number = 0;
  swingWidth: number = 0;

  constructor(width: number, height: number, type: "petal" | "firefly") {
    this.reset(width, height, type, true);
  }

  reset(width: number, height: number, type: "petal" | "firefly", init: boolean = false) {
    this.type = type;
    this.x = Math.random() * width;
    this.y = init ? Math.random() * height : (type === "petal" ? -20 : height + 20);
    this.size = type === "petal" ? 6 + Math.random() * 8 : 2 + Math.random() * 3;
    this.speedX = type === "petal" ? -0.5 + Math.random() * 1.0 : -0.3 + Math.random() * 0.6;
    this.speedY = type === "petal" ? 1.0 + Math.random() * 1.5 : -(0.5 + Math.random() * 0.8);
    this.maxOpacity = type === "petal" ? 0.3 + Math.random() * 0.5 : 0.6 + Math.random() * 0.4;
    this.opacity = init ? Math.random() * this.maxOpacity : 0;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = type === "petal" ? -0.02 + Math.random() * 0.04 : 0;
    this.swingSpeed = 0.01 + Math.random() * 0.02;
    this.swingWidth = type === "petal" ? 1.5 + Math.random() * 2 : 0.5 + Math.random() * 1;
  }

  update(width: number, height: number, progress: number) {
    this.angle += this.swingSpeed;
    this.x += this.speedX + Math.sin(this.angle) * this.swingWidth * 0.2;
    this.y += this.speedY;

    if (this.type === "petal") {
      this.angle += this.spin;
      // Fade in at top, fade out at bottom
      if (this.y < 50) this.opacity = Math.min(this.maxOpacity, this.y / 50 * this.maxOpacity);
      if (this.y > height - 100) this.opacity = Math.max(0, (height - this.y) / 100 * this.maxOpacity);
      
      // If scroll is deep, slowly force petals to reset as fireflies or die out
      if (progress > 0.6) {
        this.opacity -= 0.01;
      }
    } else {
      // Firefly twinkling
      this.opacity = this.maxOpacity * (0.6 + 0.4 * Math.sin(this.angle * 2));
      if (this.y < 100) this.opacity *= (this.y / 100);
      
      // If scroll is back to sunset, kill fireflies
      if (progress < 0.45) {
        this.opacity -= 0.01;
      }
    }

    // Reset bounds
    if (this.y > height + 20 || this.y < -20 || this.x > width + 20 || this.x < -20 || this.opacity < 0) {
      // Choose particle type based on scroll progress
      const targetType = progress > 0.55 ? "firefly" : "petal";
      this.reset(width, height, targetType);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;

    if (this.type === "petal") {
      // Soft pink flower petal drawing
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = "rgba(255, 180, 195, 0.85)";
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, this.size/3, 0, this.size);
      ctx.bezierCurveTo(this.size, this.size/3, this.size/2, -this.size/2, 0, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      // Glowing golden firefly drawing
      const glowGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
      glowGrad.addColorStop(0, "rgba(255, 235, 140, 1)");
      glowGrad.addColorStop(0.3, "rgba(255, 215, 80, 0.4)");
      glowGrad.addColorStop(1, "rgba(255, 215, 80, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export default function BackgroundOrchestrator({ progressRef, mouseRef }: BackgroundOrchestratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const balloon1Ref = useRef<HTMLDivElement>(null);
  const balloon2Ref = useRef<HTMLDivElement>(null);
  const sunsetSunRef = useRef<HTMLDivElement>(null);
  const nightMoonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initial setup for particles
    const particles: Particle[] = [];
    const maxParticles = 65;
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle(width, height, "petal"));
    }

    // Static stars setup for the night sky (twinkling in background)
    const stars: { x: number; y: number; size: number; phase: number; speed: number }[] = [];
    const maxStars = 120;
    for (let i = 0; i < maxStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.75), // Concentrate stars in the top 3/4ths
        size: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Dynamic render loop running at 60 FPS
    let animationFrameId: number;

    const render = () => {
      const p = progressRef.current ?? 0;
      const mouse = mouseRef.current ?? { x: 0, y: 0 };

      // 1. COMPUTE GRADIENT COLORS BASED ON SCROLL PROGRESS
      // Find bounding keyframes
      let key1 = skyKeyframes[0];
      let key2 = skyKeyframes[skyKeyframes.length - 1];

      for (let i = 0; i < skyKeyframes.length - 1; i++) {
        if (p >= skyKeyframes[i].progress && p <= skyKeyframes[i + 1].progress) {
          key1 = skyKeyframes[i];
          key2 = skyKeyframes[i + 1];
          break;
        }
      }

      const segmentProgress = (p - key1.progress) / (key2.progress - key1.progress || 1);
      const topColor = lerpHsl(key1.top, key2.top, segmentProgress);
      const midColor = lerpHsl(key1.mid, key2.mid, segmentProgress);
      const botColor = lerpHsl(key1.bot, key2.bot, segmentProgress);

      // Draw Sky Gradient on Canvas
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, `hsl(${topColor.h}, ${topColor.s}%, ${topColor.l}%)`);
      grad.addColorStop(0.5, `hsl(${midColor.h}, ${midColor.s}%, ${midColor.l}%)`);
      grad.addColorStop(1, `hsl(${botColor.h}, ${botColor.s}%, ${botColor.l}%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Apply subtle mouse parallax to elements
      const mouseParallaxX = (mouse.x - width / 2) * 0.03;
      const mouseParallaxY = (mouse.y - height / 2) * 0.03;

      // 2. DRAW TWINKLING STARS (only visible at night, p > 0.45)
      if (p > 0.4) {
        ctx.save();
        // Fade in stars based on progress
        const starsOpacity = Math.min(1, (p - 0.4) * 4);
        ctx.globalAlpha = starsOpacity;

        stars.forEach((star) => {
          star.phase += star.speed;
          const tw = 0.5 + 0.5 * Math.sin(star.phase);
          ctx.fillStyle = `rgba(255, 255, 250, ${0.4 + 0.6 * tw})`;
          
          // Apply slight parallax to stars based on mouse
          const starX = (star.x + mouseParallaxX * 0.3 + width) % width;
          const starY = star.y + mouseParallaxY * 0.3;

          ctx.beginPath();
          ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 3. DRAW PARTICLES (Petals / Fireflies)
      particles.forEach((part) => {
        part.update(width, height, p);
        part.draw(ctx);
      });

      // 4. SYNC SUN, MOON AND BALLOONS PARALLAX
      // Sun (sets)
      const sun = sunsetSunRef.current;
      if (sun) {
        // Sun starts at 20% viewport top, moves down as scroll goes to 0.6
        const sunProgress = Math.min(1, p / 0.6);
        const sunY = lerp(height * 0.25, height * 0.85, sunProgress) + mouseParallaxY * 0.7;
        const sunX = width * 0.5 + mouseParallaxX * 0.7;
        const sunOpacity = Math.max(0, 1 - sunProgress * 1.4);
        sun.style.transform = `translate(-50%, -50%) translate(${sunX}px, ${sunY}px)`;
        sun.style.opacity = `${sunOpacity}`;
      }

      // Moon (rises)
      const moon = nightMoonRef.current;
      if (moon) {
        // Moon starts at height + 100, rises to 20% viewport top as progress goes from 0.5 to 0.85
        const moonProgress = Math.max(0, Math.min(1, (p - 0.45) / 0.4));
        const moonY = lerp(height + 150, height * 0.22, moonProgress) + mouseParallaxY * 0.6;
        const moonX = width * 0.75 + mouseParallaxX * 0.6;
        const moonOpacity = Math.min(1, moonProgress * 2.5);
        moon.style.transform = `translate(-50%, -50%) translate(${moonX}px, ${moonY}px)`;
        moon.style.opacity = `${moonOpacity}`;
      }

      // Balloon 1 (large, parallax)
      const balloon1 = balloon1Ref.current;
      if (balloon1) {
        // Balloon floats left to right and rises based on scroll
        const balloonY = lerp(height * 0.45, -200, p) + mouseParallaxY * 1.5;
        const balloonX = lerp(width * 0.15, width * 0.4, p) + mouseParallaxX * 1.5;
        // Fade out slightly in the ending scene zoom-out
        const opacity = p > 0.85 ? Math.max(0.2, 1 - (p - 0.85) * 5) : 1;
        balloon1.style.transform = `translate(-50%, -50%) translate(${balloonX}px, ${balloonY}px) scale(${1.2 - p * 0.4})`;
        balloon1.style.opacity = `${opacity}`;
      }

      // Balloon 2 (small, background)
      const balloon2 = balloon2Ref.current;
      if (balloon2) {
        const balloonY = lerp(height * 0.35, -150, p * 0.8) + mouseParallaxY * 0.5;
        const balloonX = lerp(width * 0.75, width * 0.6, p * 0.8) + mouseParallaxX * 0.5;
        const opacity = p > 0.85 ? Math.max(0.1, 0.7 - (p - 0.85) * 4) : 0.7;
        balloon2.style.transform = `translate(-50%, -50%) translate(${balloonX}px, ${balloonY}px) scale(${0.7 - p * 0.2})`;
        balloon2.style.opacity = `${opacity}`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [progressRef, mouseRef]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        overflow: "hidden",
      }}
    >
      {/* Background Sky Canvas */}
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

      {/* Sunset Sun */}
      <div
        ref={sunsetSunRef}
        className="absolute w-44 h-44 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,250,1) 0%, rgba(255,200,90,0.8) 30%, rgba(255,100,50,0) 70%)",
          mixBlendMode: "screen",
          left: 0,
          top: 0,
        }}
      />

      {/* Night Moon */}
      <div
        ref={nightMoonRef}
        className="absolute w-24 h-24 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(220,230,255,0.7) 40%, rgba(100,150,255,0) 75%)",
          boxShadow: "0 0 40px rgba(180, 210, 255, 0.4)",
          mixBlendMode: "screen",
          left: 0,
          top: 0,
        }}
      />

      {/* Floating Hot Air Balloon 1 */}
      <div
        ref={balloon1Ref}
        className="absolute w-24 h-36 pointer-events-none"
        style={{ left: 0, top: 0, transition: "opacity 0.2s" }}
      >
        <svg viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          {/* Balloon Envelope */}
          <path d="M50 10C25 10 10 30 10 55C10 85 40 115 50 120C60 115 90 85 90 55C90 30 75 10 50 10Z" fill="url(#balloonGrad)" />
          {/* Envelope Stripes */}
          <path d="M50 10C35 10 25 30 25 55C25 80 40 108 50 120C60 108 75 80 75 55C75 30 65 10 50 10Z" fill="url(#balloonStripe)" opacity="0.3" />
          <path d="M50 10C42 10 37 30 37 55C37 77 46 112 50 120C54 112 63 77 63 55C63 30 58 10 50 10Z" fill="url(#balloonCenter)" opacity="0.25" />
          {/* Basket Rigging */}
          <line x1="38" y1="120" x2="43" y2="135" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <line x1="62" y1="120" x2="57" y2="135" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <line x1="50" y1="120" x2="50" y2="135" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          {/* Basket */}
          <rect x="42" y="135" width="16" height="11" rx="2" fill="#8C6E51" stroke="#5C4531" strokeWidth="1" />
          {/* Burner Glow */}
          <circle cx="50" cy="123" r="5" fill="#FFA500" filter="blur(2px)" opacity="0.8" />
          {/* Gradients */}
          <defs>
            <linearGradient id="balloonGrad" x1="50" y1="10" x2="50" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF7E5F" />
              <stop offset="60%" stopColor="#FEB47B" />
              <stop offset="100%" stopColor="#FF7E5F" />
            </linearGradient>
            <linearGradient id="balloonStripe" x1="50" y1="10" x2="50" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FEB47B" />
            </linearGradient>
            <linearGradient id="balloonCenter" x1="50" y1="10" x2="50" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8A2BE2" />
              <stop offset="100%" stopColor="#E066FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating Hot Air Balloon 2 (Distant) */}
      <div
        ref={balloon2Ref}
        className="absolute w-12 h-18 pointer-events-none"
        style={{ left: 0, top: 0, transition: "opacity 0.2s" }}
      >
        <svg viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
          <path d="M50 10C25 10 10 30 10 55C10 85 40 115 50 120C60 115 90 85 90 55C90 30 75 10 50 10Z" fill="url(#balloonGrad2)" />
          <path d="M50 10C35 10 25 30 25 55C25 80 40 108 50 120C60 108 75 80 75 55C75 30 65 10 50 10Z" fill="#FFFFFF" opacity="0.2" />
          <line x1="40" y1="120" x2="44" y2="135" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <line x1="60" y1="120" x2="56" y2="135" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <rect x="44" y="135" width="12" height="9" rx="1.5" fill="#7C5D41" />
          <defs>
            <linearGradient id="balloonGrad2" x1="50" y1="10" x2="50" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8A2BE2" />
              <stop offset="50%" stopColor="#DA70D6" />
              <stop offset="100%" stopColor="#4169E1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Moving Grass at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "-5px",
          left: 0,
          width: "100%",
          height: "80px",
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          {/* Background hills / treeline silhouette */}
          <path
            d="M0 60 Q 360 40, 720 70 T 1440 50 L 1440 100 L 0 100 Z"
            fill="rgba(20, 10, 25, 0.4)"
          />
          {/* Foreground Grass Blades Silhouette */}
          <path
            d="M0 80 C 120 70, 240 85, 360 75 C 480 65, 600 80, 720 70 C 840 60, 960 78, 1080 72 C 1200 65, 1320 80, 1440 75 L 1440 100 L 0 100 Z"
            fill="#090511"
          />
        </svg>
      </div>
    </div>
  );
}
