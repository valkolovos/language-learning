Feature: Functional analytics event catalog
  As a product owner
  I want essential practice events captured conceptually
  So that engagement can be understood at a high level

  Scenario: Session start
    When the learner opens the practice
    Then an event "practice_started" is recorded with minimal identifiers

  Scenario: Attempt lifecycle
    When the learner begins an attempt
    Then an event "attempt_started" is recorded with the phrase identifier

  Scenario: Feedback shown
    When feedback is shown
    Then an event "feedback_shown" is recorded with the feedback state

  Scenario: Micro-tip shown
    When a micro-tip is displayed
    Then an event "micro_tip_shown" is recorded with phrase and tip identifiers

  Scenario: Phrase completed
    When a phrase is marked completed
    Then an event "phrase_completed" is recorded with the phrase identifier for completion

  Scenario: Practice completed
    When the practice summary is displayed
    Then an event "practice_completed" is recorded with overall counts
