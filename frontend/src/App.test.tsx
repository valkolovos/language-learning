import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

// Mock the useAudioPlayback hook to prevent Web Speech API errors
jest.mock("./hooks/useAudioPlayback", () => ({
  useAudioPlayback: () => ({
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
  }),
}));

// Mock the LessonService to prevent actual API calls
jest.mock("./services/lessonService", () => ({
  LessonService: {
    loadLesson: jest.fn(),
    getAvailableLessons: jest.fn().mockReturnValue(["meet-greet-001"]),
  },
}));

// Mock the logger to prevent console errors
jest.mock("./services/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

test("renders app without crashing", async () => {
  const { container } = render(<App />);

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  expect(container).toBeTruthy();
});

test("app contains title text", async () => {
  render(<App />);

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  expect(screen.getByText("EarFirst")).toBeInTheDocument();
});

test("app shows lesson selector", async () => {
  render(<App />);

  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  expect(screen.getByText("Select a Lesson")).toBeInTheDocument();
  expect(screen.getByText("Lesson Content Demo")).toBeInTheDocument();
});

test("app shows loading state initially", () => {
  render(<App />);
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});
