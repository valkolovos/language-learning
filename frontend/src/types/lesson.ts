export interface BaseAudioClip {
  id: string;
  duration: number;
  volume: number;
}

export interface PreRecordedAudioClip extends BaseAudioClip {
  type: "pre_recorded";
  filename: string; // Path to pre-recorded audio file
}

export interface TTSAudioClip extends BaseAudioClip {
  type: "tts";
  text: string; // Text to speak for TTS
  language: string; // Language code for TTS (e.g., 'el-GR' for Greek)
}

export type AudioClip = PreRecordedAudioClip | TTSAudioClip;

// Type guard functions for convenience
export function isTTSAudioClip(
  audioClip: AudioClip,
): audioClip is TTSAudioClip {
  return audioClip.type === "tts";
}

export function isPreRecordedAudioClip(
  audioClip: AudioClip,
): audioClip is PreRecordedAudioClip {
  return audioClip.type === "pre_recorded";
}

// Interfaces for partially validated lesson data during validation
export interface PartialAudioClip {
  id: string;
  filename?: string;
  text?: string;
  language?: string;
  duration?: number;
  volume?: number;
}

export interface PartialMainLine {
  nativeText: string;
  gloss: string;
  tips?: string;
  audio: PartialAudioClip;
}

export interface PartialPhrase {
  id: string;
  nativeText: string;
  gloss: string;
  tips?: string;
  audio: PartialAudioClip;
}

export interface PartialLesson {
  id: string;
  title: string;
  mainLine: PartialMainLine;
  phrases: PartialPhrase[];
  metadata?: {
    difficulty?: "beginner" | "intermediate" | "advanced";
    estimatedDuration?: number;
    tags?: string[];
  };
}

/**
 * Represents a supporting phrase within a language learning lesson.
 * These phrases provide context, variations, or related expressions to the main line.
 */
export interface Phrase {
  /** Unique identifier for the phrase within the lesson */
  id: string;
  /** The phrase text in the target language (e.g., Greek) */
  nativeText: string;
  /** Learner-friendly translation or explanation of the phrase */
  gloss: string;
  /** Optional learning tips or cultural context for the phrase */
  tips?: string;
  /** Audio representation of the phrase (TTS or pre-recorded) */
  audio: AudioClip;
}

/**
 * Represents a complete language learning lesson containing a main line and supporting phrases.
 * This is the core data structure for the MVP's single micro-lesson approach.
 */
export interface Lesson {
  /** Unique identifier for the lesson */
  id: string;
  /** Human-readable title of the lesson */
  title: string;
  /** The primary learning target - the main phrase to be mastered */
  mainLine: {
    /** The main phrase text in the target language */
    nativeText: string;
    /** Learner-friendly translation or explanation */
    gloss: string;
    /** Optional learning tips or cultural context */
    tips?: string;
    /** Audio representation of the main phrase */
    audio: AudioClip;
  };
  /** Supporting phrases that provide context and variations */
  phrases: Phrase[];
  /** Optional metadata for lesson categorization and planning */
  metadata?: {
    /** Estimated difficulty level for the lesson */
    difficulty?: "beginner" | "intermediate" | "advanced";
    /** Estimated time to complete the lesson in minutes */
    estimatedDuration?: number;
    /** Tags for categorization and search */
    tags?: string[];
  };
}

export interface LessonContentError {
  type: "parse_error" | "missing_audio" | "invalid_structure" | "unknown";
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface LessonLoadResult {
  success: boolean;
  lesson?: Lesson;
  error?: LessonContentError;
}

// New types for audio playback and reveal gate
export interface AudioPlaybackState {
  isPlaying: boolean;
  currentAudioId: string | null;
  playCount: number; // tracks complete plays of main line
  canReveal: boolean; // true after 2 complete plays
  error: string | null;
}

export interface AudioPlaybackEvent {
  type:
    | "play_started"
    | "play_completed"
    | "play_error"
    | "play_aborted"
    | "main_line_changed";
  audioId: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

// Extended error interface for enhanced error handling with user-friendly messages
export interface ExtendedError extends Error {
  userMessage: string;
  technicalDetails: string;
  helpUrl: string; // Help URL for user guidance (required for consistent error handling)
}
