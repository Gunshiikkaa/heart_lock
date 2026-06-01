"use client";

interface EndingSceneProps {
  opacity: number;
  isVisible: boolean;
  onRestart: () => void;
}

export default function EndingScene({ opacity, isVisible, onRestart }: EndingSceneProps) {
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
        zIndex: 10,
        pointerEvents: opacity > 0.1 ? "auto" : "none",
      }}
      className="flex flex-col items-center justify-center text-center px-6"
    >
      <div className="max-w-2xl mx-auto space-y-8 select-none">
        {/* Decorative elements */}
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#feb47b] to-transparent mx-auto opacity-75" />

        <div className="space-y-4">
          <p
            className="text-2xl sm:text-4xl font-serif text-orange-100 italic leading-relaxed"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            &ldquo;Every memory led me here.&rdquo;
          </p>
          <p
            className="text-3xl sm:text-5xl font-serif text-white font-bold tracking-wide leading-tight"
            style={{
              fontFamily: "var(--font-serif)",
              textShadow: "0 0 20px rgba(255,255,255,0.15)",
            }}
          >
            And every tomorrow begins with you.
          </p>
        </div>

        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#feb47b] to-transparent mx-auto opacity-75" />

        {/* Floating Paper Airplane Restart CTA */}
        <div className="pt-8">
          <button
            onClick={onRestart}
            className="glass-panel text-white text-xs sm:text-sm font-medium tracking-[0.25em] uppercase py-4 px-8 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 active:scale-95 interactive-hover"
          >
            Begin the Journey Again
          </button>
        </div>
      </div>
    </div>
  );
}
