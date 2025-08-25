/**
 * Progress and XP calculation constants
 * Centralized configuration for lesson progress tracking and XP rewards
 */

export const PROGRESS_WEIGHTS = {
  // Main line progress (50% of total lesson progress)
  MAIN_LINE: {
    TOTAL_WEIGHT: 50,
    // Progress per play count (2 plays = 100% of main line weight)
    PER_PLAY_WEIGHT: 25,
  },

  // Phrase interaction progress (50% of total lesson progress)
  PHRASE_INTERACTIONS: {
    TOTAL_WEIGHT: 50,
    // Base bonus for revealing text (25% of total progress)
    REVEAL_BONUS: 25,
    // Progress per phrase interaction (up to 25% of total progress)
    PER_PHRASE_WEIGHT: 5,
    // Maximum phrase interactions that count toward progress
    MAX_PHRASE_COUNT: 5, // 5 phrases × 5% = 25% max
  },
} as const;

export const XP_REWARDS = {
  // XP awarded for revealing text (main achievement)
  TEXT_REVEAL: 50,

  // XP awarded per phrase replay
  PHRASE_REPLAY: 10,

  // XP awarded for replaying all phrases
  REPLAY_ALL: 25,
} as const;

export const PROGRESS_THRESHOLDS = {
  // Number of plays required to unlock text reveal
  REVEAL_AFTER_PLAYS: 2,

  // Maximum progress percentage (capped at 100%)
  MAX_PROGRESS: 100,
} as const;
