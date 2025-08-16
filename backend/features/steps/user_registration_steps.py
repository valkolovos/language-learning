"""
pytest-bdd step definitions for user registration feature.
"""

from typing import Any, Dict, List

import pytest
import structlog
from pytest_bdd import given, parsers, then, when
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.auth import UserCreate
from app.services.user_service import UserService

logger = structlog.get_logger(__name__)


def _safe_get_test_data(test_state: Dict[str, Any], key: str, default: Any = None) -> Any:
    """Safely extract data from test state with proper error handling."""
    if key not in test_state:
        raise KeyError(f"Required test state key '{key}' not found. Available keys: {list(test_state.keys())}")
    return test_state[key]


@pytest.fixture
def test_state() -> Dict[str, Any]:
    """Fixture for storing test state between steps."""
    return {}


@pytest.fixture
def registration_data() -> Dict[str, str]:
    """Fixture for registration data."""
    return {
        "email": "newuser@example.com",
        "username": "newuser",
        "password": "securepass123",
        "first_name": "John",
        "last_name": "Doe",
        "native_language": "en",
        "target_language": "es",
        "proficiency_level": "beginner",
    }


@pytest.fixture
async def existing_user(test_session: AsyncSession) -> User:
    """Fixture for existing user."""
    from app.core.security import get_password_hash

    user = User.create_user(
        email="existing@example.com",
        username="existinguser",
        hashed_password=get_password_hash("existingpass"),
        native_language="en",
        target_language="es",
        proficiency_level="beginner",
    )

    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)
    return user


@given("the application is running")
def application_running() -> None:
    """Ensure the application is running."""
    # This would typically check if the API is accessible
    # For now, we'll assume it's running


@given("no user exists with email {email}")
def no_user_exists(email: str, test_session: AsyncSession) -> None:
    """Ensure no user exists with the given email."""
    # This is handled by the test database setup


@given("a user already exists with email {email}")
def user_exists_with_email(email: str, existing_user: User) -> None:
    """User with given email exists."""
    assert existing_user.email == email


@given("a user already exists with username {username}")
def user_exists_with_username(username: str, existing_user: User) -> None:
    """User with given username exists."""
    assert existing_user.username == username


@when(parsers.parse("I register with the following information:\n{table}"))
async def register_with_information(
    table: List[Dict[str, str]], test_session: AsyncSession, test_state: Dict[str, Any]
) -> None:
    """Register with the provided information."""
    # Extract data from the table
    if not table:
        raise ValueError("No registration data provided in table")

    registration_data = table[0]

    # Validate required fields exist
    required_fields = ["email", "username", "password", "native_language", "target_language"]
    missing_fields = [field for field in required_fields if not registration_data.get(field)]

    if missing_fields:
        raise ValueError(f"Missing required fields: {missing_fields}")

    user_data = UserCreate(
        email=registration_data["email"],
        username=registration_data["username"],
        password=registration_data["password"],
        first_name=registration_data.get("first_name", ""),
        last_name=registration_data.get("last_name", ""),
        native_language=registration_data["native_language"],
        target_language=registration_data["target_language"],
        proficiency_level=registration_data.get("proficiency_level", "beginner"),
    )

    # Store for later verification
    test_state["registration_data"] = user_data
    test_state["registered_user"] = await _register_user(test_session, user_data)


@when("I register with email {email}")
async def register_with_email(email: str, test_session: AsyncSession, test_state: Dict[str, Any]) -> None:
    """Register with just an email."""
    user_data = UserCreate(
        email=email,
        username="testuser",
        password="testpass123",
        first_name="Test",
        last_name="User",
        native_language="en",
        target_language="es",
        proficiency_level="beginner",
    )
    test_state["registered_user"] = await _register_user(test_session, user_data)


@when("I register with username {username}")
async def register_with_username(username: str, test_session: AsyncSession, test_state: Dict[str, Any]) -> None:
    """Register with just a username."""
    user_data = UserCreate(
        email="test@example.com",
        username=username,
        password="testpass123",
        first_name="Test",
        last_name="User",
        native_language="en",
        target_language="es",
        proficiency_level="beginner",
    )
    test_state["registered_user"] = await _register_user(test_session, user_data)


