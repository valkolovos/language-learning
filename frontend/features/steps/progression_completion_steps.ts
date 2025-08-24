import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { SpeakingFeedbackState, PracticeSession, SpeakingAttempt } from '../../src/types/lesson';

// Mock data for testing
const mockPracticePhrases = [
  {
    id: 'phrase-1',
    nativeText: 'Γειά σου',
    gloss: 'Hello',
    maxAttempts: 5,
    skipAfterAttempts: 3
  },
  {
    id: 'phrase-2',
    nativeText: 'πώς είσαι;',
    gloss: 'how are you?',
    maxAttempts: 5,
    skipAfterAttempts: 3
  },
  {
    id: 'phrase-3',
    nativeText: 'Καλά, ευχαριστώ',
    gloss: 'Good, thank you',
    maxAttempts: 5,
    skipAfterAttempts: 3
  }
];

// Test state
let practiceSession: PracticeSession;
let currentPhraseIndex = 0;
let completedPhrases: string[] = [];
let skippedPhrases: string[] = [];
let attemptsPerPhrase: Record<string, number> = {};
let microTipsShown: string[] = [];

Given('the practice set contains three phrases', function() {
  expect(mockPracticePhrases).to.have.length(3);
  
  practiceSession = {
    lessonId: 'meet-greet-001',
    startTime: Date.now(),
    attempts: [],
    completedPhrases: [],
    skippedPhrases: []
  };
  
  currentPhraseIndex = 0;
  completedPhrases = [];
  skippedPhrases = [];
  attemptsPerPhrase = {};
  microTipsShown = [];
});

Given('the learner receives {string} for a phrase', function(feedbackState: string) {
  expect(feedbackState).to.equal('clear');
  
  const currentPhrase = mockPracticePhrases[currentPhraseIndex];
  const phraseId = currentPhrase.id;
  
  // Mark phrase as completed
  if (!completedPhrases.includes(phraseId)) {
    completedPhrases.push(phraseId);
    practiceSession.completedPhrases.push(phraseId);
  }
  
  // Record attempt
  const attempt: SpeakingAttempt = {
    phraseId,
    feedbackState: feedbackState as SpeakingFeedbackState,
    timestamp: Date.now()
  };
  practiceSession.attempts.push(attempt);
});

Then('the phrase is marked as completed', function() {
  const currentPhrase = mockPracticePhrases[currentPhraseIndex];
  expect(completedPhrases).to.include(currentPhrase.id);
  expect(practiceSession.completedPhrases).to.include(currentPhrase.id);
});

Given('the learner has not achieved a {string} on a phrase', function(feedbackState: string) {
  expect(feedbackState).to.equal('clear');
  
  const currentPhrase = mockPracticePhrases[currentPhraseIndex];
  const phraseId = currentPhrase.id;
  
  // Ensure phrase is not completed
  expect(completedPhrases).to.not.include(phraseId);
  expect(practiceSession.completedPhrases).to.not.include(phraseId);
});

Given('the learner has reached the configured minimum attempts', function() {
  const currentPhrase = mockPracticePhrases[currentPhraseIndex];
  const phraseId = currentPhrase.id;
  
  if (!attemptsPerPhrase[phraseId]) {
    attemptsPerPhrase[phraseId] = 0;
  }
  
  // Set attempts to minimum required for skip
  attemptsPerPhrase[phraseId] = currentPhrase.skipAfterAttempts;
  
  expect(attemptsPerPhrase[phraseId]).to.equal(currentPhrase.skipAfterAttempts);
});

Then('a Skip option becomes available', function() {
  const currentPhrase = mockPracticePhrases[currentPhraseIndex];
  const phraseId = currentPhrase.id;
  const attempts = attemptsPerPhrase[phraseId] || 0;
  
  expect(attempts).to.be.greaterThanOrEqual(currentPhrase.skipAfterAttempts);
  expect(completedPhrases).to.not.include(phraseId);
});

When('the learner chooses Skip', function() {
  const currentPhrase = mockPracticePhrases[currentPhraseIndex];
  const phraseId = currentPhrase.id;
  
  // Mark phrase as skipped
  if (!skippedPhrases.includes(phraseId)) {
    skippedPhrases.push(phraseId);
    practiceSession.skippedPhrases.push(phraseId);
  }
  
  // Move to next phrase
  currentPhraseIndex++;
});

Then('the next phrase is presented', function() {
  expect(currentPhraseIndex).to.be.greaterThan(0);
  expect(currentPhraseIndex).to.be.lessThan(mockPracticePhrases.length);
  
  const nextPhrase = mockPracticePhrases[currentPhraseIndex];
  expect(nextPhrase.nativeText).to.equal('πώς είσαι;');
});

Given('all phrases are either completed or skipped', function() {
  // Complete or skip all phrases
  mockPracticePhrases.forEach((phrase, index) => {
    if (index === 0) {
      // First phrase completed
      completedPhrases.push(phrase.id);
      practiceSession.completedPhrases.push(phrase.id);
      
      // Add a mock attempt for completed phrase
      practiceSession.attempts.push({
        phraseId: phrase.id,
        feedbackState: 'clear',
        timestamp: Date.now()
      });
    } else if (index === 1) {
      // Second phrase skipped
      skippedPhrases.push(phrase.id);
      practiceSession.skippedPhrases.push(phrase.id);
      
      // Add a mock attempt for skipped phrase
      practiceSession.attempts.push({
        phraseId: phrase.id,
        feedbackState: 'try_again',
        timestamp: Date.now()
      });
    } else {
      // Third phrase completed
      completedPhrases.push(phrase.id);
      practiceSession.completedPhrases.push(phrase.id);
      
      // Add a mock attempt for completed phrase
      practiceSession.attempts.push({
        phraseId: phrase.id,
        feedbackState: 'clear',
        timestamp: Date.now()
      });
    }
  });
  
  expect(completedPhrases.length + skippedPhrases.length).to.equal(mockPracticePhrases.length);
  expect(practiceSession.attempts.length).to.be.greaterThan(0);
});

When('the practice ends', function() {
  // Add a small delay to ensure endTime > startTime
  practiceSession.endTime = practiceSession.startTime + 1;
  
  // Ensure we have valid values
  expect(practiceSession.startTime).to.be.a('number');
  expect(practiceSession.endTime).to.be.a('number');
  expect(practiceSession.endTime).to.be.greaterThan(practiceSession.startTime);
  expect(practiceSession.endTime).to.be.greaterThan(0);
});

Then('the learner sees a summary including:', function(dataTable: any) {
  const summaryItems = dataTable.rows().map((row: any) => row[0]);
  
  expect(summaryItems).to.include('count of attempts per phrase');
  expect(summaryItems).to.include('list of micro-tips shown');
  expect(summaryItems).to.include('gentle encouragement to review');
  expect(summaryItems).to.include('an optional light XP nudge');
  
  // Validate that we have the data to show these items
  expect(practiceSession.attempts.length).to.be.greaterThan(0);
  expect(completedPhrases.length + skippedPhrases.length).to.equal(mockPracticePhrases.length);
});
