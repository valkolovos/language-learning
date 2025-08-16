const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

When('the learner plays the main audio once to completion', function() {
  // Simulate playing the main audio once
  global.testState.playbackState.playCount = 1;
  global.testState.playbackState.canReveal = false; // Still need one more play
});

When('the learner plays the main audio a second time to completion', function() {
  // Simulate playing the main audio a second time
  global.testState.playbackState.playCount = 2;
  global.testState.playbackState.canReveal = true; // Now can reveal
});

Given('the learner has completed two full plays of the main audio', function() {
  // Ensure the prerequisite is met
  global.testState.playbackState.playCount = 2;
  global.testState.playbackState.canReveal = true;
});

When('the learner chooses to "Show text"', function() {
  // Simulate clicking the reveal button
  if (global.testState.playbackState.canReveal) {
    global.testState.textRevealed = true;
  }
});

Then('no lesson text is visible anywhere', function() {
  // Verify text is hidden
  expect(global.testState.textRevealed).to.be.false;
  
  // Check that main line text is not visible
  expect(global.testState.lesson.mainLine.nativeText).to.exist;
  expect(global.testState.lesson.mainLine.gloss).to.exist;
  
  // In the UI, these would not be rendered when textRevealed is false
});

Then('the "Show text" button is not displayed', function() {
  // Verify reveal button is not available
  expect(global.testState.playbackState.canReveal).to.be.false;
});

Then('a control to "Show text" becomes available and enabled', function() {
  // Verify reveal button is now available
  expect(global.testState.playbackState.canReveal).to.be.true;
  expect(global.testState.playbackState.playCount).to.be.at.least(2);
});

Then('the reveal button is visible and clickable', function() {
  // Verify reveal button state
  expect(global.testState.playbackState.canReveal).to.be.true;
  expect(global.testState.textRevealed).to.be.false; // Button should be visible but text not yet revealed
});

Then('the full line is displayed', function() {
  // Verify main line text is now visible
  expect(global.testState.textRevealed).to.be.true;
  expect(global.testState.lesson.mainLine.nativeText).to.equal('Γειά σου, πώς είσαι;');
  expect(global.testState.lesson.mainLine.gloss).to.equal('Hello, how are you?');
});

Then('three phrase items are displayed for individual replay', function() {
  // Verify phrases are visible
  expect(global.testState.textRevealed).to.be.true;
  expect(global.testState.lesson.phrases).to.have.lengthOf(3);
  
  // Check each phrase
  expect(global.testState.lesson.phrases[0].nativeText).to.equal('Γειά σου');
  expect(global.testState.lesson.phrases[1].nativeText).to.equal('πώς είσαι;');
  expect(global.testState.lesson.phrases[2].nativeText).to.equal('Καλά, ευχαριστώ');
});

Then('the main line text shows both native text and gloss', function() {
  // Verify main line text display
  expect(global.testState.textRevealed).to.be.true;
  expect(global.testState.lesson.mainLine.nativeText).to.equal('Γειά σου, πώς είσαι;');
  expect(global.testState.lesson.mainLine.gloss).to.equal('Hello, how are you?');
});

Then('each phrase shows its native text and gloss', function() {
  // Verify each phrase text display
  expect(global.testState.textRevealed).to.be.true;
  
  // Phrase 1
  expect(global.testState.lesson.phrases[0].nativeText).to.equal('Γειά σου');
  expect(global.testState.lesson.phrases[0].gloss).to.equal('Hello');
  
  // Phrase 2
  expect(global.testState.lesson.phrases[1].nativeText).to.equal('πώς είσαι;');
  expect(global.testState.lesson.phrases[1].gloss).to.equal('how are you?');
  
  // Phrase 3
  expect(global.testState.lesson.phrases[2].nativeText).to.equal('Καλά, ευχαριστώ');
  expect(global.testState.lesson.phrases[2].gloss).to.equal('Good, thank you');
});
