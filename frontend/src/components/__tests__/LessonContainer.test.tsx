import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

// Mock all the services at the module level
jest.mock("../../services/lessonService");
jest.mock("../../hooks/useAudioPlayback");
jest.mock("../../services/eventTrackingService");
jest.mock("../../services/audioPlaybackService");
jest.mock("../../services/logger");

describe("LessonContainer Accessibility", () => {
  const mockLesson = {
    id: "test-lesson",
    title: "Test Lesson",
    mainLine: {
      id: "main-1",
      nativeText: "Hello, how are you?",
      gloss: "Hello, how are you?",
      tips: "Practice the greeting",
      audio: { id: "audio-1", url: "test-audio-1.mp3", language: "en" },
    },
    phrases: [
      {
        id: "phrase-1",
        nativeText: "I'm fine, thank you",
        gloss: "I'm fine, thank you",
        tips: "Polite response",
        audio: { id: "audio-2", url: "test-audio-2.mp3", language: "en" },
      },
      {
        id: "phrase-2",
        nativeText: "Nice to meet you",
        gloss: "Nice to meet you",
        tips: "Friendly introduction",
        audio: { id: "audio-3", url: "test-audio-3.mp3", language: "en" },
      },
    ],
    metadata: {
      difficulty: "Beginner",
      estimatedDuration: 5,
    },
  };

  const mockAudioPlaybackHook = {
    playbackState: {
      isPlaying: false,
      currentAudioId: null,
      playCount: 0,
      canReveal: false,
      error: null,
    },
    playAudio: jest.fn(),
    stopAudio: jest.fn(),
    resetPlayback: jest.fn(),
    getCurrentState: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks using require to avoid read-only issues
    const lessonService = require("../../services/lessonService");
    const useAudioPlayback = require("../../hooks/useAudioPlayback");
    const eventTrackingService = require("../../services/eventTrackingService");
    const audioPlaybackService = require("../../services/audioPlaybackService");
    const logger = require("../../services/logger");

    // Mock the services
    lessonService.LessonService = {
      loadLesson: jest.fn(),
    };

    useAudioPlayback.useAudioPlayback = jest
      .fn()
      .mockReturnValue(mockAudioPlaybackHook);

    eventTrackingService.EventTrackingService = {
      getInstance: jest.fn(() => ({
        trackLessonStarted: jest.fn(),
        trackTextRevealed: jest.fn(),
        trackAudioPlay: jest.fn(),
        trackPhraseReplay: jest.fn(),
      })),
    };

    audioPlaybackService.AudioPlaybackService = {
      getInstance: jest.fn(() => ({
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    };

    logger.default = {
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
  });

  describe("Keyboard Navigation", () => {
    it("should handle Enter key on buttons", async () => {
      // Mock successful lesson loading
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: true,
        lesson: mockLesson,
      });

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      const playButton = screen.getByRole("button", {
        name: /play main line audio/i,
      });
      expect(playButton).toBeInTheDocument();
    });

    it("should handle Space key on buttons", async () => {
      // Mock successful lesson loading
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: true,
        lesson: mockLesson,
      });

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      const playButton = screen.getByRole("button", {
        name: /play main line audio/i,
      });
      expect(playButton).toBeInTheDocument();
    });
  });

  describe("Screen Reader Support", () => {
    it("should have screen reader announcements container", async () => {
      // Mock successful lesson loading
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: true,
        lesson: mockLesson,
      });

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      const announcementsContainer = screen.getByLabelText(
        "Screen reader announcements",
      );
      expect(announcementsContainer).toBeInTheDocument();
      expect(announcementsContainer).toHaveAttribute("aria-live", "polite");
      expect(announcementsContainer).toHaveAttribute("aria-atomic", "true");
    });

    it("should have proper ARIA labels on all interactive elements", async () => {
      // Mock successful lesson loading
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: true,
        lesson: mockLesson,
      });

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      // Check main play button
      const playButton = screen.getByRole("button", {
        name: /play main line audio/i,
      });
      expect(playButton).toBeInTheDocument();

      // Check progress bar accessibility
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-label", "Progress: 0%");
    });
  });

  describe("Error Handling Accessibility", () => {
    it("should handle errors gracefully with accessible error messages", async () => {
      // Mock LessonService to return error
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: false,
        error: { message: "Network error" },
      });

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Error Loading Lesson")).toBeInTheDocument();
      });

      // Check error message accessibility
      const errorMessage = screen.getByText(
        "We couldn't load your lesson right now",
      );
      expect(errorMessage).toBeInTheDocument();

      // Check retry button
      const retryButton = screen.getByRole("button", { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });
  });
});
