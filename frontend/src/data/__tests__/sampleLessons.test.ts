import {
  SAMPLE_LESSON,
  SAMPLE_PRACTICE_LESSON,
  MICRO_TIPS,
} from "../sampleLessons";

describe("Sample Lessons Data", () => {
  describe("SAMPLE_LESSON", () => {
    it("should have the correct structure", () => {
      expect(SAMPLE_LESSON.id).toBe("meet-greet-001");
      expect(SAMPLE_LESSON.title).toBe("Meet & Greet");
      expect(SAMPLE_LESSON.phrases).toHaveLength(3);
      expect(SAMPLE_LESSON.metadata?.difficulty).toBe("beginner");
    });

    it("should have valid audio clips for all phrases", () => {
      SAMPLE_LESSON.phrases.forEach((phrase) => {
        expect(phrase.audio).toBeDefined();
        expect(phrase.audio.id).toBeDefined();
        expect(phrase.audio.duration).toBeGreaterThan(0);
      });
    });
  });

  describe("MICRO_TIPS", () => {
    it("should have tips for all three phrases", () => {
      const phrase1Tips = MICRO_TIPS.filter(
        (tip) => tip.phraseId === "phrase-1",
      );
      const phrase2Tips = MICRO_TIPS.filter(
        (tip) => tip.phraseId === "phrase-2",
      );
      const phrase3Tips = MICRO_TIPS.filter(
        (tip) => tip.phraseId === "phrase-3",
      );

      expect(phrase1Tips).toHaveLength(3);
      expect(phrase2Tips).toHaveLength(3);
      expect(phrase3Tips).toHaveLength(3);
    });

    it("should have tips ≤ 60 characters each", () => {
      MICRO_TIPS.forEach((tip) => {
        expect(tip.text.length).toBeLessThanOrEqual(60);
      });
    });

    it("should have unique IDs for all tips", () => {
      const tipIds = MICRO_TIPS.map((tip) => tip.id);
      const uniqueIds = new Set(tipIds);
      expect(uniqueIds.size).toBe(tipIds.length);
    });

    it("should have phrase-specific tips (no generic advice)", () => {
      const phrase1Tips = MICRO_TIPS.filter(
        (tip) => tip.phraseId === "phrase-1",
      );
      const phrase2Tips = MICRO_TIPS.filter(
        (tip) => tip.phraseId === "phrase-2",
      );
      const phrase3Tips = MICRO_TIPS.filter(
        (tip) => tip.phraseId === "phrase-3",
      );

      // Phrase 1 tips should be about "Γειά σου" (Hello)
      phrase1Tips.forEach((tip) => {
        expect(tip.text).toMatch(/(ya soo|γ|soo|casual|friendly)/i);
      });

      // Phrase 2 tips should be about "πώς είσαι;" (how are you?)
      phrase2Tips.forEach((tip) => {
        expect(tip.text).toMatch(/(pos|ee-seh|question|stress)/i);
      });

      // Phrase 3 tips should be about "Καλά, ευχαριστώ" (Good, thank you)
      phrase3Tips.forEach((tip) => {
        expect(tip.text).toMatch(/(ka-la|ef-ha-ree-sto|comma)/i);
      });
    });
  });

  describe("SAMPLE_PRACTICE_LESSON", () => {
    it("should extend SAMPLE_LESSON with practice configuration", () => {
      expect(SAMPLE_PRACTICE_LESSON.id).toBe(SAMPLE_LESSON.id);
      expect(SAMPLE_PRACTICE_LESSON.title).toBe(SAMPLE_LESSON.title);
      expect(SAMPLE_PRACTICE_LESSON.practicePhrases).toBeDefined();
    });

    it("should have practice phrases with micro-tips", () => {
      expect(SAMPLE_PRACTICE_LESSON.practicePhrases).toHaveLength(3);

      SAMPLE_PRACTICE_LESSON.practicePhrases.forEach((practicePhrase) => {
        expect(practicePhrase.microTips).toBeDefined();
        expect(practicePhrase.microTips.length).toBeGreaterThan(0);
        expect(practicePhrase.maxAttempts).toBe(5);
        expect(practicePhrase.skipAfterAttempts).toBe(3);
      });
    });

    it("should have practice phrases that match the original phrases", () => {
      SAMPLE_PRACTICE_LESSON.practicePhrases.forEach(
        (practicePhrase, index) => {
          const originalPhrase = SAMPLE_LESSON.phrases[index];
          expect(practicePhrase.id).toBe(originalPhrase.id);
          expect(practicePhrase.nativeText).toBe(originalPhrase.nativeText);
          expect(practicePhrase.gloss).toBe(originalPhrase.gloss);
        },
      );
    });

    it("should have valid practice configuration", () => {
      SAMPLE_PRACTICE_LESSON.practicePhrases.forEach((practicePhrase) => {
        expect(practicePhrase.maxAttempts).toBeGreaterThan(
          practicePhrase.skipAfterAttempts,
        );
        expect(practicePhrase.skipAfterAttempts).toBeGreaterThan(0);
        expect(practicePhrase.maxAttempts).toBeLessThanOrEqual(10); // Reasonable upper limit
      });
    });
  });
});
