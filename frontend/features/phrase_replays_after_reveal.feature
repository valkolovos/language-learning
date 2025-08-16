Feature: Phrase replays after reveal
  In order to practice parts of the line
  As a learner
  I want to replay each phrase individually

  Background:
    Given the learner has revealed the text in the "Meet & Greet" micro-lesson
    And the lesson content is visible

  Scenario: Replaying a single phrase
    When the learner activates a phrase item
    Then the corresponding phrase audio plays
    And a clear playing state is shown for that phrase

  Scenario: Replaying multiple phrases in succession
    When the learner activates each phrase item in turn
    Then only one phrase plays at any time
    And each activation provides clear playing feedback
