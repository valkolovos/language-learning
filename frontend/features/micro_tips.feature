Feature: Micro-tips guide improvement without distraction
  As a learner
  I want concise tips when my attempt needs work
  So that I can improve on the next try

  Background:
    Given each phrase has a library of concise, phrase-specific micro-tips

  Scenario: Tips do not appear on clear
    Given the learner receives "clear"
    Then no micro-tip is shown

  Scenario Outline: Tips appear on non-clear feedback
    Given the learner receives "<state>" on a phrase
    When the feedback is displayed
    Then exactly one micro-tip is shown
    And the micro-tip is specific to that phrase
    And the micro-tip length is within the defined limit
    Examples:
      | state      |
      | almost     |
      | try_again  |

  Scenario: Tip rotation across multiple attempts
    Given the learner has received a micro-tip for a phrase
    And the learner retries the same phrase without a "clear" result
    When the next feedback is shown
    Then a different micro-tip from the phrase's library is shown (if available)
