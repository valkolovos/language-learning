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
        
        # Download and verify uv installer
        UV_INSTALLER_URL="https://astral.sh/uv/install.sh"
        UV_INSTALLER_SHA256="$(curl -s https://astral.sh/uv/install.sh.sha256 | cut -d' ' -f1)"
        
        if [ -z "$UV_INSTALLER_SHA256" ]; then
            print_error "Failed to get uv installer checksum. Installation aborted for security."
            exit 1
        fi
        
        # Download installer to temporary file for verification
        TEMP_INSTALLER=$(mktemp)
        curl -LsSf "$UV_INSTALLER_URL" -o "$TEMP_INSTALLER"
        
        # Verify checksum
        if ! echo "$UV_INSTALLER_SHA256  $TEMP_INSTALLER" | sha256sum -c --quiet; then
            print_error "Checksum verification failed for uv installer. Installation aborted for security."
            rm -f "$TEMP_INSTALLER"
            exit 1
        fi
        
        # Execute verified installer
        sh "$TEMP_INSTALLER"
        rm -f "$TEMP_INSTALLER"
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
                # Download and verify just installer
                JUST_INSTALLER_URL="https://just.systems/install.sh"
                JUST_INSTALLER_SHA256="$(curl -s https://just.systems/install.sh.sha256 | cut -d' ' -f1)"
                
                if [ -z "$JUST_INSTALLER_SHA256" ]; then
                    print_error "Failed to get just installer checksum. Installation aborted for security."
                    exit 1
                fi
                
                # Download installer to temporary file for verification
                TEMP_INSTALLER=$(mktemp)
                curl --proto '=https' --tlsv1.2 -sSf "$JUST_INSTALLER_URL" -o "$TEMP_INSTALLER"
                
                # Verify checksum
                if ! echo "$JUST_INSTALLER_SHA256  $TEMP_INSTALLER" | sha256sum -c --quiet; then
                    print_error "Checksum verification failed for just installer. Installation aborted for security."
                    rm -f "$TEMP_INSTALLER"
                    exit 1
                fi
                
                # Execute verified installer
                bash "$TEMP_INSTALLER" --to ~/.local/bin
                rm -f "$TEMP_INSTALLER"
                export PATH="$HOME/.local/bin:$PATH"
            elif command -v yum &> /dev/null; then
                # RHEL/CentOS
                # Download and verify just installer
                JUST_INSTALLER_URL="https://just.systems/install.sh"
                JUST_INSTALLER_SHA256="$(curl -s https://just.systems/install.sh.sha256 | cut -d' ' -f1)"
            
                if [ -z "$JUST_INSTALLER_SHA256" ]; then
                    print_error "Failed to get just installer checksum. Installation aborted for security."
                    exit 1
                fi
            
                # Download installer to temporary file for verification
                TEMP_INSTALLER=$(mktemp)
                curl --proto '=https' --tlsv1.2 -sSf "$JUST_INSTALLER_URL" -o "$TEMP_INSTALLER"
            
                # Verify checksum
                if ! echo "$JUST_INSTALLER_SHA256  $TEMP_INSTALLER" | sha256sum -c --quiet; then
                    print_error "Checksum verification failed for just installer. Installation aborted for security."
                    exit 1
                fi
                
                # Execute verified installer
                bash "$TEMP_INSTALLER" --to ~/.local/bin
                rm -f "$TEMP_INSTALLER"
                export PATH="$HOME/.local/bin:$PATH"
            else
                # Generic Linux
                # Download and verify just installer
                JUST_INSTALLER_URL="https://just.systems/install.sh"
                JUST_INSTALLER_SHA256="$(curl -s https://just.systems/install.sh.sha256 | cut -d' ' -f1)"
                
                if [ -z "$JUST_INSTALLER_SHA256" ]; then
                    print_error "Failed to get just installer checksum. Installation aborted for security."
                    exit 1
                fi
                
                # Download installer to temporary file for verification
                TEMP_INSTALLER=$(mktemp)
                curl --proto '=https' --tlsv1.2 -sSf "$JUST_INSTALLER_URL" -o "$TEMP_INSTALLER"
                
                # Verify checksum
                if ! echo "$JUST_INSTALLER_SHA256  $TEMP_INSTALLER" | sha256sum -c --quiet; then
                    print_error "Checksum verification failed for just installer. Installation aborted for security."
                    rm -f "$TEMP_INSTALLER"
                    exit 1
                fi
                
                # Execute verified installer
                bash "$TEMP_INSTALLER" --to ~/.local/bin
                rm -f "$TEMP_INSTALLER"
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
                # Download and verify just installer
                JUST_INSTALLER_URL="https://just.systems/install.sh"
                JUST_INSTALLER_SHA256="$(curl -s https://just.systems/install.sh.sha256 | cut -d' ' -f1)"
                
                if [ -z "$JUST_INSTALLER_SHA256" ]; then
                    print_error "Failed to get just installer checksum. Installation aborted for security."
                    exit 1
                fi
                
                # Download installer to temporary file for verification
                TEMP_INSTALLER=$(mktemp)
                curl --proto '=https' --tlsv1.2 -sSf "$JUST_INSTALLER_URL" -o "$TEMP_INSTALLER"
                
                # Verify checksum
                if ! echo "$JUST_INSTALLER_SHA256  $TEMP_INSTALLER" | sha256sum -c --quiet; then
                    print_error "Checksum verification failed for just installer. Installation aborted for security."
                    rm -f "$TEMP_INSTALLER"
                    exit 1
                fi
                
                # Execute verified installer
                bash "$TEMP_INSTALLER" --to ~/.local/bin
                rm -f "$TEMP_INSTALLER"
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

