import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AudioPlayer } from "../AudioPlayer";
import { AudioClip } from "../../types/lesson";

const mockAudioClip: AudioClip = {
  type: "tts",
  id: "test-audio",
  text: "Hello world",
  duration: 2.0,
  volume: 0.8,
  language: "en-US",
};

describe("AudioPlayer", () => {
  const defaultProps = {
    audioClip: mockAudioClip,
    isPlaying: false,
    onPlay: jest.fn(),
    onStop: jest.fn(),
    playCount: 0,
    canReveal: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders play button when not playing", () => {
    render(<AudioPlayer {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /play main lesson/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("renders stop button when playing", () => {
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);

    expect(
      screen.getByRole("button", { name: /stop audio/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Stop")).toBeInTheDocument();
  });

  it("shows correct status text for initial state", () => {
    render(<AudioPlayer {...defaultProps} />);

    expect(screen.getByText("Listen first to unlock text")).toBeInTheDocument();
  });

  it("shows play progress when playCount > 0", () => {
    render(<AudioPlayer {...defaultProps} playCount={1} />);

    expect(screen.getByText("Played 1/2 times")).toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("shows ready to reveal message when canReveal is true", () => {
    render(<AudioPlayer {...defaultProps} canReveal={true} />);

    expect(screen.getByText("Ready to reveal text!")).toBeInTheDocument();
  });

  it("shows error message when error exists", () => {
    const errorMessage = "Failed to load audio file";
    render(<AudioPlayer {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("calls onPlay when play button is clicked", () => {
    const onPlay = jest.fn();
    render(<AudioPlayer {...defaultProps} onPlay={onPlay} />);

    fireEvent.click(screen.getByRole("button", { name: /play main lesson/i }));

    expect(onPlay).toHaveBeenCalledWith(mockAudioClip);
  });

  it("calls onStop when stop button is clicked", () => {
    const onStop = jest.fn();
    render(<AudioPlayer {...defaultProps} isPlaying={true} onStop={onStop} />);

    fireEvent.click(screen.getByRole("button", { name: /stop audio/i }));

    expect(onStop).toHaveBeenCalled();
  });

  it("applies correct CSS classes based on state", () => {
    const { rerender } = render(<AudioPlayer {...defaultProps} />);

    // Initial state - should have base class
    let button = screen.getByRole("button");
    expect(button).toHaveClass("audio-player-button");

    // Playing state - should have playing class
    rerender(<AudioPlayer {...defaultProps} isPlaying={true} />);
    button = screen.getByRole("button");
    expect(button).toHaveClass("audio-player-button playing");

    // Unlocked state - should have unlocked class
    rerender(<AudioPlayer {...defaultProps} canReveal={true} />);
    button = screen.getByRole("button");
    expect(button).toHaveClass("audio-player-button unlocked");

    // Error state - should have error class
    rerender(<AudioPlayer {...defaultProps} error="Test error" />);
    button = screen.getByRole("button");
    expect(button).toHaveClass("audio-player-button error");
  });

  it("shows progress bar with correct width based on play count", () => {
    render(<AudioPlayer {...defaultProps} playCount={1} />);

    const progressFill = screen.getByTestId("progress-fill");
    expect(progressFill).toHaveStyle({ width: "50%" });
  });

  it("shows progress bar with correct width for 2 plays", () => {
    render(<AudioPlayer {...defaultProps} playCount={2} />);

    const progressFill = screen.getByTestId("progress-fill");
    expect(progressFill).toHaveStyle({ width: "100%" });
  });
});
