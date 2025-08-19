import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Lesson,
  LessonLoadResult,
  AudioClip,
  ExtendedError,
  AudioPlaybackEvent,
} from "../types/lesson";
import { LessonService } from "../services/lessonService";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { AudioPlayer } from "./AudioPlayer";
import { PhrasePlayer } from "./PhrasePlayer";
import { TranscriptToggle } from "./TranscriptToggle";
import { ProgressIndicator } from "./ProgressIndicator";
import { EventTrackingService } from "../services/eventTrackingService";
import { AudioPlaybackService } from "../services/audioPlaybackService";
import {
  createExtendedError,
  getUserFriendlyMessage,
} from "../utils/errorUtils";
import log from "../services/logger";

interface LessonContainerProps {
  lessonId: string;
}

export const LessonContainer: React.FC<LessonContainerProps> = ({
  lessonId,
}) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ExtendedError | null>(null);
  const [textRevealed, setTextRevealed] = useState(false);
  const [transcriptVisible, setTranscriptVisible] = useState(true);
  const [xp, setXp] = useState(0);
  const [showXpBreakdown, setShowXpBreakdown] = useState(false);

  // Initialize services using refs to avoid dependency issues
  const eventTracking = useRef(EventTrackingService.getInstance());

  // Initialize audio playback hook
  const { playbackState, playAudio, stopAudio, resetPlayback } =
    useAudioPlayback();

  // Focus management refs
  const mainPlayButtonRef = useRef<HTMLButtonElement>(null);
  const revealButtonRef = useRef<HTMLButtonElement>(null);
  const replayAllButtonRef = useRef<HTMLButtonElement>(null);
  const transcriptToggleRef = useRef<HTMLButtonElement>(null);
  const firstPhraseButtonRef = useRef<HTMLButtonElement>(null);

  // Screen reader announcements
  const [announcement, setAnnouncement] = useState("");

  // Announce to screen readers
  const announceToScreenReader = useCallback((message: string) => {
    setAnnouncement(message);
    // Clear announcement after a short delay to allow screen reader to process
    setTimeout(() => setAnnouncement(""), 100);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (event.target instanceof HTMLButtonElement) {
          event.target.click();
        }
        break;
      case "Tab":
        // Ensure logical tab order is maintained
        break;
    }
  }, []);

  // Focus management functions
  const focusRevealButton = useCallback(() => {
    revealButtonRef.current?.focus();
  }, []);

  const focusFirstPhraseButton = useCallback(() => {
    firstPhraseButtonRef.current?.focus();
  }, []);

  // Focus management when state changes
  useEffect(() => {
    if (playbackState.canReveal && !textRevealed) {
      // Announce that reveal is available and focus the reveal button
      announceToScreenReader(
        "Text is now available to reveal. Press Enter or Space to show the lesson text.",
      );
      // Small delay to ensure the reveal button is rendered
      setTimeout(() => focusRevealButton(), 100);
    }
  }, [
    playbackState.canReveal,
    textRevealed,
    announceToScreenReader,
    focusRevealButton,
  ]);

  useEffect(() => {
    if (textRevealed) {
      // Announce that text is revealed and focus the first phrase button
      announceToScreenReader(
        "Lesson text revealed. You can now practice individual phrases. Use Tab to navigate between controls.",
      );
      // Small delay to ensure phrase buttons are rendered
      setTimeout(() => focusFirstPhraseButton(), 100);
    }
  }, [textRevealed, announceToScreenReader, focusFirstPhraseButton]);

  // Announce audio playback state changes
  useEffect(() => {
    if (playbackState.isPlaying) {
      announceToScreenReader("Audio is now playing");
    } else if (playbackState.currentAudioId) {
      announceToScreenReader("Audio playback stopped");
    }
  }, [
    playbackState.isPlaying,
    playbackState.currentAudioId,
    announceToScreenReader,
  ]);

  const loadLesson = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result: LessonLoadResult = await LessonService.loadLesson(lessonId);

      if (result.success && result.lesson) {
        setLesson(result.lesson);
        // Reset audio playback when lesson changes
        resetPlayback();
        setTextRevealed(false);

        // Track lesson started event
        eventTracking.current.trackLessonStarted(lessonId);

        // Announce lesson loaded
        announceToScreenReader(
          "Lesson loaded. Press Enter or Space on the Play button to start listening.",
        );
      } else {
        const errorMessage = result.error?.message || "Failed to load lesson";
        setError(
          createExtendedError(
            errorMessage,
            "We couldn't load your lesson right now",
            `Technical details: ${errorMessage}`,
            "https://help.example.com/lesson-loading",
          ),
        );
      }
    } catch (err) {
      setError(
        createExtendedError(
          "Unexpected error occurred while loading lesson",
          "Something went wrong while loading your lesson",
          `Technical error: ${err instanceof Error ? err.message : String(err)}`,
          "https://help.example.com/troubleshooting",
        ),
      );
      log.error("Lesson loading error:", err);
    } finally {
      setLoading(false);
    }
  }, [lessonId, resetPlayback, announceToScreenReader]);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  // Handle text reveal
  const handleRevealText = () => {
    if (playbackState.canReveal) {
      setTextRevealed(true);
      // Track text revealed event
      eventTracking.current.trackTextRevealed(lessonId);
      // Award XP for revealing text
      setXp((prev) => prev + 50);

      // Announce reveal action
      announceToScreenReader(
        "Text revealed! You can now see the lesson content and practice phrases.",
      );
    }
  };

  // Handle transcript toggle
  const handleTranscriptToggle = () => {
    setTranscriptVisible((prev) => !prev);
    // Announce transcript state change
    announceToScreenReader(
      transcriptVisible ? "Translations hidden" : "Translations shown",
    );
  };

  // Handle XP breakdown toggle
  const handleXpBreakdownToggle = () => {
    setShowXpBreakdown((prev) => !prev);
    // Announce XP breakdown state change
    announceToScreenReader(
      showXpBreakdown ? "XP breakdown hidden" : "XP breakdown shown",
    );
  };

  // Handle phrase replay
  const handlePhrasePlay = (audioClip: AudioClip) => {
    playAudio(audioClip);
    // Track phrase replay event
    eventTracking.current.trackPhraseReplay(audioClip.id, lessonId);
    // Award XP for phrase replay
    setXp((prev) => prev + 10);

    // Announce phrase playback
    announceToScreenReader(`Playing phrase: ${audioClip.id}`);
  };

  // Handle replay all phrases
  const handleReplayAll = () => {
    if (lesson) {
      try {
        // Create a sequence of all audio clips to play
        const audioSequence = [
          lesson.mainLine.audio,
          ...lesson.phrases.map((p) => p.audio),
        ];

        // Play audio clips in sequence
        playAudioSequence(audioSequence);

        // Award XP for replay all action
        setXp((prev) => prev + 25);

        // Announce replay all action
        announceToScreenReader("Replaying all phrases in sequence");
      } catch (error) {
        log.error("Error during replay all:", error);
      }
    }
  };

  // Helper function to play audio clips in sequence
  const playAudioSequence = (audioClips: AudioClip[]) => {
    if (audioClips.length === 0) return;

    let currentIndex = 0;
    let isSequenceActive = true;

    // Get audio service instance early
    const audioService = AudioPlaybackService.getInstance();

    // Fallback timeout ID for cleanup
    let fallbackTimeoutId: NodeJS.Timeout | undefined;

    // Cleanup function to remove event listener and clear timeout
    const cleanup = () => {
      isSequenceActive = false;
      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId);
        fallbackTimeoutId = undefined;
      }
      audioService.removeEventListener(handleAudioComplete);
    };

    const playNext = () => {
      if (currentIndex >= audioClips.length || !isSequenceActive) {
        // Sequence completed or was cancelled
        cleanup();
        return;
      }

      const currentClip = audioClips[currentIndex];
      playAudio(currentClip);
      currentIndex++;
    };

    // Listen for audio completion events to trigger next audio
    const handleAudioComplete = (event: AudioPlaybackEvent) => {
      if (event.type === "play_completed" && isSequenceActive) {
        setTimeout(playNext, 500); // Small delay between audio clips for better UX
      }
    };

    // Add temporary event listener
    audioService.addEventListener(handleAudioComplete);

    // Start the sequence
    playNext();

    // Calculate total expected duration with safety margin
    const totalDuration = audioClips.reduce(
      (sum, clip) => sum + clip.duration,
      0,
    );
    const safetyMargin = 2000; // 2 seconds safety margin
    const cleanupTimeout = totalDuration * 1000 + safetyMargin;

    // Fallback cleanup timeout based on actual durations
    fallbackTimeoutId = setTimeout(() => {
      if (isSequenceActive) {
        log.warn("Audio sequence cleanup timeout reached, forcing cleanup");
        cleanup();
      }
    }, cleanupTimeout);
  };

  // Handle main line audio play
  const handleMainLinePlay = (audioClip: AudioClip) => {
    playAudio(audioClip);
    // Track audio play event
    eventTracking.current.trackAudioPlay(audioClip.id, lessonId);

    // Announce main line playback
    announceToScreenReader("Playing main line audio");
  };

  // Handle main line audio stop
  const handleMainLineStop = () => {
    stopAudio();
    // Announce main line stopped
    announceToScreenReader("Main line audio stopped");
  };

  if (loading) {
    return (
      <div className="lesson-container loading">
        <div className="loading-spinner">
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-container error">
        <div className="error-message">
          <h3>Error Loading Lesson</h3>
          <p className="user-message">{getUserFriendlyMessage(error)}</p>

          {error.helpUrl && (
            <p className="help-link">
              <a href={error.helpUrl} target="_blank" rel="noopener noreferrer">
                Get help with this issue
              </a>
            </p>
          )}

          <details className="error-details">
            <summary>Technical details</summary>
            <p className="technical-details">{error.technicalDetails}</p>
          </details>

          <button onClick={loadLesson} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-container no-lesson">
        <p>No lesson found</p>
      </div>
    );
  }

  // Calculate progress percentage based on actions completed
  const calculateProgress = () => {
    // Listening phase contributes up to 50%
    const listeningProgress = Math.min(1, playbackState.playCount / 2) * 50;

    if (!textRevealed) {
      return Math.min(50, listeningProgress);
    }

    // Engagement (XP) contributes up to the remaining 50%
    const engagementProgress = Math.min(1, xp / 100) * 50;

    // Total progress is capped at 100%
    return Math.min(100, 50 + engagementProgress);
  };

  return (
    <div className="lesson-container">
      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        aria-label="Screen reader announcements"
      >
        {announcement}
      </div>

      <div className="lesson-header">
        <h2>{lesson.title}</h2>
        {lesson.metadata && (
          <div className="lesson-metadata">
            <span className="difficulty">{lesson.metadata.difficulty}</span>
            {lesson.metadata.estimatedDuration && (
              <span className="duration">
                ~{lesson.metadata.estimatedDuration} min
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator
        xp={xp}
        progressPercentage={calculateProgress()}
        className="lesson-progress"
        showBreakdown={showXpBreakdown}
        onToggleBreakdown={handleXpBreakdownToggle}
      />

      <div className="lesson-content">
        {/* Listen-First Section */}
        <div className="listen-first-section">
          <div className="listen-hint">
            <h3>🎧 Listen First</h3>
            <p className="hint-text">
              {textRevealed
                ? "Great job! You can now see the text and practice phrases."
                : "Listen to the main line twice to unlock the text. Focus on the sounds first."}
            </p>
          </div>

          {/* Main Line Audio Player */}
          <div className="main-line-audio">
            <h4>Main Line</h4>
            <AudioPlayer
              ref={mainPlayButtonRef}
              audioClip={lesson.mainLine.audio}
              isPlaying={
                playbackState.isPlaying &&
                playbackState.currentAudioId === lesson.mainLine.audio.id
              }
              onPlay={handleMainLinePlay}
              onStop={handleMainLineStop}
              playCount={playbackState.playCount}
              canReveal={playbackState.canReveal}
              error={playbackState.error}
              className="main-line-player"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Reveal Button - Only shown when gate is unlocked */}
          {playbackState.canReveal && !textRevealed && (
            <div className="reveal-section">
              <button
                ref={revealButtonRef}
                className="reveal-button"
                onClick={handleRevealText}
                onKeyDown={handleKeyDown}
                aria-label="Reveal lesson text"
                aria-describedby="reveal-description"
              >
                ✨ Show Text
              </button>
              <div id="reveal-description" className="sr-only">
                Press Enter or Space to reveal the lesson text and practice
                phrases
              </div>
            </div>
          )}
        </div>

        {/* Lesson Content - Only shown after reveal */}
        {textRevealed && (
          <>
            <div className="main-line-section">
              <h3>Main Line</h3>
              <div className="text-content">
                <p className="native-text">{lesson.mainLine.nativeText}</p>
                {transcriptVisible && (
                  <p className="gloss-text">{lesson.mainLine.gloss}</p>
                )}
                {lesson.mainLine.tips && (
                  <div className="tips">
                    <p>
                      <strong>Tip:</strong> {lesson.mainLine.tips}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Post-reveal controls */}
            <div className="post-reveal-controls">
              <button
                ref={replayAllButtonRef}
                className="replay-all-button"
                onClick={handleReplayAll}
                onKeyDown={handleKeyDown}
                aria-label="Replay all phrases"
                aria-describedby="replay-all-description"
              >
                🔄 Replay All
              </button>
              <div id="replay-all-description" className="sr-only">
                Press Enter or Space to replay all phrases in sequence
              </div>

              <TranscriptToggle
                ref={transcriptToggleRef}
                isVisible={transcriptVisible}
                onToggle={handleTranscriptToggle}
                className="transcript-toggle-control"
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="phrases-section">
              <h3>Practice Phrases</h3>
              <p className="phrase-hint">Tap a phrase to hear it again</p>
              <div className="phrases-list">
                {lesson.phrases.map((phrase, index) => (
                  <PhrasePlayer
                    key={phrase.id}
                    ref={index === 0 ? firstPhraseButtonRef : undefined}
                    phraseId={phrase.id}
                    nativeText={phrase.nativeText}
                    gloss={phrase.gloss}
                    tips={phrase.tips}
                    audio={phrase.audio}
                    isPlaying={
                      playbackState.isPlaying &&
                      playbackState.currentAudioId === phrase.audio.id
                    }
                    onPlay={handlePhrasePlay}
                    onStop={stopAudio}
                    className="phrase-player-item"
                    showGloss={transcriptVisible}
                    onKeyDown={handleKeyDown}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
