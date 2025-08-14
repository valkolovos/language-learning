Feature: User Registration
  As a new user
  I want to register for an account
  So that I can start learning languages

  Background:
    Given the application is running
    And no user exists with email "newuser@example.com"

  Scenario: Successful user registration with valid data
    When I register with the following information:
      | email              | username | password      | first_name | last_name | native_language | target_language | proficiency_level |
      | newuser@example.com | newuser  | securepass123 | John       | Doe       | en              | es              | beginner          |
    Then the registration should be successful
    And a new user account should be created
    And the user should have the following attributes:
      | attribute          | value              |
      | email             | newuser@example.com |
      | username          | newuser            |
      | first_name        | John               |
      | last_name         | Doe                |
      | native_language   | en                 |
      | target_language   | es                 |
      | proficiency_level | beginner           |
      | total_xp          | 0                  |
      | current_streak    | 0                  |
    And the password should be securely hashed
    And the user should be marked as active

  Scenario: Registration fails with duplicate email
    Given a user already exists with email "existing@example.com"
    When I register with email "existing@example.com"
    Then the registration should fail
    And an error message should indicate "Email already registered"
    And no new user account should be created

  Scenario: Registration fails with duplicate username
    Given a user already exists with username "existinguser"
    When I register with username "existinguser"
    Then the registration should fail
    And an error message should indicate "Username already taken"
    And no new user account should be created

  Scenario: Registration fails with invalid email format
    When I register with email "invalid-email"
    Then the registration should fail
    And an error message should indicate "Invalid email format"

  Scenario: Registration fails with weak password
    When I register with password "123"
    Then the registration should fail
    And an error message should indicate "Password too weak"

  Scenario: Registration fails with missing required fields
    When I register with missing required fields
    Then the registration should fail
    And error messages should indicate which fields are required

  Scenario: Registration with optional fields omitted
    When I register with only required fields:
      | email              | username | password      | native_language | target_language |
      | minimal@example.com | minimal  | securepass123 | en              | fr              |
    Then the registration should be successful
    And the user should have default values:
      | attribute          | value    |
      | first_name        | null     |
      | last_name         | null     |
      | proficiency_level | beginner |
      | is_verified       | false    |

  Scenario: Registration creates initial learning profile
    When I register successfully
    Then a learning profile should be created
    And daily goals should be set up
    And achievement tracking should be initialized
    And the user should be ready to start learning
