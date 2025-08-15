#!/bin/bash

# AI Language Learning Application Setup Script
# This script sets up the complete development environment
#
# Usage:
#   ./setup.sh                    # Interactive mode (default)
#   NON_INTERACTIVE=true ./setup.sh  # Non-interactive mode (skips prompts)

set -e  # Exit on any error

echo "🚀 Setting up AI Language Learning Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    print_status "Checking Docker installation..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! docker-compose --version > /dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Check Python version using uv
check_python() {
    print_status "Checking Python version using uv..."
    
    # First check if uv is available (this should be called after check_uv)
    if ! command -v uv &> /dev/null; then
        print_error "uv is not available. Please install uv first."
        exit 1
    fi
    
    # Check if we have a Python version that meets our requirements (>=3.11)
    print_status "Looking for Python 3.11+ installation..."
    
    # Try to find Python 3.11+ using uv
    PYTHON_VERSION=$(uv python find ">=3.11" 2>/dev/null | head -n1 | grep -o 'cpython-[0-9]\+\.[0-9]\+' | head -n1)
    
    if [ -z "$PYTHON_VERSION" ]; then
        print_status "No Python 3.11+ found, attempting to install with uv..."
        uv python install "3.11"
        PYTHON_VERSION="3.11"
    fi
    
    # Verify the Python version works
    if uv run python --version &> /dev/null; then
        ACTUAL_VERSION=$(uv run python --version | cut -d' ' -f2)
        print_success "Python $ACTUAL_VERSION is available via uv"
    else
        print_error "Failed to verify Python installation via uv"
        exit 1
    fi
}

# Check if nvm is available and use it
check_nvm() {
    print_status "Checking nvm installation..."
    
    # Check if nvm is available
    if ! command -v nvm &> /dev/null; then
        # Try to source nvm from common locations
        if [ -f "$HOME/.nvm/nvm.sh" ]; then
            source "$HOME/.nvm/nvm.sh"
        elif [ -f "$HOME/.bashrc" ]; then
            source "$HOME/.bashrc"
        elif [ -f "$HOME/.zshrc" ]; then
            source "$HOME/.zshrc"
        fi
    fi
    
    if ! command -v nvm &> /dev/null; then
        print_error "nvm is not available. Please install nvm first:"
        echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        echo "  Then restart your terminal or source your profile file."
        exit 1
    fi
    
    print_success "nvm is available"
    
    # Check if .nvmrc exists
    if [ ! -f ".nvmrc" ]; then
        print_error ".nvmrc file not found. Please create one with the desired Node.js version."
        exit 1
    fi
    
    # Read the Node.js version from .nvmrc
    NODE_VERSION=$(cat .nvmrc | tr -d '[:space:]')
    print_status "Using Node.js version from .nvmrc: $NODE_VERSION"
    
    # Check if the required Node.js version is installed
    if ! nvm list | grep -q "$NODE_VERSION"; then
        print_status "Installing Node.js $NODE_VERSION..."
        nvm install "$NODE_VERSION"
    fi
    
    # Use the specified Node.js version
    nvm use "$NODE_VERSION"
    
    # Verify the Node.js version
    ACTUAL_VERSION=$(node --version | cut -d'v' -f2)
    print_success "Node.js $ACTUAL_VERSION is now active"
    
    # Check npm version
    NPM_VERSION=$(npm --version)
    print_success "npm $NPM_VERSION is available"
}

# Check if uv is installed
check_uv() {
    print_status "Checking uv installation..."
    if ! command -v uv &> /dev/null; then
        print_warning "uv is not installed. Installing uv..."
        curl -LsSf https://astral.sh/uv/install.sh | sh
        source $HOME/.cargo/env
    fi
    print_success "uv is available"
}

