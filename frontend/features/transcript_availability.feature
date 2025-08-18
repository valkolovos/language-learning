Feature: Transcript availability
  In order to connect sound to meaning without distraction
  As a learner
  I want the transcript to appear only after I've listened first

  Background:
    Given a new learner opens the "Meet & Greet" micro-lesson
    And the lesson loads successfully

  Scenario: Transcript is not available before reveal
    Then the transcript control is not present

  Scenario: Transcript appears after reveal
    When the learner reveals the text
    Then a transcript control becomes available
    And activating it shows an English gloss beneath the native text

  Scenario: Transcript can be toggled on and off
    Given the learner has revealed the text
    When the learner toggles the transcript control
    Then the English gloss text is hidden
    When the learner toggles the transcript control again
    Then the English gloss text is shown again
