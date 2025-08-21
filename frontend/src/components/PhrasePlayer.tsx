import React, { forwardRef } from "react";
import { AudioClip } from "../types/lesson";
import { MICROCOPY } from "../constants/microcopy";

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
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export const PhrasePlayer = forwardRef<HTMLButtonElement, PhrasePlayerProps>(
  (
    {
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
      onKeyDown,
    },
    ref,
  ) => {
    const handlePlayClick = () => {
      if (isPlaying) {
        onStop();
      } else {
        onPlay(audio);
      }
    };

    const getPlayButtonText = () => {
      if (isPlaying) return MICROCOPY.STOP_BUTTON_LABEL;
      return MICROCOPY.PHRASE_PLAY_BUTTON;
    };

    const getPlayButtonClass = () => {
      let baseClass = "phrase-player-button";
      if (isPlaying) baseClass += " playing";
      return baseClass;
    };

    return (
      <div className={`phrase-player ${className}`} data-testid="phrase-player">
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
              ref={ref}
              className={getPlayButtonClass()}
              onClick={handlePlayClick}
              onKeyDown={onKeyDown}
              aria-label={`${isPlaying ? MICROCOPY.STOP_BUTTON_LABEL : MICROCOPY.PHRASE_PLAY_BUTTON} phrase: ${nativeText}`}
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
              data-testid="phrase-status"
            >
              {isPlaying ? `Playing: ${nativeText}` : ""}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

PhrasePlayer.displayName = "PhrasePlayer";
