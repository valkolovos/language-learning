import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { SpeakingFeedbackState, PracticeSession, SpeakingAttempt } from '../../src/types/lesson';

// Mock analytics service
interface AnalyticsEvent {
  name: string;
  timestamp: number;
  data: Record<string, any>;
}

class MockAnalyticsService {
  private events: AnalyticsEvent[] = [];
  
  trackEvent(name: string, data: Record<string, any> = {}) {
    this.events.push({
      name,
      timestamp: Date.now(),
      data
    });
  }
  
  getEvents(): AnalyticsEvent[] {
    return this.events;
  }
  
  getEventsByName(name: string): AnalyticsEvent[] {
    return this.events.filter(event => event.name === name);
  }
  
  clearEvents() {
    this.events = [];
  }
}

// Test state
const analyticsService = new MockAnalyticsService();
let practiceSession: PracticeSession;
let currentPhraseId: string | null = null;
let currentFeedback: SpeakingFeedbackState | null = null;
let currentMicroTipId: string | null = null;

Given('the analytics service is ready', function() {
  analyticsService.clearEvents();
  expect(analyticsService.getEvents()).to.have.length(0);
});

When('the learner opens the practice', function() {
  practiceSession = {
    lessonId: 'meet-greet-001',
    startTime: Date.now(),
    attempts: [],
    completedPhrases: [],
    skippedPhrases: []
  };
  
  analyticsService.trackEvent('practice_started', {
    lessonId: practiceSession.lessonId,
    timestamp: practiceSession.startTime
  });
});

Then('an event {string} is recorded with minimal identifiers', function(eventName: string) {
  expect(eventName).to.equal('practice_started');
  
  const events = analyticsService.getEventsByName(eventName);
  expect(events).to.have.length(1);
  
  const event = events[0];
  expect(event.data.lessonId).to.equal('meet-greet-001');
  expect(event.data.timestamp).to.be.a('number');
});

When('the learner begins an attempt', function() {
  currentPhraseId = 'phrase-1';
  
  analyticsService.trackEvent('attempt_started', {
    phraseId: currentPhraseId,
    lessonId: practiceSession.lessonId,
    timestamp: Date.now()
  });
});

Then('an event {string} is recorded with the phrase identifier', function(eventName: string) {
  expect(eventName).to.equal('attempt_started');
  
  const events = analyticsService.getEventsByName(eventName);
  expect(events).to.have.length(1);
  
  const event = events[0];
  expect(event.data.phraseId).to.equal('phrase-1');
  expect(event.data.lessonId).to.equal('meet-greet-001');
});

When('feedback is shown', function() {
  currentFeedback = 'almost';
  
  analyticsService.trackEvent('feedback_shown', {
    phraseId: currentPhraseId,
    feedbackState: currentFeedback,
    lessonId: practiceSession.lessonId,
    timestamp: Date.now()
  });
});

Then('an event {string} is recorded with the feedback state', function(eventName: string) {
  expect(eventName).to.equal('feedback_shown');
  
  const events = analyticsService.getEventsByName(eventName);
  expect(events).to.have.length(1);
  
  const event = events[0];
  expect(event.data.feedbackState).to.equal('almost');
  expect(event.data.phraseId).to.equal('phrase-1');
});

When('a micro-tip is displayed', function() {
  currentMicroTipId = 'tip-1-1';
  
  analyticsService.trackEvent('micro_tip_shown', {
    phraseId: currentPhraseId,
    tipId: currentMicroTipId,
    lessonId: practiceSession.lessonId,
    timestamp: Date.now()
  });
});

Then('an event {string} is recorded with phrase and tip identifiers', function(eventName: string) {
  expect(eventName).to.equal('micro_tip_shown');
  
  const events = analyticsService.getEventsByName(eventName);
  expect(events).to.have.length(1);
  
  const event = events[0];
  expect(event.data.phraseId).to.equal('phrase-1');
  expect(event.data.tipId).to.equal('tip-1-1');
});

When('a phrase is marked completed', function() {
  if (currentPhraseId) {
    practiceSession.completedPhrases.push(currentPhraseId);
    
    analyticsService.trackEvent('phrase_completed', {
      phraseId: currentPhraseId,
      lessonId: practiceSession.lessonId,
      timestamp: Date.now()
    });
  }
});

Then('an event {string} is recorded with the phrase identifier for completion', function(eventName: string) {
  expect(eventName).to.equal('phrase_completed');
  
  const events = analyticsService.getEventsByName(eventName);
  expect(events).to.have.length(1);
  
  const event = events[0];
  expect(event.data.phraseId).to.equal('phrase-1');
  expect(event.data.lessonId).to.equal('meet-greet-001');
});

When('the practice summary is displayed', function() {
  // Simulate practice completion
  practiceSession.endTime = Date.now();
  
  analyticsService.trackEvent('practice_completed', {
    lessonId: practiceSession.lessonId,
    totalAttempts: practiceSession.attempts.length,
    completedPhrases: practiceSession.completedPhrases.length,
    skippedPhrases: practiceSession.skippedPhrases.length,
    duration: practiceSession.endTime - practiceSession.startTime,
    timestamp: Date.now()
  });
});

Then('an event {string} is recorded with overall counts', function(eventName: string) {
  expect(eventName).to.equal('practice_completed');
  
  const events = analyticsService.getEventsByName(eventName);
  expect(events).to.have.length(1);
  
  const event = events[0];
  expect(event.data.totalAttempts).to.be.a('number');
  expect(event.data.completedPhrases).to.be.a('number');
  expect(event.data.skippedPhrases).to.be.a('number');
  expect(event.data.duration).to.be.a('number');
  expect(event.data.duration).to.be.greaterThan(0);
});
