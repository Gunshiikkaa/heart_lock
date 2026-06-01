"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function AudioToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const sequencerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ghibli-esque warm pentatonic notes (C Maj Pentatonic / C Maj 9 chords)
  const scales = [
    [130.81, 164.81, 196.00, 246.94, 293.66, 329.63, 392.00, 493.88], // C3, E3, G3, B3, D4, E4, G4, B4 (Cmaj9)
    [110.00, 146.83, 174.61, 220.00, 261.63, 349.23, 440.00, 523.25], // A2, D3, F3, A3, C4, F4, A4, C5 (Fmaj9 / Dm7)
    [116.54, 146.83, 174.61, 233.08, 293.66, 349.23, 466.16, 587.33], // Bb2, D3, F3, Bb3, D4, F4, Bb4, D5 (Bbmaj9)
    [123.47, 146.83, 196.00, 246.94, 293.66, 392.00, 493.88, 587.33]  // B2, D3, G3, B3, D4, G4, B4, D5 (G6/9)
  ];

  const playAmbientNote = (ctx: AudioContext, destination: AudioNode) => {
    // Pick current scale based on time
    const chordIndex = Math.floor(Date.now() / 8000) % scales.length;
    const currentScale = scales[chordIndex];
    
    // Choose a random note, biasing slightly towards lower notes for bass foundation
    const noteIndex = Math.floor(Math.random() * currentScale.length);
    const freq = currentScale[noteIndex];

    // Create Oscillator (soft triangle wave for warm flute/piano sound)
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    // Soft low-pass filter to keep it cozy and round
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800; // Filter high harmonics

    // Custom Amplitude Envelope (slow attack, long release)
    const gainNode = ctx.createGain();
    const now = ctx.currentTime;
    
    const attack = 0.8 + Math.random() * 0.6;
    const decay = 2.0 + Math.random() * 1.5;
    const volume = 0.05 + Math.random() * 0.08;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

    // Reverb / Stereo Delay Node Simulation
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.45;
    
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0.4; // 40% feedback

    // Hook up delay feedback loop
    gainNode.connect(destination);
    gainNode.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay); // Feedback loop
    delayGain.connect(destination);

    osc.connect(filter);
    filter.connect(gainNode);

    osc.start(now);
    osc.stop(now + attack + decay + 1);
  };

  const startSynthesizer = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Master low pass and master volume
      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = "lowpass";
      masterFilter.frequency.value = 1200;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 1.5); // Fade in master sound smoothly

      masterFilter.connect(masterGain);
      masterGain.connect(ctx.destination);
      mainGainRef.current = masterGain;
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Main Gain node for fading
    const masterGain = mainGainRef.current;
    if (masterGain) {
      masterGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 1.0);
    }

    // Scheduling loop for ambient notes
    const playLoop = () => {
      if (ctx.state === "running" && mainGainRef.current && mainGainRef.current.gain.value > 0.05) {
        // Play 1 or 2 simultaneous notes for chord density
        playAmbientNote(ctx, mainGainRef.current);
        if (Math.random() > 0.6) {
          setTimeout(() => {
            if (audioCtxRef.current && mainGainRef.current) {
              playAmbientNote(audioCtxRef.current, mainGainRef.current);
            }
          }, 400 + Math.random() * 600);
        }
      }
      const nextNoteDelay = 2000 + Math.random() * 2500;
      sequencerTimeoutRef.current = setTimeout(playLoop, nextNoteDelay);
    };

    playLoop();
  };

  const stopSynthesizer = () => {
    const ctx = audioCtxRef.current;
    const masterGain = mainGainRef.current;
    if (ctx && masterGain) {
      // Fade out volume before suspending context to avoid pops
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
      setTimeout(() => {
        if (ctx.state === "running" && !isPlaying) {
          ctx.suspend();
        }
      }, 1000);
    }
    if (sequencerTimeoutRef.current) {
      clearTimeout(sequencerTimeoutRef.current);
      sequencerTimeoutRef.current = null;
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopSynthesizer();
      setIsPlaying(false);
    } else {
      startSynthesizer();
      setIsPlaying(true);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sequencerTimeoutRef.current) {
        clearTimeout(sequencerTimeoutRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <button
      onClick={toggleAudio}
      className="audio-toggle-btn interactive-hover"
      aria-label="Toggle background music"
      title="Procedural ambient piano"
    >
      {isPlaying ? (
        <div className="audio-bars">
          <span className="audio-bar" />
          <span className="audio-bar" />
          <span className="audio-bar" />
          <span className="audio-bar" />
        </div>
      ) : (
        <VolumeX size={20} />
      )}
    </button>
  );
}
