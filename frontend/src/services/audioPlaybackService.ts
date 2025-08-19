import {
  AudioClip,
  AudioPlaybackState,
  AudioPlaybackEvent,
  isTTSAudioClip,
} from "../types/lesson";
import { createExtendedError } from "../utils/errorUtils";
import {
  AUDIO_IDS,
  AUDIO_SETTINGS,
  PLAYBACK_THRESHOLDS,
} from "../constants/audio";

export class AudioPlaybackService {
  private static instance: AudioPlaybackService;
  private speechSynthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;
  private currentAudioId: string | null = null;
  private playCount: number = 0;
  private canReveal: boolean = false;
  private error: string | null = null;
  private eventListeners: ((event: AudioPlaybackEvent) => void)[] = [];
  private mainLineAudioId: string = AUDIO_IDS.MAIN_LINE; // Configurable main line identifier

  private constructor() {
    // Check if Web Speech API is supported
    if (!window.speechSynthesis) {
      const userFriendlyMessage =
        "Speech synthesis is not supported in your browser.";
      const detailedMessage = `This feature requires a modern browser with speech synthesis support. Supported browsers include Chrome 33+, Safari 7+, Edge 79+, and Firefox 49+. Consider updating your browser or using a supported browser for the best experience.`;

      // Create error with user-friendly message and detailed info
      throw createExtendedError(
        userFriendlyMessage,
        userFriendlyMessage,
        detailedMessage,
        "https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#browser_compatibility",
      );
    }

    this.speechSynthesis = window.speechSynthesis;
  }

  static getInstance(): AudioPlaybackService {
    if (!AudioPlaybackService.instance) {
      AudioPlaybackService.instance = new AudioPlaybackService();
    }
    return AudioPlaybackService.instance;
  }

  /**
   * Play audio using text-to-speech
   * Note: This service only supports TTS-based audio clips
   */
  async playAudio(audioClip: AudioClip): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stopAudio();

      // Validate that this is a TTS audio clip
      if (!isTTSAudioClip(audioClip)) {
        throw new Error(
          `Cannot play pre-recorded audio clip '${audioClip.id}' with TTS service. Pre-recorded audio files are not yet supported in this implementation.`,
        );
      }

      // Create new utterance
      this.currentUtterance = new SpeechSynthesisUtterance(audioClip.text);

      // Configure TTS settings
      this.currentUtterance.lang = audioClip.language;
      this.currentUtterance.volume = audioClip.volume;
      this.currentUtterance.rate = AUDIO_SETTINGS.DEFAULT_RATE; // Slightly slower for language learning
      this.currentUtterance.pitch = AUDIO_SETTINGS.DEFAULT_PITCH;

      // Set up utterance event handlers
      this.currentUtterance.onstart = () =>
        this.handleSpeechStart(audioClip.id);
      this.currentUtterance.onend = () => this.handleSpeechEnd();
      this.currentUtterance.onerror = (event) => this.handleSpeechError(event);

      // Update state
      this.isPlaying = true;
      this.currentAudioId = audioClip.id;
      this.error = null;

      // Start speaking
      this.speechSynthesis.speak(this.currentUtterance);

      // Emit play started event
      this.emitEvent({
        type: "play_started",
        audioId: audioClip.id,
        timestamp: Date.now(),
        details: { text: audioClip.text, language: audioClip.language },
      });
    } catch (error) {
      this.error = `Failed to start audio playback: ${error}`;
      this.emitEvent({
        type: "play_error",
        audioId: audioClip.id,
        timestamp: Date.now(),
        details: { error: this.error },
      });
      throw new Error(this.error);
    }
  }

  /**
   * Stop current audio playback
   */
  stopAudio(): void {
    if (this.currentUtterance && this.isPlaying) {
      this.speechSynthesis.cancel();

      this.emitEvent({
        type: "play_aborted",
        audioId: this.currentAudioId || "unknown",
        timestamp: Date.now(),
      });
    }

    this.isPlaying = false;
    this.currentAudioId = null;
    this.currentUtterance = null;
  }

  /**
   * Get current playback state
   */
  getCurrentState(): AudioPlaybackState {
    return {
      isPlaying: this.isPlaying,
      currentAudioId: this.currentAudioId,
      playCount: this.playCount,
      canReveal: this.canReveal,
      error: this.error,
    };
  }

  /**
   * Reset playback state (used when changing lessons)
   */
  resetPlayback(): void {
    this.stopAudio();
    this.playCount = 0;
    this.canReveal = false;
    this.error = null;
    this.mainLineAudioId = AUDIO_IDS.MAIN_LINE; // Reset to default
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: AudioPlaybackEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: AudioPlaybackEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Set the main line audio identifier for this lesson
   *
   * @warning Changing the main line audio ID resets the play count for the previous
   * main line and starts fresh counting for the new main line. This affects the
   * reveal gate mechanism - text will only be revealed after the NEW main line
   * has been played completely at least 2 times.
   *
   * This method should be called when:
   * - Switching between different lessons that have different main phrases
   * - Changing the primary learning target within the same lesson
   * - Implementing lesson progression where the main focus changes
   *
   * @param audioId - The audio ID that represents the main line for the current lesson phase
   */
  setMainLineAudioId(audioId: string): void {
    // Only reset if the main line ID is actually changing
    if (this.mainLineAudioId !== audioId) {
      const previousMainLineId = this.mainLineAudioId;
      this.mainLineAudioId = audioId;
      // Reset play count and reveal state for the new main line
      this.playCount = 0;
      this.canReveal = false;

      // Emit event to notify listeners of the reset
      this.emitEvent({
        type: "main_line_changed",
        audioId: audioId,
        timestamp: Date.now(),
        details: {
          previousMainLineId: previousMainLineId,
          playCountReset: true,
        },
      });
    }
  }

  /**
   * Get the current main line audio identifier
   */
  getMainLineAudioId(): string {
    return this.mainLineAudioId;
  }

  // Private event handlers
  private handleSpeechStart(audioId: string): void {
    this.isPlaying = true;
    this.currentAudioId = audioId;
  }

  private handleSpeechEnd(): void {
    this.isPlaying = false;

    // Only count complete plays of the main line
    if (this.currentAudioId === this.mainLineAudioId) {
      this.playCount++;

      // Check if we can reveal text (after 2 complete plays)
      if (this.playCount >= PLAYBACK_THRESHOLDS.REVEAL_AFTER_PLAYS) {
        this.canReveal = true;
      }
    }

    this.emitEvent({
      type: "play_completed",
      audioId: this.currentAudioId || "unknown",
      timestamp: Date.now(),
      details: { playCount: this.playCount, canReveal: this.canReveal },
    });

    this.currentUtterance = null;
    this.currentAudioId = null;
  }

  private handleSpeechError(event: SpeechSynthesisErrorEvent): void {
    this.error = `TTS Error: ${event.error}`;
    this.isPlaying = false;
    this.currentUtterance = null;
    this.currentAudioId = null;

    this.emitEvent({
      type: "play_error",
      audioId: this.currentAudioId || "unknown",
      timestamp: Date.now(),
      details: { error: this.error },
    });
  }

  private emitEvent(event: AudioPlaybackEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        // Log error but continue processing other listeners
        console.error("Event listener error:", error);
        // Optionally, you could remove the failing listener here
        // const index = this.eventListeners.indexOf(listener);
        // if (index > -1) {
        //   this.eventListeners.splice(index, 1);
        // }
      }
    }
  }
}
