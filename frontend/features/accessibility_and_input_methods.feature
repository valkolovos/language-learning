Feature: Accessibility and input methods
  In order to be usable by all learners
  As a learner using keyboard or assistive tech
  I need full operability and clear system feedback

  Background:
    Given the accessibility test environment is ready

  Scenario: Keyboard operability for main controls
    Given the accessibility test environment is ready
    Then every interactive control is operable using keyboard alone
    And focus is visibly indicated on each control

  Scenario: Tab navigation order
    Given the accessibility test environment is ready
    When the learner presses Tab to navigate
    Then focus moves through controls in logical order
    And Shift+Tab moves focus in reverse order

  Scenario: Enter and Space key activation
    Given the accessibility test environment is ready
    And the learner has focused on an interactive control
    When the learner presses Enter or Space
    Then the control is activated
    And the default browser behavior is prevented

  Scenario: Focus management during state changes
    Given the accessibility test environment is ready
    And the learner has completed two full plays of the main line
    When the reveal gate unlocks
    Then focus automatically moves to the "Show text" button
    And a screen reader announcement is made about the available action

  Scenario: Focus management after text reveal
    Given the accessibility test environment is ready
    And the learner has revealed the lesson text
    When the text is fully displayed
    Then focus automatically moves to the first phrase button
    And a screen reader announcement is made about the new content

  Scenario: Screen reader announcements for playback changes
    Given the accessibility test environment is ready
    When a phrase or the main line begins playing
    Then learners using assistive technologies are informed of the change in a timely, non-disruptive manner
    And the announcement includes the specific content being played

  Scenario: Screen reader announcements for playback completion
    Given the accessibility test environment is ready
    When a phrase or the main line finishes playing
    Then learners using assistive technologies are informed of the completion
    And the announcement is clear and non-disruptive

  Scenario: ARIA labels and descriptions
    Given the accessibility test environment is ready
    Then all interactive controls have descriptive ARIA labels
    And complex controls have additional ARIA descriptions
    And emoji icons are hidden from screen readers

  Scenario: Progress and status announcements
    Given the accessibility test environment is ready
    And the learner is progressing through the lesson
    When the progress state changes
    Then screen readers announce the current progress
    And the announcements are polite and informative

  Scenario: Error state accessibility
    Given the accessibility test environment is ready
    And an error occurs during lesson loading or playback
    When the error is displayed
    Then the error message is accessible to screen readers
    And the retry button is clearly labeled and focusable
    And focus is managed appropriately during error recovery