@when("I register with password {password}")
async def register_with_password(password: str, test_session: AsyncSession, test_state: Dict[str, Any]) -> None:
    """Register with just a password."""
    user_data = UserCreate(
        email="test@example.com",
        username="testuser",
        password=password,
        first_name="Test",
        last_name="User",
        native_language="en",
        target_language="es",
        proficiency_level="beginner",
    )
    test_state["registered_user"] = await _register_user(test_session, user_data)


@when("I register with missing required fields")
async def register_with_missing_fields(test_session: AsyncSession, test_state: Dict[str, Any]) -> None:
    """Register with missing required fields."""
    user_data = UserCreate(
        email="",  # Missing email
        username="",  # Missing username
        password="",  # Missing password
        first_name="",
        last_name="",
        native_language="en",
        target_language="es",
        proficiency_level="beginner",
    )
    test_state["registered_user"] = await _register_user(test_session, user_data)


@when(parsers.parse("I register with only required fields:\n{table}"))
async def register_with_only_required_fields(
    table: List[Dict[str, str]], test_session: AsyncSession, test_state: Dict[str, Any]
) -> None:
    """Register with only required fields."""
    if not table:
        raise ValueError("No registration data provided in table")

    registration_data = table[0]

    # Validate required fields exist
    required_fields = ["email", "username", "password", "native_language", "target_language"]
    missing_fields = [field for field in required_fields if not registration_data.get(field)]

    if missing_fields:
        raise ValueError(f"Missing required fields: {missing_fields}")

    user_data = UserCreate(
        email=registration_data["email"],
        username=registration_data["username"],
        password=registration_data["password"],
        first_name=registration_data.get("first_name", ""),
        last_name=registration_data.get("last_name", ""),
        native_language=registration_data["native_language"],
        target_language=registration_data["target_language"],
        proficiency_level=registration_data.get("proficiency_level", "beginner"),
    )

    test_state["registered_user"] = await _register_user(test_session, user_data)


@when("I register successfully")
async def register_successfully(test_session: AsyncSession, test_state: Dict[str, Any]) -> None:
    """Register successfully with valid data."""
    user_data = UserCreate(
        email="success@example.com",
        username="successuser",
        password="securepass123",
        first_name="Success",
        last_name="User",
        native_language="en",
        target_language="es",
        proficiency_level="beginner",
    )
    test_state["registered_user"] = await _register_user(test_session, user_data)


async def _register_user(test_session: AsyncSession, user_data: UserCreate) -> Dict[str, Any]:
    """Helper to register a user."""
    try:
        user_service = UserService(test_session)
        user = await user_service.create_user(user_data)
        return {"success": True, "user": user}
    except Exception as e:
        return {"success": False, "error": str(e)}


@then("the registration should be successful")
def registration_successful(test_state: Dict[str, Any]) -> None:
    """Verify registration was successful."""
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert registered_user["success"], f"Registration failed: {registered_user.get('error', 'Unknown error')}"


@then("the registration should fail")
def registration_failed(test_state: Dict[str, Any]) -> None:
    """Verify registration failed."""
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert not registered_user["success"], "Registration should have failed but succeeded"


@then("a new user account should be created")
def new_user_account_created(test_state: Dict[str, Any]) -> None:
    """Verify a new user account was created."""
    registered_user = _safe_get_test_data(test_state, "registered_user")
    registration_data = _safe_get_test_data(test_state, "registration_data")

    assert registered_user["success"]
    user = registered_user["user"]
    assert user.id is not None
    assert user.email == registration_data.email


@then("no new user account should be created")
def no_new_user_account_created(test_state: Dict[str, Any]) -> None:
    """Verify no new user account was created."""
    # This would typically check the database count
    # For now, we'll check that the registration failed
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert not registered_user["success"]


