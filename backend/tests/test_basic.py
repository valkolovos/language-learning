"""
Basic tests to verify the pytest setup is working correctly.
"""

import pytest
from app.core.config import settings


def test_settings_loaded():
    """Test that settings are loaded correctly."""
    assert settings.APP_NAME == "AI Language Learning"
    assert settings.VERSION == "1.0.0"


def test_debug_mode():
    """Test debug mode configuration."""
    # Debug mode should be configurable
    assert hasattr(settings, 'DEBUG')
    assert isinstance(settings.DEBUG, bool)


@pytest.mark.asyncio
async def test_async_support():
    """Test that async tests are supported."""
    result = await async_function()
    assert result == "async_works"


async def async_function():
    """Simple async function for testing."""
    return "async_works"


@pytest.mark.parametrize("input_value,expected", [
    (1, 2),
    (2, 4),
    (3, 6),
    (10, 20),
])
def test_parameterized(input_value, expected):
    """Test parameterized testing."""
    assert input_value * 2 == expected


class TestClass:
    """Test class example."""
    
    def test_method(self):
        """Test method in class."""
        assert True
    
    def test_another_method(self):
        """Another test method."""
        assert 1 + 1 == 2
