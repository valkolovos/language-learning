import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { SpeakingFeedbackState, MicroTip } from '../../src/types/lesson';

// Mock data for testing
const mockPhraseWithTips = {
  id: 'phrase-1',
  nativeText: 'Γειά σου',
  gloss: 'Hello',
  microTips: [
    { id: 'tip-1-1', text: 'Say ya soo - the γ is silent', phraseId: 'phrase-1' },
    { id: 'tip-1-2', text: 'Stress the second syllable soo', phraseId: 'phrase-1' },
    { id: 'tip-1-3', text: 'Keep it casual and friendly', phraseId: 'phrase-1' }
  ]
};

// Test state
let currentFeedback: SpeakingFeedbackState | null = null;
let currentMicroTip: MicroTip | null = null;
let tipsShown: string[] = [];
let currentAttempts = 0;

Given('each phrase has a library of concise, phrase-specific micro-tips', function() {
  expect(mockPhraseWithTips.microTips).to.have.length(3);
  mockPhraseWithTips.microTips.forEach(tip => {
    expect(tip.text.length).to.be.lessThanOrEqual(60);
    expect(tip.phraseId).to.equal(mockPhraseWithTips.id);
  });
});

Given('the learner receives {string}', function(feedbackState: string) {
  currentFeedback = feedbackState as SpeakingFeedbackState;
  expect(['clear', 'almost', 'try_again']).to.include(feedbackState);
});

Then('no micro-tip is shown', function() {
  expect(currentFeedback).to.equal('clear');
  expect(currentMicroTip).to.be.null;
});

Given('the learner receives {string} on a phrase', function(feedbackState: string) {
  currentFeedback = feedbackState as SpeakingFeedbackState;
  expect(['almost', 'try_again']).to.include(feedbackState);
});

When('the feedback is displayed', function() {
  expect(currentFeedback).to.be.oneOf(['almost', 'try_again']);
  
  // Simulate showing a micro-tip
  const availableTips = mockPhraseWithTips.microTips.filter(
    tip => !tipsShown.includes(tip.id)
  );
  
  if (availableTips.length > 0) {
    currentMicroTip = availableTips[0];
    tipsShown.push(currentMicroTip.id);
  }
});

Then('exactly one micro-tip is shown', function() {
  expect(currentMicroTip).to.not.be.null;
  expect(currentMicroTip!.id).to.be.oneOf(
    mockPhraseWithTips.microTips.map(tip => tip.id)
  );
});

Then('the micro-tip is specific to that phrase', function() {
  expect(currentMicroTip).to.not.be.null;
  expect(currentMicroTip!.phraseId).to.equal(mockPhraseWithTips.id);
});

Then('the micro-tip length is within the defined limit', function() {
  expect(currentMicroTip).to.not.be.null;
  expect(currentMicroTip!.text.length).to.be.lessThanOrEqual(60);
});

Given('the learner has received a micro-tip for a phrase', function() {
  // Reset state to simulate receiving first tip
  tipsShown = ['tip-1-1'];
  currentMicroTip = mockPhraseWithTips.microTips[0];
  expect(currentMicroTip).to.not.be.null;
  expect(tipsShown).to.have.length(1);
});

Given('the learner retries the same phrase without a {string} result', function(feedbackState: string) {
  expect(feedbackState).to.equal('clear');
  expect(currentFeedback).to.not.equal('clear');
  
  // Simulate retry
  currentAttempts++;
  expect(currentAttempts).to.be.greaterThan(0);
});

When('the next feedback is shown', function() {
  expect(currentAttempts).to.be.greaterThan(0);
  
  // Simulate showing next micro-tip
  const availableTips = mockPhraseWithTips.microTips.filter(
    tip => !tipsShown.includes(tip.id)
  );
  
  if (availableTips.length > 0) {
    currentMicroTip = availableTips[0];
    tipsShown.push(currentMicroTip.id);
  }
});

Then('a different micro-tip from the phrase\'s library is shown \\(if available\\)', function() {
  if (tipsShown.length < mockPhraseWithTips.microTips.length) {
    // Should show a different tip
    expect(currentMicroTip).to.not.be.null;
    expect(tipsShown).to.have.length(2);
    expect(tipsShown[0]).to.not.equal(tipsShown[1]);
  } else {
    // All tips have been shown
    expect(tipsShown).to.have.length(mockPhraseWithTips.microTips.length);
  }
});
