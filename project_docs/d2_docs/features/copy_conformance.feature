Feature: Copy uses the approved deck
  As a content reviewer
  I want consistent, approved copy across the practice
  So that tone and clarity are maintained

  Scenario: Controls and state labels
    When the practice is reviewed
    Then control labels and feedback text match the approved copy deck

  Scenario: Micro-tip style and length
    When micro-tips are shown
    Then each tip follows the approved style and does not exceed the length limit

  Scenario: Error and guidance messages
    When error or alternative-input guidance appears
    Then the messages match the approved copy deck
