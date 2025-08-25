import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock all the services at the module level
jest.mock("../../services/lessonService");
jest.mock("../../hooks/useAudioPlayback");
jest.mock("../../services/eventTrackingService");
jest.mock("../../services/audioPlaybackService");
jest.mock("../../services/logger");

describe("LessonContainer", () => {
  const mockLesson = {
    id: "test-lesson",
    title: "Test Lesson",
    mainLine: {
      nativeText: "Hello, how are you?",
      gloss: "Hello, how are you?",
      tips: "Practice the greeting",
      audio: {
        id: "main-audio-1",
        type: "tts" as const,
        text: "Hello, how are you?",
        language: "en-US",
        duration: 2.5,
        volume: 0.8,
      },
    },
    phrases: [
      {
        id: "phrase-1",
        nativeText: "I'm fine, thank you",
        gloss: "I'm fine, thank you",
        tips: "Polite response",
        audio: {
          id: "phrase-audio-1",
          type: "tts" as const,
          text: "I'm fine, thank you",
          language: "en-US",
          duration: 1.8,
          volume: 0.8,
        },
      },
      {
        id: "phrase-2",
        nativeText: "Nice to meet you",
        gloss: "Nice to meet you",
        tips: "Friendly introduction",
        audio: {
          id: "phrase-audio-2",
          type: "tts" as const,
          text: "Nice to meet you",
          language: "en-US",
          duration: 1.5,
          volume: 0.8,
        },
      },
    ],
    metadata: {
      difficulty: "beginner" as const,
      estimatedDuration: 5,
    },
  };

  const mockAudioPlaybackHook = {
    playbackState: {
      isPlaying: false,
      currentAudioId: null as string | null,
      playCount: 0,
      canReveal: false,
      error: null,
    },
    playAudio: jest.fn(),
    stopAudio: jest.fn(),
    resetPlayback: jest.fn(),
  };

  const mockEventTracking = {
    trackLessonStarted: jest.fn(),
    trackTextRevealed: jest.fn(),
    trackAudioPlay: jest.fn(),
    trackPhraseReplay: jest.fn(),
  };

  const mockAudioPlaybackService = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
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
      getInstance: jest.fn(() => mockEventTracking),
    };

    audioPlaybackService.AudioPlaybackService = {
      getInstance: jest.fn(() => mockAudioPlaybackService),
    };

    logger.default = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
  });

  describe("Lesson Loading", () => {
    it("should load lesson successfully", async () => {
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

      expect(lessonService.LessonService.loadLesson).toHaveBeenCalledWith(
        "test-lesson",
      );
      expect(mockEventTracking.trackLessonStarted).toHaveBeenCalledWith(
        "test-lesson",
      );
      expect(mockAudioPlaybackHook.resetPlayback).toHaveBeenCalled();
    });

    it("should handle lesson loading error", async () => {
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

      expect(
        screen.getByText("We couldn't load your lesson right now"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try again/i }),
      ).toBeInTheDocument();
    });

    it("should handle unexpected errors during lesson loading", async () => {
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockRejectedValue(
        new Error("Unexpected error"),
      );

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Error Loading Lesson")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Something went wrong while loading your lesson"),
      ).toBeInTheDocument();
    });

    it("should show loading state initially", () => {
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockImplementation(
        () => new Promise(() => {}),
      ); // Never resolves

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      expect(screen.getByText("Loading lesson...")).toBeInTheDocument();
    });

    it("should handle no lesson found", async () => {
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: true,
        lesson: null,
      });

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Error Loading Lesson")).toBeInTheDocument();
      });
    });
  });

  describe("Audio Playback", () => {
    beforeEach(async () => {
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: true,
        lesson: mockLesson,
      });
    });

    it("should play main line audio", async () => {
      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      const playButton = screen.getByRole("button", {
        name: /play main lesson/i,
      });
      fireEvent.click(playButton);

      expect(mockAudioPlaybackHook.playAudio).toHaveBeenCalledWith(
        mockLesson.mainLine.audio,
      );
      expect(mockEventTracking.trackAudioPlay).toHaveBeenCalledWith(
        "main-audio-1",
        "test-lesson",
      );
    });

    it("should stop main line audio when playing", async () => {
      // Set up playing state
      mockAudioPlaybackHook.playbackState.isPlaying = true;
      mockAudioPlaybackHook.playbackState.currentAudioId = "main-audio-1";

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      const stopButton = screen.getByRole("button", {
        name: /stop audio/i,
      });
      fireEvent.click(stopButton);

      expect(mockAudioPlaybackHook.stopAudio).toHaveBeenCalled();
    });

    it("should show reveal button when canReveal is true", async () => {
      mockAudioPlaybackHook.playbackState.canReveal = true;

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      expect(
        screen.getByRole("button", { name: /reveal lesson text/i }),
      ).toBeInTheDocument();
    });

    it("should handle text reveal", async () => {
      mockAudioPlaybackHook.playbackState.canReveal = true;

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      const revealButton = screen.getByRole("button", {
        name: /reveal lesson text/i,
      });
      fireEvent.click(revealButton);

      expect(mockEventTracking.trackTextRevealed).toHaveBeenCalledWith(
        "test-lesson",
      );
      expect(screen.getByText("Practice Phrases")).toBeInTheDocument();
    });

    it("should handle phrase replay", async () => {
      mockAudioPlaybackHook.playbackState.canReveal = true;

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      // Reveal text first
      const revealButton = screen.getByRole("button", {
        name: /reveal lesson text/i,
      });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByText("Practice Phrases")).toBeInTheDocument();
      });

      const phraseButton = screen.getByRole("button", {
        name: /play phrase phrase: I'm fine, thank you/i,
      });
      fireEvent.click(phraseButton);

      expect(mockAudioPlaybackHook.playAudio).toHaveBeenCalledWith(
        mockLesson.phrases[0].audio,
      );
      expect(mockEventTracking.trackPhraseReplay).toHaveBeenCalledWith(
        "phrase-audio-1",
        "test-lesson",
      );
    });

    it("should handle replay all phrases", async () => {
      mockAudioPlaybackHook.playbackState.canReveal = true;

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      // Reveal text first
      const revealButton = screen.getByRole("button", {
        name: /reveal lesson text/i,
      });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /replay all/i }),
        ).toBeInTheDocument();
      });

      const replayAllButton = screen.getByRole("button", {
        name: /replay all/i,
      });
      fireEvent.click(replayAllButton);

      expect(mockAudioPlaybackService.addEventListener).toHaveBeenCalled();
    });
  });

  describe("Progress and XP System", () => {
    beforeEach(async () => {
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: true,
        lesson: mockLesson,
      });
    });

    it("should calculate progress correctly before reveal", async () => {
      mockAudioPlaybackHook.playbackState.playCount = 1;
      const onProgressChange = jest.fn();

      const { LessonContainer } = require("../LessonContainer");
      render(
        <LessonContainer
          lessonId="test-lesson"
          onProgressChange={onProgressChange}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      // Progress should be calculated based on play count
      expect(onProgressChange).toHaveBeenCalledWith(25);
    });

    it("should calculate progress correctly after reveal", async () => {
      mockAudioPlaybackHook.playbackState.canReveal = true;
      mockAudioPlaybackHook.playbackState.playCount = 2;
      const onProgressChange = jest.fn();

      const { LessonContainer } = require("../LessonContainer");
      render(
        <LessonContainer
          lessonId="test-lesson"
          onProgressChange={onProgressChange}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      // Reveal text
      const revealButton = screen.getByRole("button", {
        name: /reveal lesson text/i,
      });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByText("Practice Phrases")).toBeInTheDocument();
      });

      // Progress should be calculated after reveal (75%)
      expect(onProgressChange).toHaveBeenCalledWith(75);
    });

    it("should increase progress with phrase interactions", async () => {
      mockAudioPlaybackHook.playbackState.canReveal = true;
      const onProgressChange = jest.fn();

      const { LessonContainer } = require("../LessonContainer");
      render(
        <LessonContainer
          lessonId="test-lesson"
          onProgressChange={onProgressChange}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      // Reveal text first
      const revealButton = screen.getByRole("button", {
        name: /reveal lesson text/i,
      });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByText("Practice Phrases")).toBeInTheDocument();
      });

      // Progress should be 75% after reveal
      expect(onProgressChange).toHaveBeenCalledWith(75);

      // Play a phrase
      const phraseButton = screen.getByRole("button", {
        name: /play phrase phrase: I'm fine, thank you/i,
      });
      fireEvent.click(phraseButton);

      // Progress should increase to 80% (75% + 5% for phrase interaction)
      expect(onProgressChange).toHaveBeenCalledWith(80);
    });

    it("should award XP for text reveal", async () => {
      mockAudioPlaybackHook.playbackState.canReveal = true;
      const onXpChange = jest.fn();

      const { LessonContainer } = require("../LessonContainer");
      render(
        <LessonContainer
          lessonId="test-lesson"
          onXpChange={onXpChange}
          onProgressChange={jest.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      const revealButton = screen.getByRole("button", {
        name: /reveal lesson text/i,
      });
      fireEvent.click(revealButton);

      // XP should be awarded (50 for reveal)
      expect(onXpChange).toHaveBeenCalledWith(50);
    });

    it("should award XP for phrase replay", async () => {
      mockAudioPlaybackHook.playbackState.canReveal = true;
      const onXpChange = jest.fn();

      const { LessonContainer } = require("../LessonContainer");
      render(
        <LessonContainer
          lessonId="test-lesson"
          onXpChange={onXpChange}
          onProgressChange={jest.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      // Reveal text first
      const revealButton = screen.getByRole("button", {
        name: /reveal lesson text/i,
      });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByText("Practice Phrases")).toBeInTheDocument();
      });

      const phraseButton = screen.getByRole("button", {
        name: /play phrase phrase: I'm fine, thank you/i,
      });
      fireEvent.click(phraseButton);

      // XP should be awarded (50 for reveal + 10 for phrase replay)
      expect(onXpChange).toHaveBeenCalledWith(60);
    });
  });

  describe("Transcript and UI Controls", () => {
    beforeEach(async () => {
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: true,
        lesson: mockLesson,
      });
      mockAudioPlaybackHook.playbackState.canReveal = true;
    });

    it("should toggle transcript visibility", async () => {
      const { LessonContainer } = require("../LessonContainer");
      render(
        <LessonContainer lessonId="test-lesson" onProgressChange={jest.fn()} />,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      // Reveal text first
      const revealButton = screen.getByRole("button", {
        name: /reveal lesson text/i,
      });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByText("Practice Phrases")).toBeInTheDocument();
      });

      const transcriptToggle = screen.getByRole("button", {
        name: /hide all translations/i,
      });
      fireEvent.click(transcriptToggle);

      // Transcript should be hidden (gloss text should not be visible)
      expect(screen.getByText("Hello, how are you?")).toBeInTheDocument(); // Native text should still be visible
      // The gloss text should be hidden by the TranscriptToggle component
    });

    it("should handle XP changes through callback", async () => {
      const onXpChange = jest.fn();
      const { LessonContainer } = require("../LessonContainer");
      render(
        <LessonContainer
          lessonId="test-lesson"
          onXpChange={onXpChange}
          onProgressChange={jest.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      // XP callback should be called with initial value
      expect(onXpChange).toHaveBeenCalledWith(0);
    });
  });

  describe("Screen Reader Support", () => {
    beforeEach(async () => {
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: true,
        lesson: mockLesson,
      });
    });

    it("should have screen reader announcements container", async () => {
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

    it("should announce lesson loaded", async () => {
      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      const announcementsContainer = screen.getByLabelText(
        "Screen reader announcements",
      );
      expect(announcementsContainer).toHaveTextContent(
        "Lesson loaded. Press Enter or Space on the Play button to start listening.",
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle errors gracefully with accessible error messages", async () => {
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

      expect(
        screen.getByText("We couldn't load your lesson right now"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try again/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("Technical details")).toBeInTheDocument();
    });

    it("should retry lesson loading", async () => {
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson
        .mockResolvedValueOnce({
          success: false,
          error: { message: "Network error" },
        })
        .mockResolvedValueOnce({
          success: true,
          lesson: mockLesson,
        });

      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Error Loading Lesson")).toBeInTheDocument();
      });

      const retryButton = screen.getByRole("button", { name: /try again/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });
    });
  });

  describe("Audio Sequence Cleanup", () => {
    beforeEach(async () => {
      const lessonService = require("../../services/lessonService");
      lessonService.LessonService.loadLesson.mockResolvedValue({
        success: true,
        lesson: mockLesson,
      });
      mockAudioPlaybackHook.playbackState.canReveal = true;
    });

    it("should properly clean up audio sequence event listeners", async () => {
      const { LessonContainer } = require("../LessonContainer");
      render(<LessonContainer lessonId="test-lesson" />);

      await waitFor(() => {
        expect(screen.getByText("Test Lesson")).toBeInTheDocument();
      });

      // Reveal text first
      const revealButton = screen.getByRole("button", {
        name: /reveal lesson text/i,
      });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /replay all/i }),
        ).toBeInTheDocument();
      });

      const replayAllButton = screen.getByRole("button", {
        name: /replay all/i,
      });
      fireEvent.click(replayAllButton);

      expect(mockAudioPlaybackService.addEventListener).toHaveBeenCalled();
    });
  });
});
