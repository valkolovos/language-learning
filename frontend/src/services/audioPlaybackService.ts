import {
  AudioPlaybackState,
  AudioPlaybackEvent,
  AudioClip,
} from "../types/lesson";

export class AudioPlaybackService {
  private static instance: AudioPlaybackService;
  private audioElement: HTMLAudioElement | null = null;
  private currentState: AudioPlaybackState = {
    isPlaying: false,
    currentAudioId: null,
    playCount: 0,
    canReveal: false,
    error: null,
  };
  private eventListeners: ((event: AudioPlaybackEvent) => void)[] = [];
  private mainLineAudioId: string | null = null;

  private constructor() {}

  static getInstance(): AudioPlaybackService {
    if (!AudioPlaybackService.instance) {
      AudioPlaybackService.instance = new AudioPlaybackService();
    }
    return AudioPlaybackService.instance;
  }

  /**
   * Initialize the service with the main line audio ID for play counting
   */
  initialize(mainLineAudioId: string): void {
    this.mainLineAudioId = mainLineAudioId;
    this.resetState();
  }

  /**
   * Get current playback state
   */
  getState(): AudioPlaybackState {
    return { ...this.currentState };
  }

  /**
   * Play an audio clip
   */
  async playAudio(audioClip: AudioClip): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stopAudio();

      // Create new audio element
      this.audioElement = new Audio();
      this.audioElement.src = audioClip.filename; // Will be resolved to full URL by caller
      this.audioElement.volume = audioClip.volume || 0.8;

      // Set up event listeners
      this.audioElement.addEventListener("loadstart", () => {
        this.currentState.isPlaying = true;
        this.currentState.currentAudioId = audioClip.id;
        this.currentState.error = null;
        this.emitEvent({
          type: "play_started",
          audioId: audioClip.id,
          timestamp: Date.now(),
        });
      });

      this.audioElement.addEventListener("ended", () => {
        this.handlePlayCompleted(audioClip.id);
      });

      this.audioElement.addEventListener("error", (e) => {
        this.handlePlayError(audioClip.id, e);
      });

      this.audioElement.addEventListener("abort", () => {
        this.handlePlayAborted(audioClip.id);
      });

      // Start playback
      await this.audioElement.play();
    } catch (error) {
      this.handlePlayError(audioClip.id, error);
    }
  }

  /**
   * Stop current audio playback
   */
  stopAudio(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }

    if (this.currentState.isPlaying) {
      this.currentState.isPlaying = false;
      this.currentState.currentAudioId = null;
    }
  }

  /**
   * Handle successful completion of audio playback
   */
  private handlePlayCompleted(audioId: string): void {
    this.currentState.isPlaying = false;
    this.currentState.currentAudioId = null;

    // Only count main line plays for the reveal gate
    if (audioId === this.mainLineAudioId) {
      this.currentState.playCount++;

      // Check if reveal gate should unlock
      if (this.currentState.playCount >= 2) {
        this.currentState.canReveal = true;
      }
    }

    this.emitEvent({
      type: "play_completed",
      audioId,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle audio playback errors
   */
  private handlePlayError(audioId: string, error: any): void {
    this.currentState.isPlaying = false;
    this.currentState.currentAudioId = null;
    this.currentState.error = `Failed to play audio: ${error.message || "Unknown error"}`;

    this.emitEvent({
      type: "play_error",
      audioId,
      timestamp: Date.now(),
      details: error,
    });
  }

  /**
   * Handle aborted audio playback
   */
  private handlePlayAborted(audioId: string): void {
    this.currentState.isPlaying = false;
    this.currentState.currentAudioId = null;

    this.emitEvent({
      type: "play_aborted",
      audioId,
      timestamp: Date.now(),
    });
  }

  /**
   * Reset playback state (useful for starting a new lesson)
   */
  resetState(): void {
    this.stopAudio();
    this.currentState = {
      isPlaying: false,
      currentAudioId: null,
      playCount: 0,
      canReveal: false,
      error: null,
    };
  }

  /**
   * Subscribe to playback events
   */
  subscribe(listener: (event: AudioPlaybackEvent) => void): () => void {
    this.eventListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit events to all subscribers
   */
  private emitEvent(event: AudioPlaybackEvent): void {
    this.eventListeners.forEach((listener) => listener(event));
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopAudio();
    this.eventListeners = [];
    this.mainLineAudioId = null;
  }
}
