import React, { forwardRef } from "react";
import { MICROCOPY } from "../constants/microcopy";
import { XP_REWARDS, PROGRESS_THRESHOLDS } from "../constants/progress";

interface ProgressIndicatorProps {
  xp: number;
  progressPercentage: number;
  className?: string;
  showBreakdown?: boolean;
  onToggleBreakdown?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export const ProgressIndicator = forwardRef<
  HTMLButtonElement,
  ProgressIndicatorProps
>(
  (
    {
      xp,
      progressPercentage,
      className = "",
      showBreakdown = false,
      onToggleBreakdown,
      onKeyDown,
    },
    ref,
  ) => {
    return (
      <div className={`progress-indicator ${className}`}>
        <div className="xp-counter">
          <span className="xp-icon" aria-hidden="true">
            ⭐
          </span>
          <span className="xp-value">{xp} XP</span>
          {onToggleBreakdown && (
            <button
              ref={ref}
              className="xp-breakdown-toggle"
              onClick={onToggleBreakdown}
              onKeyDown={onKeyDown}
              aria-label={`${showBreakdown ? "Hide" : "Show"} XP breakdown`}
              aria-describedby="xp-breakdown-description"
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
              aria-valuemax={PROGRESS_THRESHOLDS.MAX_PROGRESS}
              role="progressbar"
              aria-label={`Progress: ${progressPercentage}%`}
            />
          </div>
          <span className="progress-text">
            {Math.round(progressPercentage)}%
          </span>
        </div>

        {showBreakdown && (
          <div className="xp-breakdown">
            <h4>{MICROCOPY.XP_BREAKDOWN_TITLE}</h4>
            <div className="xp-breakdown-list">
              <div className="xp-item">
                <span className="xp-action">Reveal text</span>
                <span className="xp-points">+{XP_REWARDS.TEXT_REVEAL} XP</span>
              </div>
              <div className="xp-item">
                <span className="xp-action">Replay phrase</span>
                <span className="xp-points">
                  +{XP_REWARDS.PHRASE_REPLAY} XP each
                </span>
              </div>
              <div className="xp-item">
                <span className="xp-action">Replay all</span>
                <span className="xp-points">+{XP_REWARDS.REPLAY_ALL} XP</span>
              </div>
              <div className="xp-item total">
                <span className="xp-action">Total possible</span>
                <span className="xp-points">
                  +
                  {XP_REWARDS.TEXT_REVEAL +
                    XP_REWARDS.PHRASE_REPLAY * 5 +
                    XP_REWARDS.REPLAY_ALL}{" "}
                  XP
                </span>
              </div>
            </div>
          </div>
        )}

        {onToggleBreakdown && (
          <div id="xp-breakdown-description" className="sr-only">
            Press Enter or Space to toggle XP breakdown visibility
          </div>
        )}
      </div>
    );
  },
);

ProgressIndicator.displayName = "ProgressIndicator";
