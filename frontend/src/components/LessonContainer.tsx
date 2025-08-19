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
  }, [lessonId, resetPlayback]);

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
    }
  };

  // Handle transcript toggle
  const handleTranscriptToggle = () => {
    setTranscriptVisible((prev) => !prev);
  };

  // Handle XP breakdown toggle
  const handleXpBreakdownToggle = () => {
    setShowXpBreakdown((prev) => !prev);
  };

  // Handle phrase replay
  const handlePhrasePlay = (audioClip: AudioClip) => {
    playAudio(audioClip);
    // Track phrase replay event
    eventTracking.current.trackPhraseReplay(audioClip.id, lessonId);
    // Award XP for phrase replay
    setXp((prev) => prev + 10);
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
      } catch (error) {
        log.error("Error during replay all:", error);
      }
    }
  };

  // Helper function to play audio clips in sequence
  const playAudioSequence = (audioClips: AudioClip[]) => {
    if (audioClips.length === 0) return;

    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex >= audioClips.length) return;

      const currentClip = audioClips[currentIndex];
      playAudio(currentClip);
      currentIndex++;
    };

    // Listen for audio completion events to trigger next audio
    const handleAudioComplete = (event: AudioPlaybackEvent) => {
      if (event.type === "play_completed") {
        setTimeout(playNext, 500); // Small delay between audio clips for better UX
      }
    };

    // Add temporary event listener
    const audioService = AudioPlaybackService.getInstance();
    audioService.addEventListener(handleAudioComplete);

    // Start the sequence
    playNext();

    // Clean up listener after sequence completes
    setTimeout(() => {
      audioService.removeEventListener(handleAudioComplete);
    }, audioClips.length * 5000); // Generous timeout for cleanup
  };

  // Handle main line audio play
  const handleMainLinePlay = (audioClip: AudioClip) => {
    playAudio(audioClip);
    // Track audio play event
    eventTracking.current.trackAudioPlay(audioClip.id, lessonId);
  };

  // Handle main line audio stop
  const handleMainLineStop = () => {
    stopAudio();
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
            />
          </div>

          {/* Reveal Button - Only shown when gate is unlocked */}
          {playbackState.canReveal && !textRevealed && (
            <div className="reveal-section">
              <button
                className="reveal-button"
                onClick={handleRevealText}
                aria-label="Reveal lesson text"
              >
                ✨ Show Text
              </button>
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
                className="replay-all-button"
                onClick={handleReplayAll}
                aria-label="Replay all phrases"
              >
                🔄 Replay All
              </button>

              <TranscriptToggle
                isVisible={transcriptVisible}
                onToggle={handleTranscriptToggle}
                className="transcript-toggle-control"
              />
            </div>

            <div className="phrases-section">
              <h3>Practice Phrases</h3>
              <p className="phrase-hint">Tap a phrase to hear it again</p>
              <div className="phrases-list">
                {lesson.phrases.map((phrase, index) => (
                  <PhrasePlayer
                    key={phrase.id}
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
