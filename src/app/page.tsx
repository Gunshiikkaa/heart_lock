"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX, X, ArrowLeft, Edit3, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomCursor from "@/components/CustomCursor";

// Interface for Polaroid photos
interface PhotoData {
  id: number;
  src: string;
  caption: string;
  alt: string;
}

const defaultPhotos: PhotoData[] = [
  { id: 1, src: "/images/rose_bouquet.png", caption: "A beautiful rose, representing the bloom of our future.", alt: "Bouquet of pink roses" },
  { id: 2, src: "/images/pink_blossoms.png", caption: "Walking under spring blossoms, waiting for the day we walk together.", alt: "Pink cherry blossoms sunset" },
  { id: 3, src: "/images/babys_breath.png", caption: "Delicate baby's breath, saving this gentle moment for you.", alt: "Hands holding baby's breath" },
  { id: 4, src: "/images/forest_walk.png", caption: "Down golden pathways, dreaming of holding your hand.", alt: "Sunlit forest pathway" },
  { id: 5, src: "/images/coffee_shop.png", caption: "A warm cup of coffee, wondering if you're looking out the same window.", alt: "Coffee mugs in rain" },
  { id: 6, src: "/images/stargazing.png", caption: "Under a blanket of stars, reserving this campsite just for us.", alt: "Tent under starry night sky" },
  { id: 7, src: "/images/beach_sunset.png", caption: "Ocean shorelines, walking side by side in my dreams.", alt: "Beach sunset silhouettes" },
  { id: 8, src: "/images/clinking_drinks.png", caption: "Cheers to our tomorrow, the one that begins with you.", alt: "Matcha drinks clinking in park" }
];

