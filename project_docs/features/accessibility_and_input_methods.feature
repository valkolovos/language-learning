Feature: Accessibility and input methods
  In order to be usable by all learners
  As a learner using keyboard or assistive tech
  I need full operability and clear system feedback

  Scenario: Keyboard operability
    Given the lesson is open
    Then every interactive control (Play, Show text, phrase items, Replay all, Transcript, Retry) is operable using keyboard alone
    And focus is visibly indicated on each control

  Scenario: Announcements for playback changes
    When a phrase or the main line begins or ends
    Then learners using assistive technologies are informed of the change in a timely, non-disruptive manner
