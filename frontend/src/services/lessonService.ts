import { Lesson, LessonLoadResult } from "../types/lesson";

// Sample lesson data - in a real app, this would come from an API or file system
const SAMPLE_LESSON: Lesson = {
  id: "meet-greet-001",
  title: "Meet & Greet",
  mainLine: {
    nativeText: "Γεια σου, πώς είσαι;",
    gloss: "Hello, how are you?",
    tips: "A friendly greeting in Greek",
    audio: {
      id: "main-line-audio",
      filename: "geia-sou-pos-eisai.mp3",
      duration: 2.3,
      volume: 0.8,
    },
  },
  phrases: [
    {
      id: "phrase-1",
      nativeText: "Γεια σου",
      gloss: "Hello",
      tips: 'Informal greeting, pronounced "ya soo"',
      audio: {
        id: "phrase-1-audio",
        filename: "geia-sou.mp3",
        duration: 1.0,
        volume: 0.8,
      },
    },
    {
      id: "phrase-2",
      nativeText: "πώς είσαι;",
      gloss: "how are you?",
      tips: 'Question form, literally "how are you?"',
      audio: {
        id: "phrase-2-audio",
        filename: "pos-eisai.mp3",
        duration: 1.3,
        volume: 0.8,
      },
    },
    {
      id: "phrase-3",
      nativeText: "Καλά, ευχαριστώ",
      gloss: "Good, thank you",
      tips: 'Common response to "how are you?"',
      audio: {
        id: "phrase-3-audio",
        filename: "kala-efharisto.mp3",
        duration: 1.4,
        volume: 0.8,
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
      return {
        success: false,
        error: {
          type: "unknown",
          message: "Failed to load lesson due to unexpected error",
          details: error,
        },
      };
    }
  }

  /**
   * Validate lesson content structure
   * @param lesson - The lesson object to validate
   * @returns LessonLoadResult - Success/failure with validation results
   */
  static validateLesson(lesson: any): LessonLoadResult {
    try {
      // Check required fields
      if (!lesson.id || typeof lesson.id !== "string") {
        return {
          success: false,
          error: {
            type: "invalid_structure",
            message: "Lesson must have a valid string ID",
            field: "id",
          },
        };
      }

      if (!lesson.title || typeof lesson.title !== "string") {
        return {
          success: false,
          error: {
            type: "invalid_structure",
            message: "Lesson must have a valid string title",
            field: "title",
          },
        };
      }

      if (!lesson.mainLine || typeof lesson.mainLine !== "object") {
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
        !lesson.mainLine.nativeText ||
        !lesson.mainLine.gloss ||
        !lesson.mainLine.audio
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

      if (!Array.isArray(lesson.phrases) || lesson.phrases.length === 0) {
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
      for (let i = 0; i < lesson.phrases.length; i++) {
        const phrase = lesson.phrases[i];
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
      if (!this.validateAudioFiles(lesson)) {
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
      return {
        success: false,
        error: {
          type: "parse_error",
          message: "Failed to parse lesson content",
          details: error,
        },
      };
    }
  }

  /**
   * Basic audio file validation
   * @param lesson - The lesson object to validate
   * @returns boolean - True if all audio files are valid
   */
  private static validateAudioFiles(lesson: any): boolean {
    try {
      // Check main line audio
      if (!lesson.mainLine.audio.filename || !lesson.mainLine.audio.id) {
        return false;
      }

      // Check phrase audio files
      for (const phrase of lesson.phrases) {
        if (!phrase.audio.filename || !phrase.audio.id) {
          return false;
        }
      }

      return true;
    } catch {
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
