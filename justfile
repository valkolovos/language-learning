# AI Language Learning Application - Root Just Commands
# Run with: just <command> or just --list to see all commands

# Default command - show help
default:
    @just --list

# Show available commands
help:
    @echo "AI Language Learning Application - Available Commands:"
    @echo ""
    @echo "🚀 Quick Start:"
    @echo "  just start        - Local development mode (fast iteration)"
    @echo "  just start-docker - Docker mode (production-like environment)"
    @echo ""
    @echo "Full Stack Management:"
    @echo "  just start        - Start ALL services (DB + Redis + Backend + Frontend)"
    @echo "  just stop         - Stop ALL services (DB + Redis + Backend + Frontend)"
    @echo "  just restart      - Restart all services"
    @echo "  just start-docker - Start ALL services in Docker mode (production-like)"
    @echo "  just stop-docker  - Stop ALL Docker services"
    @echo "  just restart-docker - Restart all Docker services"
    @echo "  just status       - Show service status and health checks"
    @echo "  just logs         - Show all service logs"
    @echo ""
    @echo "Development Environment:"
    @echo "  just dev          - Start development environment (DB + Redis + Backend + Frontend)"
    @echo "  just dev-stop     - Stop development services only (keep DB + Redis running)"
    @echo "  just dev-backend  - Start backend development server only"
    @echo "  just dev-frontend - Start frontend development server only"
    @echo ""
    @echo "Docker Mode (Production-like):"
    @echo "  just start-docker - Start all services in Docker containers"
    @echo "  just stop-docker  - Stop all Docker services"
    @echo "  just restart-docker - Restart all Docker services"
    @echo ""
    @echo "Database Management:"
    @echo "  just db-start     - Start database services (PostgreSQL + Redis)"
    @echo "  just db-stop      - Stop database services"
    @echo "  just db-reset     - Reset database (WARNING: destroys data)"
    @echo "  just db-seed      - Seed database with sample data"
    @echo "  just verify-db-health - Verify PostgreSQL and Redis health"
    @echo ""
    @echo "Testing:"
    @echo "  just test         - Run all tests"
    @echo "  just test-backend - Run backend tests"
    @echo "  just test-frontend - Run frontend tests"
    @echo ""
    @echo "Code Quality:"
    @echo "  just quality      - Run all quality checks"
    @echo "  just format       - Format all code"
    @echo "  just lint         - Lint all code"
    @echo ""
    @echo "Node.js Management:"
    @echo "  just nvm-use      - Use Node.js version from .nvmrc"
    @echo "  just node-info    - Show Node.js version information"
    @echo ""
    @echo "Utilities:"
    @echo "  just clean        - Clean all generated files"
    @echo "  just docker       - Docker management commands"
    @echo "  just health       - Health check all services"
    @echo "  just modes        - Explain development modes"
    @echo ""
    @echo "Quick Start:"
    @echo "  just start        - Start everything for development (local mode)"
    @echo "  just start-docker - Start everything in Docker mode (production-like)"
    @echo "  just stop         - Stop everything when done"
    @echo "  just stop-docker  - Stop Docker services"
    @echo "  just dev          - Alternative to start (same functionality)"
    @echo "  just dev-stop     - Stop just the app services (keep DB running)"

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

# Verify database health
verify-db-health:
    @echo "Verifying database health..."
    @echo "Checking PostgreSQL..."
    @docker-compose exec -T postgres pg_isready -U postgres || (echo "❌ PostgreSQL is not ready" && exit 1)
    @echo "✅ PostgreSQL is ready"
    @echo "Checking Redis..."
    @docker-compose exec -T redis redis-cli ping | grep -q "PONG" || (echo "❌ Redis is not responding" && exit 1)
    @echo "✅ Redis is responding"
    @echo "✅ Database health verification complete"

# Start all services
start:
    @echo "Starting all services..."
    @echo "Starting database services..."
    docker-compose up -d postgres redis
    @echo "Waiting for database services to be ready..."
    @sleep 5
    @just verify-db-health
    @echo "Starting application services..."
    @just dev-backend
    @just dev-frontend
    @echo "Waiting for application services to start..."
    @sleep 10
    @just status
    @echo "✅ All services started and verified"

# Start all services in Docker mode (production-like)
start-docker:
    @echo "Starting all services in Docker mode..."
    @echo "Building Docker images..."
    @just docker-build
    @echo "Starting database services..."
    @just db-start
    @echo "Starting application services in Docker..."
    docker-compose up -d backend frontend nginx
    @echo "Waiting for services to initialize..."
    @sleep 10
    @echo "Checking service status..."
    @just status
    @echo "✅ All Docker services started"

