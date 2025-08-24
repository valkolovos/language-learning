Feature: Progression rules and completion summary
  As a learner
  I want clear progression and a useful summary
  So that I understand my effort and next steps

  Background:
    Given the practice set contains three phrases

  Scenario: Phrase completion on first clear
    Given the learner receives "clear" for a phrase
    Then the phrase is marked as completed

  Scenario: Skip becomes available after configured attempts
    Given the learner has not achieved a "clear" on a phrase
    And the learner has reached the configured minimum attempts
    Then a Skip option becomes available
    When the learner chooses Skip
    Then the next phrase is presented

  Scenario: Practice completion summary
    Given all phrases are either completed or skipped
    When the practice ends
    Then the learner sees a summary including:
      | item                           |
      | count of attempts per phrase   |
      | list of micro-tips shown       |
      | gentle encouragement to review |
      | an optional light XP nudge     |
