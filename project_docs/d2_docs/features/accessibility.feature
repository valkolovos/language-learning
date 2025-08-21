Feature: Accessible interaction and feedback
  As a learner using assistive technologies
  I want the practice to be operable and understandable
  So that I can complete it without barriers

  Scenario: Keyboard operability
    Given the practice screen is open
    Then all interactive controls are operable via keyboard
    And focus states are clearly visible

  Scenario: Non-color feedback cues
    When feedback is shown
    Then the feedback is conveyed with text and/or affordances not relying on color alone

  Scenario: Screen reader announcements
    When feedback changes from one state to another
    Then the change is announced in a polite and timely manner

  Scenario: Alternative input guidance
    Given the learner indicates they cannot speak aloud
    Then guidance for using the practice in a quiet environment is presented
