# AI Language Learning Application - Root Just Commands
# Run with: just <command> or just --list to see all commands

# Default command - show help
default:
    @just --list

# Show available commands
help:
    @echo "AI Language Learning Application - Available Commands:"
    @echo ""
    @echo "Full Stack:"
    @echo "  just setup        - Complete application setup"
    @echo "  just start        - Start all services"
    @echo "  just stop         - Stop all services"
    @echo "  just restart      - Restart all services"
    @echo "  just status       - Show service status"
    @echo "  just logs         - Show all service logs"
    @echo ""
    @echo "Development:"
    @echo "  just dev          - Start development environment"
    @echo "  just dev-backend  - Start backend development server"
    @echo "  just dev-frontend - Start frontend development server"
    @echo "  just test         - Run all tests"
    @echo "  just test-backend - Run backend tests"
    @echo "  just test-frontend - Run frontend tests"
    @echo ""
    @echo "Code Quality:"
    @echo "  just quality      - Run all quality checks"
    @echo "  just format       - Format all code"
    @echo "  just lint         - Lint all code"
    @echo ""
    @echo "Database:"
    @echo "  just db-start     - Start database services"
    @echo "  just db-stop      - Stop database services"
    @echo "  just db-reset     - Reset database (WARNING: destroys data)"
    @echo ""
    @echo "Node.js Management:"
    @echo "  just nvm-use      - Use Node.js version from .nvmrc"
    @echo "  just node-info    - Show Node.js version information"
    @echo ""
    @echo "Utilities:"
    @echo "  just clean        - Clean all generated files"
    @echo "  just docker       - Docker management commands"
    @echo "  just health       - Health check all services"

# Complete application setup
setup:
    @echo "🚀 Setting up AI Language Learning Application..."
    @echo "Checking prerequisites..."
    @just check-prerequisites
    @echo "Creating directories..."
    @just create-directories
    @echo "Setting up backend..."
    @just setup-backend
    @echo "Setting up frontend..."
    @just setup-frontend
    @echo "Setting up database..."
    @just setup-database
    @echo "Starting services..."
    @just start
    @echo "Waiting for services..."
    @just wait-for-services
    @echo "Setup complete! 🎉"

# Check prerequisites
check-prerequisites:
    @echo "Checking Docker..."
    @docker --version || (echo "❌ Docker not found. Please install Docker." && exit 1)
    @echo "Checking Docker Compose..."
    @docker-compose --version || (echo "❌ Docker Compose not found. Please install Docker Compose." && exit 1)
    @echo "Checking Python..."
    @python3 --version || (echo "❌ Python 3 not found. Please install Python 3.11+." && exit 1)
    @echo "Checking nvm..."
    @just check-nvm
    @echo "Checking uv..."
    @uv --version || (echo "❌ uv not found. Please install uv." && exit 1)
    @echo "Checking just..."
    @just --version || (echo "❌ just not found. Please install just." && exit 1)
    @echo "✅ All prerequisites met!"

# Check nvm and Node.js version
check-nvm:
    @echo "Checking nvm installation..."
    @if ! command -v nvm &> /dev/null; then
        @echo "❌ nvm not found. Please install nvm first:"
        @echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        @echo "  Then restart your terminal or source your profile file."
        @exit 1
    @fi
    @echo "✅ nvm is available"
    @echo "Checking .nvmrc file..."
    @if [ ! -f ".nvmrc" ]; then
        @echo "❌ .nvmrc file not found. Please create one with the desired Node.js version."
        @exit 1
    @fi
    @echo "✅ .nvmrc file found"
    @echo "Using Node.js version from .nvmrc..."
    @nvm use
    @echo "✅ Node.js version:"
    @node --version

# Create necessary directories
create-directories:
    @echo "Creating directories..."
    mkdir -p backend/logs backend/reports frontend/build database/init credentials nginx

# Setup backend
setup-backend:
    @echo "Setting up backend..."
    cd backend && just install

# Setup frontend
setup-frontend:
    @echo "Setting up frontend..."
    cd frontend && just install

# Setup database
setup-database:
    @echo "Setting up database..."
    @just db-start
    @echo "Waiting for database..."
    @just wait-for-db

