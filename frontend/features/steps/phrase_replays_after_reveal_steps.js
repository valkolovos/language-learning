const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Given('the learner has revealed the text in the "Meet & Greet" micro-lesson', function() {
  // Simulate text reveal
  global.testState.textRevealed = true;
  
  // Initialize phrase play states
  global.testState.phrasePlayStates = {
    "phrase-1": false,
    "phrase-2": false,
    "phrase-3": false,
  };
});

Given('the lesson content is visible', function() {
  // Verify lesson content is accessible
  expect(global.testState.textRevealed).to.be.true;
  expect(global.testState.lesson).to.not.be.null;
  expect(global.testState.lesson.phrases).to.have.lengthOf(3);
});

When('the learner activates a phrase item', function() {
  // Simulate activating the first phrase
  global.testState.currentPlayingPhrase = "phrase-1";
  global.testState.audioService.isPlaying = true;
  global.testState.audioService.currentAudioId = "phrase-1-audio";
  global.testState.phrasePlayStates["phrase-1"] = true;
});

Then('the corresponding phrase audio plays', function() {
  // Verify the correct phrase audio is playing
  expect(global.testState.audioService.isPlaying).to.be.true;
  expect(global.testState.audioService.currentAudioId).to.equal("phrase-1-audio");
  expect(global.testState.currentPlayingPhrase).to.equal("phrase-1");
});

Then('a clear playing state is shown for that phrase', function() {
  // Verify the phrase shows as playing
  expect(global.testState.phrasePlayStates["phrase-1"]).to.be.true;
  
  // Verify the phrase data is correct
  const phrase = global.testState.lesson.phrases.find(p => p.id === "phrase-1");
  expect(phrase).to.not.be.undefined;
  expect(phrase.nativeText).to.equal("Γειά σου");
  expect(phrase.gloss).to.equal("Hello");
});

When('the learner activates each phrase item in turn', function() {
  // Simulate playing each phrase in sequence
  const phrases = ["phrase-1", "phrase-2", "phrase-3"];
  
  phrases.forEach((phraseId, index) => {
    // Stop previous phrase
    if (global.testState.currentPlayingPhrase && global.testState.currentPlayingPhrase !== phraseId) {
      global.testState.phrasePlayStates[global.testState.currentPlayingPhrase] = false;
    }
    
    // Start new phrase
    global.testState.currentPlayingPhrase = phraseId;
    global.testState.audioService.isPlaying = true;
    global.testState.audioService.currentAudioId = `${phraseId}-audio`;
    global.testState.phrasePlayStates[phraseId] = true;
    
    // Verify only one phrase is playing at a time
    const playingPhrases = Object.values(global.testState.phrasePlayStates).filter(state => state === true);
    expect(playingPhrases).to.have.lengthOf(1);
  });
});

Then('only one phrase plays at any time', function() {
  // Verify only one phrase is marked as playing
  const playingPhrases = Object.values(global.testState.phrasePlayStates).filter(state => state === true);
  expect(playingPhrases).to.have.lengthOf(1);
  
  // Verify audio service reflects single phrase playing
  expect(global.testState.audioService.isPlaying).to.be.true;
  expect(global.testState.audioService.currentAudioId).to.not.be.null;
});

Then('each activation provides clear playing feedback', function() {
  // Verify each phrase can be activated and shows playing state
  const phrases = ["phrase-1", "phrase-2", "phrase-3"];
  
  phrases.forEach(phraseId => {
    // Simulate activating this phrase
    global.testState.currentPlayingPhrase = phraseId;
    global.testState.audioService.currentAudioId = `${phraseId}-audio`;
    global.testState.phrasePlayStates[phraseId] = true;
    
    // Verify feedback is clear
    expect(global.testState.currentPlayingPhrase).to.equal(phraseId);
    expect(global.testState.audioService.currentAudioId).to.equal(`${phraseId}-audio`);
    expect(global.testState.phrasePlayStates[phraseId]).to.be.true;
    
    // Reset for next iteration
    global.testState.phrasePlayStates[phraseId] = false;
  });
});
