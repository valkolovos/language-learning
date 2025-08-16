import {
  AudioClip,
  AudioPlaybackState,
  AudioPlaybackEvent,
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
      throw new Error("Web Speech API not supported in this browser");
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
   */
  async playAudio(audioClip: AudioClip): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stopAudio();

      // Create new utterance
      this.currentUtterance = new SpeechSynthesisUtterance(audioClip.text);

      // Configure TTS settings
      this.currentUtterance.lang =
        audioClip.language || AUDIO_SETTINGS.DEFAULT_LANGUAGE;
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
   * @param audioId - The audio ID that represents the main line
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