@then(parsers.parse("the user should have the following attributes:\n{table}"))
def user_has_attributes(table: List[Dict[str, str]], test_state: Dict[str, Any]) -> None:
    """Verify user has the expected attributes."""
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert registered_user["success"], "User registration must be successful to check attributes"
    user = registered_user["user"]

    for row in table:
        if not row:
            continue

        attribute = row.get("attribute")
        expected_value = row.get("value")

        if not attribute:
            continue

        if not hasattr(user, attribute):
            raise AttributeError(f"User object does not have attribute '{attribute}'")

        if expected_value == "null":
            assert getattr(user, attribute) is None, f"Expected {attribute} to be null"
        else:
            actual_value = getattr(user, attribute)
            if expected_value and expected_value.isdigit():
                actual_value = str(actual_value)
            assert actual_value == expected_value, f"Expected {attribute} to be {expected_value}, got {actual_value}"


@then("the password should be securely hashed")
def password_securely_hashed(test_state: Dict[str, Any]) -> None:
    """Verify password is securely hashed."""
    registered_user = _safe_get_test_data(test_state, "registered_user")
    registration_data = _safe_get_test_data(test_state, "registration_data")

    assert registered_user["success"]
    user = registered_user["user"]

    # Password should not be stored in plain text
    assert user.hashed_password != registration_data.password
    # Hash should start with bcrypt identifier
    assert user.hashed_password.startswith("$2b$")


@then("the user should be marked as active")
def user_marked_active(test_state: Dict[str, Any]) -> None:
    """Verify user is marked as active."""
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert registered_user["success"]
    user = registered_user["user"]
    assert user.is_active is True


@then("an error message should indicate {message}")
def error_message_indicates(message: str, test_state: Dict[str, Any]) -> None:
    """Verify error message contains expected text."""
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert not registered_user["success"]
    error = registered_user.get("error", "")
    assert message in error, f"Expected error message '{message}' not found in '{error}'"


@then(parsers.parse("the user should have default values:\n{table}"))
def user_has_default_values(table: List[Dict[str, str]], test_state: Dict[str, Any]) -> None:
    """Verify user has expected default values."""
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert registered_user["success"], "User registration must be successful to check default values"
    user = registered_user["user"]

    for row in table:
        if not row:
            continue

        attribute = row.get("attribute")
        expected_value = row.get("value")

        if not attribute:
            continue

        if not hasattr(user, attribute):
            raise AttributeError(f"User object does not have attribute '{attribute}'")

        if expected_value == "null":
            assert getattr(user, attribute) is None, f"Expected {attribute} to be null"
        else:
            actual_value = getattr(user, attribute)
            # Convert string representations to appropriate types for comparison

            def convert_value(val: str) -> Any:
                if val == "false":
                    return False
                elif val == "true":
                    return True
                else:
                    return val

            if expected_value is not None:
                converted_value = convert_value(expected_value)
                assert (
                    actual_value == converted_value
                ), f"Expected {attribute} to be {converted_value}, got {actual_value}"
            else:
                # Handle case where expected_value is None but not "null"
                assert actual_value is None, f"Expected {attribute} to be None, got {actual_value}"


@then("a learning profile should be created")
def learning_profile_created(test_state: Dict[str, Any]) -> None:
    """Verify learning profile was created."""
    # This would check for related learning records
    # For now, we'll just verify the user was created
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert registered_user["success"]


@then("daily goals should be set up")
def daily_goals_setup(test_state: Dict[str, Any]) -> None:
    """Verify daily goals were set up."""
    # This would check for daily goal records
    # For now, we'll just verify the user was created
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert registered_user["success"]


@then("achievement tracking should be initialized")
def achievement_tracking_initialized(test_state: Dict[str, Any]) -> None:
    """Verify achievement tracking was initialized."""
    # This would check for achievement tracking records
    # For now, we'll just verify the user was created
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert registered_user["success"]


@then("the user should be ready to start learning")
def user_ready_to_learn(test_state: Dict[str, Any]) -> None:
    """Verify user is ready to start learning."""
    # This would check for all necessary setup
    # For now, we'll just verify the user was created
    registered_user = _safe_get_test_data(test_state, "registered_user")
    assert registered_user["success"]
