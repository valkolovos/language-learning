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

### 4. Functional Telemetry (`functional_telemetry.feature`)

Tests the event tracking functionality:

- **Session start recording**: Verifies that lesson start events are captured
- **Play and replay tracking**: Tests that audio interactions are properly recorded
- **Text reveal tracking**: Ensures reveal actions are logged
- **Multiple phrase replay tracking**: Validates individual phrase replay events

### 5. Transcript Availability (`transcript_availability.feature`)

Tests the transcript toggle functionality:

- **Pre-reveal availability**: Verifies transcript controls are hidden before text reveal
- **Post-reveal availability**: Tests that transcript controls appear after reveal
- **Toggle functionality**: Ensures transcript can be shown/hidden smoothly

### 6. Accessibility and Input Methods (`accessibility_and_input_methods.feature`) 🆕

Tests comprehensive accessibility features:

- **Keyboard operability**: Verifies all controls work with keyboard navigation
- **Tab navigation order**: Tests logical focus flow through all interactive elements
- **Enter/Space key activation**: Ensures proper key handling and default behavior prevention
- **Focus management**: Tests automatic focus movement during state changes
- **Screen reader support**: Validates announcements for playback changes and progress updates
- **ARIA compliance**: Checks proper labels, descriptions, and emoji hiding
- **Error state accessibility**: Ensures error handling maintains accessibility

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
- **Step definitions** (`steps/*.ts`): Implement the test logic for each step
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

### Functional Telemetry
- **Scenario 1**: Session start is recorded
- **Scenario 2**: Plays and replays are recorded
- **Scenario 3**: Reveal is recorded
- **Scenario 4**: Multiple phrase replays are tracked

### Transcript Availability
- **Scenario 1**: Transcript is not available before reveal
- **Scenario 2**: Transcript appears after reveal
- **Scenario 3**: Transcript can be toggled on and off

### Accessibility and Input Methods 🆕
- **Scenario 1**: Keyboard operability for main controls
- **Scenario 2**: Tab navigation order
- **Scenario 3**: Enter and Space key activation
- **Scenario 4**: Focus management during state changes
- **Scenario 5**: Focus management after text reveal
- **Scenario 6**: Screen reader announcements for playback changes
- **Scenario 7**: Screen reader announcements for playback completion
- **Scenario 8**: ARIA labels and descriptions
- **Scenario 9**: Progress and status announcements
- **Scenario 10**: Error state accessibility

## Notes

- These tests use mock data to simulate the lesson content
- They test the business logic and state management, not the actual UI rendering
- The tests verify the core functionality without requiring a full browser environment
- For full integration testing, these scenarios could be extended with actual UI testing tools like Playwright or Cypress
- All six features are already implemented in the existing codebase and are being tested for correctness
- The accessibility feature tests validate our Track D implementation and ensure WCAG compliance
