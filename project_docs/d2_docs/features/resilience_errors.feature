Feature: Recoverable errors and resilient flow
  As a learner
  I want to recover from errors without losing my place
  So that I can continue practicing

  Scenario: Speaking input unavailable or blocked
    Given speaking input is unavailable or blocked
    Then the learner sees a clear message and a Retry action
    And navigation to other parts of the practice remains available

  Scenario: Very short or silent attempt
    When the learner submits a very short or silent attempt
    Then "Try again" feedback is shown
    And a micro-tip is provided

  Scenario: Generic failure
    Given a non-specific failure occurs
    Then a general error message is shown
    And the learner can retry without losing progress