# Start all services
start:
    @echo "Starting all services..."
    docker-compose up -d

# Stop all services
stop:
    @echo "Stopping all services..."
    docker-compose down

# Restart all services
restart: stop start
    @echo "Services restarted!"

# Show service status
status:
    @echo "Service Status:"
    @echo "==============="
    @docker-compose ps
    @echo ""
    @echo "Health Checks:"
    @just health

# Show all service logs
logs:
    @echo "Showing all service logs..."
    docker-compose logs -f

# Show specific service logs
logs-service service:
    @echo "Showing {{service}} logs..."
    docker-compose logs -f {{service}}

# Development environment
dev: dev-backend dev-frontend
    @echo "Development environment started! 🚀"

# Start backend development server
dev-backend:
    @echo "Starting backend development server..."
    cd backend && just dev

# Start frontend development server
dev-frontend:
    @echo "Starting frontend development server..."
    cd frontend && just dev

# Run all tests
test: test-backend test-frontend
    @echo "All tests completed! 🎯"

# Run backend tests
test-backend:
    @echo "Running backend tests..."
    cd backend && just test

# Run frontend tests
test-frontend:
    @echo "Running frontend tests..."
    cd frontend && just test

# Run backend tests with coverage
test-backend-cov:
    @echo "Running backend tests with coverage..."
    cd backend && just test-cov

# Run frontend tests with coverage
test-frontend-cov:
    @echo "Running frontend tests with coverage..."
    cd frontend && just test-cov

# Run all tests with coverage
test-cov: test-backend-cov test-frontend-cov
    @echo "All tests with coverage completed! 📊"

# Run all quality checks
quality: quality-backend quality-frontend
    @echo "All quality checks passed! ✨"

# Run backend quality checks
quality-backend:
    @echo "Running backend quality checks..."
    cd backend && just quality

# Run frontend quality checks
quality-frontend:
    @echo "Running frontend quality checks..."
    cd frontend && just quality

# Format all code
format: format-backend format-frontend
    @echo "All code formatted! 🎨"

# Format backend code
format-backend:
    @echo "Formatting backend code..."
    cd backend && just format

# Format frontend code
format-frontend:
    @echo "Formatting frontend code..."
    cd frontend && just format

# Lint all code
lint: lint-backend lint-frontend
    @echo "All code linted! 🔍"

# Lint backend code
lint-backend:
    @echo "Linting backend code..."
    cd backend && just lint

# Lint frontend code
lint-frontend:
    @echo "Linting frontend code..."
    cd frontend && just lint

# Node.js version management
nvm-use:
    @echo "Using Node.js version from .nvmrc..."
    nvm use
    @echo "Current Node.js version:"
    node --version

# Show Node.js version information
node-info:
    @echo "Node.js version information:"
    @echo "Current version:"
    node --version
    @echo "npm version:"
    npm --version
    @echo "nvm current:"
    nvm current
    @echo "Available versions:"
    nvm list

# Database management
db-start:
    @echo "Starting database services..."
    docker-compose up -d postgres redis

db-stop:
    @echo "Stopping database services..."
    docker-compose stop postgres redis

db-reset:
    @echo "⚠️  WARNING: This will destroy all data!"
    @read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ]
    @echo "Resetting database..."
    docker-compose down -v
    docker-compose up -d postgres redis
    @just wait-for-db

# Wait for database to be ready
wait-for-db:
    @echo "Waiting for database to be ready..."
    @until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
        @echo "Database not ready, waiting..."
        @sleep 2
    done
    @echo "Database is ready!"

# Wait for all services to be ready
wait-for-services:
    @echo "Waiting for all services to be ready..."
    @just wait-for-db
    @echo "Waiting for backend..."
    @until curl -f http://localhost:8000/health > /dev/null 2>&1; do
        @echo "Backend not ready, waiting..."
        @sleep 2
    done
    @echo "Waiting for frontend..."
    @until curl -f http://localhost:3000 > /dev/null 2>&1; do
        @echo "Frontend not ready, waiting..."
        @sleep 2
    done
    @echo "All services are ready! 🎉"

