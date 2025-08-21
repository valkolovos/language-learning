import { LessonService } from "../lessonService";
import { AUDIO_IDS } from "../../constants/audio";

describe("LessonService", () => {
  describe("getAvailableLessons", () => {
    it("should return available lesson IDs", async () => {
      const lessons = await LessonService.getAvailableLessons();

      expect(Array.isArray(lessons)).toBe(true);
      expect(lessons).toContain("meet-greet-001");
      expect(lessons.length).toBeGreaterThan(0);
    });
  });

  describe("loadLesson", () => {
    it("should load a valid lesson successfully", async () => {
      const result = await LessonService.loadLesson("meet-greet-001");

      expect(result.success).toBe(true);
      expect(result.lesson).toBeDefined();
      expect(result.lesson?.id).toBe("meet-greet-001");
      expect(result.lesson?.title).toBe("Meet & Greet");
    });

    it("should return error for non-existent lesson", async () => {
      const result = await LessonService.loadLesson("non-existent-lesson");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe("invalid_structure");
    });

    it("should handle lesson loading errors gracefully", () => {
      jest
        .spyOn(LessonService, "loadLesson")
        .mockRejectedValueOnce(new Error("Network error"));

      return expect(LessonService.loadLesson("invalid-lesson")).rejects.toThrow(
        "Network error",
      );
    });
  });

  describe("validateLesson", () => {
    it("should validate a well-formed lesson successfully", () => {
      const validLesson = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Γειά σου",
          gloss: "Hello",
          tips: "A greeting",
          audio: {
            id: AUDIO_IDS.MAIN_LINE,
            text: "Γειά σου",
            duration: 1.5,
            volume: 0.8,
            language: "el-GR",
          },
        },
        phrases: [
          {
            id: "phrase-1",
            nativeText: "Γειά σου",
            gloss: "Hello",
            tips: "Informal greeting",
            audio: {
              id: AUDIO_IDS.PHRASE_1,
              text: "Γειά σου",
              duration: 1.0,
              volume: 0.8,
              language: "el-GR",
            },
          },
        ],
      };

      const result = LessonService.validateLesson(validLesson);

      expect(result.success).toBe(true);
      expect(result.lesson).toEqual(validLesson);
    });

    it("should reject lesson with missing required fields", () => {
      const invalidLesson = {
        // Missing id, title, mainLine
        phrases: [],
      };

      const result = LessonService.validateLesson(invalidLesson);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe("invalid_structure");
      expect(result.error?.field).toBe("id");
    });

    it("should reject lesson with invalid mainLine structure", () => {
      const invalidLesson = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          // Missing nativeText, gloss, audio
          tips: "A greeting",
        },
        phrases: [],
      };

      const result = LessonService.validateLesson(invalidLesson);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe("invalid_structure");
      expect(result.error?.field).toBe("mainLine");
    });

    it("should reject lesson with invalid phrases structure", () => {
      const invalidLesson = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Γειά σου",
          gloss: "Hello",
          tips: "A greeting",
          audio: {
            id: AUDIO_IDS.MAIN_LINE,
            text: "Γειά σου",
            duration: 1.5,
            volume: 0.8,
            language: "el-GR",
          },
        },
        phrases: [
          {
            // Missing id, nativeText, gloss, audio
            tips: "Informal greeting",
          },
        ],
      };

      const result = LessonService.validateLesson(invalidLesson);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe("invalid_structure");
      expect(result.error?.field).toBe("phrases[0]");
    });

    it("should reject lesson with non-object input", () => {
      const result = LessonService.validateLesson(null);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("invalid_structure");
      expect(result.error?.field).toBe("root");
    });

    it("should reject lesson with non-array phrases", () => {
      const invalidLesson = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Γειά σου",
          gloss: "Hello",
          tips: "A greeting",
          audio: {
            id: AUDIO_IDS.MAIN_LINE,
            text: "Γειά σου",
            language: "el-GR",
            rate: 0.9,
            pitch: 1.0,
            volume: 0.8,
          },
        },
        phrases: "not-an-array", // Should be an array
      };

      const result = LessonService.validateLesson(invalidLesson);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("invalid_structure");
      expect(result.error?.field).toBe("phrases");
    });
  });

  describe("audio validation", () => {
    it("should validate lesson with TTS audio (text + language)", () => {
      const lessonWithTTS = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Γειά σου",
          gloss: "Hello",
          tips: "A greeting",
          audio: {
            id: AUDIO_IDS.MAIN_LINE,
            text: "Γειά σου",
            language: "el-GR",
            rate: 0.9,
            pitch: 1.0,
            volume: 0.8,
          },
        },
        phrases: [
          {
            id: "phrase-1",
            nativeText: "Γειά σου",
            gloss: "Hello",
            tips: "Informal greeting",
            audio: {
              id: AUDIO_IDS.PHRASE_1,
              text: "Γειά σου",
              language: "el-GR",
              rate: 0.9,
              pitch: 1.0,
              volume: 0.8,
            },
          },
        ],
      };

      const result = LessonService.validateLesson(lessonWithTTS);

      expect(result.success).toBe(true);
    });

    it("should validate lesson with pre-recorded audio (filename)", () => {
      const lessonWithPreRecorded = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Γειά σου",
          gloss: "Hello",
          tips: "A greeting",
          audio: {
            id: AUDIO_IDS.MAIN_LINE,
            filename: "main-line.mp3",
            duration: 2.0,
            volume: 0.8,
          },
        },
        phrases: [
          {
            id: "phrase-1",
            nativeText: "Γειά σου",
            gloss: "Hello",
            tips: "Informal greeting",
            audio: {
              id: AUDIO_IDS.PHRASE_1,
              filename: "phrase-1.mp3",
              duration: 1.5,
              volume: 0.8,
            },
          },
        ],
      };

      const result = LessonService.validateLesson(lessonWithPreRecorded);

      expect(result.success).toBe(true);
    });

    it("should reject lesson with missing audio configuration", () => {
      const lessonWithoutAudio = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Γειά σου",
          gloss: "Hello",
          tips: "A greeting",
          audio: {
            id: AUDIO_IDS.MAIN_LINE,
            // Missing both text+language and filename
            duration: 1.5,
            volume: 0.8,
          },
        },
        phrases: [
          {
            id: "phrase-1",
            nativeText: "Γειά σου",
            gloss: "Hello",
            tips: "Informal greeting",
            audio: {
              id: AUDIO_IDS.PHRASE_1,
              text: "Γειά σου",
              language: "el-GR",
              duration: 1.0,
              volume: 0.8,
            },
          },
        ],
      };

      const result = LessonService.validateLesson(lessonWithoutAudio);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("missing_audio");
      expect(result.error?.field).toBe("audio");
    });

    it("should reject lesson with incomplete TTS audio (missing language)", () => {
      const lessonWithIncompleteTTS = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Γειά σου",
          gloss: "Hello",
          tips: "A greeting",
          audio: {
            id: AUDIO_IDS.MAIN_LINE,
            text: "Γειά σου",
            // Missing language
            duration: 2.5,
            volume: 0.8,
          },
        },
        phrases: [
          {
            id: "phrase-1",
            nativeText: "Γειά σου",
            gloss: "Hello",
            tips: "Informal greeting",
            audio: {
              id: AUDIO_IDS.PHRASE_1,
              text: "Γειά σου",
              language: "el-GR",
              duration: 1.0,
              volume: 0.8,
            },
          },
        ],
      };

      const result = LessonService.validateLesson(lessonWithIncompleteTTS);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("missing_audio");
      expect(result.error?.field).toBe("audio");
    });
  });

  describe("error handling", () => {
    it("should handle validation errors with proper error types", () => {
      const invalidLesson = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Γειά σου",
          gloss: "Hello",
          tips: "A greeting",
          audio: {
            id: AUDIO_IDS.MAIN_LINE,
            text: "Γειά σου",
            duration: 1.5,
            volume: 0.8,
            language: "el-GR",
          },
        },
        phrases: [
          {
            id: "phrase-1",
            nativeText: "Γειά σου",
            gloss: "Hello",
            tips: "Informal greeting",
            audio: {
              id: AUDIO_IDS.PHRASE_1,
              // Missing required audio configuration
              duration: 1.0,
              volume: 0.8,
            },
          },
        ],
      };

      const result = LessonService.validateLesson(invalidLesson);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe("missing_audio");
      expect(result.error?.message).toContain("audio");
    });

    it("should provide helpful error messages", () => {
      const invalidLesson = null;

      const result = LessonService.validateLesson(invalidLesson);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Lesson must be a valid object");
      expect(result.error?.field).toBe("root");
    });

    it("should handle lesson with empty phrases array", () => {
      const lessonWithEmptyPhrases = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Γειά σου",
          gloss: "Hello",
          tips: "A greeting",
          audio: {
            id: AUDIO_IDS.MAIN_LINE,
            text: "Γειά σου",
            duration: 1.5,
            volume: 0.8,
            language: "el-GR",
          },
        },
        phrases: [], // Empty array is valid
      };

      const result = LessonService.validateLesson(lessonWithEmptyPhrases);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe("invalid_structure");
      expect(result.error?.field).toBe("phrases");
    });
  });

  describe("edge cases", () => {
    it("should handle lesson with many phrases", () => {
      const lessonWithManyPhrases = {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Γειά σου",
          gloss: "Hello",
          tips: "A greeting",
          audio: {
            id: AUDIO_IDS.MAIN_LINE,
            text: "Γειά σου",
            language: "el-GR",
            rate: 0.9,
            pitch: 1.0,
            volume: 0.8,
          },
        },
        phrases: Array.from({ length: 10 }, (_, i) => ({
          id: `phrase-${i + 1}`,
          nativeText: `Phrase ${i + 1}`,
          gloss: `English ${i + 1}`,
          tips: `Tip ${i + 1}`,
          audio: {
            id: `phrase-${i + 1}-audio`,
            text: `Phrase ${i + 1}`,
            language: "el-GR",
            duration: 1.0,
            volume: 0.8,
          },
        })),
      };

      const result = LessonService.validateLesson(lessonWithManyPhrases);

      expect(result.success).toBe(true);
      expect(result.lesson?.phrases).toHaveLength(10);
    });
  });
});
