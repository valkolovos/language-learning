import {
  AudioClip,
  AudioPlaybackState,
  AudioPlaybackEvent,
  isTTSAudioClip,
} from "../types/lesson";
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
      const errorMessage =
        "Web Speech API not supported in this browser. " +
        "This feature requires a modern browser with speech synthesis support. " +
        "Supported browsers include Chrome 33+, Safari 7+, Edge 79+, and Firefox 49+. " +
        "Consider updating your browser or using a supported browser for the best experience.";
      throw new Error(errorMessage);
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
          `Cannot play pre-recorded audio clip '${audioClip.id}' with TTS service. Use audio playback service instead.`,
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
      this.error = `Failed to start TTS: ${error}`;
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
   * This method should be called when:
   * - Switching between different lessons that have different main phrases
   * - Changing the primary learning target within the same lesson
   * - Implementing lesson progression where the main focus changes
   *
   * IMPORTANT: Changing the main line audio ID resets the play count for the previous
   * main line and starts fresh counting for the new main line. This affects the
   * reveal gate mechanism - text will only be revealed after the NEW main line
   * has been played completely at least 2 times.
   *
   * @param audioId - The audio ID that represents the main line for the current lesson phase
   */
  setMainLineAudioId(audioId: string): void {
    this.mainLineAudioId = audioId;
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
    this.eventListeners.forEach((listener) => listener(event));
  }
}
