Feature: Lightweight progress signals
  In order to feel momentum
  As a learner
  I want simple, non-authoritative indicators of progress

  Background:
    Given a new learner opens the "Meet & Greet" micro-lesson
    And the lesson loads successfully

  Scenario: Progress completes at reveal
    Given the learner has not yet revealed the text
    Then the progress indicator is not complete
    When the learner reveals the text
    Then the progress indicator shows completion
    And any XP counters update locally without affecting lesson behavior

  Scenario: Progress increments during listening phase
    Given the learner has not played any audio yet
    Then the progress indicator shows 0%
    When the learner plays the main line once
    Then the progress indicator shows 25%
    When the learner plays the main line a second time
    Then the progress indicator shows 50%
    And the reveal button becomes available

  Scenario: Progress increments during engagement phase
    Given the learner has revealed the text
    Then the progress indicator shows 50%
    When the learner replays a phrase
    Then the progress indicator shows 55%
    When the learner replays another phrase
    Then the progress indicator shows 60%
    When the learner uses the replay all feature
    Then the progress indicator shows 75%
    When the learner replays the third phrase
    Then the progress indicator shows 80%

  Scenario: XP counter increments with actions
    Given the learner has revealed the text
    Then the XP counter shows 50 XP
    When the learner replays a phrase
    Then the XP counter shows 60 XP
    When the learner replays another phrase
    Then the XP counter shows 70 XP
    When the learner uses the replay all feature
    Then the XP counter shows 95 XP
    When the learner replays the third phrase
    Then the XP counter shows 105 XP

  Scenario: Progress bar never exceeds 100%
    Given the learner has completed all possible actions
    Then the progress indicator shows 100%
    And the XP counter shows 105 XP
    When the learner performs additional actions
    Then the progress indicator remains at 100%
    And the XP counter continues to increment
