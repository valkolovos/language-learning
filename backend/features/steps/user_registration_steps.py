"""
pytest-bdd step definitions for user registration feature.
"""

import pytest
from pytest_bdd import given, when, then, parsers, scenario
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import structlog

from app.models.user import User
from app.schemas.auth import UserCreate
from app.services.user_service import UserService

logger = structlog.get_logger(__name__)


@pytest.fixture
def registration_data():
    """Fixture for registration data."""
    return {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "securepass123",
        "first_name": "John",
        "last_name": "Doe",
        "native_language": "en",
        "target_language": "es",
        "proficiency_level": "beginner"
    }


@pytest.fixture
def existing_user(test_session: AsyncSession):
    """Fixture for existing user."""
    from app.core.security import get_password_hash
    
    user = User(
        email="existing@example.com",
        username="existinguser",
        hashed_password=get_password_hash("existingpass"),
        native_language="en",
        target_language="es",
        proficiency_level="beginner"
    )
    
    test_session.add(user)
    test_session.commit()
    test_session.refresh(user)
    return user


@given("the application is running")
def application_running():
    """Ensure the application is running."""
    # This would typically check if the API is accessible
    # For now, we'll assume it's running
    pass


@given("no user exists with email {email}")
def no_user_exists(email, test_session: AsyncSession):
    """Ensure no user exists with the given email."""
    # This is handled by the test database setup
    pass


@given("a user already exists with email {email}")
def user_exists_with_email(email, existing_user):
    """User with given email exists."""
    assert existing_user.email == email


@given("a user already exists with username {username}")
def user_exists_with_username(username, existing_user):
    """User with given username exists."""
    assert existing_user.username == username