# Check if just is installed
check_just() {
    print_status "Checking just installation..."
    if ! command -v just &> /dev/null; then
        print_warning "just is not installed. Installing just..."
        
        # Detect OS and install just
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            if command -v apt-get &> /dev/null; then
                # Debian/Ubuntu
                curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/.local/bin
                export PATH="$HOME/.local/bin:$PATH"
            elif command -v yum &> /dev/null; then
                # RHEL/CentOS
                curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/.local/bin
                export PATH="$HOME/.local/bin:$PATH"
            else
                # Generic Linux
                curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/.local/bin
                export PATH="$HOME/.local/bin:$PATH"
            fi
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install just
            else
                curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/.local/bin
                export PATH="$HOME/.local/bin:$PATH"
            fi
        else
            # Generic Unix
            curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/.local/bin
            export PATH="$HOME/.local/bin:$PATH"
        fi
        
        # Verify installation
        if ! command -v just &> /dev/null; then
            print_error "Failed to install just. Please install manually from https://just.systems/"
            exit 1
        fi
    fi
    print_success "just is available"
    
    # Check if required justfile commands are available
    print_status "Verifying justfile commands..."
    if ! just verify-db-health --help > /dev/null 2>&1; then
        print_warning "Some justfile commands may not be available. This could cause issues."
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/logs
    mkdir -p backend/reports
    mkdir -p frontend/build
    mkdir -p database/init
    mkdir -p credentials
    mkdir -p nginx
    
    print_success "Directories created"
}

# Setup backend environment
setup_backend() {
    print_status "Setting up backend environment..."
    
    cd backend
    
    # Create virtual environment using uv
    if [ ! -d ".venv" ]; then
        print_status "Creating Python virtual environment with uv..."
        uv venv
    fi
    
    # Install dependencies using uv (no need to activate venv manually)
    print_status "Installing Python dependencies with uv..."
    uv pip install -e .
    uv pip install -e ".[dev]"
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file from template..."
        cp env.example .env
        print_warning "Please update .env file with your actual configuration values"
    fi
    
    cd ..
    print_success "Backend environment setup complete"
}

# Setup frontend environment
setup_frontend() {
    print_status "Setting up frontend environment..."
    
    cd frontend
    
    # Ensure we're using the correct Node.js version
    cd ..
    nvm use
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        echo "REACT_APP_API_URL=http://localhost:8000" > .env
    fi
    
    cd ..
    print_success "Frontend environment setup complete"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Create database initialization script
    cat > database/init/init.sql << 'EOF'
-- Language Learning Database Initialization

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE lesson_status AS ENUM ('not_started', 'in_progress', 'completed', 'mastered');
CREATE TYPE exercise_type AS ENUM ('multiple_choice', 'fill_blank', 'matching', 'speaking', 'listening');
CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Note: Tables and indexes will be created by the application's models and migrations
-- This ensures proper schema management and version control
-- Sample data can be inserted after the application starts and tables are created
EOF
    
    print_success "Database initialization script created"
    
    # Note: Database seeding script already exists as seed_data_simple.py
    print_status "Database seeding script already exists (seed_data_simple.py)"
    print_status "Use 'just db-seed' to populate the database with sample data"
}

# Setup nginx configuration
setup_nginx() {
    print_status "Setting up nginx configuration..."
    
    # Create nginx config for the root nginx service
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health checks
        location /health {
            proxy_pass http://backend/health;
        }
    }
}
EOF
    
    # Also create nginx config for the frontend Docker build
    cat > frontend/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name localhost;
        
        # Serve static files
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }
        
        # Health check
        location /health {
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF
    
    print_success "Nginx configuration created"
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Use the new just command for starting all services in Docker mode
    print_status "Starting all services in Docker mode..."
    just start-docker
    
    print_success "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database using justfile command
    print_status "Waiting for database..."
    until just verify-db-health > /dev/null 2>&1; do
        print_status "Database not ready yet, waiting..."
        sleep 5
    done
    print_success "Database is ready"
    
    # Wait for backend with timeout
    print_status "Waiting for backend..."
    local backend_timeout=60
    local backend_elapsed=0
    while [ $backend_elapsed -lt $backend_timeout ]; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Backend is ready"
            break
        fi
        print_status "Backend not ready yet, waiting... ($backend_elapsed/$backend_timeout seconds)"
        sleep 5
        backend_elapsed=$((backend_elapsed + 5))
    done
    
    if [ $backend_elapsed -ge $backend_timeout ]; then
        print_warning "Backend health check timed out after $backend_timeout seconds"
        print_warning "You may need to check backend logs manually"
    fi
    
    # Wait for frontend with timeout
    print_status "Waiting for frontend..."
    local frontend_timeout=60
    local frontend_elapsed=0
    while [ $frontend_elapsed -lt $frontend_timeout ]; do
        # Check frontend on port 3000 (mapped from container port 80)
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend is ready"
            break
        fi
        print_status "Frontend not ready yet, waiting... ($frontend_elapsed/$frontend_timeout seconds)"
        sleep 5
        frontend_elapsed=$((frontend_elapsed + 5))
    done
    
    if [ $frontend_elapsed -ge $frontend_timeout ]; then
        print_warning "Frontend health check timed out after $frontend_timeout seconds"
        print_warning "You may need to check frontend logs manually"
    fi
    
    print_success "Service health checks completed"
    
    # Show final service status
    print_status "Final service status:"
    just status
}

