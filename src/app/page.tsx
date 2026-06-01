"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import AudioToggle from "@/components/AudioToggle";
import BackgroundOrchestrator from "@/components/BackgroundOrchestrator";
import FutureLetter from "@/components/FutureLetter";
import MemoryWall, { PolaroidData } from "@/components/MemoryWall";
import Timeline from "@/components/Timeline";
import Constellation from "@/components/Constellation";
import MessageReveal from "@/components/MessageReveal";
import EndingScene from "@/components/EndingScene";
import Image from "next/image";
import { X } from "lucide-react";

export default function Home() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const fixedContainerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Section Refs
  const heroTextRef = useRef<HTMLDivElement>(null);
  const letterWrapperRef = useRef<HTMLDivElement>(null);
  const memoryWallWrapperRef = useRef<HTMLDivElement>(null);
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const constellationWrapperRef = useRef<HTMLDivElement>(null);
  const envelopeWrapperRef = useRef<HTMLDivElement>(null);
  const endingWrapperRef = useRef<HTMLDivElement>(null);

  // Children Refs
  const polaroidCardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const timelineCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // High frequency reactive values stored in refs for 60fps canvas performance
  const scrollProgressRef = useRef<number>(0);
  const mouseCoordinatesRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // React states for local overlays and specific interactive attributes
  const [charCount, setCharCount] = useState<number>(0);
  const [lineProgress, setLineProgress] = useState<number>(0);
  const [activePhoto, setActivePhoto] = useState<PolaroidData | null>(null);

  // States to selectively mount/unmount content sections for optimization
  const [activeSections, setActiveSections] = useState({
    hero: true,
    letter: false,
    memoryWall: false,
    timeline: false,
    constellation: false,
    envelope: false,
    ending: false,
  });

  // Track global mouse movement for canvas particles and 3D tilts
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseCoordinatesRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // GSAP Animations Registration
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const spacer = spacerRef.current;
      const mm = gsap.matchMedia();

      // Master Timeline driven by ScrollTrigger
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: spacer,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5, // Buttery smooth scroll drag follow
          onUpdate: (self) => {
            scrollProgressRef.current = self.progress;

            // Dynamically manage section visibility states to reduce active DOM operations
            setActiveSections({
              hero: self.progress < 0.15,
              letter: self.progress > 0.05 && self.progress < 0.45,
              memoryWall: self.progress > 0.35 && self.progress < 0.65,
              timeline: self.progress > 0.52 && self.progress < 0.76,
              constellation: self.progress > 0.68 && self.progress < 0.88,
              envelope: self.progress > 0.82 && self.progress < 0.95,
              ending: self.progress > 0.9,
            });
          },
        },
      });

      // Define default animation settings
      masterTl.duration(100);

      // --- SECTION 1: HERO SCENE OUT (0s -> 12s) ---
      masterTl.to(
        heroTextRef.current,
        {
          opacity: 0,
          y: -80,
          duration: 10,
          ease: "power2.inOut",
        },
        0
      );

      // --- SECTION 2: LETTER IN & TYPING (10s -> 36s) ---
      // Rise from bottom
      masterTl.fromTo(
        letterWrapperRef.current,
        { y: "100vh", opacity: 0, scale: 0.8, rotateX: 25 },
        { y: "-50%", opacity: 1, scale: 1, rotateX: 0, duration: 10, ease: "power3.out" },
        8
      );

      // Typewriter ink animation
      const textDummy = { chars: 0 };
      masterTl.to(
        textDummy,
        {
          chars: 480, // Total character count of the letter
          duration: 16,
          ease: "none",
          onUpdate: () => {
            setCharCount(Math.floor(textDummy.chars));
          },
        },
        16
      );

      // --- SECTION 3: TRANSITION & FOLD INTO PHOTO GALLERY (34s -> 46s) ---
      // Fold/Shrink the letter sheet
      masterTl.to(
        letterWrapperRef.current,
        {
          scale: 0.12,
          rotateX: 65,
          rotateY: 20,
          opacity: 0,
          y: "-30%",
          duration: 8,
          ease: "power2.inOut",
        },
        32
      );

      // Base configuration for Memory Wall container
      masterTl.fromTo(
        memoryWallWrapperRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 5 },
        36
      );

      // Polaroid Explode & Parallax Animation
      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isDesktop } = context.conditions as { isDesktop: boolean };

          // Responsive positions
          const cardPositions = isDesktop
            ? [
                { x: "-26vw", y: "-22vh", r: -8 }, // Card 1: Top-Left
                { x: "24vw", y: "-24vh", r: 6 },  // Card 2: Top-Right
                { x: "-25vw", y: "18vh", r: 5 },  // Card 3: Bottom-Left
                { x: "26vw", y: "20vh", r: -7 },  // Card 4: Bottom-Right
              ]
            : [
                { x: "-20vw", y: "-24vh", r: -5 }, // Card 1: Top-Left (Grid)
                { x: "20vw", y: "-24vh", r: 6 },   // Card 2: Top-Right (Grid)
                { x: "-20vw", y: "14vh", r: 4 },   // Card 3: Bottom-Left (Grid)
                { x: "20vw", y: "14vh", r: -5 },   // Card 4: Bottom-Right (Grid)
              ];

          // Animate cards outward
          polaroidCardsRef.current.forEach((card, index) => {
            if (!card) return;
            const pos = cardPositions[index];

            // 1. Zoom out from the folded letter center
            masterTl.fromTo(
              card,
              { x: "-50%", y: "-50%", scale: 0, opacity: 0, rotate: 0 },
              {
                x: `calc(-50% + ${pos.x})`,
                y: `calc(-50% + ${pos.y})`,
                scale: isDesktop ? 1.0 : 0.82,
                opacity: 1,
                rotate: pos.r,
                duration: 8,
                ease: "back.out(1.2)",
              },
              36
            );

            // 2. Slow parallax horizontal drift while scrolling
            masterTl.to(
              card,
              {
                x: `calc(-50% + ${pos.x} + ${index % 2 === 0 ? "-35px" : "35px"})`,
                y: `calc(-50% + ${pos.y} + ${index < 2 ? "-15px" : "15px"})`,
                duration: 12,
                ease: "none",
              },
              44
            );

            // 3. Float up and fade out to transition to timeline
            masterTl.to(
              card,
              {
                y: `calc(-50% + ${pos.y} - 120px)`,
                opacity: 0,
                scale: 0.6,
                duration: 6,
                ease: "power2.in",
              },
              52
            );
          });
        }
      );

      masterTl.to(
        memoryWallWrapperRef.current,
        { opacity: 0, duration: 4 },
        54
      );

      // --- SECTION 4: TIMELINE DEPTH TUNNEL (54s -> 72s) ---
      masterTl.fromTo(
        timelineWrapperRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 4 },
        55
      );

      // Milestone Card Sequence (Scale & Blur emerge from Fog)
      timelineCardsRef.current.forEach((card, index) => {
        if (!card) return;

        const startTime = 57 + index * 3.5; // Staggered timeline card triggers

        // Card Emerges
        masterTl.fromTo(
          card,
          { opacity: 0, filter: "blur(20px)", transform: "translate3d(0, 0, -400px) scale(0.5)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            transform: "translate3d(0, 0, 0px) scale(1)",
            duration: 4,
            ease: "power2.out",
          },
          startTime
        );

        // Card Zooms Past Camera
        masterTl.to(
          card,
          {
            opacity: 0,
            filter: "blur(12px)",
            transform: "translate3d(0, -60px, 350px) scale(1.8)",
            duration: 3.5,
            ease: "power2.in",
          },
          startTime + 3.5
        );
      });

      masterTl.to(
        timelineWrapperRef.current,
        { opacity: 0, duration: 4 },
        695
      );

      // --- SECTION 5: LOVE CONSTELLATION (69s -> 86s) ---
      masterTl.fromTo(
        constellationWrapperRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 5 },
        70
      );

      // Animate line connection progress state in React
      const lineDummy = { progress: 0 };
      masterTl.to(
        lineDummy,
        {
          progress: 1,
          duration: 10,
          ease: "none",
          onUpdate: () => {
            setLineProgress(lineDummy.progress);
          },
        },
        74
      );

      // Fade out constellation
      masterTl.to(
        constellationWrapperRef.current,
        { opacity: 0, duration: 4 },
        83
      );

      // --- SECTION 6: MESSAGE REVEAL / ENVELOPE (82s -> 94s) ---
      masterTl.fromTo(
        envelopeWrapperRef.current,
        { y: "-65vh", opacity: 0 },
        { y: "-50%", opacity: 1, duration: 8, ease: "bounce.out" },
        82
      );

      masterTl.to(
        envelopeWrapperRef.current,
        { opacity: 0, y: "-100vh", duration: 5, ease: "power2.in" },
        90
      );

      // --- SECTION 7: ENDING SCENE & CAMERA PULL BACK (91s -> 100s) ---
      // Fade in final quote
      masterTl.fromTo(
        endingWrapperRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 6, ease: "power2.out" },
        93
      );

      // Camera Pull-Back: Scale down landscape container to create miniature effect
      masterTl.fromTo(
        canvasContainerRef.current,
        { scale: 1.0 },
        { scale: 0.84, borderRadius: "24px", duration: 8, ease: "power3.inOut" },
        92
      );
    },
    { scope: spacerRef }
  );

  // Restart trigger: Smoothly scroll back to top of page
  const handleRestart = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <SmoothScroll>
      <div ref={spacerRef} className="relative w-full h-[850vh]">
        {/* Fixed Core Stage Container */}
        <div
          ref={fixedContainerRef}
          className="fixed inset-0 w-full h-full overflow-hidden"
        >
          {/* Parallax Scalable Background Layer */}
          <div
            ref={canvasContainerRef}
            className="absolute inset-0 w-full h-full origin-center overflow-hidden transition-all duration-300"
          >
            <BackgroundOrchestrator
              progressRef={scrollProgressRef}
              mouseRef={mouseCoordinatesRef}
            />
          </div>

          {/* 1. HERO SECTION */}
          {activeSections.hero && (
            <div
              ref={heroTextRef}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10 select-none pointer-events-none"
            >
              <span className="text-xs uppercase tracking-[0.35em] text-orange-200/80 mb-6 font-semibold animate-pulse">
                A love letter to tomorrow
              </span>
              <h1
                className="text-4xl sm:text-6xl font-serif text-white font-bold leading-tight max-w-4xl"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Some stories begin with a hello.
                <br />
                <span className="text-orange-200">Ours begins before we&apos;ve even met.</span>
              </h1>
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                  Scroll to write
                </span>
                {/* Pulsing Mouse Scroll Indicator */}
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                  <div className="w-1.5 h-3 bg-[#feb47b] rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {/* 2. FUTURE WRITING LETTER SECTION */}
          <div
            ref={letterWrapperRef}
            style={{
              display: activeSections.letter ? "block" : "none",
            }}
          >
            <FutureLetter
              charCount={charCount}
              opacity={1}
              y="-50%"
              scale={1}
              rotateX={0}
            />
          </div>

          {/* 3. MEMORY PHOTO WALL */}
          <div
            ref={memoryWallWrapperRef}
            style={{
              display: activeSections.memoryWall ? "block" : "none",
            }}
          >
            <MemoryWall
              opacity={1}
              cardsRef={polaroidCardsRef}
              onCardClick={(photo) => setActivePhoto(photo)}
              isVisible={activeSections.memoryWall}
            />
          </div>

          {/* 4. TIMELINE FLOW */}
          <div
            ref={timelineWrapperRef}
            style={{
              display: activeSections.timeline ? "block" : "none",
            }}
          >
            <Timeline
              opacity={1}
              cardsRef={timelineCardsRef}
              containerRef={timelineWrapperRef}
              isVisible={activeSections.timeline}
            />
          </div>

          {/* 5. STAR CONSTELLATION MAP */}
          <div
            ref={constellationWrapperRef}
            style={{
              display: activeSections.constellation ? "block" : "none",
            }}
          >
            <Constellation
              opacity={1}
              lineProgress={lineProgress}
              isVisible={activeSections.constellation}
            />
          </div>

          {/* 6. GLOWING MESSAGE ENVELOPE */}
          <div
            ref={envelopeWrapperRef}
            style={{
              display: activeSections.envelope ? "block" : "none",
            }}
          >
            <MessageReveal
              opacity={1}
              y="-50%"
              isVisible={activeSections.envelope}
            />
          </div>

          {/* 7. ENDING SCENE CONCLUSION */}
          <div
            ref={endingWrapperRef}
            style={{
              display: activeSections.ending ? "block" : "none",
            }}
          >
            <EndingScene
              opacity={1}
              isVisible={activeSections.ending}
              onRestart={handleRestart}
            />
          </div>
        </div>

        {/* Global Floating Sound Synth Loop Toggle */}
        <AudioToggle />

        {/* Custom Lag Spring Glass Cursor */}
        <CustomCursor />

        {/* Cinematic Lightbox Modal for Photo Details */}
        <div
          className={`lightbox-overlay ${activePhoto ? "active" : ""}`}
          onClick={() => setActivePhoto(null)}
        >
          {activePhoto && (
            <div
              className="lightbox-content relative flex flex-col items-center text-center p-6 bg-white rounded-lg max-w-[500px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-100 hover:bg-zinc-200 rounded-full p-2.5 z-10 interactive-hover"
                aria-label="Close photo"
              >
                <X size={20} />
              </button>

              <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-zinc-100 mb-6 border border-zinc-100 shadow-inner">
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  fill
                  className="object-cover"
                  sizes="500px"
                  priority
                />
              </div>

              <p
                className="font-handwritten text-[#2b2b2b] text-3xl leading-relaxed mt-2"
                style={{ fontFamily: "var(--font-handwritten)" }}
              >
                {activePhoto.caption}
              </p>
            </div>
          )}
        </div>
      </div>
    </SmoothScroll>
  );
}
