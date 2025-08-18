import React from "react";
import { AudioClip } from "../types/lesson";

interface PhrasePlayerProps {
  phraseId: string;
  nativeText: string;
  gloss: string;
  tips?: string;
  audio: AudioClip;
  isPlaying: boolean;
  onPlay: (audioClip: AudioClip) => void;
  onStop: () => void;
  className?: string;
  showGloss?: boolean;
}

export const PhrasePlayer: React.FC<PhrasePlayerProps> = ({
  phraseId,
  nativeText,
  gloss,
  tips,
  audio,
  isPlaying,
  onPlay,
  onStop,
  className = "",
  showGloss = true,
}) => {
  const handlePlayClick = () => {
    if (isPlaying) {
      onStop();
    } else {
      onPlay(audio);
    }
  };

  const getPlayButtonText = () => {
    if (isPlaying) return "Stop";
    return "Play";
  };

  const getPlayButtonClass = () => {
    let baseClass = "phrase-player-button";
    if (isPlaying) baseClass += " playing";
    return baseClass;
  };

  return (
    <div className={`phrase-player ${className}`}>
      <div className="phrase-content">
        <div className="phrase-text">
          <p className="native-text">{nativeText}</p>
          {showGloss && <p className="gloss-text">{gloss}</p>}
          {tips && (
            <p className="tip-text">
              <strong>Tip:</strong> {tips}
            </p>
          )}
        </div>

        <div className="phrase-controls">
          <button
            className={getPlayButtonClass()}
            onClick={handlePlayClick}
            aria-label={`${isPlaying ? "Stop" : "Play"} phrase: ${nativeText}`}
            aria-describedby={`phrase-${phraseId}-status`}
          >
            <span aria-hidden="true">{isPlaying ? "⏹️" : "▶️"}</span>
            {getPlayButtonText()}
          </button>

          <div
            id={`phrase-${phraseId}-status`}
            className="phrase-status"
            aria-live="polite"
            aria-hidden="true"
          >
            {isPlaying ? `Playing: ${nativeText}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
};