export default function Home() {
  // Navigation Screens: "sound_modal" | "lock" | "letter" | "collage"
  const [screen, setScreen] = useState<"sound_modal" | "lock" | "letter" | "collage">("sound_modal");
  
  // Audio Synthesizer states
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const synthTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lock Pin states
  const [pinDigits, setPinDigits] = useState<number[]>([0, 0, 0, 0]);
  const [isLockShaking, setIsLockShaking] = useState(false);

  // Letter states
  const [letterStage, setLetterStage] = useState<"intro" | "choice1_selected" | "choice2_selected" | "ended">("intro");
  const [choice1Text, setChoice1Text] = useState("");
  const [choice2Text, setChoice2Text] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isTypingActive, setIsTypingActive] = useState(false);
  
  // Custom Letter states
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customLetterText, setCustomLetterText] = useState("");
  const [customLetterTitle, setCustomLetterTitle] = useState("");
  const [isReadingCustom, setIsReadingCustom] = useState(false);

  // Photo Lightbox states
  const [activePhoto, setActivePhoto] = useState<PhotoData | null>(null);

  // Ghibli-esque warm pentatonic notes (C Maj Pentatonic / C Maj 9 chords)
  const chordScales = [
    [130.81, 164.81, 196.00, 246.94, 293.66, 329.63, 392.00, 493.88], // Cmaj9
    [110.00, 146.83, 174.61, 220.00, 261.63, 349.23, 440.00, 523.25], // Fmaj9 / Dm7
    [116.54, 146.83, 174.61, 233.08, 293.66, 349.23, 466.16, 587.33], // Bbmaj9
    [123.47, 146.83, 196.00, 246.94, 293.66, 392.00, 493.88, 587.33]  // G6/9
  ];

  // Procedural Web Audio Synth note player
  const playAmbientNote = (ctx: AudioContext, destination: AudioNode) => {
    const chordIndex = Math.floor(Date.now() / 7000) % chordScales.length;
    const currentScale = chordScales[chordIndex];
    const freq = currentScale[Math.floor(Math.random() * currentScale.length)];

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 750;

    const gainNode = ctx.createGain();
    const now = ctx.currentTime;
    const attack = 1.0 + Math.random() * 0.5;
    const decay = 2.5 + Math.random() * 1.5;
    const volume = 0.04 + Math.random() * 0.05;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.5;
    
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.35;

    gainNode.connect(destination);
    gainNode.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay);
    delayGain.connect(destination);

    osc.connect(filter);
    filter.connect(gainNode);

    osc.start(now);
    osc.stop(now + attack + decay + 1);
  };

  // Synthetic typewriter keystroke tick generator
  const playTypewriterClick = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || ctx.state !== "running" || isAudioMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Quick random frequency click
    osc.type = "sine";
    osc.frequency.setValueAtTime(1100 + Math.random() * 400, ctx.currentTime);
    
    // Short click envelope
    gain.gain.setValueAtTime(0.003, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  };

  // Start Ghibli Background Loop Synthesizer
  const startSynthesizer = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = "lowpass";
      masterFilter.frequency.value = 1100;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2.0);

      masterFilter.connect(masterGain);
      masterGain.connect(ctx.destination);
      mainGainRef.current = masterGain;
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const playLoop = () => {
      if (ctx.state === "running" && mainGainRef.current && !isAudioMuted) {
        playAmbientNote(ctx, mainGainRef.current);
        if (Math.random() > 0.6) {
          setTimeout(() => {
            if (audioCtxRef.current && mainGainRef.current && !isAudioMuted) {
              playAmbientNote(audioCtxRef.current, mainGainRef.current);
            }
          }, 500 + Math.random() * 500);
        }
      }
      synthTimeoutRef.current = setTimeout(playLoop, 2200 + Math.random() * 1500);
    };

    playLoop();
  };

  const handleMuteToggle = () => {
    const nextMute = !isAudioMuted;
    setIsAudioMuted(nextMute);
    
    const masterGain = mainGainRef.current;
    const ctx = audioCtxRef.current;
    if (ctx && masterGain) {
      masterGain.gain.linearRampToValueAtTime(nextMute ? 0 : 0.55, ctx.currentTime + 0.5);
    }
  };

  // Pin digits controls
  const incrementDigit = (idx: number) => {
    const updated = [...pinDigits];
    updated[idx] = (updated[idx] + 1) % 10;
    setPinDigits(updated);
    playTypewriterClick();
  };

  const decrementDigit = (idx: number) => {
    const updated = [...pinDigits];
    updated[idx] = (updated[idx] - 1 + 10) % 10;
    setPinDigits(updated);
    playTypewriterClick();
  };

  // Lock verify PIN (correct is 0001)
  const handleVerifyLock = () => {
    const code = pinDigits.join("");
    if (code === "0001") {
      // Unlocked
      setScreen("letter");
      setCharCount(0);
      setLetterStage("intro");
      setIsReadingCustom(false);
    } else {
      // Error Feedback: Shake padlock
      setIsLockShaking(true);
      setTimeout(() => setIsLockShaking(false), 500);
      setPinDigits([0, 0, 0, 0]);
    }
  };

  // Content segments of the love letter
  const getFullText = () => {
    if (isReadingCustom) {
      return customLetterText || "I look forward to writing our letters here.";
    }

    let text = `Dear My Future Wife,\n\nI don't know your name yet.\n\nI don't know the sound of your laugh, the way your eyes look when you're tired, or how you take your coffee in the morning. I don't know if we've already crossed paths in some ordinary place, and never knew it, or if life is still preparing the road that will lead me to you.`;

    if (letterStage === "intro") return text;

    // Append Choice 1
    text += `\n\n${choice1Text}`;
    if (choice1Text.startsWith("It's strange to miss someone")) {
      text += ` Stranger to feel a kind of longing for a person whose face I cannot picture clearly, and yet, somewhere deep in me, there is a quiet space that feels like it belongs to you. A place for my future wife...`;
    }

    text += `\n\nAnd hoping that someday this letter will no longer be addressed to a dream, but to the woman drying her hands, smiling, reading it with me in our kitchen.\n\nThe memories that do not yet exist... the love you hide behind your smile... the dream of you is always on my mind. I want to tell you that I've been waiting for you, page by page, never trying to skip to the ending.\n\nAnd one day, if I am blessed enough to call you my wife, I'll love to know that I have been waiting for you even before I knew who you were.\n\nSome words remain silent, but I will write them to continue in this space, for the day I will finally see you.`;

    if (letterStage === "choice1_selected") return text;

    // Append Choice 2
    text += `\n\n${choice2Text}`;
    text += `\n\nWith love,\nYour future husband, Kenji.`;

    return text;
  };

  const fullText = getFullText();

  // Character Typewriter script
  useEffect(() => {
    if (screen !== "letter") {
      setIsTypingActive(false);
      return;
    }

    setIsTypingActive(true);
    const interval = setInterval(() => {
      setCharCount((prev) => {
        if (prev >= fullText.length) {
          clearInterval(interval);
          setIsTypingActive(false);
          return prev;
        }
        playTypewriterClick();
        return prev + 1;
      });
    }, 28);

    return () => clearInterval(interval);
  }, [screen, fullText, letterStage, isReadingCustom]);

  const handleSkipTyping = () => {
    setCharCount(fullText.length);
    setIsTypingActive(false);
  };

  // Custom letter local storage loading
  useEffect(() => {
    const savedText = localStorage.getItem("custom_love_letter_text");
    const savedTitle = localStorage.getItem("custom_love_letter_title");
    if (savedText) setCustomLetterText(savedText);
    if (savedTitle) setCustomLetterTitle(savedTitle);
  }, []);

  const handleSaveCustomLetter = () => {
    localStorage.setItem("custom_love_letter_text", customLetterText);
    localStorage.setItem("custom_love_letter_title", customLetterTitle);
    setShowCustomModal(false);
  };

  const handleReadCustomLetter = () => {
    setIsReadingCustom(true);
    setLetterStage("ended");
    setCharCount(0);
    setScreen("letter");
  };

  const handleRestartLetter = () => {
    setLetterStage("intro");
    setChoice1Text("");
    setChoice2Text("");
    setCharCount(0);
    setIsReadingCustom(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundImage: "url('/images/sunset_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* 1. INITIAL SOUND CONSENT MODAL */}
      <AnimatePresence>
        {screen === "sound_modal" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(12px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel"
              style={{
                maxWidth: "460px",
                width: "100%",
                padding: "40px",
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
              }}
            >
              <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.3em", color: "#feb47b", fontWeight: "600", display: "block", marginBottom: "16px" }}>
                DEAR EXPERIENCE
              </span>
              <h2 style={{ fontSize: "2rem", fontFamily: "var(--font-serif)", color: "#fff", fontWeight: "700", marginBottom: "16px" }}>
                Continue with sound
              </h2>
              <p style={{ color: "#e2e8f0", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "32px" }}>
                Listening to songs and ambient sounds will make your layout look and feel much more romantic.
              </p>
              <button
                onClick={() => {
                  startSynthesizer();
                  setScreen("lock");
                }}
                className="ending-restart-btn interactive-hover"
                style={{
                  width: "100%",
                  backgroundColor: "#fff",
                  color: "#ff5e7e",
                  fontWeight: "700",
                  border: "none",
                  boxShadow: "0 8px 24px rgba(255, 94, 126, 0.25)",
                }}
              >
                CONTINUE WITH SOUND
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HEART LOCK SCREEN */}
      <AnimatePresence>
        {screen === "lock" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            {/* Padlock PIN Display */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "2px solid rgba(255, 255, 255, 0.35)",
                padding: "12px 28px",
                borderRadius: "999px",
                color: "#fff",
                fontSize: "1.25rem",
                fontWeight: "700",
                letterSpacing: "0.15em",
                marginBottom: "28px",
                boxShadow: "0 12px 36px rgba(255, 94, 126, 0.35), inset 0 0 15px rgba(255,255,255,0.1)",
                textShadow: "0 0 10px rgba(255,255,255,0.3)",
                userSelect: "none",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>THE PIN IS :</span>
              <span style={{ color: "#ffe66d", textShadow: "0 0 12px #ffe66d, 0 0 20px #ffe66d", fontSize: "1.4rem", fontWeight: "800" }}>0001</span>
            </div>

            {/* Heart Lock Grid card */}
            <div
              className={isLockShaking ? "lock-shake" : ""}
              style={{
                position: "relative",
                width: "360px",
                height: "360px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* SVG Heart Background Panel */}
              <svg
                viewBox="0 0 100 100"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  fill: "rgba(255, 94, 126, 0.9)",
                  filter: "drop-shadow(0 20px 48px rgba(255, 94, 126, 0.45))",
                }}
              >
                <path d="M50 88.5 C45 80 12 55 12 36 C12 21 24.5 10 39.5 10 C46.5 10 50 15 50 15 C50 15 53.5 10 60.5 10 C75.5 10 88 21 88 36 C88 55 55 80 50 88.5 Z" />
              </svg>

              {/* Padlock Digit rollers & Enter Button */}
              <div
                style={{
                  position: "relative",
                  zIndex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "28px",
                  marginTop: "-16px",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  {pinDigits.map((val, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <button
                        onClick={() => incrementDigit(idx)}
                        className="interactive-hover"
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(255,255,255,0.75)",
                          cursor: "pointer",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        ▲
                      </button>
                      <div
                        style={{
                          width: "44px",
                          height: "60px",
                          backgroundColor: "#fff",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ff5e7e",
                          fontSize: "24px",
                          fontWeight: "800",
                          boxShadow: "0 8px 16px rgba(0,0,0,0.06)",
                          userSelect: "none",
                        }}
                      >
                        {val}
                      </div>
                      <button
                        onClick={() => decrementDigit(idx)}
                        className="interactive-hover"
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(255,255,255,0.75)",
                          cursor: "pointer",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        ▼
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleVerifyLock}
                  className="interactive-hover"
                  style={{
                    padding: "10px 32px",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "#fff",
                    color: "#ff5e7e",
                    fontWeight: "800",
                    fontSize: "0.85rem",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  ENTER
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. LETTER WRITING READER SCREEN */}
      <AnimatePresence>
        {screen === "letter" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 10,
            }}
          >
            {/* The letter container */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "640px",
                height: "82vh",
                background: "linear-gradient(145deg, #ffffff 0%, #faf6ec 100%)",
                borderRadius: "16px",
                boxShadow: "0 30px 90px rgba(0,0,0,0.25), inset 0 0 40px rgba(234, 214, 184, 0.12)",
                border: "1px solid #ebdcb9",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "40px 48px",
                overflow: "hidden",
              }}
            >
              {/* Red Wax Seal Watermark */}
              <div style={{ position: "absolute", bottom: "75px", right: "44px", width: "90px", height: "90px", opacity: 0.05, pointerEvents: "none", zIndex: 1 }}>
                <svg viewBox="0 0 100 100" fill="#a8253b" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C72.1 90 90 72.1 90 50 C90 27.9 72.1 10 50 10 Z M50 20 C66.5 20 80 33.5 80 50 C80 66.5 66.5 80 50 80 C33.5 80 20 66.5 20 50 C20 33.5 33.5 20 50 20 Z" />
                  <path d="M50 28 C37.8 28 28 37.8 28 50 C28 62.2 37.8 72 50 72 C62.2 72 72 62.2 72 50 C72 37.8 62.2 28 50 28 Z M50 35 C58.3 35 65 41.7 65 50 C65 58.3 58.3 65 50 65 C41.7 65 35 58.3 35 50 C35 41.7 41.7 35 50 35 Z" />
                  <path d="M46 44 L54 44 L54 48 L58 48 L58 52 L54 52 L54 58 L46 58 L46 52 L42 52 L42 48 L46 48 Z" />
                </svg>
              </div>
              {/* Paper line textures overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  opacity: 0.025,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              />

              {/* Header block info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid rgba(235, 220, 185, 0.4)", paddingBottom: "12px", marginBottom: "20px", zIndex: 2 }}>
                <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: "700", color: "#1c1813" }}>
                  {isReadingCustom ? customLetterTitle || "Custom Letter" : "Dear My Future Wife,"}
                </h4>
                <span style={{ fontSize: "0.8rem", color: "#7a6e5d", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  MAY 16, 2026
                </span>
              </div>

              {/* Scrollable Letter Writing Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                  fontFamily: "var(--font-serif)",
                  color: "#2c2214",
                  lineHeight: "1.75",
                  fontSize: "1.05rem",
                  paddingRight: "6px",
                  zIndex: 2,
                }}
              >
                {fullText.slice(0, charCount)}
                {isTypingActive && <span className="cursor-blink" />}

                {/* --- CHOICE PANEL 1 --- */}
                {!isTypingActive && charCount === fullText.length && letterStage === "intro" && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      margin: "32px 0 16px 0",
                      padding: "20px",
                      backgroundColor: "rgba(235, 220, 185, 0.25)",
                      borderRadius: "6px",
                      border: "1px dashed #ebdcb9",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <button
                      onClick={() => {
                        setChoice1Text("But tonight, I find myself missing you.");
                        setLetterStage("choice1_selected");
                        setCharCount(0);
                      }}
                      className="letter-choice-btn interactive-hover"
                    >
                      &bull; But tonight, I find myself missing you.
                    </button>
                    <button
                      onClick={() => {
                        setChoice1Text("It's strange to miss someone I have not yet met.");
                        setLetterStage("choice1_selected");
                        setCharCount(0);
                      }}
                      className="letter-choice-btn interactive-hover"
                    >
                      &bull; It&apos;s strange to miss someone I have not yet met.
                    </button>
                  </motion.div>
                )}

                {/* --- CHOICE PANEL 2 --- */}
                {!isTypingActive && charCount === fullText.length && letterStage === "choice1_selected" && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      margin: "32px 0 16px 0",
                      padding: "20px",
                      backgroundColor: "rgba(235, 220, 185, 0.25)",
                      borderRadius: "6px",
                      border: "1px dashed #ebdcb9",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() => {
                        setChoice2Text("Until then, I will keep carrying this quiet hope.");
                        setLetterStage("choice2_selected");
                        setCharCount(0);
                      }}
                      className="letter-choice-btn interactive-hover"
                    >
                      &bull; Until then, I will keep carrying this quiet hope.
                    </button>
                    <button
                      onClick={() => {
                        setChoice2Text("This can be real.");
                        setLetterStage("choice2_selected");
                        setCharCount(0);
                      }}
                      className="letter-choice-btn interactive-hover"
                    >
                      &bull; This can be real.
                    </button>
                    <button
                      onClick={() => {
                        setChoice2Text("That you are real.");
                        setLetterStage("choice2_selected");
                        setCharCount(0);
                      }}
                      className="letter-choice-btn interactive-hover"
                    >
                      &bull; That you are real.
                    </button>
                    <button
                      onClick={() => {
                        setChoice2Text("Then in this lifetime, somehow I will find you.");
                        setLetterStage("choice2_selected");
                        setCharCount(0);
                      }}
                      className="letter-choice-btn interactive-hover"
                    >
                      &bull; Then in this lifetime, somehow I will find you.
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Bottom footer button navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(235, 220, 185, 0.4)", paddingTop: "16px", marginTop: "16px", zIndex: 2 }}>
                {/* Skip / Restart trigger */}
                {isTypingActive ? (
                  <button
                    onClick={handleSkipTyping}
                    className="interactive-hover"
                    style={{ border: "none", background: "none", color: "#7a6e5d", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    SKIP TYPING
                  </button>
                ) : (
                  <button
                    onClick={handleRestartLetter}
                    className="interactive-hover"
                    style={{ border: "none", background: "none", color: "#7a6e5d", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <RotateCcw size={14} /> RESET
                  </button>
                )}

                {/* Show Next button only when typing completes and choices are finished */}
                {!isTypingActive && charCount === fullText.length && (letterStage === "choice2_selected" || isReadingCustom) && (
                  <button
                    onClick={() => setScreen("collage")}
                    className="interactive-hover"
                    style={{
                      padding: "12px 36px",
                      borderRadius: "999px",
                      border: "none",
                      backgroundColor: "#ff5e7e",
                      color: "#fff",
                      fontWeight: "800",
                      fontSize: "0.88rem",
                      letterSpacing: "0.12em",
                      cursor: "pointer",
                      boxShadow: "0 8px 24px rgba(255, 94, 126, 0.35)",
                      transition: "transform 0.2s ease, background-color 0.2s"
                    }}
                  >
                    SHOW PICTURES
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. PHOTO COLLAGE SCREEN */}
      <AnimatePresence>
        {screen === "collage" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "40px 20px",
              zIndex: 10,
              overflowY: "auto"
            }}
          >
            {/* Header Title */}
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.25rem",
                color: "#fff",
                fontWeight: "700",
                textShadow: "0 4px 16px rgba(0,0,0,0.15)",
                marginBottom: "16px",
                textAlign: "center"
              }}
            >
              Photo Collage
            </h2>

            {/* Sub-Navigation buttons */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "40px", zIndex: 10 }}>
              <button
                onClick={() => {
                  setScreen("letter");
                  setLetterStage("choice2_selected");
                  setCharCount(getFullText().length);
                }}
                className="ending-restart-btn interactive-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.3)"
                }}
              >
                <ArrowLeft size={16} /> BACK TO LETTER
              </button>
              <button
                onClick={() => setShowCustomModal(true)}
                className="ending-restart-btn interactive-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#ff5e7e",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(255, 94, 126, 0.2)"
                }}
              >
                <Edit3 size={16} /> CREATE YOUR OWN LETTER
              </button>
            </div>

            {/* Collage Grid mapping 8 Polaroids */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "24px",
                width: "100%",
                maxWidth: "1000px",
                margin: "0 auto",
                paddingBottom: "40px"
              }}
            >
              {defaultPhotos.map((photo, idx) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  onClick={() => setActivePhoto(photo)}
                  className="polaroid-card interactive-hover"
                  style={{
                    width: "100%",
                    maxWidth: "240px",
                    justifySelf: "center",
                    padding: "12px 12px 24px 12px",
                    transform: `rotate(${(idx % 2 === 0 ? 1.5 : -1.5) * (idx + 1)}deg)`,
                    transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out"
                  }}
                >
                  <div className="polaroid-image-container" style={{ aspectRatio: "1" }}>
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="220px"
                      style={{ objectFit: "cover" }}
                      draggable={false}
                    />
                  </div>
                  <div
                    className="polaroid-caption"
                    style={{
                      fontFamily: "var(--font-handwritten)",
                      fontSize: "1.3rem",
                      marginTop: "10px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {photo.caption}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. LIGHTBOX OVERLAY */}
      <div
        className={`lightbox-overlay ${activePhoto ? "active" : ""}`}
        onClick={() => setActivePhoto(null)}
      >
        {activePhoto && (
          <div
            className="lightbox-content-card"
            style={{ padding: "20px 20px 36px 20px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="lightbox-close-button interactive-hover"
              style={{ top: "12px", right: "12px" }}
            >
              CLOSE
            </button>

            <div className="lightbox-image-wrapper" style={{ margin: "20px 0" }}>
              <Image
                src={activePhoto.src}
                alt={activePhoto.alt}
                fill
                className="object-cover"
                sizes="500px"
                priority
              />
            </div>

            <p className="lightbox-caption-text">
              {activePhoto.caption}
            </p>
            <span style={{ fontSize: "0.85rem", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginTop: "16px" }}>
              PHOTO {activePhoto.id} OF 8
            </span>
          </div>
        )}
      </div>

      {/* 6. CREATE YOUR OWN LETTER MODAL OVERLAY */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(8px)",
              zIndex: 110,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="glass-panel-dark"
              style={{
                maxWidth: "500px",
                width: "100%",
                padding: "36px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "#fff", fontWeight: "600" }}>
                  Write Your Own Letter
                </h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  style={{ border: "none", background: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                  className="interactive-hover"
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#feb47b" }}>
                    Letter Header / Title
                  </label>
                  <input
                    type="text"
                    value={customLetterTitle}
                    onChange={(e) => setCustomLetterTitle(e.target.value)}
                    placeholder="e.g., Dear My Love,"
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "#fff",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#feb47b" }}>
                    Letter Content
                  </label>
                  <textarea
                    rows={6}
                    value={customLetterText}
                    onChange={(e) => setCustomLetterText(e.target.value)}
                    placeholder="Write your heartfelt letter here..."
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: "1px solid rgba(255,255,255,0.15)",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      color: "#fff",
                      outline: "none",
                      resize: "none",
                      lineHeight: "1.5",
                      fontFamily: "inherit"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleSaveCustomLetter}
                  className="ending-restart-btn interactive-hover"
                  style={{ flex: 1, backgroundColor: "#fff", color: "#ff5e7e", border: "none", padding: "12px" }}
                >
                  SAVE LETTER
                </button>
                {customLetterText && (
                  <button
                    onClick={() => {
                      handleSaveCustomLetter();
                      handleReadCustomLetter();
                    }}
                    className="ending-restart-btn interactive-hover"
                    style={{ flex: 1, backgroundColor: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", padding: "12px" }}
                  >
                    READ IT NOW
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. FLOATING BOTTOM SOUND MUTE TOGGLE (Visible after unmute modal) */}
      {screen !== "sound_modal" && (
        <button
          onClick={handleMuteToggle}
          className="audio-toggle-btn interactive-hover"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 100,
            width: "44px",
            height: "44px"
          }}
          title={isAudioMuted ? "Unmute music" : "Mute music"}
        >
          {isAudioMuted ? (
            <VolumeX size={18} />
          ) : (
            <div className="audio-bars">
              <span className="audio-bar" />
              <span className="audio-bar" />
              <span className="audio-bar" />
              <span className="audio-bar" />
            </div>
          )}
        </button>
      )}

      {/* 8. CUSTOM SPRING Trail Cursor */}
      <CustomCursor />
    </div>
  );
}
