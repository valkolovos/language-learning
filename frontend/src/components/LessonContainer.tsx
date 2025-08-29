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

import { EventTrackingService } from "../services/eventTrackingService";
import { AudioPlaybackService } from "../services/audioPlaybackService";
import {
  createExtendedError,
  getUserFriendlyMessage,
} from "../utils/errorUtils";
import { MICROCOPY } from "../constants/microcopy";
import {
  PROGRESS_WEIGHTS,
  XP_REWARDS,
  PROGRESS_THRESHOLDS,
} from "../constants/progress";
import log from "../services/logger";

interface LessonContainerProps {
  lessonId: string;
  onXpChange?: (xp: number) => void;
  onProgressChange?: (progress: number) => void;
}

export const LessonContainer: React.FC<LessonContainerProps> = ({
  lessonId,
  onXpChange,
  onProgressChange,
}) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ExtendedError | null>(null);
  const [textRevealed, setTextRevealed] = useState(false);
  const [transcriptVisible, setTranscriptVisible] = useState(true);
  const [xp, setXp] = useState(0);
  const [currentlyPlayingPhraseId, setCurrentlyPlayingPhraseId] = useState<
    string | null
  >(null);

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

  // Phrase player refs for scrolling
  const phraseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Screen reader announcements
  const [announcement, setAnnouncement] = useState("");

  // Track component mount state to prevent memory leaks
  const isMountedRef = useRef(true);

  // Announce to screen readers
  const announceToScreenReader = useCallback((message: string) => {
    if (!isMountedRef.current) return;

    setAnnouncement(message);
    // Clear announcement after a short delay to allow screen reader to process
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        setAnnouncement("");
      }
    }, 100);

    // Store timeout ID for cleanup
    return timeoutId;
  }, []);

  // Announce to screen readers without returning cleanup (for event handlers)
  const announceToScreenReaderImmediate = useCallback((message: string) => {
    if (!isMountedRef.current) return;

    setAnnouncement(message);
    // Clear announcement after a short delay to allow screen reader to process
    setTimeout(() => {
      if (isMountedRef.current) {
        setAnnouncement("");
      }
    }, 100);

    // Cleanup is handled internally, no return value needed
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

  // Focus management when state changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    let announcementTimeoutId: NodeJS.Timeout | undefined;

    if (playbackState.canReveal && !textRevealed) {
      // Announce that reveal is available and focus the reveal button
      announcementTimeoutId = announceToScreenReader(
        MICROCOPY.SCREEN_READER_REVEAL_AVAILABLE,
      );
      // Small delay to ensure the reveal button is rendered
      timeoutId = setTimeout(() => {
        if (isMountedRef.current && revealButtonRef.current) {
          revealButtonRef.current.focus();
        }
      }, 100);
    }

    // Return cleanup function to clear timeouts when effect is cleaned up
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (announcementTimeoutId) {
        clearTimeout(announcementTimeoutId);
      }
    };
  }, [playbackState.canReveal, textRevealed, announceToScreenReader]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    let announcementTimeoutId: NodeJS.Timeout | undefined;

    if (textRevealed) {
      // Announce that text is revealed and focus the first phrase button
      announcementTimeoutId = announceToScreenReader(
        MICROCOPY.SCREEN_READER_TEXT_REVEALED,
      );
      // Small delay to ensure phrase buttons are rendered
      timeoutId = setTimeout(() => {
        if (isMountedRef.current && firstPhraseButtonRef.current) {
          firstPhraseButtonRef.current.focus();
        }
      }, 100);
    }

    // Return cleanup function to clear timeouts when effect is cleaned up
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (announcementTimeoutId) {
        clearTimeout(announcementTimeoutId);
      }
    };
  }, [textRevealed, announceToScreenReader]);

  // Announce audio playback state changes
  useEffect(() => {
    let announcementTimeoutId: NodeJS.Timeout | undefined;

    if (playbackState.isPlaying) {
      announcementTimeoutId = announceToScreenReader(
        MICROCOPY.SCREEN_READER_AUDIO_PLAYING,
      );
    } else if (playbackState.currentAudioId) {
      announcementTimeoutId = announceToScreenReader(
        MICROCOPY.SCREEN_READER_AUDIO_STOPPED,
      );
    }

    // Return cleanup function to clear announcement timeout when effect is cleaned up
    return () => {
      if (announcementTimeoutId) {
        clearTimeout(announcementTimeoutId);
      }
    };
  }, [
    playbackState.isPlaying,
    playbackState.currentAudioId,
    announceToScreenReader,
  ]);

  // Notify parent component of XP changes
  useEffect(() => {
    onXpChange?.(xp);
  }, [xp, onXpChange]);

  // Calculate and notify parent of lesson progress
  useEffect(() => {
    if (!lesson) {
      onProgressChange?.(0);
      return;
    }

    let progress = 0;

    // Main line progress (PROGRESS_WEIGHTS.MAIN_LINE.TOTAL_WEIGHT% of total)
    if (textRevealed) {
      progress += PROGRESS_WEIGHTS.MAIN_LINE.TOTAL_WEIGHT;
    } else if (playbackState.playCount > 0) {
      progress +=
        (playbackState.playCount / PROGRESS_THRESHOLDS.REVEAL_AFTER_PLAYS) *
        PROGRESS_WEIGHTS.MAIN_LINE.TOTAL_WEIGHT;
    }

    // Phrase interaction progress (PROGRESS_WEIGHTS.PHRASE_INTERACTIONS.TOTAL_WEIGHT% of total)
    if (textRevealed) {
      // Base bonus for revealing text (PROGRESS_WEIGHTS.PHRASE_INTERACTIONS.REVEAL_BONUS%)
      progress += PROGRESS_WEIGHTS.PHRASE_INTERACTIONS.REVEAL_BONUS;

      // Additional progress for phrase interactions (up to PROGRESS_WEIGHTS.PHRASE_INTERACTIONS.TOTAL_WEIGHT - PROGRESS_WEIGHTS.PHRASE_INTERACTIONS.REVEAL_BONUS%)
      // Each phrase interaction adds PROGRESS_WEIGHTS.PHRASE_INTERACTIONS.PER_PHRASE_WEIGHT% progress
      const phraseProgress = Math.min(
        PROGRESS_WEIGHTS.PHRASE_INTERACTIONS.TOTAL_WEIGHT -
          PROGRESS_WEIGHTS.PHRASE_INTERACTIONS.REVEAL_BONUS,
        ((xp - XP_REWARDS.TEXT_REVEAL) / XP_REWARDS.PHRASE_REPLAY) *
          PROGRESS_WEIGHTS.PHRASE_INTERACTIONS.PER_PHRASE_WEIGHT,
      );
      progress += phraseProgress;
    }

    onProgressChange?.(
      Math.min(PROGRESS_THRESHOLDS.MAX_PROGRESS, Math.round(progress)),
    );
  }, [lesson, textRevealed, playbackState.playCount, xp, onProgressChange]);

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
        announceToScreenReaderImmediate(MICROCOPY.SCREEN_READER_LESSON_LOADED);
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
  }, [lessonId, resetPlayback, announceToScreenReaderImmediate]);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle text reveal
  const handleRevealText = () => {
    if (playbackState.canReveal) {
      setTextRevealed(true);
      // Track text revealed event
      eventTracking.current.trackTextRevealed(lessonId);
      // Award XP for revealing text
      setXp((prev) => prev + XP_REWARDS.TEXT_REVEAL);

      // Announce reveal action
      announceToScreenReaderImmediate(
        MICROCOPY.SCREEN_READER_TEXT_REVEALED_ACTION,
      );
    }
  };

  // Handle transcript toggle
  const handleTranscriptToggle = () => {
    setTranscriptVisible((prev) => !prev);
    // Announce transcript state change
    announceToScreenReaderImmediate(
      transcriptVisible
        ? MICROCOPY.SCREEN_READER_TRANSLATIONS_HIDDEN
        : MICROCOPY.SCREEN_READER_TRANSLATIONS_SHOWN,
    );
  };

  // Handle phrase replay
  const handlePhrasePlay = (audioClip: AudioClip) => {
    playAudio(audioClip);
    // Track phrase replay event
    eventTracking.current.trackPhraseReplay(audioClip.id, lessonId);
    // Award XP for phrase replay
    setXp((prev) => prev + XP_REWARDS.PHRASE_REPLAY);

    // Announce phrase playback
    announceToScreenReaderImmediate(`Playing phrase: ${audioClip.id}`);
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
        setXp((prev) => prev + XP_REWARDS.REPLAY_ALL);

        // Announce replay all action
        announceToScreenReaderImmediate("Replaying all phrases in sequence");
      } catch (error) {
        log.error("Error during replay all:", error);
      }
    }
  };

  // Helper function to scroll to a phrase
  const scrollToPhrase = useCallback((phraseId: string) => {
    const phraseElement = phraseRefs.current[phraseId];
    if (phraseElement) {
      phraseElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, []);

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
      setCurrentlyPlayingPhraseId(null);
    };

    const playNext = () => {
      if (currentIndex >= audioClips.length || !isSequenceActive) {
        // Sequence completed or was cancelled
        setCurrentlyPlayingPhraseId(null);
        cleanup();
        return;
      }

      const currentClip = audioClips[currentIndex];

      // Update currently playing phrase for visual feedback and scrolling
      if (currentIndex === 0) {
        // Playing main line - don't highlight any phrase
        setCurrentlyPlayingPhraseId(null);
      } else {
        // Playing a phrase - highlight and scroll to it
        const phraseIndex = currentIndex - 1; // Subtract 1 because first clip is main line
        if (lesson && lesson.phrases[phraseIndex]) {
          const phraseId = lesson.phrases[phraseIndex].id;
          setCurrentlyPlayingPhraseId(phraseId);
          scrollToPhrase(phraseId);
        }
      }

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
    announceToScreenReaderImmediate("Playing main line audio");
  };

  // Handle main line audio stop
  const handleMainLineStop = () => {
    stopAudio();
    // Announce main line stopped
    announceToScreenReaderImmediate("Main line audio stopped");
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

      <div className="lesson-content">
        {/* Listen-First Section */}
        <div className="listen-first-section">
          <div className="listen-hint">
            <h3>{MICROCOPY.LISTEN_FIRST_HEADING}</h3>
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
                {MICROCOPY.SHOW_TEXT}
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
                🔄 {MICROCOPY.REPLAY_ALL_BUTTON_LABEL}
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
              <p className="phrase-hint">{MICROCOPY.PHRASE_REPLAY_HINT}</p>
              <div className="phrases-list">
                {lesson.phrases.map((phrase, index) => (
                  <div
                    key={phrase.id}
                    ref={(el) => {
                      phraseRefs.current[phrase.id] = el;
                    }}
                    className={`phrase-player-wrapper ${
                      currentlyPlayingPhraseId === phrase.id
                        ? "playing-in-sequence"
                        : ""
                    }`}
                  >
                    <PhrasePlayer
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
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
