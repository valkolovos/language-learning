Feature: Resilience and recovery
  In order to continue learning even when something goes wrong
  As a learner
  I want clear errors and a way to try again

  Scenario: Audio error handling
    Given an audio load or playback failure occurs
    Then the learner sees a clear error message and a Retry action
    And the reveal gate remains locked until two successful, complete plays have occurred
