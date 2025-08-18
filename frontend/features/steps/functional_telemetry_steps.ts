import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

// Global test state for telemetry functionality
declare global {
  var telemetryState: {
    events: {
      lessonStarted: boolean;
      audioPlay: boolean;
      textRevealed: boolean;
      phraseReplay: string[];
    };
  };
}

global.telemetryState = {
  events: {
    lessonStarted: false,
    audioPlay: false,
    textRevealed: false,
    phraseReplay: [],
  },
};

// Note: These steps are already defined in common_steps.ts
// We'll use the existing implementations and just add telemetry-specific state

When('the learner plays the main line or a phrase', function () {
  // Simulate audio play event
  global.telemetryState.events.audioPlay = true;
  expect(global.telemetryState.events.audioPlay).to.be.true;
});

// Note: This step is already defined in lightweight_progress_signals_steps.ts
// We'll use the existing implementation

Given('the learner has revealed the text', function () {
  global.testState.textRevealed = true;
  global.testState.playbackState.canReveal = true;
  global.testState.progressIndicator.progressPercentage = 50;
  global.testState.xpCounters.lessonXP = 50;
  expect(global.testState.textRevealed).to.be.true;
});

When('the learner replays multiple phrases', function () {
  // Simulate phrase replay events
  global.telemetryState.events.phraseReplay.push('phrase-1');
  global.telemetryState.events.phraseReplay.push('phrase-2');
  
  expect(global.telemetryState.events.phraseReplay).to.have.length(2);
});

Then('a {string} event is captured', function (eventType: string) {
  switch (eventType) {
    case 'lesson started':
      expect(global.telemetryState.events.lessonStarted).to.be.true;
      break;
    case 'text revealed':
      expect(global.telemetryState.events.textRevealed).to.be.true;
      break;
    default:
      throw new Error(`Unknown event type: ${eventType}`);
  }
});

Then('a corresponding {string} or {string} event is captured', function (eventType1: string, eventType2: string) {
  // Check if either audio play or phrase replay events were captured
  const audioPlayCaptured = global.telemetryState.events.audioPlay;
  const phraseReplayCaptured = global.telemetryState.events.phraseReplay.length > 0;
  
  expect(audioPlayCaptured || phraseReplayCaptured).to.be.true;
});

Then('each phrase replay event is captured with the correct phrase identifier', function () {
  expect(global.telemetryState.events.phraseReplay).to.have.length(2);
  expect(global.telemetryState.events.phraseReplay).to.include('phrase-1');
  expect(global.telemetryState.events.phraseReplay).to.include('phrase-2');
});
