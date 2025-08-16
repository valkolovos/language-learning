Feature: Lightweight progress signals
  In order to feel momentum
  As a learner
  I want simple, non-authoritative indicators of progress

  Scenario: Progress completes at reveal
    Given the learner has not yet revealed the text
    Then the progress indicator is not complete
    When the learner reveals the text
    Then the progress indicator shows completion
    And any XP counters update locally without affecting lesson behavior
