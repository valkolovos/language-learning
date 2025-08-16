import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { LessonContainer } from "../LessonContainer";
import { LessonService } from "../../services/lessonService";

// Mock the LessonService
jest.mock("../../services/lessonService");
const mockLessonService = LessonService as jest.Mocked<typeof LessonService>;

// Mock the audio playback hook with a stable implementation that doesn't cause state updates
const mockPlayAudio = jest.fn();
const mockStopAudio = jest.fn();
const mockResetPlayback = jest.fn();
const mockGetCurrentState = jest.fn();

// Create a stable mock that doesn't change during tests
const mockPlaybackState = {
  isPlaying: false,
  currentAudioId: null,
  playCount: 0,
  canReveal: false,
  error: null,
};

jest.mock("../../hooks/useAudioPlayback", () => ({
  useAudioPlayback: () => ({
    playbackState: mockPlaybackState,
    playAudio: mockPlayAudio,
    stopAudio: mockStopAudio,
    resetPlayback: mockResetPlayback,
    getCurrentState: mockGetCurrentState,
  }),
}));

// Mock the event tracking service
jest.mock("../../services/eventTrackingService", () => ({
  EventTrackingService: {
    getInstance: () => ({
      trackLessonStarted: jest.fn(),
      trackTextRevealed: jest.fn(),
      trackAudioPlay: jest.fn(),
      trackPhraseReplay: jest.fn(),
    }),
  },
}));

// Mock the logger to prevent console errors
jest.mock("../../services/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

describe("LessonContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock functions
    mockPlayAudio.mockClear();
    mockStopAudio.mockClear();
    mockResetPlayback.mockClear();
    mockGetCurrentState.mockClear();
  });

  it("shows loading state initially", async () => {
    // Mock a delayed response to keep component in loading state
    (mockLessonService.loadLesson as jest.Mock).mockImplementation(
      () => new Promise(() => {}), // Never resolves, keeps loading state
    );

    render(<LessonContainer lessonId="test-lesson" />);

    expect(screen.getByText("Loading lesson...")).toBeInTheDocument();
  });

  it("calls LessonService.loadLesson with correct lessonId", async () => {
    const mockLesson = {
      id: "test-lesson",
      title: "Test Lesson",
      mainLine: {
        nativeText: "Test",
        gloss: "Test",
        audio: { id: "audio-1", filename: "test.mp3" },
      },
      phrases: [],
    };

    (mockLessonService.loadLesson as jest.Mock).mockResolvedValue({
      success: true,
      lesson: mockLesson,
    });

    render(<LessonContainer lessonId="test-lesson" />);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockLessonService.loadLesson).toHaveBeenCalledWith("test-lesson");
    });
  });

  it("handles lesson loading success", async () => {
    const mockLesson = {
      id: "test-lesson",
      title: "Test Lesson",
      mainLine: {
        nativeText: "Hola",
        gloss: "Hello",
        audio: { id: "audio-1", filename: "hola.mp3", duration: 1.0 },
      },
      phrases: [
        {
          id: "phrase-1",
          nativeText: "Hola",
          gloss: "Hello",
          audio: { id: "audio-2", filename: "hola.mp3" },
        },
      ],
    };

    (mockLessonService.loadLesson as jest.Mock).mockResolvedValue({
      success: true,
      lesson: mockLesson,
    });

    render(<LessonContainer lessonId="test-lesson" />);

    // Wait for loading to complete and lesson to be displayed
    await waitFor(
      () => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Should show lesson content
    expect(screen.getByText("🎧 Listen First")).toBeInTheDocument();
  });

  it("handles lesson loading error", async () => {
    (mockLessonService.loadLesson as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        type: "invalid_structure",
        message: "Lesson not found",
      },
    });

    render(<LessonContainer lessonId="test-lesson" />);

    // Wait for loading to complete and error to be displayed
    await waitFor(
      () => {
        expect(screen.getByText("Error Loading Lesson")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Should show error message
    expect(screen.getByText("Lesson not found")).toBeInTheDocument();
  });
});
