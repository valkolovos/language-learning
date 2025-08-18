import React from "react";

interface TranscriptToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

export const TranscriptToggle: React.FC<TranscriptToggleProps> = ({
  isVisible,
  onToggle,
  className = "",
}) => {
  return (
    <div className={`transcript-toggle ${className}`}>
      <button
        className="transcript-toggle-button"
        onClick={onToggle}
        aria-label={`${isVisible ? "Hide" : "Show"} all translations`}
        aria-pressed={isVisible}
      >
        <span aria-hidden="true">{isVisible ? "👁️" : "👁️‍🗨️"}</span>
        {isVisible ? "Hide All Translations" : "Show All Translations"}
      </button>
    </div>
  );
};
