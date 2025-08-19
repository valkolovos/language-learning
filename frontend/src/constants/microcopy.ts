/**
 * Microcopy constants for learner-facing strings
 * These can be edited without code changes by modifying this file
 */

export const MICROCOPY = {
  // Pre-reveal hints and instructions
  LISTEN_FIRST_HINT: "Listen first. Text appears after you replay.",
  LISTEN_FIRST_HEADING: "🎧 Listen First",
  LISTEN_FIRST_TO_UNLOCK: "Listen first to unlock text",

  // Reveal actions
  SHOW_TEXT: "✨ Show Text",
  SHOW_TEXT_ACTION: "Show text",

  // Post-reveal hints
  PHRASE_REPLAY_HINT: "Tap a phrase to hear it again",

  // Error messages
  AUDIO_ERROR_MESSAGE: "Couldn't play audio. Check your sound and try again.",
  TRY_AGAIN: "Try Again",

  // Progress and XP
  XP_BREAKDOWN_TITLE: "XP Breakdown",
  XP_BREAKDOWN_CLOSE: "Close",

  // Screen reader announcements
  SCREEN_READER_REVEAL_AVAILABLE:
    "Text is now available to reveal. Press Enter or Space to show the lesson text.",
  SCREEN_READER_TEXT_REVEALED:
    "Lesson text revealed. You can now practice individual phrases. Use Tab to navigate between controls.",
  SCREEN_READER_GATE_UNLOCKED:
    "Listen gate unlocked. Text can now be revealed.",
  SCREEN_READER_PLAYBACK_STARTED: "Audio playback started",
  SCREEN_READER_PLAYBACK_STOPPED: "Audio playback stopped",
  SCREEN_READER_PLAYBACK_COMPLETED: "Audio playback completed",
  SCREEN_READER_AUDIO_PLAYING: "Audio is now playing",
  SCREEN_READER_AUDIO_STOPPED: "Audio playback stopped",
  SCREEN_READER_LESSON_LOADED:
    "Lesson loaded. Press Enter or Space on the Play button to start listening.",
  SCREEN_READER_TEXT_REVEALED_ACTION:
    "Text revealed! You can now see the lesson content and practice phrases.",
  SCREEN_READER_TRANSLATIONS_HIDDEN: "Translations hidden",
  SCREEN_READER_TRANSLATIONS_SHOWN: "Translations shown",

  // Button labels and accessibility
  PLAY_BUTTON_LABEL: "Play main lesson",
  STOP_BUTTON_LABEL: "Stop audio",
  REPLAY_ALL_BUTTON_LABEL: "Replay all phrases",
  TRANSCRIPT_TOGGLE_SHOW: "Show translations",
  TRANSCRIPT_TOGGLE_HIDE: "Hide translations",
  PHRASE_PLAY_BUTTON: "Play phrase",
  PHRASE_PLAYING_BUTTON: "Playing phrase",
} as const;

// Type for microcopy keys to ensure type safety
export type MicrocopyKey = keyof typeof MICROCOPY;
