import log from "./logger";

export interface TrackedEvent {
  type: "lesson_started" | "audio_play" | "text_revealed" | "phrase_replay";
  timestamp: number;
  lessonId?: string;
  audioId?: string;
  phraseId?: string;
  details?: any;
}

export class EventTrackingService {
  private static instance: EventTrackingService;
  private events: TrackedEvent[] = [];
  private maxEvents: number = 100; // Keep last 100 events in memory

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

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log event
    log.debug("Event tracked:", event);
  }
}
