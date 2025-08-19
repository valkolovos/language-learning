import log from "./logger";

// Define specific detail types for each event type
export interface LessonStartedDetails {
  difficulty?: string;
  estimatedDuration?: number;
}

export interface AudioPlayDetails {
  duration?: number;
  language?: string;
  volume?: number;
}

export interface TextRevealedDetails {
  playCount: number;
  timeToReveal?: number;
}

export interface PhraseReplayDetails {
  phraseIndex: number;
  replayCount: number;
}

// Union type for all possible event details
export type EventDetails =
  | LessonStartedDetails
  | AudioPlayDetails
  | TextRevealedDetails
  | PhraseReplayDetails
  | Record<string, unknown>; // Fallback for additional properties

export interface TrackedEvent {
  type: "lesson_started" | "audio_play" | "text_revealed" | "phrase_replay";
  timestamp: number;
  lessonId?: string;
  audioId?: string;
  phraseId?: string;
  details?: EventDetails;
}

export class EventTrackingService {
  private static instance: EventTrackingService;
  private events: TrackedEvent[] = [];
  private maxEvents: number = 100; // Keep last 100 events in memory
  private pruneThreshold: number = 120; // Start pruning when we exceed this threshold

  private constructor() {}

  static getInstance(): EventTrackingService {
    if (!EventTrackingService.instance) {
      EventTrackingService.instance = new EventTrackingService();
    }
    return EventTrackingService.instance;
  }

  /**
   * Track a lesson started event
   */
  trackLessonStarted(lessonId: string): void {
    this.addEvent({
      type: "lesson_started",
      timestamp: Date.now(),
      lessonId,
    });
  }

  /**
   * Track an audio play event
   */
  trackAudioPlay(audioId: string, lessonId?: string): void {
    this.addEvent({
      type: "audio_play",
      timestamp: Date.now(),
      audioId,
      lessonId,
    });
  }

  /**
   * Track text revealed event
   */
  trackTextRevealed(lessonId?: string): void {
    this.addEvent({
      type: "text_revealed",
      timestamp: Date.now(),
      lessonId,
    });
  }

  /**
   * Track phrase replay event
   */
  trackPhraseReplay(phraseId: string, lessonId?: string): void {
    this.addEvent({
      type: "phrase_replay",
      timestamp: Date.now(),
      phraseId,
      lessonId,
    });
  }

  /**
   * Get all tracked events
   */
  getEvents(): TrackedEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: TrackedEvent["type"]): TrackedEvent[] {
    return this.events.filter((event) => event.type === type);
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Export events as JSON (useful for debugging/inspection)
   */
  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Log events to console (useful for development)
   */
  logEvents(): void {
    log.debug("Event Tracking - All Events");
    this.events.forEach((event, index) => {
      log.debug(`${index + 1}. ${event.type}`, event);
    });
  }

  /**
   * Add event to the tracking list
   */
  private addEvent(event: TrackedEvent): void {
    this.events.push(event);

    // Prune events when we exceed maxEvents
    if (this.events.length > this.maxEvents) {
      this.pruneEvents();
    }

    // Log event
    log.debug("Event tracked:", event);
  }

  /**
   * Efficiently prune events by removing excess events in batches
   */
  private pruneEvents(): void {
    const excessCount = this.events.length - this.maxEvents;
    if (excessCount > 0) {
      // Remove excess events from the beginning of the array
      this.events.splice(0, excessCount);
    }
  }
}
