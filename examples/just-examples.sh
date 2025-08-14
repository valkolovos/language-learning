#!/bin/bash

# AI Language Learning Application - just Command Examples
# This script demonstrates various just commands and their usage

echo "🚀 AI Language Learning Application - just Command Examples"
echo "=========================================================="
echo ""

# Show all available commands
echo "📋 Available Commands:"
echo "======================"
just --list
echo ""

# Show help
echo "❓ Help Information:"
echo "==================="
just help
echo ""

# Show application info
echo "ℹ️  Application Information:"
echo "============================"
just info
echo ""

# Check service status
echo "🔍 Service Status:"
echo "=================="
just status
echo ""

# Health check
echo "🏥 Health Check:"
echo "================"
just health
echo ""

# Show Docker statistics
echo "🐳 Docker Statistics:"
echo "====================="
just docker-stats
echo ""

echo "🎯 Example Usage Patterns:"
echo "=========================="
echo ""
echo "1. Development Workflow:"
echo "   just dev              # Start development environment"
echo "   just test             # Run all tests"
echo "   just quality          # Run code quality checks"
echo "   just format           # Format all code"
echo ""
echo "2. Testing:"
echo "   just test-backend     # Backend tests only"
echo "   just test-frontend    # Frontend tests only"
echo "   just test-cov         # All tests with coverage"
echo "   just test-file <file> # Run specific test file"
echo ""
echo "3. Database Management:"
echo "   just db-start         # Start database"
echo "   just db-stop          # Stop database"
echo "   just migrate          # Run migrations"
echo ""
echo "4. Service Management:"
echo "   just start            # Start all services"
echo "   just stop             # Stop all services"
echo "   just restart          # Restart all services"
echo "   just logs             # Show all logs"
echo ""
echo "5. Code Quality:"
echo "   just quality          # All quality checks"
echo "   just lint             # Linting only"
echo "   just format           # Formatting only"
echo "   just type-check       # Type checking only"
echo ""
echo "6. Docker Operations:"
echo "   just docker-build     # Build images"
echo "   just docker-clean     # Clean resources"
echo "   just docker-stats     # Show statistics"
echo ""
echo "7. Development Workflows:"
echo "   just workflow         # Quality + tests"
echo "   just pre-commit       # Pre-commit checks"
echo "   just ci               # CI pipeline simulation"
echo ""
echo "8. Utilities:"
echo "   just clean            # Clean generated files"
echo "   just backup           # Backup database"
echo "   just monitor          # Performance monitoring"
echo ""
echo "💡 Tips:"
echo "======"
echo "- Use 'just help' to see all available commands"
echo "- Use 'just --list' to see commands in a compact format"
echo "- Commands can be combined: just quality test-cov"
echo "- Use 'just <command> --help' for command-specific help"
echo "- Commands are documented in the justfiles"
echo ""
echo "🔧 Customization:"
echo "================="
echo "- Edit justfiles to add your own commands"
echo "- Use parameters: just test-file tests/test_specific.py"
echo "- Chain commands: just quality && just test"
echo "- Use aliases in your shell for common combinations"
echo ""
echo "📚 Documentation:"
echo "================"
echo "- README.md: Quick start and overview"
echo "- DEVELOPMENT.md: Comprehensive development guide"
echo "- justfiles: Self-documenting command definitions"
echo "- https://just.systems: Official just documentation"
echo ""
echo "✨ Happy coding with just! 🚀"
