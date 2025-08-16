Feature: Performance sanity
  In order to keep the lesson feeling instant
  As a learner
  I want audio to begin promptly and the interface to remain responsive

  Scenario: Time-to-first-audio
    When the learner presses Play under expected local conditions
    Then the first audio begins within an acceptable time threshold
    And the interface remains responsive during playback
