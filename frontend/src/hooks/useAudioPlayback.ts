import { useState, useEffect, useCallback, useRef } from "react";
import { AudioPlaybackService } from "../services/audioPlaybackService";
import {
  AudioPlaybackState,
  AudioPlaybackEvent,
  AudioClip,
} from "../types/lesson";

export const useAudioPlayback = (mainLineAudioId: string) => {
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>({
    isPlaying: false,
    currentAudioId: null,
    playCount: 0,
    canReveal: false,
    error: null,
  });

  const audioService = useRef<AudioPlaybackService>(
    AudioPlaybackService.getInstance(),
  );
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize audio service when component mounts
  useEffect(() => {
    const service = audioService.current;
    service.initialize(mainLineAudioId);

    // Subscribe to playback events
    const unsubscribe = service.subscribe((event: AudioPlaybackEvent) => {
      // Update local state based on service state
      setPlaybackState(service.getState());
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      service.destroy();
    };
  }, [mainLineAudioId]);

  // Play audio function
  const playAudio = useCallback(async (audioClip: AudioClip) => {
    try {
      await audioService.current.playAudio(audioClip);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to play audio:", error);
      }
    }
  }, []);

  // Stop audio function
  const stopAudio = useCallback(() => {
    audioService.current.stopAudio();
  }, []);

  // Reset playback state
  const resetPlayback = useCallback(() => {
    audioService.current.resetState();
    setPlaybackState(audioService.current.getState());
  }, []);

  // Get current state
  const getCurrentState = useCallback(() => {
    return audioService.current.getState();
  }, []);

  return {
    playbackState,
    playAudio,
    stopAudio,
    resetPlayback,
    getCurrentState,
  };
};
