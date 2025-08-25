import React, { useState } from "react";
import "./App.css";
import { LessonContainer } from "./components/LessonContainer";
import { LessonService } from "./services/lessonService";
import { ErrorBoundary } from "./components/ErrorBoundary";
import log from "./services/logger";

function App() {
  const [selectedLessonId, setSelectedLessonId] =
    useState<string>("meet-greet-001");
  const [availableLessons, setAvailableLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(0);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const loadAvailableLessons = async () => {
      try {
        const lessons = await LessonService.getAvailableLessons();
        setAvailableLessons(lessons);
      } catch (error) {
        log.error("Failed to load available lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableLessons();
  }, []);

  // Handle scroll events for header collapse
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); // Start collapsing after 50px scroll
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="App">
        <header className={`App-header ${isScrolled ? "scrolled" : ""}`}>
          <h1>EarFirst</h1>
          <p>Loading...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className={`App-header ${isScrolled ? "scrolled" : ""}`}>
        <h1>EarFirst</h1>
        <p>Listen-First Micro-Lesson Demo</p>

        <div className="header-progress">
          <div className="header-xp-counter">
            <span className="header-xp-icon">⭐</span>
            <span className="header-xp-value">{xp}</span>
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              XP
            </span>
          </div>

          <div className="header-progress-bar-container">
            <div className="header-progress-bar">
              <div
                className="header-progress-fill"
                style={{ width: `${lessonProgress}%` }}
                aria-label={`Lesson progress: ${lessonProgress}% complete`}
              />
            </div>
            <span className="header-progress-text">{lessonProgress}%</span>
          </div>
        </div>
      </header>

      <main className="App-main">
        <div className="lesson-selector">
          <h2>Select a Lesson</h2>
          {availableLessons && availableLessons.length > 0 && (
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="lesson-dropdown"
            >
              {availableLessons.map((lessonId) => (
                <option key={lessonId} value={lessonId}>
                  {lessonId === "meet-greet-001"
                    ? "Meet & Greet (Greek)"
                    : lessonId}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="lesson-demo lesson-container">
          <h2>Lesson Content Demo</h2>
          <p>
            This demonstrates the content representation and loading mechanism.
          </p>
          <p>
            <strong>Next:</strong> Audio playback and reveal gate logic
          </p>

          <ErrorBoundary>
            <LessonContainer
              lessonId={selectedLessonId}
              onXpChange={setXp}
              onProgressChange={setLessonProgress}
            />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default App;