# Show service logs for debugging
show_service_logs() {
    print_status "Showing recent service logs for debugging..."
    echo ""
    echo "=== Database Logs ==="
    docker-compose logs --tail=20 postgres
    echo ""
    echo "=== Backend Logs ==="
    docker-compose logs --tail=20 backend
    echo ""
    echo "=== Frontend Logs ==="
    docker-compose logs --tail=20 frontend
    echo ""
    echo "=== Nginx Logs ==="
    docker-compose logs --tail=20 nginx
}

# Run tests using just
run_tests() {
    print_status "Running tests using just..."
    
    # Run all tests using root justfile
    print_status "Running all tests..."
    just test
    
    print_success "All tests completed"
}

# Show status
show_status() {
    print_status "Application Status:"
    echo "  Backend API: http://localhost:8000"
    echo "  Frontend: http://localhost:3000 (served by nginx)"
    echo "  API Documentation: http://localhost:8000/docs"
    echo "  Health Check: http://localhost:8000/health"
    echo ""
    print_status "Next steps:"
    echo "  1. Update backend/.env with your configuration"
    echo "  2. Set up Google Cloud credentials in credentials/"
    echo "  3. Configure OpenAI API key in backend/.env"
    echo "  4. Access the application at http://localhost:3000"
    echo "  5. Seed the database with sample data: just db-seed"
    echo ""
    print_status "Development commands (using just):"
    echo "  just start            - Start development environment (local mode)"
    echo "  just start-docker     - Start services in Docker mode (production-like)"
    echo "  just dev              - Alternative to start (same functionality)"
    echo "  just test             - Run all tests"
    echo "  just quality          - Run code quality checks"
    echo "  just format           - Format all code"
    echo "  just db-seed          - Seed database with sample data"
    echo "  just modes            - Explain development modes"
    echo "  just help             - Show all available commands"
    echo ""
    print_status "Node.js version management:"
    echo "  nvm use               - Use the Node.js version from .nvmrc"
    echo "  nvm current           - Show current Node.js version"
    echo "  nvm list              - List installed Node.js versions"
}

# Main execution
main() {
    echo "🎯 AI Language Learning Application Setup"
    echo "========================================"
    echo ""
    
    # Check prerequisites
    check_docker
    check_docker_compose
    check_uv
    check_python
    check_nvm
    check_just
    
    # Setup environment
    create_directories
    setup_backend
    setup_frontend
    setup_database
    setup_nginx
    
    # Start services
    start_services
    
    # Give services a moment to start
    print_status "Giving services time to initialize..."
    sleep 10
    
    # Check service status
    print_status "Checking service status..."
    just status
    
    # Wait for services to be ready
    wait_for_services
    
        # Offer to show logs if there were issues
    if [ $? -ne 0 ]; then
        echo ""
        if [ "${NON_INTERACTIVE:-false}" = "true" ]; then
            echo "Non-interactive mode: Skipping log display prompt"
        else
            read -p "Some services may not be fully ready. Show service logs for debugging? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                show_service_logs
            fi
        fi
    fi
    
    # Run tests (optional)
    if [ "${NON_INTERACTIVE:-false}" = "true" ]; then
        echo "Non-interactive mode: Skipping test execution prompt"
    else
        read -p "Do you want to run tests now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_tests
        fi
    fi
    
    # Show final status
    echo ""
    show_status
    
    print_success "Setup complete! 🎉"
    echo ""
    echo "Now you can use 'just' commands for development:"
    echo "  just help             - Show all commands"
    echo "  just start            - Start development (local mode)"
    echo "  just start-docker     - Start services in Docker mode"
    echo "  just modes            - Explain development modes"
    echo "  just test             - Run tests"
    echo "  just quality          - Code quality checks"
    echo ""
    echo "Node.js version management:"
    echo "  nvm use               - Use the Node.js version from .nvmrc"
    echo "  nvm current           - Show current Node.js version"
}

# Run main function
main "$@"
