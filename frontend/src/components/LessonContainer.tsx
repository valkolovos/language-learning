import React, { useState, useEffect, useRef } from "react";
import { Lesson, LessonLoadResult } from "../types/lesson";
import { LessonService } from "../services/lessonService";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { AudioPlayer } from "./AudioPlayer";
import { EventTrackingService } from "../services/eventTrackingService";

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

  // Initialize services using refs to avoid dependency issues
  const eventTracking = useRef(EventTrackingService.getInstance());

  // Initialize audio playback hook - only when we have a lesson
  const { playbackState, playAudio, stopAudio, resetPlayback } =
    useAudioPlayback(lesson?.mainLine?.audio?.id || "temp-id");

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        setError(null);

        const result: LessonLoadResult =
          await LessonService.loadLesson(lessonId);

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
        if (process.env.NODE_ENV === "development") {
          console.error("Lesson loading error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, resetPlayback]); // Only depend on lessonId and resetPlayback

  // Handle text reveal
  const handleRevealText = () => {
    if (playbackState.canReveal) {
      setTextRevealed(true);
      // Track text revealed event
      eventTracking.current.trackTextRevealed(lessonId);
    }
  };

  // Handle main line audio play
  const handleMainLinePlay = (audioClip: any) => {
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
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
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
                <p className="gloss-text">{lesson.mainLine.gloss}</p>
                {lesson.mainLine.tips && (
                  <div className="tips">
                    <p>
                      <strong>Tip:</strong> {lesson.mainLine.tips}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="phrases-section">
              <h3>Practice Phrases</h3>
              <p className="phrase-hint">Tap a phrase to hear it again</p>
              <div className="phrases-list">
                {lesson.phrases.map((phrase, index) => (
                  <div key={phrase.id} className="phrase-item">
                    <h4>Phrase {index + 1}</h4>
                    <div className="phrase-content">
                      <p className="native-text">{phrase.nativeText}</p>
                      <p className="gloss-text">{phrase.gloss}</p>
                      {phrase.tips && (
                        <p className="tip-text">
                          <strong>Tip:</strong> {phrase.tips}
                        </p>
                      )}
                    </div>
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
