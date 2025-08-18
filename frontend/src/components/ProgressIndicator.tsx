import React from "react";

interface ProgressIndicatorProps {
  xp: number;
  progressPercentage: number;
  className?: string;
  showBreakdown?: boolean;
  onToggleBreakdown?: () => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  xp,
  progressPercentage,
  className = "",
  showBreakdown = false,
  onToggleBreakdown,
}) => {
  return (
    <div className={`progress-indicator ${className}`}>
      <div className="xp-counter">
        <span className="xp-icon" aria-hidden="true">
          ⭐
        </span>
        <span className="xp-value">{xp} XP</span>
        {onToggleBreakdown && (
          <button
            className="xp-breakdown-toggle"
            onClick={onToggleBreakdown}
            aria-label={`${showBreakdown ? "Hide" : "Show"} XP breakdown`}
          >
            <span aria-hidden="true">{showBreakdown ? "📊" : "ℹ️"}</span>
          </button>
        )}
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
            aria-label={`Progress: ${progressPercentage}%`}
          />
        </div>
        <span className="progress-text">{Math.round(progressPercentage)}%</span>
      </div>

      {showBreakdown && (
        <div className="xp-breakdown">
          <h4>XP Breakdown</h4>
          <div className="xp-breakdown-list">
            <div className="xp-item">
              <span className="xp-action">Reveal text</span>
              <span className="xp-points">+50 XP</span>
            </div>
            <div className="xp-item">
              <span className="xp-action">Replay phrase</span>
              <span className="xp-points">+10 XP each</span>
            </div>
            <div className="xp-item">
              <span className="xp-action">Replay all</span>
              <span className="xp-points">+25 XP</span>
            </div>
            <div className="xp-item total">
              <span className="xp-action">Total possible</span>
              <span className="xp-points">+105 XP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
