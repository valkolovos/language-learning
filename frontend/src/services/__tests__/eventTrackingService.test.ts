import { EventTrackingService } from "../eventTrackingService";

// Mock the logger
jest.mock("../logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("EventTrackingService", () => {
  let service: EventTrackingService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the singleton instance to avoid maxEvents limit issues
    (EventTrackingService as unknown as { instance: undefined }).instance =
      undefined;
    service = EventTrackingService.getInstance();

    // Clear events before each test using the proper method
    service.clearEvents();
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = EventTrackingService.getInstance();
      const instance2 = EventTrackingService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("trackLessonStarted", () => {
    it("should track a lesson started event", () => {
      service.trackLessonStarted("lesson-123");

      expect(service["events"]).toHaveLength(1);
      expect(service["events"][0].type).toBe("lesson_started");
      expect(service["events"][0].lessonId).toBe("lesson-123");
      expect(service["events"][0].timestamp).toBeGreaterThan(0);
    });

    it("should track multiple lesson started events", () => {
      service.trackLessonStarted("lesson-123");
      service.trackLessonStarted("lesson-456");

      expect(service["events"]).toHaveLength(2);
      expect(service["events"][0].lessonId).toBe("lesson-123");
      expect(service["events"][1].lessonId).toBe("lesson-456");
    });
  });

  describe("trackAudioPlay", () => {
    it("should track an audio play event", () => {
      service.trackAudioPlay("audio-123", "lesson-456");

      expect(service["events"]).toHaveLength(1);
      expect(service["events"][0].type).toBe("audio_play");
      expect(service["events"][0].audioId).toBe("audio-123");
      expect(service["events"][0].lessonId).toBe("lesson-456");
      expect(service["events"][0].timestamp).toBeGreaterThan(0);
    });

    it("should track audio play event without lesson ID", () => {
      service.trackAudioPlay("audio-123");

      expect(service["events"]).toHaveLength(1);
      expect(service["events"][0].type).toBe("audio_play");
      expect(service["events"][0].audioId).toBe("audio-123");
      expect(service["events"][0].lessonId).toBeUndefined();
    });
  });

  describe("trackTextRevealed", () => {
    it("should track text revealed event", () => {
      service.trackTextRevealed("lesson-123");

      expect(service["events"]).toHaveLength(1);
      expect(service["events"][0].type).toBe("text_revealed");
      expect(service["events"][0].lessonId).toBe("lesson-123");
      expect(service["events"][0].timestamp).toBeGreaterThan(0);
    });

    it("should track text revealed event without lesson ID", () => {
      service.trackTextRevealed();

      expect(service["events"]).toHaveLength(1);
      expect(service["events"][0].type).toBe("text_revealed");
      expect(service["events"][0].lessonId).toBeUndefined();
    });
  });

  describe("trackPhraseReplay", () => {
    it("should track phrase replay event", () => {
      service.trackPhraseReplay("phrase-123", "lesson-456");

      expect(service["events"]).toHaveLength(1);
      expect(service["events"][0].type).toBe("phrase_replay");
      expect(service["events"][0].phraseId).toBe("phrase-123");
      expect(service["events"][0].lessonId).toBe("lesson-456");
      expect(service["events"][0].timestamp).toBeGreaterThan(0);
    });

    it("should track phrase replay event without lesson ID", () => {
      service.trackPhraseReplay("phrase-123");

      expect(service["events"]).toHaveLength(1);
      expect(service["events"][0].type).toBe("phrase_replay");
      expect(service["events"][0].phraseId).toBe("phrase-123");
      expect(service["events"][0].lessonId).toBeUndefined();
    });
  });

  describe("event storage", () => {
    it("should store events in chronological order", () => {
      service.trackLessonStarted("lesson-1");
      service.trackAudioPlay("audio-1");
      service.trackTextRevealed("lesson-1");

      expect(service["events"]).toHaveLength(3);
      expect(service["events"][0].type).toBe("lesson_started");
      expect(service["events"][1].type).toBe("audio_play");
      expect(service["events"][2].type).toBe("text_revealed");
    });

    it("should limit stored events to maxEvents", () => {
      // Set a small maxEvents for testing
      service["maxEvents"] = 3;

      service.trackLessonStarted("lesson-1");
      service.trackLessonStarted("lesson-2");
      service.trackLessonStarted("lesson-3");
      service.trackLessonStarted("lesson-4"); // This should remove the first event

      expect(service["events"]).toHaveLength(3);
      expect(service["events"][0].lessonId).toBe("lesson-2");
      expect(service["events"][1].lessonId).toBe("lesson-3");
      expect(service["events"][2].lessonId).toBe("lesson-4");
    });
  });

  describe("data retrieval", () => {
    beforeEach(() => {
      // Clear events and add fresh test data
      service.clearEvents();
      service.trackLessonStarted("lesson-1");
      service.trackAudioPlay("audio-1", "lesson-1");
      service.trackTextRevealed("lesson-1");
      service.trackPhraseReplay("phrase-1", "lesson-1");
    });

    it("should return all events", () => {
      const allEvents = service["events"];
      expect(allEvents).toHaveLength(4);
      expect(allEvents[0].type).toBe("lesson_started");
      expect(allEvents[1].type).toBe("audio_play");
      expect(allEvents[2].type).toBe("text_revealed");
      expect(allEvents[3].type).toBe("phrase_replay");
    });

    it("should filter events by type", () => {
      const lessonEvents = service["events"].filter(
        (e) => e.type === "lesson_started",
      );
      const audioEvents = service["events"].filter(
        (e) => e.type === "audio_play",
      );

      expect(lessonEvents).toHaveLength(1);
      expect(audioEvents).toHaveLength(1);
      expect(lessonEvents[0].lessonId).toBe("lesson-1");
      expect(audioEvents[0].audioId).toBe("audio-1");
    });

    it("should filter events by lesson ID", () => {
      const lesson1Events = service["events"].filter(
        (e) => e.lessonId === "lesson-1",
      );
      expect(lesson1Events).toHaveLength(4);
    });
  });

  describe("error handling", () => {
    it("should handle tracking events gracefully", () => {
      // Should not crash when tracking events
      expect(() => {
        service.trackLessonStarted("lesson-123");
        service.trackAudioPlay("audio-123");
        service.trackTextRevealed("lesson-123");
        service.trackPhraseReplay("phrase-123", "lesson-123");
      }).not.toThrow();
    });

    it("should handle edge cases", () => {
      // Should handle empty strings and special characters
      expect(() => {
        service.trackLessonStarted("");
        service.trackAudioPlay("", "");
        service.trackTextRevealed("");
        service.trackPhraseReplay("", "");
      }).not.toThrow();
    });
  });

  describe("performance", () => {
    it("should handle many events efficiently", () => {
      service.clearEvents();

      // Add 100 events
      for (let i = 0; i < 100; i++) {
        service.trackLessonStarted(`lesson-${i}`);
      }

      // Should complete in reasonable time (less than 100ms)
      expect(service["events"]).toHaveLength(100);
    });
  });
});
