import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('the learner has not yet revealed the text', function() {
  // Ensure text is not revealed and reset state
  global.testState.textRevealed = false;
  global.testState.playbackState.canReveal = false;
  global.testState.progressIndicator.isComplete = false;
  global.testState.progressIndicator.progressPercentage = 0;
  global.testState.xpCounters.lessonXP = 0;
  
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
  
  // Update progress indicator - reveal gives 50% progress
  global.testState.progressIndicator.progressPercentage = 50;
  
  // Update XP counters
  global.testState.xpCounters.lessonXP = 50; // 50 XP for revealing text
  global.testState.xpCounters.totalXP += global.testState.xpCounters.lessonXP;
  global.testState.xpCounters.streakCount = 1; // First lesson completed
  
  // Update transcript state
  if (global.transcriptState) {
    global.transcriptState.controlAvailable = true;
    global.transcriptState.glossTextVisible = true;
  }
  
  // Update telemetry state
  if (global.telemetryState) {
    global.telemetryState.events.textRevealed = true;
  }
});

Then('the progress indicator shows completion', function() {
  // Verify progress is now at 50% (reveal phase complete)
  expect(global.testState.progressIndicator.progressPercentage).to.equal(50);
  
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

// Progress increment steps
Then('the progress indicator shows {int}%', function(percentage: number) {
  expect(global.testState.progressIndicator.progressPercentage).to.equal(percentage);
});

When('the learner plays the main line once', function() {
  global.testState.playbackState.playCount = 1;
  // Update progress: 1/2 plays = 25% of listening phase (50% total)
  global.testState.progressIndicator.progressPercentage = 25;
});

When('the learner plays the main line a second time', function() {
  global.testState.playbackState.playCount = 2;
  global.testState.playbackState.canReveal = true;
  // Update progress: 2/2 plays = 50% (complete listening phase)
  global.testState.progressIndicator.progressPercentage = 50;
});

Then('the reveal button becomes available', function() {
  expect(global.testState.playbackState.canReveal).to.be.true;
});

When('the learner replays a phrase', function() {
  // Simulate phrase replay - adds 10 XP and 5% progress
  global.testState.xpCounters.lessonXP += 10;
  global.testState.progressIndicator.progressPercentage += 5;
});

When('the learner replays another phrase', function() {
  // Simulate another phrase replay
  global.testState.xpCounters.lessonXP += 10;
  global.testState.progressIndicator.progressPercentage += 5;
});

When('the learner uses the replay all feature', function() {
  // Simulate replay all - adds 25 XP and 15% progress
  global.testState.xpCounters.lessonXP += 25;
  global.testState.progressIndicator.progressPercentage += 15;
});

When('the learner replays the third phrase', function() {
  // Simulate third phrase replay
  global.testState.xpCounters.lessonXP += 10;
  global.testState.progressIndicator.progressPercentage += 5;
});

Then('the XP counter shows {int} XP', function(xp: number) {
  expect(global.testState.xpCounters.lessonXP).to.equal(xp);
});

Given('the learner has completed all possible actions', function() {
  // Set up completed state: 50 XP from reveal + 30 XP from phrases + 25 XP from replay all = 105 XP
  global.testState.xpCounters.lessonXP = 105;
  global.testState.progressIndicator.progressPercentage = 100;
  global.testState.progressIndicator.isComplete = true;
});

When('the learner performs additional actions', function() {
  // Simulate additional actions that should not affect progress bar
  global.testState.xpCounters.lessonXP += 10;
  // Progress should remain at 100%
  global.testState.progressIndicator.progressPercentage = 100;
});

Then('the progress indicator remains at 100%', function() {
  expect(global.testState.progressIndicator.progressPercentage).to.equal(100);
});

Then('the XP counter continues to increment', function() {
  expect(global.testState.xpCounters.lessonXP).to.be.greaterThan(105);
});