# Create root-level .env file for docker-compose
create_root_env() {
    print_status "Creating root-level .env file for docker-compose..."
    
    if [ ! -f ".env" ]; then
        cat > .env << 'EOF'
# Database credentials
POSTGRES_PASSWORD=secure_password_123

# Google Cloud configuration
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id

# Optional: Override default ports if needed
# POSTGRES_PORT=5432
# REDIS_PORT=6379
# BACKEND_PORT=8000
# FRONTEND_PORT=3000
EOF
        print_success "Created .env file with secure default password"
        print_warning "Please update with your actual configuration values:"
        print_warning "  - Change POSTGRES_PASSWORD if desired"
        print_warning "  - Set your GOOGLE_CLOUD_PROJECT if using Google Cloud services"
    else
        print_status "Root-level .env file already exists"
    fi
    
    print_success "Root-level .env file ready"
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
        print_status "Creating .env file with correct Docker configuration..."
        
        # Get the password from root .env file
        if [ -f "../.env" ]; then
            POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" ../.env | cut -d'=' -f2)
            if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "your_secure_password_here" ]; then
                print_warning "POSTGRES_PASSWORD not set or still has default value in root .env"
                print_warning "Using fallback password for backend configuration"
                POSTGRES_PASSWORD="secure_password_123"
            fi
        else
            print_warning "Root .env file not found, using fallback password"
            POSTGRES_PASSWORD="secure_password_123"
        fi
        
        # Create backend .env with correct Docker configuration
        cat > .env << EOF
# Application Configuration
DEBUG=true
SECRET_KEY=your-secret-key-here-change-in-production
HOST=0.0.0.0
PORT=8000

# Database Configuration - Smart configuration for both local dev and Docker modes
# The backend will automatically detect which mode it's running in
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/language_learning
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30

# Redis Configuration - Smart configuration for both modes
REDIS_URL=redis://localhost:6379
REDIS_POOL_SIZE=10

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-google-cloud-project-id
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/google-credentials.json

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
AI_MODEL_NAME=gpt-4

# Security Configuration
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256

# CORS Configuration
ALLOWED_HOSTS=http://localhost:3000,http://localhost:8000

# Learning Engine Configuration
SPACED_REPETITION_INTERVALS=1,3,7,14,30,90,180,365
MAX_DAILY_LESSONS=5
MIN_LEARNING_SESSION_TIME=300

# Gamification Configuration
XP_PER_LESSON=100
XP_PER_EXERCISE=25
STREAK_MULTIPLIER=1.1

# Logging Configuration
LOG_LEVEL=INFO
LOG_FORMAT=json

# Monitoring Configuration
SENTRY_DSN=your-sentry-dsn-here
ENABLE_METRICS=true

# Testing Configuration
TESTING=false
TEST_DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/test_language_learning
TEST_DB_USER=postgres
TEST_DB_PASSWORD=${POSTGRES_PASSWORD}
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=test_language_learning

# Environment Detection
# Note: When running in Docker, the backend will automatically use the correct
# database host (postgres) and redis host (redis) due to Docker networking.
# When running locally, it will use localhost for both.
EOF
        
        print_success "Backend .env file created with Docker-optimized configuration"
        print_warning "Please update with your actual API keys and configuration values"
    else
        print_status "Backend .env file already exists"
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

# Show setup status
show_setup_status() {
    print_status "Setup Status:"
    echo "  ✅ Root-level .env file created"
    echo "  ✅ Backend .env file created with Docker configuration"
    echo "  ✅ Frontend .env file created"
    echo "  ✅ Database initialization script created"
    echo "  ✅ Nginx configuration created"
    echo "  ✅ Backend dependencies installed"
    echo "  ✅ Frontend dependencies installed"
    echo ""
    print_status "Configuration files created:"
    echo "  - .env (root level - for docker-compose)"
    echo "  - backend/.env (backend configuration)"
    echo "  - frontend/.env (frontend configuration)"
    echo ""
    print_status "Next steps:"
    echo "  1. Update backend/.env with your actual API keys and configuration"
    echo "  2. Set up Google Cloud credentials in credentials/"
    echo "  3. Configure OpenAI API key in backend/.env"
    echo "  4. Start services with: just start-docker"
    echo "  5. Access the application at http://localhost:3000"
    echo "  6. Seed the database with sample data: just db-seed"
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
    create_root_env
    setup_backend
    setup_frontend
    setup_database
    setup_nginx
    
    # Show final status and next steps
    echo ""
    show_setup_status
    print_success "Setup complete! 🎉"
    echo ""
    echo "Now you can use 'just' commands for development:"
    echo "  just help             - Show all commands"
    echo "  just dev              - Start development (local mode)"
    echo "  just start            - Start services in Docker mode"
    echo "  just modes            - Explain development modes"
    echo "  just test             - Run tests"
    echo "  just quality          - Code quality checks"
}

# Run main function
main "$@"
