export interface AudioClip {
  id: string;
  filename?: string; // Path to pre-recorded audio file. Omit for TTS-based audio.
  text: string; // Text to speak for TTS
  duration: number;
  volume: number;
  language?: string; // Language code for TTS (e.g., 'el-GR' for Greek)
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
  type: "play_started" | "play_completed" | "play_error" | "play_aborted";
  audioId: string;
  timestamp: number;
  details?: Record<string, unknown>;
}
