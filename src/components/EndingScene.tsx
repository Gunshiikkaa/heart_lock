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
      className="ending-section-container"
    >
      <div className="ending-content-wrapper">
        {/* Decorative elements */}
        <div className="ending-divider" />

        <div className="ending-text-group">
          <p className="ending-quote-line-1">
            &ldquo;Every memory led me here.&rdquo;
          </p>
          <p className="ending-quote-line-2">
            And every tomorrow begins with you.
          </p>
        </div>

        <div className="ending-divider" />

        {/* Floating Paper Airplane Restart CTA */}
        <div className="ending-cta-container">
          <button
            onClick={onRestart}
            className="ending-restart-btn interactive-hover"
          >
            Begin the Journey Again
          </button>
        </div>
      </div>
    </div>
  );
}
