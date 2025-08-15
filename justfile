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
    @command -v nvm &> /dev/null || (echo "❌ nvm not found. Please install nvm first:" && echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash" && echo "  Then restart your terminal or source your profile file." && exit 1)
    @echo "✅ nvm is available"
    @echo "Checking .nvmrc file..."
    @test -f ".nvmrc" || (echo "❌ .nvmrc file not found. Please create one with the desired Node.js version." && exit 1)
    @echo "✅ .nvmrc file found"
    @echo "Using Node.js version from .nvmrc..."
    @nvm use
    @echo "✅ Node.js version:"
    @node --version

# Create necessary directories
create-directories:
    @echo "Creating logs and reports directories..."
    mkdir -p logs reports
    @echo "✅ Directories created"

# Setup backend environment
setup-backend:
    @echo "Setting up backend environment..."
    cd backend && just install
    @echo "✅ Backend environment setup complete"

# Setup frontend environment
setup-frontend:
    @echo "Setting up frontend environment..."
    cd frontend && just install
    @echo "✅ Frontend environment setup complete"

# Setup database
setup-database:
    @echo "Setting up database..."
    mkdir -p database/init
    echo "-- Language Learning Database Initialization" > database/init/init.sql
    echo "" >> database/init/init.sql
    echo "-- Create extensions" >> database/init/init.sql
    echo "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >> database/init/init.sql
    echo "" >> database/init/init.sql
    echo "-- Create custom types" >> database/init/init.sql
    echo "CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced');" >> database/init/init.sql
    echo "CREATE TYPE lesson_status AS ENUM ('not_started', 'in_progress', 'completed', 'mastered');" >> database/init/init.sql
    echo "CREATE TYPE exercise_type AS ENUM ('multiple_choice', 'fill_blank', 'matching', 'speaking', 'listening');" >> database/init/init.sql
    echo "CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');" >> database/init/init.sql
    echo "" >> database/init/init.sql
    echo "-- Note: Tables and indexes will be created by the application's models and migrations" >> database/init/init.sql
    echo "-- This ensures proper schema management and version control" >> database/init/init.sql
    @echo "✅ Database initialization script created"

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

# Run tests with coverage
test-cov: test-backend-cov test-frontend-cov
    @echo "All tests with coverage completed! 📊"

# Run backend tests with coverage
test-backend-cov:
    @echo "Running backend tests with coverage..."
    cd backend && just test-cov

# Run frontend tests with coverage
test-frontend-cov:
    @echo "Running frontend tests with coverage..."
    cd frontend && just test-cov

# Code quality checks
quality: quality-backend quality-frontend
    @echo "All quality checks completed! ✨"

# Backend quality checks
quality-backend:
    @echo "Running backend quality checks..."
    cd backend && just quality

# Frontend quality checks
quality-frontend:
    @echo "Running frontend quality checks..."
    cd frontend && just quality

# Format code
format: format-backend format-frontend
    @echo "All code formatting completed! 🎨"

# Format backend code
format-backend:
    @echo "Formatting backend code..."
    cd backend && just format

# Format frontend code
format-frontend:
    @echo "Formatting frontend code..."
    cd frontend && just format

# Lint code
lint: lint-backend lint-frontend
    @echo "All code linting completed! 🔍"

# Lint backend code
lint-backend:
    @echo "Linting backend code..."
    cd backend && just lint

# Lint frontend code
lint-frontend:
    @echo "Linting frontend code..."
    cd frontend && just lint

# Clean generated files
clean:
    @echo "Cleaning generated files..."
    rm -rf logs reports
    cd backend && just clean
    cd frontend && just clean
    @echo "✅ Cleanup completed"

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
    @echo "✅ Database services started"

db-stop:
    @echo "Stopping database services..."
    docker-compose stop postgres redis
    @echo "✅ Database services stopped"

db-reset:
    @echo "Resetting database (WARNING: This will destroy all data!)..."
    docker-compose down -v postgres redis
    docker-compose up -d postgres redis
    @echo "✅ Database reset complete"

# Wait for services to be ready
wait-for-services:
    @echo "Waiting for database to be ready..."
    @echo "Note: This may take a few moments..."
    @docker-compose exec -T postgres pg_isready -U postgres || (echo "❌ Database is not ready. Please check Docker services." && exit 1)
    @echo "✅ Database is ready"
    @echo "Waiting for backend to be ready..."
    @echo "Note: This may take a few moments..."
    @curl -f http://localhost:8000/health > /dev/null 2>&1 || (echo "❌ Backend is not ready. Please check Docker services." && exit 1)
    @echo "✅ Backend is ready"
    @echo "Waiting for frontend to be ready..."
    @echo "Note: This may take a few moments..."
    @curl -f http://localhost:3000 > /dev/null 2>&1 || (echo "❌ Frontend is not ready. Please check Docker services." && exit 1)
    @echo "✅ Frontend is ready"

# Docker management
docker-build:
    @echo "Building all Docker images..."
    docker-compose build
    @echo "✅ All Docker images built"

docker-clean:
    @echo "Cleaning Docker resources..."
    docker-compose down -v --rmi all
    @echo "✅ Docker resources cleaned"

docker-stats:
    @echo "Showing Docker container statistics..."
    docker stats

docker-push:
    @echo "Pushing Docker images to registry (requires login)..."
    docker-compose push
    @echo "✅ Docker images pushed"

# Application info
info:
    @echo "AI Language Learning Application Info:"
    @echo "====================================="
    @echo "Application Name: AI Language Learning"
    @echo "Version: 1.0.0"
    @echo "Backend Port: 8000"
    @echo "Frontend Port: 3000"
    @echo "Database: PostgreSQL"
    @echo "Cache: Redis"
    @echo "Backend Framework: FastAPI"
    @echo "Frontend Framework: React + TypeScript"
    @echo "Python Version: 3.11+"
    @echo "Node.js Version: 18+"
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
