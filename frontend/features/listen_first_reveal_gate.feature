Feature: Listen-first reveal gate
  In order to learn by ear first
  As a brand-new learner
  I want text to remain hidden until I have listened enough

  Background:
    Given a new learner opens the "Meet & Greet" micro-lesson
    And the lesson loads successfully

  Scenario: No text is shown on the first play
    When the learner plays the main audio once to completion
    Then no lesson text is visible anywhere
    And the "Show text" button is not displayed

  Scenario: Text can be revealed only after two complete plays
    When the learner plays the main audio a second time to completion
    Then a control to "Show text" becomes available and enabled
    And the reveal button is visible and clickable

  Scenario: Revealing text exposes phrase practice
    Given the learner has completed two full plays of the main audio
    When the learner chooses to "Show text"
    Then the full line is displayed
    And three phrase items are displayed for individual replay
    And the main line text shows both native text and gloss
    And each phrase shows its native text and gloss
