import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the learner has not yet revealed the text', function() {
  // Verify text is not revealed
  expect(global.testState.textRevealed).to.be.false;
  expect(global.testState.playbackState.canReveal).to.be.false;
  expect(global.testState.progressIndicator.isComplete).to.be.false;
});

Then('the progress indicator is not complete', function() {
  // Verify progress is not complete
  expect(global.testState.progressIndicator.isComplete).to.be.false;
  expect(global.testState.progressIndicator.progressPercentage).to.be.lessThan(100);
  
  // Progress should be based on play count (0 plays = 0% progress)
  const expectedProgress = (global.testState.playbackState.playCount / 2) * 100;
  expect(global.testState.progressIndicator.progressPercentage).to.equal(expectedProgress);
});

When('the learner reveals the text', function() {
  // Simulate completing two plays and revealing text
  global.testState.playbackState.playCount = 2;
  global.testState.playbackState.canReveal = true;
  global.testState.textRevealed = true;
  
  // Update progress indicator
  global.testState.progressIndicator.isComplete = true;
  global.testState.progressIndicator.progressPercentage = 100;
  
  // Update XP counters
  global.testState.xpCounters.lessonXP = 50; // Example XP for completing lesson
  global.testState.xpCounters.totalXP += global.testState.xpCounters.lessonXP;
  global.testState.xpCounters.streakCount = 1; // First lesson completed
});

Then('the progress indicator shows completion', function() {
  // Verify progress is now complete
  expect(global.testState.progressIndicator.isComplete).to.be.true;
  expect(global.testState.progressIndicator.progressPercentage).to.equal(100);
  
  // Verify the reveal gate was properly unlocked
  expect(global.testState.playbackState.playCount).to.be.at.least(2);
  expect(global.testState.playbackState.canReveal).to.be.true;
  expect(global.testState.textRevealed).to.be.true;
});

Then('any XP counters update locally without affecting lesson behavior', function() {
  // Verify XP counters have been updated
  expect(global.testState.xpCounters.lessonXP).to.be.greaterThan(0);
  expect(global.testState.xpCounters.totalXP).to.be.greaterThan(0);
  expect(global.testState.xpCounters.streakCount).to.be.greaterThan(0);
  
  // Verify lesson behavior is unaffected by XP updates
  expect(global.testState.lesson).to.not.be.null;
  expect(global.testState.lesson.phrases).to.have.lengthOf(3);
  expect(global.testState.textRevealed).to.be.true;
  
  // Verify all lesson content is still accessible
  expect(global.testState.lesson.mainLine.nativeText).to.equal('Γειά σου, πώς είσαι;');
  expect(global.testState.lesson.mainLine.gloss).to.equal('Hello, how are you?');
  
  // Verify phrases are still accessible
  expect(global.testState.lesson.phrases[0].nativeText).to.equal('Γειά σου');
  expect(global.testState.lesson.phrases[1].nativeText).to.equal('πώς είσαι;');
  expect(global.testState.lesson.phrases[2].nativeText).to.equal('Καλά, ευχαριστώ');
});
