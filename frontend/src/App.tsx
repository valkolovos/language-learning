import React, { useState } from "react";
import "./App.css";
import { LessonContainer } from "./components/LessonContainer";
import { LessonService } from "./services/lessonService";

function App() {
  const [selectedLessonId, setSelectedLessonId] =
    useState<string>("meet-greet-001");
  const [availableLessons, setAvailableLessons] = useState<string[]>([]);

  React.useEffect(() => {
    const loadAvailableLessons = async () => {
      try {
        const lessons = await LessonService.getAvailableLessons();
        setAvailableLessons(lessons);
      } catch (error) {
        console.error("Failed to load available lessons:", error);
      }
    };

    loadAvailableLessons();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Language Learning</h1>
        <p>Listen-First Micro-Lesson Demo</p>
      </header>

      <main className="App-main">
        <div className="lesson-selector">
          <h2>Select a Lesson</h2>
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
        </div>

        <div className="lesson-demo">
          <h2>Lesson Content Demo</h2>
          <p>
            This demonstrates the content representation and loading mechanism.
          </p>
          <p>
            <strong>Next:</strong> Audio playback and reveal gate logic
          </p>

          <LessonContainer lessonId={selectedLessonId} />
        </div>
      </main>
    </div>
  );
}

export default App;
