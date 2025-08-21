Feature: Speaking attempt feedback is clear and actionable
  As a new learner
  I want immediate, lightweight feedback on each attempt
  So that I know whether to retry or advance

  Background:
    Given a 3-phrase practice set is available

  Scenario: Prompt to speak is presented
    When the learner starts the practice
    Then the learner sees a clear prompt to speak the first phrase
    And primary controls to start and finish an attempt are visible

  Scenario Outline: Feedback states after an attempt
    Given the learner completes an attempt on a phrase
    When the system evaluates the attempt at a user-experience level
    Then the learner sees "<state>" feedback
    And the visible next actions match the "<state>" state
    Examples:
      | state     |
      | Clear     |
      | Almost    |
      | Try again |

  Scenario: Advancing after a clear result
    Given the learner has received "Clear" on a phrase
    When the learner chooses to continue
    Then the next phrase is presented with a prompt to speak

  Scenario: Retrying after Almost or Try again
    Given the learner has received "Almost" or "Try again"
    When the learner chooses to retry
    Then the prompt to speak the same phrase is shown again
