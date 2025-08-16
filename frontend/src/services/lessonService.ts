import { Lesson, LessonLoadResult, PartialLesson } from "../types/lesson";
import { AUDIO_IDS } from "../constants/audio";
import logger from "./logger";

// Sample lesson data - in a real app, this would come from an API or file system
const SAMPLE_LESSON: Lesson = {
  id: "meet-greet-001",
  title: "Meet & Greet",
  mainLine: {
    nativeText: "Γειά σου, πώς είσαι;",
    gloss: "Hello, how are you?",
    tips: "A friendly greeting in Greek",
    audio: {
      type: "tts",
      id: AUDIO_IDS.MAIN_LINE,
      text: "Γειά σου, πώς είσαι;",
      duration: 2.3,
      volume: 0.8,
      language: "el-GR", // Greek language code
    },
  },
  phrases: [
    {
      id: "phrase-1",
      nativeText: "Γειά σου",
      gloss: "Hello",
      tips: 'Informal greeting, pronounced "ya soo"',
      audio: {
        type: "tts",
        id: AUDIO_IDS.PHRASE_1,
        text: "Γειά σου",
        duration: 1.0,
        volume: 0.8,
        language: "el-GR",
      },
    },
    {
      id: "phrase-2",
      nativeText: "πώς είσαι;",
      gloss: "how are you?",
      tips: 'Question form, literally "how are you?"',
      audio: {
        type: "tts",
        id: AUDIO_IDS.PHRASE_2,
        text: "πώς είσαι;",
        duration: 1.3,
        volume: 0.8,
        language: "el-GR",
      },
    },
    {
      id: "phrase-3",
      nativeText: "Καλά, ευχαριστώ",
      gloss: "Good, thank you",
      tips: 'Common response to "how are you?"',
      audio: {
        type: "tts",
        id: AUDIO_IDS.PHRASE_3,
        text: "Καλά, ευχαριστώ",
        duration: 1.4,
        volume: 0.8,
        language: "el-GR",
      },
    },
  ],
  metadata: {
    difficulty: "beginner",
    estimatedDuration: 5,
    tags: ["greetings", "greek", "beginner"],
  },
};

export class LessonService {
  /**
   * Load a lesson by ID
   * @param lessonId - The unique identifier for the lesson
   * @returns Promise<LessonLoadResult> - Success/failure with lesson data or error
   */
  static async loadLesson(lessonId: string): Promise<LessonLoadResult> {
    try {
      // Simulate async loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      // For now, return the sample lesson
      // In a real implementation, this would fetch from an API or file system
      if (lessonId === "meet-greet-001") {
        return {
          success: true,
          lesson: SAMPLE_LESSON,
        };
      }

      // Lesson not found
      return {
        success: false,
        error: {
          type: "invalid_structure",
          message: `Lesson with ID '${lessonId}' not found`,
          field: "id",
        },
      };
    } catch (error) {
      // Convert error to a safe format for details
      const errorDetails =
        error instanceof Error
          ? { message: error.message, name: error.name, stack: error.stack }
          : { value: String(error) };

      return {
        success: false,
        error: {
          type: "unknown",
          message: "Failed to load lesson due to unexpected error",
          details: errorDetails,
        },
      };
    }
  }

  /**
   * Validate lesson content structure
   * @param lesson - The lesson object to validate
   * @returns LessonLoadResult - Success/failure with validation results
   */
  static validateLesson(lesson: unknown): LessonLoadResult {
    try {
      // Type guard to ensure lesson is an object
      if (!lesson || typeof lesson !== "object") {
        return {
          success: false,
          error: {
            type: "invalid_structure",
            message: "Lesson must be a valid object",
            field: "root",
          },
        };
      }

      // Cast to PartialLesson for validation
      const lessonObj = lesson as PartialLesson;

      // Check required fields
      if (!lessonObj.id) {
        return {
          success: false,
          error: {
            type: "invalid_structure",
            message: "Lesson must have a valid string ID",
            field: "id",
          },
        };
      }

      if (!lessonObj.title) {
        return {
          success: false,
          error: {
            type: "invalid_structure",
            message: "Lesson must have a valid string title",
            field: "title",
          },
        };
      }

      if (!lessonObj.mainLine) {
        return {
          success: false,
          error: {
            type: "invalid_structure",
            message: "Lesson must have a mainLine object",
            field: "mainLine",
          },
        };
      }

      if (
        !lessonObj.mainLine.nativeText ||
        !lessonObj.mainLine.gloss ||
        !lessonObj.mainLine.audio
      ) {
        return {
          success: false,
          error: {
            type: "invalid_structure",
            message: "Main line must have nativeText, gloss, and audio",
            field: "mainLine",
          },
        };
      }

      if (!Array.isArray(lessonObj.phrases) || lessonObj.phrases.length === 0) {
        return {
          success: false,
          error: {
            type: "invalid_structure",
            message: "Lesson must have at least one phrase",
            field: "phrases",
          },
        };
      }

      // Validate each phrase
      for (let i = 0; i < lessonObj.phrases.length; i++) {
        const phrase = lessonObj.phrases[i];
        if (
          !phrase.id ||
          !phrase.nativeText ||
          !phrase.gloss ||
          !phrase.audio
        ) {
          return {
            success: false,
            error: {
              type: "invalid_structure",
              message: `Phrase ${i + 1} must have id, nativeText, gloss, and audio`,
              field: `phrases[${i}]`,
            },
          };
        }
      }

      // Validate audio files exist (basic check)
      if (!this.validateAudioFiles(lessonObj)) {
        return {
          success: false,
          error: {
            type: "missing_audio",
            message: "One or more audio files are missing or invalid",
            field: "audio",
          },
        };
      }

      return {
        success: true,
        lesson: lesson as Lesson,
      };
    } catch (error) {
      // Convert error to a safe format for details
      const errorDetails =
        error instanceof Error
          ? { message: error.message, name: error.name, stack: error.stack }
          : { value: String(error) };

      return {
        success: false,
        error: {
          type: "parse_error",
          message: "Failed to parse lesson content",
          details: errorDetails,
        },
      };
    }
  }

  /**
   * Basic audio file validation
   * @param lesson - The lesson object to validate
   * @returns boolean - True if all audio files are valid
   */
  private static validateAudioFiles(lesson: PartialLesson): boolean {
    try {
      // Check main line audio - must have id and either filename (pre-recorded) or text+language (TTS)
      const mainAudio = lesson.mainLine.audio;
      if (
        !mainAudio.id ||
        (!mainAudio.filename && (!mainAudio.text || !mainAudio.language))
      ) {
        return false;
      }

      // Check phrase audio files - must have id and either filename (pre-recorded) or text+language (TTS)
      for (const phrase of lesson.phrases) {
        const phraseAudio = phrase.audio;
        if (
          !phraseAudio.id ||
          (!phraseAudio.filename &&
            (!phraseAudio.text || !phraseAudio.language))
        ) {
          return false;
        }
      }

      return true;
    } catch (error) {
      // Log the error for debugging but return false for validation failure
      logger.warn("Audio validation error:", error);
      return false;
    }
  }

  /**
   * Get available lesson IDs
   * @returns Promise<string[]> - Array of available lesson IDs
   */
  static async getAvailableLessons(): Promise<string[]> {
    // Simulate async loading
    await new Promise((resolve) => setTimeout(resolve, 50));
    return ["meet-greet-001"];
  }
}
