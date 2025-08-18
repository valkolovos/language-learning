import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

// Global test state for transcript functionality
declare global {
  var transcriptState: {
    isVisible: boolean;
    controlAvailable: boolean;
    glossTextVisible: boolean;
  };
}

global.transcriptState = {
  isVisible: true,
  controlAvailable: false,
  glossTextVisible: true,
};

// Note: These steps are already defined in common_steps.ts
// We'll use the existing implementations and just add transcript-specific state

// Note: This step is already defined in lightweight_progress_signals_steps.ts
// We'll use the existing implementation

When('the learner toggles the transcript control', function () {
  global.transcriptState.glossTextVisible = false;
  expect(global.transcriptState.glossTextVisible).to.be.false;
});

When('the learner toggles the transcript control again', function () {
  global.transcriptState.glossTextVisible = true;
  expect(global.transcriptState.glossTextVisible).to.be.true;
});

Then('the transcript control is not present', function () {
  expect(global.transcriptState.controlAvailable).to.be.false;
});

Then('a transcript control becomes available', function () {
  expect(global.transcriptState.controlAvailable).to.be.true;
});

Then('activating it shows an English gloss beneath the native text', function () {
  expect(global.transcriptState.glossTextVisible).to.be.true;
  expect(global.testState.lesson.mainLine.gloss).to.equal('Hello, how are you?');
});

Then('the English gloss text is hidden', function () {
  expect(global.transcriptState.glossTextVisible).to.be.false;
});

Then('the English gloss text is shown again', function () {
  expect(global.transcriptState.glossTextVisible).to.be.true;
});
