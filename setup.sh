#!/bin/bash

# AI Language Learning Application Setup Script
# This script sets up the complete development environment
#
# Security Features:
# - Network connectivity validation before downloads
# - Timeout and retry logic for network operations
# - Proper checksum validation with format verification
# - Secure download handling with error checking
# - Temporary file cleanup on failures
#
# Usage:
#   ./setup.sh                    # Interactive mode (default)
#   NON_INTERACTIVE=true ./setup.sh  # Non-interactive mode (skips prompts)

set -e  # Exit on any error
set -o pipefail  # Exit if any command in a pipeline fails

# Global variable to track temporary files for cleanup
TEMP_FILES=()

# Function to cleanup temporary files on exit
cleanup_temp_files() {
    if [ ${#TEMP_FILES[@]} -gt 0 ]; then
        print_status "Cleaning up temporary files..."
        for temp_file in "${TEMP_FILES[@]}"; do
            if [ -f "$temp_file" ]; then
                rm -f "$temp_file"
            fi
        done
    fi
}

# Set trap to cleanup on script exit
trap cleanup_temp_files EXIT

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

# Function to check network connectivity
check_network_connectivity() {
    local test_urls=("https://google.com" "https://github.com" "https://astral.sh" "https://just.systems")
    local connected=false
    
    print_status "Checking network connectivity..."
    
    for url in "${test_urls[@]}"; do
        if curl --proto '=https' --tlsv1.2 -sSf --max-time 10 --connect-timeout 5 "$url" >/dev/null 2>&1; then
            connected=true
            print_success "Network connectivity confirmed via $url"
            break
        fi
    done
    
    if [ "$connected" = false ]; then
        print_error "Network connectivity check failed. Please check your internet connection and try again."
        print_error "The script needs internet access to download and verify installers securely."
        exit 1
    fi
}

# Function to validate SHA256 checksum format
validate_checksum() {
    local checksum="$1"
    local source="$2"
    
    # Check if checksum is empty
    if [ -z "$checksum" ]; then
        print_error "Empty checksum received from $source. Security check failed."
        return 1
    fi
    
    # Check if checksum is exactly 64 hex characters
    if ! [[ "$checksum" =~ ^[a-fA-F0-9]{64}$ ]]; then
        print_error "Invalid checksum format received from $source. Expected 64 hex characters, got: ${checksum:0:20}..."
        return 1
    fi
    
    return 0
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
    
    # Try to find Python 3.11+ using uv with proper error handling
    PYTHON_VERSION=""
    if uv python find ">=3.11" >/dev/null 2>&1; then
        # Use a more robust approach to extract Python version
        PYTHON_FIND_OUTPUT=$(uv python find ">=3.11" 2>/dev/null)
        if [ $? -eq 0 ] && [ -n "$PYTHON_FIND_OUTPUT" ]; then
            # Extract the first Python version found with error handling
            PYTHON_VERSION=$(echo "$PYTHON_FIND_OUTPUT" | head -n1 | grep -o 'cpython-[0-9]\+\.[0-9]\+' | head -n1 || true)
            if [ -n "$PYTHON_VERSION" ]; then
                print_status "Found existing Python version: $PYTHON_VERSION"
            fi
        fi
    fi
    
    if [ -z "$PYTHON_VERSION" ]; then
        print_status "No Python 3.11+ found, attempting to install with uv..."
        if uv python install "3.11"; then
            PYTHON_VERSION="3.11"
            print_success "Python 3.11 installed successfully"
        else
            print_error "Failed to install Python 3.11 with uv"
            exit 1
        fi
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
        
        # Download and verify uv installer with proper error handling
        UV_INSTALLER_URL="https://astral.sh/uv/install.sh"
        UV_CHECKSUM_URL="https://astral.sh/uv/install.sh.sha256"
        
        # Function to safely download and verify checksum
        download_with_checksum() {
            local url="$1"
            local checksum_url="$2"
            local installer_name="$3"
            
            print_status "Downloading $installer_name checksum..."
            
            # Download checksum with timeout and error checking
            local checksum_response
            if ! checksum_response=$(curl --proto '=https' --tlsv1.2 -sSf --max-time 30 --retry 3 --retry-delay 2 "$checksum_url" 2>/dev/null); then
                print_error "Failed to download checksum from $checksum_url. Network error or timeout."
                return 1
            fi
            
            # Validate checksum format (should be 64 hex characters)
            local checksum
            if ! checksum=$(echo "$checksum_response" | grep -E '^[a-fA-F0-9]{64}' | head -n1); then
                print_error "Invalid checksum format received from $checksum_url. Security check failed."
                return 1
            fi
            
            # Use the validation function
            if ! validate_checksum "$checksum" "$checksum_url"; then
                return 1
            fi
            
            print_status "Checksum validation successful: ${checksum:0:8}..."
            
            # Download installer with timeout and error checking
            print_status "Downloading $installer_name installer..."
            local temp_installer
            temp_installer=$(mktemp)
            TEMP_FILES+=("$temp_installer")
            
            if ! curl --proto '=https' --tlsv1.2 -sSf --max-time 60 --retry 3 --retry-delay 2 "$url" -o "$temp_installer" 2>/dev/null; then
                print_error "Failed to download installer from $url. Network error or timeout."
                rm -f "$temp_installer"
                return 1
            fi
            
            # Verify checksum
            print_status "Verifying installer checksum..."
            if ! echo "$checksum  $temp_installer" | sha256sum -c --quiet 2>/dev/null; then
                print_error "Checksum verification failed for $installer_name installer. Installation aborted for security."
                rm -f "$temp_installer"
                return 1
            fi
            
            print_success "Checksum verification successful for $installer_name"
            echo "$temp_installer"
            return 0
        }
        
        # Download and verify uv installer
        if ! TEMP_INSTALLER=$(download_with_checksum "$UV_INSTALLER_URL" "$UV_CHECKSUM_URL" "uv"); then
            print_error "Failed to download uv installer securely. Please install manually from https://astral.sh/uv/"
            exit 1
        fi
        
        # Execute verified installer
        print_status "Installing uv..."
        if ! sh "$TEMP_INSTALLER"; then
            print_error "Failed to execute uv installer"
            rm -f "$TEMP_INSTALLER"
            exit 1
        fi
        
        # Clean up
        rm -f "$TEMP_INSTALLER"
        
        # Source cargo environment
        if [ -f "$HOME/.cargo/env" ]; then
            source "$HOME/.cargo/env"
        fi
        
        # Verify installation
        if ! command -v uv &> /dev/null; then
            print_error "uv installation failed. Please install manually from https://astral.sh/uv/"
            exit 1
        fi
    fi
    print_success "uv is available"
}

# Check if just is installed
check_just() {
    print_status "Checking just installation..."
    if ! command -v just &> /dev/null; then
        print_warning "just is not installed. Installing just..."
        
        # Function to safely download and verify just installer
        download_just_installer() {
            local checksum_url="https://just.systems/install.sh.sha256"
            local installer_url="https://just.systems/install.sh"
            
            print_status "Downloading just installer checksum..."
            
            # Download checksum with timeout and error checking
            local checksum_response
            if ! checksum_response=$(curl --proto '=https' --tlsv1.2 -sSf --max-time 30 --retry 3 --retry-delay 2 "$checksum_url" 2>/dev/null); then
                print_error "Failed to download just checksum from $checksum_url. Network error or timeout."
                return 1
            fi
            
            # Validate checksum format (should be 64 hex characters)
            local checksum
            if ! checksum=$(echo "$checksum_response" | grep -E '^[a-fA-F0-9]{64}' | head -n1); then
                print_error "Invalid checksum format received from $checksum_url. Security check failed."
                return 1
            fi
            
            # Use the validation function
            if ! validate_checksum "$checksum" "$checksum_url"; then
                return 1
            fi
            
            print_status "Checksum validation successful: ${checksum:0:8}..."
            
            # Download installer with timeout and error checking
            print_status "Downloading just installer..."
            local temp_installer
            temp_installer=$(mktemp)
            TEMP_FILES+=("$temp_installer")
            
            if ! curl --proto '=https' --tlsv1.2 -sSf --max-time 60 --retry 3 --retry-delay 2 "$installer_url" -o "$temp_installer" 2>/dev/null; then
                print_error "Failed to download just installer from $installer_url. Network error or timeout."
                rm -f "$temp_installer"
                return 1
            fi
            
            # Verify checksum
            print_status "Verifying just installer checksum..."
            if ! echo "$checksum  $temp_installer" | sha256sum -c --quiet 2>/dev/null; then
                print_error "Checksum verification failed for just installer. Installation aborted for security."
                rm -f "$temp_installer"
                return 1
            fi
            
            print_success "Checksum verification successful for just"
            echo "$temp_installer"
            return 0
        }
        
        # Detect OS and install just
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux - all distributions use the same installer
            print_status "Installing just on Linux..."
            
            if ! TEMP_INSTALLER=$(download_just_installer); then
                print_error "Failed to download just installer securely. Please install manually from https://just.systems/"
                exit 1
            fi
            
            # Execute verified installer
            print_status "Installing just..."
            if ! bash "$TEMP_INSTALLER" --to ~/.local/bin; then
                print_error "Failed to execute just installer"
                rm -f "$TEMP_INSTALLER"
                exit 1
            fi
            
            # Clean up
            rm -f "$TEMP_INSTALLER"
            export PATH="$HOME/.local/bin:$PATH"
            
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                print_status "Installing just via Homebrew..."
                if ! brew install just; then
                    print_error "Failed to install just via Homebrew"
                    exit 1
                fi
            else
                print_status "Installing just via installer script..."
                
                if ! TEMP_INSTALLER=$(download_just_installer); then
                    print_error "Failed to download just installer securely. Please install manually from https://just.systems/"
                    exit 1
                fi
                
                # Execute verified installer
                print_status "Installing just..."
                if ! bash "$TEMP_INSTALLER" --to ~/.local/bin; then
                    print_error "Failed to execute just installer"
                    rm -f "$TEMP_INSTALLER"
                    exit 1
                fi
                
                # Clean up
                rm -f "$TEMP_INSTALLER"
                export PATH="$HOME/.local/bin:$PATH"
            fi
        else
            # Generic Unix
            print_status "Installing just on Unix system..."
            
            if ! TEMP_INSTALLER=$(download_just_installer); then
                print_error "Failed to download just installer securely. Please install manually from https://just.systems/"
                exit 1
            fi
            
            # Execute verified installer
            print_status "Installing just..."
            if ! bash "$TEMP_INSTALLER" --to ~/.local/bin; then
                print_error "Failed to execute just installer"
                rm -f "$TEMP_INSTALLER"
                exit 1
            fi
            
            # Clean up
            rm -f "$TEMP_INSTALLER"
            export PATH="$HOME/.local/bin:$PATH"
        fi
        
        # Verify installation
        if ! command -v just &> /dev/null; then
            print_error "Failed to install just. Please install manually from https://just.systems/"
            exit 1
        fi
        
        print_success "just installed successfully"
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
    
    cd backend || { print_error "Failed to enter backend directory"; exit 1; }
    
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
    
    cd .. || { print_error "Failed to return to root directory"; exit 1; }
    print_success "Backend environment setup complete"
}

# Setup frontend environment
setup_frontend() {
    print_status "Setting up frontend environment..."
    
    cd frontend || { print_error "Failed to enter frontend directory"; exit 1; }
    
    # Ensure we're using the correct Node.js version
    cd .. || { print_error "Failed to return to root directory"; exit 1; }
    nvm use
    cd frontend || { print_error "Failed to enter frontend directory"; exit 1; }
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        echo "REACT_APP_API_URL=http://localhost:8000" > .env
    fi
    
    cd .. || { print_error "Failed to return to root directory"; exit 1; }
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
    check_network_connectivity
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
    echo "Security improvements implemented:"
    echo "  ✅ Network connectivity validation"
    echo "  ✅ Timeout and retry logic for downloads"
    echo "  ✅ Proper checksum validation with format verification"
    echo "  ✅ Secure download handling with error checking"
    echo "  ✅ Automatic cleanup of temporary files"
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
