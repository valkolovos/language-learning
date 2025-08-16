import { useState, useEffect, useRef, useCallback } from "react";
import { AudioPlaybackService } from "../services/audioPlaybackService";
import {
  AudioClip,
  AudioPlaybackState,
  AudioPlaybackEvent,
} from "../types/lesson";
import log from "../services/logger";

export const useAudioPlayback = () => {
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>({
    isPlaying: false,
    currentAudioId: null,
    playCount: 0,
    canReveal: false,
    error: null,
  });

  const audioService = useRef<AudioPlaybackService | null>(null);

  useEffect(() => {
    try {
      audioService.current = AudioPlaybackService.getInstance();

      const handlePlaybackEvent = (event: AudioPlaybackEvent) => {
        setPlaybackState(audioService.current!.getCurrentState());
      };

      audioService.current.addEventListener(handlePlaybackEvent);

      return () => {
        if (audioService.current) {
          audioService.current.removeEventListener(handlePlaybackEvent);
        }
      };
    } catch (error) {
      log.error("Failed to initialize audio service:", error);
    }
  }, []);

  const playAudio = useCallback(async (audioClip: AudioClip) => {
    if (!audioService.current) {
      throw new Error("Audio service not initialized");
    }

    try {
      await audioService.current.playAudio(audioClip);
    } catch (error) {
      log.error("Failed to play audio:", error);
      throw error;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioService.current) {
      audioService.current.stopAudio();
    }
  }, []);

  const resetPlayback = useCallback(() => {
    if (audioService.current) {
      audioService.current.resetPlayback();
    }
  }, []);

  const getCurrentState = useCallback(() => {
    if (audioService.current) {
      return audioService.current.getCurrentState();
    }
    return playbackState;
  }, [playbackState]);

  return {
    playbackState,
    playAudio,
    stopAudio,
    resetPlayback,
    getCurrentState,
  };
};
