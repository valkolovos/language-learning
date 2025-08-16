import { renderHook, act } from "@testing-library/react";
import { useAudioPlayback } from "../useAudioPlayback";
import { AudioPlaybackService } from "../../services/audioPlaybackService";
import { AudioClip } from "../../types/lesson";

// Mock the AudioPlaybackService
jest.mock("../../services/audioPlaybackService");
const mockAudioPlaybackService = AudioPlaybackService as jest.Mocked<
  typeof AudioPlaybackService
> & {
  getInstance: jest.Mock;
};

// Mock the logger
jest.mock("../../services/logger", () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("useAudioPlayback", () => {
  let mockService: jest.Mocked<AudioPlaybackService>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock service instance
    mockService = {
      playAudio: jest.fn(),
      stopAudio: jest.fn(),
      resetPlayback: jest.fn(),
      getCurrentState: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setMainLineAudioId: jest.fn(),
      getMainLineAudioId: jest.fn(),
    } as unknown as jest.Mocked<AudioPlaybackService>;

    // Mock the getInstance method to return our mock service
    (mockAudioPlaybackService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  describe("initialization", () => {
    it("should initialize with default playback state", () => {
      const defaultState = {
        isPlaying: false,
        currentAudioId: null,
        playCount: 0,
        canReveal: false,
        error: null,
      };

      mockService.getCurrentState.mockReturnValue(defaultState);

      const { result } = renderHook(() => useAudioPlayback());

      expect(result.current.playbackState).toEqual(defaultState);
      expect(mockAudioPlaybackService.getInstance).toHaveBeenCalled();
      expect(mockService.addEventListener).toHaveBeenCalled();
    });

    it("should handle initialization errors gracefully", () => {
      (mockAudioPlaybackService.getInstance as jest.Mock).mockImplementation(
        () => {
          throw new Error("Service initialization failed");
        },
      );

      // Should not crash
      expect(() => renderHook(() => useAudioPlayback())).not.toThrow();
    });
  });

  describe("audio playback methods", () => {
    it("should call service playAudio method", () => {
      const { result } = renderHook(() => useAudioPlayback());

      const audioClip: AudioClip = {
        type: "tts",
        id: "test-audio",
        text: "Hello world",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      };

      act(() => {
        result.current.playAudio(audioClip);
      });

      expect(mockService.playAudio).toHaveBeenCalledWith(audioClip);
    });

    it("should call service stopAudio method", () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.stopAudio();
      });

      expect(mockService.stopAudio).toHaveBeenCalled();
    });

    it("should call service resetPlayback method", () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.resetPlayback();
      });

      expect(mockService.resetPlayback).toHaveBeenCalled();
    });

    it("should call service getCurrentState method", () => {
      const { result } = renderHook(() => useAudioPlayback());

      act(() => {
        result.current.getCurrentState();
      });

      expect(mockService.getCurrentState).toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("should handle cleanup on unmount", () => {
      const { unmount } = renderHook(() => useAudioPlayback());

      // Verify service was initialized
      expect(mockAudioPlaybackService.getInstance).toHaveBeenCalled();

      // Unmount component
      unmount();

      // Verify cleanup was called
      expect(mockService.removeEventListener).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle service method errors gracefully", async () => {
      mockService.playAudio.mockRejectedValue(new Error("Playback failed"));

      const { result } = renderHook(() => useAudioPlayback());

      // The hook should re-throw service errors as designed
      await expect(async () => {
        await act(async () => {
          await result.current.playAudio({
            type: "tts",
            id: "test-audio",
            text: "Hello world",
            language: "en-US",
            duration: 2.5,
            volume: 0.8,
          });
        });
      }).rejects.toThrow("Playback failed");
    });
  });

  describe("performance", () => {
    it("should not cause unnecessary re-renders", () => {
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useAudioPlayback();
      });

      // Call a method that doesn't change state
      act(() => {
        result.current.getCurrentState();
      });

      // Should not cause additional renders beyond the initial one
      expect(renderCount).toBe(1);
    });
  });
});