# Stop all services
stop:
    @echo "Stopping all services..."
    @echo "Stopping development services..."
    @just dev-stop
    @echo "Stopping database services..."
    docker-compose down
    @echo "Cleaning up any remaining PID files..."
    rm -f backend/.pid frontend/.pid
    @echo "✅ All services stopped"

# Stop all Docker services
stop-docker:
    @echo "Stopping all Docker services..."
    docker-compose down
    @echo "✅ All Docker services stopped"

# Restart all services
restart: stop start
    @echo "Services restarted!"

# Restart all Docker services
restart-docker: stop-docker start-docker
    @echo "Docker services restarted!"

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
dev:
    @echo "Starting development environment..."
    @echo "Verifying database health first..."
    @just verify-db-health
    @echo "Starting application services..."
    @just dev-backend
    @just dev-frontend
    @echo "Waiting for services to start..."
    @sleep 10
    @just status
    @echo "Development environment started! 🚀"

# Start backend development server
dev-backend:
    @echo "Starting backend development server..."
    cd backend && just dev

# Start frontend development server
dev-frontend:
    @echo "Starting frontend development server..."
    cd frontend && just dev

# Stop development environment
dev-stop:
    @echo "Stopping development environment..."
    @echo "Stopping backend..."
    @if [ -f "backend/.pid" ]; then \
        PID=$(cat backend/.pid 2>/dev/null); \
        if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then \
            kill "$PID" && echo "Backend stopped (PID: $PID)" || echo "Failed to stop backend"; \
        else \
            echo "Backend PID file invalid or process not running"; \
        fi; \
        rm -f backend/.pid; \
    else \
        echo "No backend PID file found"; \
    fi
    @echo "Stopping frontend..."
    @if [ -f "frontend/.pid" ]; then \
        PID=$(cat frontend/.pid 2>/dev/null); \
        if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then \
            kill "$PID" && echo "Frontend stopped (PID: $PID)" || echo "Failed to stop frontend"; \
        else \
            echo "Frontend PID file invalid or process not running"; \
        fi; \
        rm -f frontend/.pid; \
    else \
        echo "No frontend PID file found"; \
    fi
    @echo "Development environment stopped! 🛑"

# Restart frontend development server
dev-restart-frontend:
    @echo "Restarting frontend development server..."
    @echo "Stopping frontend..."
    @if [ -f "frontend/.pid" ]; then \
        PID=$(cat frontend/.pid 2>/dev/null); \
        if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then \
            kill "$PID" && echo "Frontend stopped (PID: $PID)" || echo "Failed to stop frontend"; \
        else \
            echo "Frontend PID file invalid or process not running"; \
        fi; \
        rm -f frontend/.pid; \
    else \
        echo "No frontend PID file found"; \
    fi
    @echo "Starting frontend..."
    @just dev-frontend
    @echo "Frontend restarted! 🔄"

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

# Backend lint-fix
lint-fix-backend:
    @echo "Auto-fixing backend linting issues..."
    cd backend && just lint-fix

# Frontend lint-fix
lint-fix-frontend:
    @echo "Auto-fixing frontend linting issues..."
    cd frontend && just lint-fix

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

# Auto-fix linting issues
lint-fix: lint-fix-backend lint-fix-frontend
    @echo "All linting issues auto-fixed! ✨"

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
    rm -f backend/.pid frontend/.pid
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

# Explain the difference between development modes
modes:
    @echo "Development Modes:"
    @echo ""
    @echo "🐳 Docker Mode (just start-docker):"
    @echo "  • All services run in Docker containers"
    @echo "  • Production-like environment"
    @echo "  • Good for: demos, testing, team onboarding"
    @echo "  • Slower development cycle (rebuild containers for changes)"
    @echo ""
    @echo "💻 Local Mode (just start):"
    @echo "  • Database services in Docker, app services locally"
    @echo "  • Fast development iteration with hot reloading"
    @echo "  • Good for: active development, debugging, fast iteration"
    @echo "  • Requires local Python/Node.js setup"
    @echo ""
    @echo "🔄 Switching:"
    @echo "  • From Docker to Local: just stop-docker && just start"
    @echo "  • From Local to Docker: just stop && just start-docker"

# Database management
db-start:
    @echo "Starting database services..."
    docker-compose up -d postgres redis
    @echo "Waiting for database services to be ready..."
    @sleep 5
    @just verify-db-health
    @echo "✅ Database services started and healthy"

db-stop:
    @echo "Stopping database services..."
    docker-compose stop postgres redis
    @echo "✅ Database services stopped"

db-reset:
    @echo "Resetting database (WARNING: This will destroy all data!)..."
    docker-compose down -v postgres redis
    docker-compose up -d postgres redis
    @echo "✅ Database reset complete"

db-seed:
    @echo "Seeding database with sample data..."
    @echo "Note: This requires the backend to be running and database tables to exist"
    cd backend && just seed
    @echo "✅ Database seeding complete"

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
