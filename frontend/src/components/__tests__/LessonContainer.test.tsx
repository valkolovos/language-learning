import React from "react";
import { render, screen } from "@testing-library/react";
import { LessonContainer } from "../LessonContainer";
import { LessonService } from "../../services/lessonService";

// Mock the LessonService
jest.mock("../../services/lessonService");
const mockLessonService = LessonService as jest.Mocked<typeof LessonService>;

describe("LessonContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state initially", () => {
    // Mock a delayed response to keep component in loading state
    (mockLessonService.loadLesson as jest.Mock).mockImplementation(
      () => new Promise(() => {}), // Never resolves, keeps loading state
    );

    render(<LessonContainer lessonId="test-lesson" />);

    expect(screen.getByText("Loading lesson...")).toBeInTheDocument();
  });

  it("displays lesson content after successful load", async () => {
    const mockLesson = {
      id: "test-lesson",
      title: "Test Lesson",
      mainLine: {
        nativeText: "Hola",
        gloss: "Hello",
        audio: { id: "audio-1", filename: "hola.mp3", duration: 1.0 },
      },
      phrases: [
        {
          id: "phrase-1",
          nativeText: "Hola",
          gloss: "Hello",
          audio: { id: "audio-2", filename: "hola.mp3" },
        },
      ],
    };

    (mockLessonService.loadLesson as jest.Mock).mockResolvedValue({
      success: true,
      lesson: mockLesson,
    });

    render(<LessonContainer lessonId="test-lesson" />);

    // Wait for the content to appear
    expect(await screen.findByText("Test Lesson")).toBeInTheDocument();
    expect(screen.getByText("Main Line")).toBeInTheDocument();
    expect(screen.getByText("Phrases (1)")).toBeInTheDocument();
  });

  it("shows error message when lesson loading fails", async () => {
    (mockLessonService.loadLesson as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        type: "invalid_structure",
        message: "Lesson not found",
      },
    });

    render(<LessonContainer lessonId="invalid-lesson" />);

    // Wait for the error to appear
    expect(await screen.findByText("Error Loading Lesson")).toBeInTheDocument();
    expect(screen.getByText("Lesson not found")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("calls LessonService.loadLesson with correct lessonId", () => {
    (mockLessonService.loadLesson as jest.Mock).mockResolvedValue({
      success: true,
      lesson: {
        id: "test-lesson",
        title: "Test Lesson",
        mainLine: {
          nativeText: "Test",
          gloss: "Test",
          audio: { id: "audio-1", filename: "test.mp3" },
        },
        phrases: [],
      },
    });

    render(<LessonContainer lessonId="test-lesson" />);

    expect(mockLessonService.loadLesson).toHaveBeenCalledWith("test-lesson");
  });
});
