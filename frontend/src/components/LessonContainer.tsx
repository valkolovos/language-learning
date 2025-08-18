import React, { useState, useEffect, useRef, useCallback } from "react";
import { Lesson, LessonLoadResult, AudioClip } from "../types/lesson";
import { LessonService } from "../services/lessonService";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { AudioPlayer } from "./AudioPlayer";
import { PhrasePlayer } from "./PhrasePlayer";
import { TranscriptToggle } from "./TranscriptToggle";
import { ProgressIndicator } from "./ProgressIndicator";
import { EventTrackingService } from "../services/eventTrackingService";
import log from "../services/logger";

interface LessonContainerProps {
  lessonId: string;
}

export const LessonContainer: React.FC<LessonContainerProps> = ({
  lessonId,
}) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        setError(result.error?.message || "Failed to load lesson");
      }
    } catch (err) {
      setError("Unexpected error occurred while loading lesson");
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
      // Play main line first, then phrases in sequence
      playAudio(lesson.mainLine.audio);
      // Award XP for replay all action
      setXp((prev) => prev + 25);
    }
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
          <p>{error}</p>
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
