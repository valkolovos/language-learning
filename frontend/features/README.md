# Frontend Cucumber Tests

This directory contains Cucumber/Gherkin feature tests for the frontend functionality.

## Features Tested

### 1. Listen-First Reveal Gate (`listen_first_reveal_gate.feature`)

Tests the core listen-first learning behavior:

- **No text shown on first play**: Verifies that lesson text remains hidden until the learner has listened enough
- **Text reveal after two plays**: Tests that the "Show text" button becomes available after two complete audio plays
- **Phrase practice exposure**: Verifies that revealing text shows the full lesson content and practice phrases

### 2. Phrase Replays After Reveal (`phrase_replays_after_reveal.feature`)

Tests the phrase practice functionality:

- **Single phrase replay**: Verifies that activating a phrase item plays the corresponding audio and shows clear playing state
- **Multiple phrase succession**: Tests that only one phrase plays at a time and each activation provides clear feedback

### 3. Lightweight Progress Signals (`lightweight_progress_signals.feature`)

Tests the progress tracking functionality:

- **Progress completion**: Verifies that progress indicator shows completion when text is revealed
- **XP counter updates**: Tests that XP counters update locally without affecting lesson behavior

## Running the Tests

### Prerequisites

Install the required dependencies:

```bash
cd frontend
npm install --save-dev @cucumber/cucumber chai cucumber-html-reporter
```

### Running Tests

```bash
# Run all Cucumber tests
npm run test:cucumber

# Run tests in watch mode
npm run test:cucumber:watch

# Run tests with HTML report
npm run test:cucumber:format

# Or use just commands
just test-cucumber
just test-cucumber-html
```

### Test Structure

- **Feature files** (`.feature`): Define the behavior in Gherkin syntax
- **Step definitions** (`steps/*.js`): Implement the test logic for each step
- **Mock data**: Simulates the lesson data and application state

## Test Scenarios

### Listen-First Reveal Gate
- **Scenario 1**: No text shown on first play
- **Scenario 2**: Text reveal after two plays  
- **Scenario 3**: Revealing text exposes phrase practice

### Phrase Replays After Reveal
- **Scenario 1**: Replaying a single phrase
- **Scenario 2**: Replaying multiple phrases in succession

### Lightweight Progress Signals
- **Scenario 1**: Progress completes at reveal

## Notes

- These tests use mock data to simulate the lesson content
- They test the business logic and state management, not the actual UI rendering
- The tests verify the core functionality without requiring a full browser environment
- For full integration testing, these scenarios could be extended with actual UI testing tools like Playwright or Cypress
- All three features are already implemented in the existing codebase and are being tested for correctness
