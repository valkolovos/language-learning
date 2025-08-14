#!/bin/bash

# AI Language Learning Application Setup Script
# This script sets up the complete development environment

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

# Check Python version
check_python() {
    print_status "Checking Python version..."
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.11+ and try again."
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]); then
        print_error "Python 3.11+ is required. Current version: $PYTHON_VERSION"
        exit 1
    fi
    
    print_success "Python $PYTHON_VERSION is available"
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
    
    # Activate virtual environment
    source .venv/bin/activate
    
    # Install dependencies using uv
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_lessons_target_language ON lessons(target_language);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty_level ON lessons(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_lesson_progress(lesson_id);

-- Insert sample data for testing
INSERT INTO achievements (name, description, achievement_type, criteria, xp_reward, rarity) VALUES
('First Steps', 'Complete your first lesson', 'lessons', '{"threshold": 1, "timeframe": "lifetime"}', 50, 'common'),
('Streak Master', 'Maintain a 7-day learning streak', 'streak', '{"threshold": 7, "timeframe": "daily"}', 200, 'rare'),
('Language Explorer', 'Complete 10 lessons', 'lessons', '{"threshold": 10, "timeframe": "lifetime"}', 500, 'epic'),
('Dedicated Learner', 'Study for 30 days in a row', 'streak', '{"threshold": 30, "timeframe": "daily"}', 1000, 'legendary')
ON CONFLICT (name) DO NOTHING;
EOF
    
    print_success "Database initialization script created"
}

# Setup nginx configuration
setup_nginx() {
    print_status "Setting up nginx configuration..."
    
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
    
    print_success "Nginx configuration created"
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Build images
    docker-compose build
    
    # Start services
    docker-compose up -d
    
    print_success "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
        sleep 2
    done
    
    # Wait for backend
    print_status "Waiting for backend..."
    until curl -f http://localhost:8000/health > /dev/null 2>&1; do
        sleep 2
    done
    
    # Wait for frontend
    print_status "Waiting for frontend..."
    until curl -f http://localhost:3000 > /dev/null 2>&1; do
        sleep 2
    done
    
    print_success "All services are ready"
}

# Run tests using just
run_tests() {
    print_status "Running tests using just..."
    
    # Run backend tests
    print_status "Running backend tests..."
    cd backend
    just test
    
    # Run frontend tests
    print_status "Running frontend tests..."
    cd ../frontend
    just test
    
    cd ..
    print_success "All tests completed"
}

# Show status
show_status() {
    print_status "Application Status:"
    echo "  Backend API: http://localhost:8000"
    echo "  Frontend: http://localhost:3000"
    echo "  API Documentation: http://localhost:8000/docs"
    echo "  Health Check: http://localhost:8000/health"
    echo ""
    print_status "Next steps:"
    echo "  1. Update backend/.env with your configuration"
    echo "  2. Set up Google Cloud credentials in credentials/"
    echo "  3. Configure OpenAI API key in backend/.env"
    echo "  4. Access the application at http://localhost:3000"
    echo ""
    print_status "Development commands (using just):"
    echo "  just dev              - Start development environment"
    echo "  just test             - Run all tests"
    echo "  just quality          - Run code quality checks"
    echo "  just format           - Format all code"
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
    check_python
    check_nvm
    check_uv
    check_just
    
    # Setup environment
    create_directories
    setup_backend
    setup_frontend
    setup_database
    setup_nginx
    
    # Start services
    start_services
    wait_for_services
    
    # Run tests (optional)
    read -p "Do you want to run tests now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_tests
    fi
    
    # Show final status
    echo ""
    show_status
    
    print_success "Setup complete! 🎉"
    echo ""
    echo "Now you can use 'just' commands for development:"
    echo "  just help             - Show all commands"
    echo "  just dev              - Start development"
    echo "  just test             - Run tests"
    echo "  just quality          - Code quality checks"
    echo ""
    echo "Node.js version management:"
    echo "  nvm use               - Use the Node.js version from .nvmrc"
    echo "  nvm current           - Show current Node.js version"
}

# Run main function
main "$@"
