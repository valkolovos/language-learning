Feature: Functional telemetry
  In order to understand how learners use the lesson
  As the product team
  We need high-level usage events captured

  Background:
    Given a new learner opens the "Meet & Greet" micro-lesson
    And the lesson loads successfully

  Scenario: Session start is recorded
    Then a "lesson started" event is captured

  Scenario: Plays and replays are recorded
    When the learner plays the main line or a phrase
    Then a corresponding "audio play" or "phrase replay" event is captured

  Scenario: Reveal is recorded
    When the learner reveals the text
    Then a "text revealed" event is captured

  Scenario: Multiple phrase replays are tracked
    Given the learner has revealed the text
    When the learner replays multiple phrases
    Then each phrase replay event is captured with the correct phrase identifier