# Health check all services
health:
    @echo "Health Check Results:"
    @echo "===================="
    @echo "Database:"
    @docker-compose exec -T postgres pg_isready -U postgres && echo "✅ Database healthy" || echo "❌ Database unhealthy"
    @echo "Backend:"
    @curl -f http://localhost:8000/health > /dev/null 2>&1 && echo "✅ Backend healthy" || echo "❌ Backend unhealthy"
    @echo "Frontend:"
    @curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ Frontend healthy" || echo "❌ Frontend unhealthy"

# Clean all generated files
clean: clean-backend clean-frontend
    @echo "All generated files cleaned! 🧹"

# Clean backend
clean-backend:
    @echo "Cleaning backend..."
    cd backend && just clean

# Clean frontend
clean-frontend:
    @echo "Cleaning frontend..."
    cd frontend && just clean

# Docker management
docker:
    @echo "Docker Management Commands:"
    @echo "=========================="
    @echo "  just docker-build     - Build all Docker images"
    @echo "  just docker-push      - Push images to registry"
    @echo "  just docker-clean     - Clean Docker resources"
    @echo "  just docker-stats     - Show Docker statistics"

# Build all Docker images
docker-build:
    @echo "Building all Docker images..."
    docker-compose build

# Push images to registry
docker-push:
    @echo "Pushing images to registry..."
    @echo "Note: Configure your registry first"
    docker-compose push

# Clean Docker resources
docker-clean:
    @echo "Cleaning Docker resources..."
    docker system prune -f
    docker volume prune -f

# Show Docker statistics
docker-stats:
    @echo "Docker Statistics:"
    @docker stats --no-stream

# Development workflow
workflow: quality test-cov
    @echo "Development workflow completed! 🎯"

# Pre-commit checks
pre-commit: quality test-backend test-frontend
    @echo "Pre-commit checks passed! ✨"

# CI pipeline simulation
ci: quality test-cov security
    @echo "CI pipeline completed! 🚀"

# Security checks
security: security-backend security-frontend
    @echo "Security checks completed! 🔒"

# Backend security
security-backend:
    @echo "Running backend security checks..."
    cd backend && just security

# Frontend security
security-frontend:
    @echo "Running frontend security checks..."
    cd frontend && just security

# Update all dependencies
update: update-backend update-frontend
    @echo "All dependencies updated! 🔄"

# Update backend dependencies
update-backend:
    @echo "Updating backend dependencies..."
    cd backend && just update

# Update frontend dependencies
update-frontend:
    @echo "Updating frontend dependencies..."
    cd frontend && just update

# Show dependency information
deps: deps-backend deps-frontend
    @echo "Dependency information displayed! 📦"

# Show backend dependencies
deps-backend:
    @echo "Backend dependencies:"
    cd backend && just deps

# Show frontend dependencies
deps-frontend:
    @echo "Frontend dependencies:"
    cd frontend && just deps

# Performance monitoring
monitor:
    @echo "Performance monitoring started..."
    @echo "Press Ctrl+C to stop"
    docker stats

# Backup database
backup:
    @echo "Creating database backup..."
    @timestamp=$$(date +%Y%m%d_%H%M%S)
    @docker-compose exec -T postgres pg_dump -U postgres language_learning > backup_$$timestamp.sql
    @echo "Backup created: backup_$$timestamp.sql"

# Restore database from backup
restore file:
    @echo "Restoring database from {{file}}..."
    @docker-compose exec -T postgres psql -U postgres language_learning < {{file}}
    @echo "Database restored!"

# Show application info
info:
    @echo "AI Language Learning Application"
    @echo "================================"
    @echo "Version: 1.0.0"
    @echo "Backend: FastAPI + Python 3.11+"
    @echo "Frontend: React 18 + TypeScript"
    @echo "Database: PostgreSQL + Redis"
    @echo "Testing: pytest + pytest-bdd + Jest"
    @echo "Package Manager: uv (backend) + npm (frontend)"
    @echo "Command Runner: just"
    @echo "Node.js Manager: nvm"
    @echo ""
    @echo "Quick Start:"
    @echo "  just setup        - Complete setup"
    @echo "  just dev          - Start development"
    @echo "  just test         - Run all tests"
    @echo "  just nvm-use      - Use correct Node.js version"
    @echo "  just help         - Show this help"
