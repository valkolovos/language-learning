import React, { forwardRef } from "react";

interface TranscriptToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export const TranscriptToggle = forwardRef<
  HTMLButtonElement,
  TranscriptToggleProps
>(({ isVisible, onToggle, className = "", onKeyDown }, ref) => {
  return (
    <div className={`transcript-toggle ${className}`}>
      <button
        ref={ref}
        className="transcript-toggle-button"
        onClick={onToggle}
        onKeyDown={onKeyDown}
        aria-label={`${isVisible ? "Hide" : "Show"} all translations`}
        aria-pressed={isVisible}
        aria-describedby="transcript-toggle-description"
      >
        <span aria-hidden="true">{isVisible ? "👁️" : "👁️‍🗨️"}</span>
        {isVisible ? "Hide All Translations" : "Show All Translations"}
      </button>
      <div id="transcript-toggle-description" className="sr-only">
        Press Enter or Space to toggle translation visibility
      </div>
    </div>
  );
});

TranscriptToggle.displayName = "TranscriptToggle";
