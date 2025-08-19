import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhrasePlayer } from "../PhrasePlayer";
import { AudioClip } from "../../types/lesson";

describe("PhrasePlayer", () => {
  const mockOnPlay = jest.fn();
  const mockOnStop = jest.fn();

  const mockTTSAudio: AudioClip = {
    id: "test-audio",
    type: "tts",
    text: "Hello",
    language: "en-US",
    duration: 1.5,
    volume: 0.8,
  };

  const mockPreRecordedAudio: AudioClip = {
    id: "test-audio-2",
    type: "pre_recorded",
    filename: "hello.mp3",
    duration: 2.0,
    volume: 1.0,
  };

  const defaultProps = {
    phraseId: "phrase-1",
    nativeText: "Hello",
    gloss: "Greeting",
    audio: mockTTSAudio,
    isPlaying: false,
    onPlay: mockOnPlay,
    onStop: mockOnStop,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders phrase text and gloss correctly", () => {
    render(<PhrasePlayer {...defaultProps} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Greeting")).toBeInTheDocument();
  });

  it("renders without gloss when showGloss is false", () => {
    render(<PhrasePlayer {...defaultProps} showGloss={false} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.queryByText("Greeting")).not.toBeInTheDocument();
  });

  it("renders tips when provided", () => {
    render(<PhrasePlayer {...defaultProps} tips="This is a greeting" />);

    expect(screen.getByText("Tip:")).toBeInTheDocument();
    expect(screen.getByText("This is a greeting")).toBeInTheDocument();
  });

  it("does not render tips when not provided", () => {
    render(<PhrasePlayer {...defaultProps} />);

    expect(screen.queryByText(/Tip:/)).not.toBeInTheDocument();
  });

  it("shows play button when not playing", () => {
    render(<PhrasePlayer {...defaultProps} isPlaying={false} />);

    const button = screen.getByRole("button", {
      name: /play phrase phrase: hello/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Play");
    expect(button).toHaveTextContent("▶️");
  });

  it("shows stop button when playing", () => {
    render(<PhrasePlayer {...defaultProps} isPlaying={true} />);

    const button = screen.getByRole("button", {
      name: /stop audio phrase: hello/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Stop");
    expect(button).toHaveTextContent("⏹️");
  });

  it("calls onPlay with audio clip when play button is clicked", () => {
    render(<PhrasePlayer {...defaultProps} isPlaying={false} />);

    const playButton = screen.getByRole("button", {
      name: /play phrase phrase: hello/i,
    });
    fireEvent.click(playButton);

    expect(mockOnPlay).toHaveBeenCalledTimes(1);
    expect(mockOnPlay).toHaveBeenCalledWith(mockTTSAudio);
    expect(mockOnStop).not.toHaveBeenCalled();
  });

  it("calls onStop when stop button is clicked", () => {
    render(<PhrasePlayer {...defaultProps} isPlaying={true} />);

    const stopButton = screen.getByRole("button", {
      name: /stop audio phrase: hello/i,
    });
    fireEvent.click(stopButton);

    expect(mockOnStop).toHaveBeenCalledTimes(1);
    expect(mockOnPlay).not.toHaveBeenCalled();
  });

  it("applies correct CSS classes when not playing", () => {
    render(<PhrasePlayer {...defaultProps} isPlaying={false} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("phrase-player-button");
    expect(button).not.toHaveClass("playing");
  });

  it("applies correct CSS classes when playing", () => {
    render(<PhrasePlayer {...defaultProps} isPlaying={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("phrase-player-button", "playing");
  });

  it("applies custom className", () => {
    render(<PhrasePlayer {...defaultProps} className="custom-class" />);

    const container = screen.getByTestId("phrase-player");
    expect(container).toHaveClass("phrase-player", "custom-class");
  });

  it("shows playing status when playing", () => {
    render(<PhrasePlayer {...defaultProps} isPlaying={true} />);

    const status = screen.getByText("Playing: Hello");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("hides playing status when not playing", () => {
    render(<PhrasePlayer {...defaultProps} isPlaying={false} />);

    const status = screen.queryByText(/Playing:/);
    expect(status).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<PhrasePlayer {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Play phrase phrase: Hello");
    expect(button).toHaveAttribute(
      "aria-describedby",
      "phrase-phrase-1-status",
    );

    const statusElement = screen.getByTestId("phrase-status");
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute("aria-live", "polite");
    expect(statusElement).toHaveAttribute("aria-hidden", "true");
  });

  it("works with pre-recorded audio clip", () => {
    render(<PhrasePlayer {...defaultProps} audio={mockPreRecordedAudio} />);

    const playButton = screen.getByRole("button", {
      name: /play phrase phrase: hello/i,
    });
    fireEvent.click(playButton);

    expect(mockOnPlay).toHaveBeenCalledWith(mockPreRecordedAudio);
  });

  it("handles long phrase text correctly", () => {
    const longText =
      "This is a very long phrase that might wrap to multiple lines in the UI";
    render(<PhrasePlayer {...defaultProps} nativeText={longText} />);

    expect(screen.getByText(longText)).toBeInTheDocument();

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      `Play phrase phrase: ${longText}`,
    );
  });

  it("handles special characters in phrase text", () => {
    const specialText = "¡Hola! ¿Cómo estás? 😊";
    render(<PhrasePlayer {...defaultProps} nativeText={specialText} />);

    expect(screen.getByText(specialText)).toBeInTheDocument();
  });

  it("maintains button state consistency during rapid clicks", () => {
    const { rerender } = render(
      <PhrasePlayer {...defaultProps} isPlaying={false} />,
    );

    const button = screen.getByRole("button");

    // Click play
    fireEvent.click(button);
    expect(mockOnPlay).toHaveBeenCalledTimes(1);

    // Update to playing state
    rerender(<PhrasePlayer {...defaultProps} isPlaying={true} />);
    expect(button).toHaveTextContent("Stop");

    // Click stop
    fireEvent.click(button);
    expect(mockOnStop).toHaveBeenCalledTimes(1);

    // Update back to not playing
    rerender(<PhrasePlayer {...defaultProps} isPlaying={false} />);
    expect(button).toHaveTextContent("Play");
  });

  describe("edge cases", () => {
    it("handles empty string phrases gracefully", () => {
      render(<PhrasePlayer {...defaultProps} nativeText="" gloss="" />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Play phrase phrase: ");
    });

    it("handles undefined tips gracefully", () => {
      render(<PhrasePlayer {...defaultProps} tips={undefined} />);

      expect(screen.queryByText(/Tip:/)).not.toBeInTheDocument();
    });

    it("handles missing className gracefully", () => {
      render(<PhrasePlayer {...defaultProps} className={undefined} />);

      const container = screen.getByTestId("phrase-player");
      expect(container).toHaveClass("phrase-player");
    });
  });
});
