import React, { useState, useEffect } from "react";
import { Lesson, LessonLoadResult } from "../types/lesson";
import { LessonService } from "../services/lessonService";

interface LessonContainerProps {
  lessonId: string;
}

export const LessonContainer: React.FC<LessonContainerProps> = ({
  lessonId,
}) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        setError(null);

        const result: LessonLoadResult =
          await LessonService.loadLesson(lessonId);

        if (result.success && result.lesson) {
          setLesson(result.lesson);
        } else {
          setError(result.error?.message || "Failed to load lesson");
        }
      } catch (err) {
        setError("Unexpected error occurred while loading lesson");
        console.error("Lesson loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

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
        <div className="main-line-section">
          <h3>Main Line</h3>
          <div className="audio-info">
            <p>
              <strong>Audio:</strong> {lesson.mainLine.audio.filename}
            </p>
            {lesson.mainLine.audio.duration && (
              <p>
                <strong>Duration:</strong> {lesson.mainLine.audio.duration}s
              </p>
            )}
            {lesson.mainLine.audio.volume && (
              <p>
                <strong>Volume:</strong>{" "}
                {Math.round(lesson.mainLine.audio.volume * 100)}%
              </p>
            )}
          </div>
          {lesson.mainLine.tips && (
            <div className="tips">
              <p>
                <strong>Tip:</strong> {lesson.mainLine.tips}
              </p>
            </div>
          )}
        </div>

        <div className="phrases-section">
          <h3>Phrases ({lesson.phrases.length})</h3>
          <div className="phrases-list">
            {lesson.phrases.map((phrase, index) => (
              <div key={phrase.id} className="phrase-item">
                <h4>Phrase {index + 1}</h4>
                <div className="phrase-content">
                  <p>
                    <strong>Native:</strong> {phrase.nativeText}
                  </p>
                  <p>
                    <strong>Gloss:</strong> {phrase.gloss}
                  </p>
                  <p>
                    <strong>Audio:</strong> {phrase.audio.filename}
                  </p>
                  {phrase.audio.duration && (
                    <p>
                      <strong>Duration:</strong> {phrase.audio.duration}s
                    </p>
                  )}
                  {phrase.tips && (
                    <p>
                      <strong>Tip:</strong> {phrase.tips}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
