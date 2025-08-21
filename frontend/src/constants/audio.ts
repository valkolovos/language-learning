/**
 * Audio-related constants used throughout the application
 */

// Audio identifiers
export const AUDIO_IDS = {
  MAIN_LINE: "main-line-audio",
  PHRASE_1: "phrase-1-audio",
  PHRASE_2: "phrase-2-audio",
  PHRASE_3: "phrase-3-audio",
} as const;

// Audio playback settings
export const AUDIO_SETTINGS = {
  DEFAULT_RATE: 0.9, // Slightly slower for language learning
  DEFAULT_PITCH: 1.0,
  DEFAULT_LANGUAGE: "en-US",
} as const;

// Playback thresholds
export const PLAYBACK_THRESHOLDS = {
  REVEAL_AFTER_PLAYS: 2, // Number of complete plays before revealing text
} as const;
