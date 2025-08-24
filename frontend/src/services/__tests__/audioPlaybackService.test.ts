import { AudioPlaybackService } from "../audioPlaybackService";
import { AudioClip } from "../../types/lesson";
import { AUDIO_IDS } from "../../constants/audio";

// Mock the Web Speech API
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([]),
  onvoiceschanged: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Mock SpeechSynthesisUtterance constructor
global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  rate: 0.9,
  pitch: 1.0,
  volume: 0.8,
  lang: "en-US",
  onstart: jest.fn(),
  onend: jest.fn(),
  onerror: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock window.speechSynthesis
Object.defineProperty(window, "speechSynthesis", {
  value: mockSpeechSynthesis,
  writable: true,
});

describe("AudioPlaybackService", () => {
  let service: AudioPlaybackService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = AudioPlaybackService.getInstance();
    service.resetPlayback();
  });

  describe("constructor", () => {
    it("should throw error when speech synthesis is not supported", () => {
      // Clear the singleton instance to force new construction
      (
        AudioPlaybackService as unknown as {
          instance: AudioPlaybackService | null;
        }
      ).instance = null;

      // Temporarily override the window.speechSynthesis to be undefined
      const originalSpeechSynthesis = window.speechSynthesis;
      (
        window as { speechSynthesis: SpeechSynthesis | undefined }
      ).speechSynthesis = undefined;

      // Expect getInstance to throw when speech synthesis is not available
      expect(() => AudioPlaybackService.getInstance()).toThrow(
        "Speech synthesis is not supported in your browser.",
      );

      // Restore speechSynthesis and reset instance
      (
        window as { speechSynthesis: SpeechSynthesis | undefined }
      ).speechSynthesis = originalSpeechSynthesis;
      (
        AudioPlaybackService as unknown as {
          instance: AudioPlaybackService | null;
        }
      ).instance = null;
    });
  });

  afterEach(() => {
    // Clean up any event listeners
    if (service.removeEventListener) {
      service.removeEventListener(jest.fn());
    }
  });

  describe("getInstance", () => {
    it("should return the same instance (singleton)", () => {
      const instance1 = AudioPlaybackService.getInstance();
      const instance2 = AudioPlaybackService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("playAudio", () => {
    it("should play audio with TTS when no filename is provided", () => {
      const audioClip: AudioClip = {
        type: "tts",
        id: "test-audio",
        text: "Hello world",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      };

      service.playAudio(audioClip);

      // Verify the constructor was called with the correct text
      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith(
        "Hello world",
      );

      // Verify speak was called
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();

      // Verify the service state was updated
      expect(service.getCurrentState().isPlaying).toBe(true);
      expect(service.getCurrentState().currentAudioId).toBe("test-audio");
    });

    it("should reject pre-recorded audio clips", async () => {
      const audioClip: AudioClip = {
        type: "pre_recorded",
        id: "test-audio",
        filename: "test.mp3",
        duration: 2.5,
        volume: 0.8,
      };

      await expect(service.playAudio(audioClip)).rejects.toThrow(
        "Cannot play pre-recorded audio clip 'test-audio' with TTS service. Pre-recorded audio files are not yet supported in this implementation.",
      );
    });

    it("should emit play_started event when audio starts", () => {
      const mockListener = jest.fn();
      service.addEventListener(mockListener);

      const audioClip: AudioClip = {
        type: "tts",
        id: "test-audio",
        text: "Hello world",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      };

      service.playAudio(audioClip);

      // Simulate the speech start event by calling the service's handler directly
      (
        service as unknown as { handleSpeechStart: (audioId: string) => void }
      ).handleSpeechStart("test-audio");

      expect(mockListener).toHaveBeenCalledWith({
        type: "play_started",
        audioId: "test-audio",
        timestamp: expect.any(Number),
        details: expect.any(Object),
      });
    });

    it("should emit play_completed event when audio ends", () => {
      const mockListener = jest.fn();
      service.addEventListener(mockListener);

      const audioClip: AudioClip = {
        type: "tts",
        id: "test-audio",
        text: "Hello world",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      };

      service.playAudio(audioClip);

      // Simulate the speech end event by calling the service's handler directly
      (service as unknown as { handleSpeechEnd: () => void }).handleSpeechEnd();

      expect(mockListener).toHaveBeenCalledWith({
        type: "play_completed",
        audioId: "test-audio",
        timestamp: expect.any(Number),
        details: expect.any(Object),
      });
    });
  });

  describe("stopAudio", () => {
    it("should stop current audio playback", () => {
      const audioClip: AudioClip = {
        type: "tts",
        id: "test-audio",
        text: "Hello world",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      };

      service.playAudio(audioClip);
      expect(service.getCurrentState().isPlaying).toBe(true);

      service.stopAudio();

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(service.getCurrentState().isPlaying).toBe(false);
    });

    it("should emit play_aborted event when stopping audio", () => {
      const mockListener = jest.fn();
      service.addEventListener(mockListener);

      const audioClip: AudioClip = {
        type: "tts",
        id: "test-audio",
        text: "Hello world",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      };

      service.playAudio(audioClip);
      service.stopAudio();

      // The service emits play_started first, then play_aborted
      expect(mockListener).toHaveBeenCalledTimes(2);
      expect(mockListener).toHaveBeenNthCalledWith(1, {
        type: "play_started",
        audioId: "test-audio",
        timestamp: expect.any(Number),
        details: expect.any(Object),
      });
      expect(mockListener).toHaveBeenNthCalledWith(2, {
        type: "play_aborted",
        audioId: "test-audio",
        timestamp: expect.any(Number),
      });
    });
  });

  describe("main line audio tracking", () => {
    it("should increment play count for main line audio", () => {
      const mainLineAudio: AudioClip = {
        type: "tts",
        id: AUDIO_IDS.MAIN_LINE,
        text: "Hello world",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      };

      service.playAudio(mainLineAudio);

      // Simulate speech end by calling the service's handler directly
      (service as unknown as { handleSpeechEnd: () => void }).handleSpeechEnd();

      expect(service.getCurrentState().playCount).toBe(1);
    });

    it("should not increment play count for non-main line audio", () => {
      const phraseAudio: AudioClip = {
        type: "tts",
        id: AUDIO_IDS.PHRASE_1,
        text: "Hello world",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      };

      service.playAudio(phraseAudio);

      // Simulate speech end by calling the service's handler directly
      (service as unknown as { handleSpeechEnd: () => void }).handleSpeechEnd();

      expect(service.getCurrentState().playCount).toBe(0);
    });

    it("should enable text reveal after 2 complete plays of main line", () => {
      const mainLineAudio: AudioClip = {
        type: "tts",
        id: AUDIO_IDS.MAIN_LINE,
        text: "Hello world",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      };

      // First play
      service.playAudio(mainLineAudio);
      (service as unknown as { handleSpeechEnd: () => void }).handleSpeechEnd();
      expect(service.getCurrentState().canReveal).toBe(false);

      // Second play
      service.playAudio(mainLineAudio);
      (service as unknown as { handleSpeechEnd: () => void }).handleSpeechEnd();
      expect(service.getCurrentState().canReveal).toBe(true);
    });
  });

  describe("configurable main line audio ID", () => {
    it("should allow setting custom main line audio ID", () => {
      const customId = "custom-main-audio";
      service.setMainLineAudioId(customId);
      expect(service.getMainLineAudioId()).toBe(customId);
    });

    it("should reset to default main line audio ID when resetting playback", () => {
      service.setMainLineAudioId("custom-id");
      service.resetPlayback();
      expect(service.getMainLineAudioId()).toBe(AUDIO_IDS.MAIN_LINE);
    });

    it("should reset play count and reveal state when main line audio ID changes", () => {
      const mockListener = jest.fn();
      service.addEventListener(mockListener);

      // Set initial main line and simulate some plays
      service.setMainLineAudioId("initial-main-line");
      service["playCount"] = 3;
      service["canReveal"] = true;

      // Change to a new main line
      service.setMainLineAudioId("new-main-line");

      // Verify state was reset
      expect(service.getMainLineAudioId()).toBe("new-main-line");
      expect(service["playCount"]).toBe(0);
      expect(service["canReveal"]).toBe(false);

      // Verify event was emitted with correct previous ID
      expect(mockListener).toHaveBeenCalledWith({
        type: "main_line_changed",
        audioId: "new-main-line",
        timestamp: expect.any(Number),
        details: {
          previousMainLineId: "initial-main-line",
          playCountReset: true,
        },
      });
    });

    it("should not reset state when setting the same main line audio ID", () => {
      const mockListener = jest.fn();

      // Set initial state first
      service.setMainLineAudioId("test-main-line");
      service["playCount"] = 2;
      service["canReveal"] = false;

      // Now add listener after initial setup
      service.addEventListener(mockListener);

      // Set the same ID again
      service.setMainLineAudioId("test-main-line");

      // Verify state was not reset
      expect(service["playCount"]).toBe(2);
      expect(service["canReveal"]).toBe(false);

      // Verify no event was emitted
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe("event listeners", () => {
    it("should add and remove event listeners", () => {
      const mockListener = jest.fn();

      service.addEventListener(mockListener);
      expect(service["eventListeners"]).toContain(mockListener);

      service.removeEventListener(mockListener);
      expect(service["eventListeners"]).not.toContain(mockListener);
    });
  });

  describe("error handling", () => {
    it("should handle speech synthesis errors", () => {
      const mockListener = jest.fn();
      service.addEventListener(mockListener);

      const audioClip: AudioClip = {
        type: "tts",
        id: "test-audio",
        text: "Hello world",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      };

      service.playAudio(audioClip);

      // Simulate speech error by calling the service's handler directly
      const mockErrorEvent = {
        error: "speech-synthesis-error",
      } as unknown as SpeechSynthesisErrorEvent;
      (
        service as unknown as {
          handleSpeechError: (event: SpeechSynthesisErrorEvent) => void;
        }
      ).handleSpeechError(mockErrorEvent);

      // The service emits play_started first, then play_error
      expect(mockListener).toHaveBeenCalledTimes(2);
      expect(mockListener).toHaveBeenNthCalledWith(1, {
        type: "play_started",
        audioId: "test-audio",
        timestamp: expect.any(Number),
        details: expect.any(Object),
      });
      expect(mockListener).toHaveBeenNthCalledWith(2, {
        type: "play_error",
        audioId: "unknown", // currentAudioId is null when error occurs
        timestamp: expect.any(Number),
        details: expect.any(Object),
      });

      expect(service.getCurrentState().error).toBe(
        "TTS Error: speech-synthesis-error",
      );
    });
  });

  describe("state management", () => {
    it("should return current playback state", () => {
      const state = service.getCurrentState();

      expect(state).toEqual({
        isPlaying: false,
        currentAudioId: null,
        playCount: 0,
        canReveal: false,
        error: null,
      });
    });

    it("should reset playback state correctly", () => {
      // Set some state
      service["isPlaying"] = true;
      service["currentAudioId"] = "test-audio";
      service["playCount"] = 5;
      service["canReveal"] = true;
      service["error"] = "test error";

      service.resetPlayback();

      const state = service.getCurrentState();
      expect(state.isPlaying).toBe(false);
      expect(state.currentAudioId).toBe(null);
      expect(state.playCount).toBe(0);
      expect(state.canReveal).toBe(false);
      expect(state.error).toBe(null);
    });
  });
});
