import React from "react";
import { AudioClip } from "../types/lesson";

interface AudioPlayerProps {
  audioClip: AudioClip;
  isPlaying: boolean;
  onPlay: (audioClip: AudioClip) => void;
  onStop: () => void;
  playCount: number;
  canReveal: boolean;
  error: string | null;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioClip,
  isPlaying,
  onPlay,
  onStop,
  playCount,
  canReveal,
  error,
  className = "",
}) => {
  const handlePlayClick = () => {
    if (isPlaying) {
      onStop();
    } else {
      onPlay(audioClip);
    }
  };

  const getPlayButtonText = () => {
    if (error) return "Retry";
    if (isPlaying) return "Stop";
    return "Play";
  };

  const getPlayButtonClass = () => {
    let baseClass = "audio-player-button";
    if (error) baseClass += " error";
    else if (isPlaying) baseClass += " playing";
    else if (canReveal) baseClass += " unlocked";
    return baseClass;
  };

  const getStatusText = () => {
    if (error) return `Error: ${error}`;
    if (isPlaying) return "Playing...";
    if (canReveal) return "Ready to reveal text!";
    if (playCount > 0) return `Played ${playCount}/2 times`;
    return "Listen first to unlock text";
  };

  return (
    <div className={`audio-player ${className}`}>
      <div className="audio-player-controls">
        <button
          className={getPlayButtonClass()}
          onClick={handlePlayClick}
          aria-label={`${isPlaying ? "Stop" : "Play"} main line audio`}
        >
          {isPlaying ? "⏹️" : "▶️"} {getPlayButtonText()}
        </button>
      </div>

      <div className="audio-player-status">
        <p className="status-text">{getStatusText()}</p>
        {playCount > 0 && !canReveal && (
          <div className="play-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(playCount / 2) * 100}%` }}
                data-testid="progress-fill"
              />
            </div>
            <span className="progress-text">{playCount}/2</span>
          </div>
        )}
      </div>

      {error && (
        <div className="audio-error">
          <p className="error-message">{error}</p>
        </div>
      )}
    </div>
  );
};
