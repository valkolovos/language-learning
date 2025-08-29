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

export interface Phrase {
  id: string;
  nativeText: string;
  gloss: string; // learner-friendly translation/explanation
  tips?: string; // optional learning tips
  audio: AudioClip;
}

export interface Lesson {
  id: string;
  title: string;
  mainLine: {
    nativeText: string;
    gloss: string;
    tips?: string;
    audio: AudioClip;
  };
  phrases: Phrase[];
  metadata?: {
    difficulty?: "beginner" | "intermediate" | "advanced";
    estimatedDuration?: number; // in minutes
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
  helpUrl?: string;
}