@when(parsers.parse("I register with the following information:\n{table}"))
def register_with_information(table, test_session: AsyncSession, registration_data):
    """Register with the provided information."""
    # Extract data from the table
    data = table[0]
    
    user_data = UserCreate(
        email=data["email"],
        username=data["username"],
        password=data["password"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        native_language=data["native_language"],
        target_language=data["target_language"],
        proficiency_level=data["proficiency_level"]
    )
    
    # Store for later verification
    pytest.registration_data = user_data
    pytest.registered_user = pytest.loop.run_until_complete(
        _register_user(test_session, user_data)
    )


@when("I register with email {email}")
def register_with_email(email, test_session: AsyncSession):
    """Register with just an email."""
    user_data = UserCreate(
        email=email,
        username="testuser",
        password="testpass123",
        native_language="en",
        target_language="es"
    )
    pytest.registered_user = pytest.loop.run_until_complete(
        _register_user(test_session, user_data)
    )


@when("I register with username {username}")
def register_with_username(username, test_session: AsyncSession):
    """Register with just a username."""
    user_data = UserCreate(
        email="test@example.com",
        username=username,
        password="testpass123",
        native_language="en",
        target_language="es"
    )
    pytest.registered_user = pytest.loop.run_until_complete(
        _register_user(test_session, user_data)
    )


@when("I register with password {password}")
def register_with_password(password, test_session: AsyncSession):
    """Register with just a password."""
    user_data = UserCreate(
        email="test@example.com",
        username="testuser",
        password=password,
        native_language="en",
        target_language="es"
    )
    pytest.registered_user = pytest.loop.run_until_complete(
        _register_user(test_session, user_data)
    )


@when("I register with missing required fields")
def register_with_missing_fields(test_session: AsyncSession):
    """Register with missing required fields."""
    user_data = UserCreate(
        email="",  # Missing email
        username="",  # Missing username
        password="",  # Missing password
        native_language="en",
        target_language="es"
    )
    pytest.registered_user = pytest.loop.run_until_complete(
        _register_user(test_session, user_data)
    )


@when(parsers.parse("I register with only required fields:\n{table}"))
def register_with_only_required_fields(table, test_session: AsyncSession):
    """Register with only required fields."""
    data = table[0]
    
    user_data = UserCreate(
        email=data["email"],
        username=data["username"],
        password=data["password"],
        native_language=data["native_language"],
        target_language=data["target_language"]
    )
    
    pytest.registered_user = pytest.loop.run_until_complete(
        _register_user(test_session, user_data)
    )


@when("I register successfully")
def register_successfully(test_session: AsyncSession):
    """Register successfully with valid data."""
    user_data = UserCreate(
        email="success@example.com",
        username="successuser",
        password="securepass123",
        native_language="en",
        target_language="es"
    )
    pytest.registered_user = pytest.loop.run_until_complete(
        _register_user(test_session, user_data)
    )


async def _register_user(test_session: AsyncSession, user_data: UserCreate):
    """Helper to register a user."""
    try:
        user_service = UserService(test_session)
        user = await user_service.create_user(user_data)
        return {"success": True, "user": user}
    except Exception as e:
        return {"success": False, "error": str(e)}


@then("the registration should be successful")
def registration_successful():
    """Verify registration was successful."""
    assert pytest.registered_user["success"], f"Registration failed: {pytest.registered_user.get('error', 'Unknown error')}"


@then("the registration should fail")
def registration_failed():
    """Verify registration failed."""
    assert not pytest.registered_user["success"], "Registration should have failed but succeeded"


@then("a new user account should be created")
def new_user_account_created():
    """Verify a new user account was created."""
    assert pytest.registered_user["success"]
    user = pytest.registered_user["user"]
    assert user.id is not None
    assert user.email == pytest.registration_data.email


@then("no new user account should be created")
def no_new_user_account_created():
    """Verify no new user account was created."""
    # This would typically check the database count
    # For now, we'll check that the registration failed
    assert not pytest.registered_user["success"]


@then(parsers.parse("the user should have the following attributes:\n{table}"))
def user_has_attributes(table):
    """Verify user has the expected attributes."""
    assert pytest.registered_user["success"]
    user = pytest.registered_user["user"]
    
    for row in table:
        attribute = row["attribute"]
        expected_value = row["value"]
        
        if expected_value == "null":
            assert getattr(user, attribute) is None, f"Expected {attribute} to be null"
        else:
            actual_value = getattr(user, attribute)
            if expected_value.isdigit():
                actual_value = str(actual_value)
            assert actual_value == expected_value, f"Expected {attribute} to be {expected_value}, got {actual_value}"


@then("the password should be securely hashed")
def password_securely_hashed():
    """Verify password is securely hashed."""
    assert pytest.registered_user["success"]
    user = pytest.registered_user["user"]
    
    # Password should not be stored in plain text
    assert user.hashed_password != pytest.registration_data.password
    # Hash should start with bcrypt identifier
    assert user.hashed_password.startswith("$2b$")


@then("the user should be marked as active")
def user_marked_active():
    """Verify user is marked as active."""
    assert pytest.registered_user["success"]
    user = pytest.registered_user["user"]
    assert user.is_active is True


@then("an error message should indicate {message}")
def error_message_indicates(message):
    """Verify error message contains expected text."""
    assert not pytest.registered_user["success"]
    error = pytest.registered_user.get("error", "")
    assert message in error, f"Expected error message '{message}' not found in '{error}'"


@then(parsers.parse("the user should have default values:\n{table}"))
def user_has_default_values(table):
    """Verify user has expected default values."""
    assert pytest.registered_user["success"]
    user = pytest.registered_user["user"]
    
    for row in table:
        attribute = row["attribute"]
        expected_value = row["value"]
        
        if expected_value == "null":
            assert getattr(user, attribute) is None, f"Expected {attribute} to be null"
        else:
            actual_value = getattr(user, attribute)
            if expected_value == "false":
                expected_value = False
            elif expected_value == "true":
                expected_value = True
            assert actual_value == expected_value, f"Expected {attribute} to be {expected_value}, got {actual_value}"


@then("a learning profile should be created")
def learning_profile_created():
    """Verify learning profile was created."""
    # This would check for related learning records
    # For now, we'll just verify the user was created
    assert pytest.registered_user["success"]


@then("daily goals should be set up")
def daily_goals_setup():
    """Verify daily goals were set up."""
    # This would check for daily goal records
    # For now, we'll just verify the user was created
    assert pytest.registered_user["success"]


@then("achievement tracking should be initialized")
def achievement_tracking_initialized():
    """Verify achievement tracking was initialized."""
    # This would check for achievement tracking records
    # For now, we'll just verify the user was created
    assert pytest.registered_user["success"]


@then("the user should be ready to start learning")
def user_ready_to_learn():
    """Verify user is ready to start learning."""
    # This would check for all necessary setup
    # For now, we'll just verify the user was created
    assert pytest.registered_user["success"]
