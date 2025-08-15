# Development Guide

## 📋 Prerequisites

Before you can develop or run the AI Language Learning application, you need to install and configure the following tools and services:

**Note**: The setup script (`./setup.sh`) will automatically handle most of the dependency installation and environment setup once these core tools are installed.

### 🐳 Core Infrastructure
- **Docker**: Version 20.10+ for containerization
- **Docker Compose**: Version 2.0+ for multi-container orchestration

### 🐍 Python Environment
- **Python**: Version 3.11+ (required for FastAPI and modern Python features)
- **uv**: Modern Python package manager and project tool
- **pyenv** (recommended): For Python version management

### 🟢 Node.js Environment
- **nvm**: Node Version Manager for Node.js version control
- **Node.js**: Version 18.20.0 (specified in `.nvmrc`)
- **npm**: Comes with Node.js

### 🛠️ Development Tools
- **just**: Command runner for task automation
- **Git**: Version control system

### ☁️ Cloud Services (Optional for Development)
- **Google Cloud Platform**: For AI/ML services in production
- **OpenAI API**: For advanced language processing features

## 🚀 Installation Guide

### 1. Install Docker and Docker Compose
```bash
# macOS (using Homebrew)
brew install --cask docker

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Windows
# Download Docker Desktop from https://www.docker.com/products/docker-desktop
```

**Note**: Docker is required for both modes - even in local development mode, the database services (PostgreSQL and Redis) run in Docker containers for consistency and ease of setup.

### 2. Install Python 3.11+
```bash
# Using pyenv (recommended)
curl https://pyenv.run | bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc

pyenv install 3.11.7
pyenv global 3.11.7

# Verify installation
python --version  # Should show Python 3.11.7
```

### 3. Install uv
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Verify installation
uv --version
```

### 4. Install nvm and Node.js
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.bashrc  # or source ~/.zshrc

# Install Node.js version from .nvmrc
nvm install 18.20.0
nvm use 18.20.0

# Verify installation
node --version  # Should show v18.20.0
npm --version
```

### 5. Install just
```bash
# macOS
brew install just

# Ubuntu/Debian
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/.local/bin

# Windows
# Download from https://github.com/casey/just/releases

# Verify installation
just --version
```

### 6. Install Pre-commit Hooks (Optional but Recommended)
```bash
# Install pre-commit in the backend virtual environment
cd backend && uv pip install pre-commit

# Install the git hooks
uv run pre-commit install

# Go back to root directory
cd ..
```

**Note**: Pre-commit hooks automatically run `just quality` before each commit, ensuring code quality is maintained.

### 7. Verify All Prerequisites
```bash
# Run the setup script to verify everything is working
./setup.sh

# Or check manually
just check-prerequisites
```

## 🔧 Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd language-learning
```

### 2. Initial Setup (Required Once)
The setup script (`./setup.sh`) handles the initial environment setup and must be run at least once:

- **Python Dependencies**: Installs all Python packages using `uv`
- **Node.js Dependencies**: Installs all npm packages
- **Database Setup**: Creates database initialization scripts
- **Nginx Configuration**: Sets up nginx configuration files
- **Environment Verification**: Checks all prerequisites are met

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup script
./setup.sh
```

**Note**: After the initial setup, you can use `just` commands for day-to-day development without running the setup script again.

### 3. Prerequisite Verification (Optional but Recommended)
Use `just check-prerequisites` to verify your environment is ready for development:

```bash
# Check all prerequisites
just check-prerequisites
```

This command verifies:
- Docker and Docker Compose are available
- Python 3.11+ is installed
- nvm and Node.js are properly configured
- uv package manager is available
- just command runner is available

### 4. Choose Your Development Mode

#### **Option A: Docker Mode (Production-like, Easy Setup)**
```bash
# Make setup script executable (if not already)
chmod +x setup.sh

# Run setup - this will start everything in Docker
./setup.sh
```

**Best for**: New developers, demos, production testing, team onboarding

#### **Option B: Local Development Mode (Fast Iteration)**
```bash
# Verify prerequisites are met
just check-prerequisites

# Start only database services in Docker
just db-start

# Start local development servers
just dev
```

**Best for**: Active development, debugging, fast iteration, IDE integration

**Note**: The setup script (`./setup.sh`) must be run at least once to install Python and Node.js dependencies. After that, use `just check-prerequisites` to verify your environment is ready for local development.



### 5. Hybrid Setup (Selective Containerization)
```bash
# Verify prerequisites are met
just check-prerequisites

# Start database services
just db-start

# Choose which services to run locally vs. in Docker
# Backend in Docker (production-like)
docker-compose up -d backend

# Frontend locally (fast development)
just dev-frontend
```

**Best for**: Testing specific services in production-like conditions while keeping others local

**Note**: Use `just dev-frontend` instead of manually running `npm start` to ensure consistency with the project's command structure.

## ✅ Verification

After running the setup script, verify everything is working:

### **Docker Mode Verification**
```bash
# Check all services
just health

# Run tests
just test

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### **Local Development Mode Verification**
```bash
# Check database services
just verify-db-health

# Check backend (should be running on port 8000)
curl http://localhost:8000/health

# Check frontend (should be running on port 3000)
curl http://localhost:3000

# Run tests
just test
```

**Note**: In local development mode, the frontend runs on port 3000 (not served by nginx), and the backend runs with hot reloading enabled.

**Important**: The setup script must be run at least once before using local development mode to install all dependencies. Use `just check-prerequisites` to verify your environment is ready.

### **Common Issues and Solutions**

#### **Port Conflicts**
```bash
# Check what's using the ports
lsof -i :8000  # Backend port
lsof -i :3000  # Frontend port
lsof -i :5432  # PostgreSQL port
lsof -i :6379  # Redis port

# Kill conflicting processes if needed
kill -9 <PID>
```

#### **Service Not Starting**
```bash
# Check service status
just status

# View logs
just logs

# Restart services
just restart
```

## 🆘 Troubleshooting Prerequisites

### Docker Issues
- **Docker not running**: Start Docker Desktop or Docker service
- **Permission denied**: Add user to docker group: `sudo usermod -aG docker $USER`
- **Port conflicts**: Ensure ports 8000, 3000, 5432, 6379 are available

### Python Issues
- **Wrong Python version**: The setup script automatically handles Python version management with `uv`
- **uv not found**: Ensure uv is in your PATH
- **Virtual environment issues**: The setup script automatically creates and manages virtual environments

### Node.js Issues
- **Wrong Node.js version**: The setup script automatically uses the correct Node.js version from `.nvmrc`
- **nvm not found**: Source your profile file: `source ~/.bashrc`
- **npm install fails**: The setup script handles npm installation automatically

### just Issues
- **Command not found**: Ensure just is in your PATH
- **Permission denied**: Check file permissions and ownership

## 🔄 Updating Prerequisites

### Update Python
```bash
pyenv install 3.11.8  # Latest 3.11.x
pyenv global 3.11.8
```

### Update Node.js
```bash
nvm install 18.20.1  # Latest 18.20.x
nvm use 18.20.1
# Update .nvmrc file with new version
```

### Update Tools
```bash
# Update uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Update just
# Use your package manager or download latest release
```

---

## 🏗️ Architecture Overview

The AI Language Learning application follows a modern, scalable architecture with clear separation of concerns:

### Backend Architecture
```
app/
├── api/                    # API endpoints and routing
│   └── v1/               # Version 1 API
├── core/                  # Core configuration and utilities
├── models/                # Database models and ORM
├── schemas/               # Pydantic schemas for validation
├── services/              # Business logic and external services
├── tests/                 # Unit and integration tests
└── features/              # BDD feature files and steps
```

### Frontend Architecture
```
src/
├── components/            # Reusable UI components
├── pages/                # Page components
├── hooks/                # Custom React hooks
├── services/             # API service layer
├── stores/               # State management (Zustand)
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

### Database Design
- **Users**: Core user data and learning preferences
- **Lessons**: Learning content and structure
- **Exercises**: Interactive learning activities
- **Progress**: User learning progress and spaced repetition
- **Gamification**: Achievements, streaks, and rewards

## 🧪 Testing Strategy

### BDD Testing with pytest-bdd
- **Feature Files**: Human-readable specifications in Gherkin syntax
- **Step Definitions**: Python implementations using pytest fixtures
- **Test Configuration**: pytest configuration with async support
- **Test Data**: Fixtures and factories for test data

### Unit Testing with pytest
- **Model Tests**: Database model validation and methods
- **Service Tests**: Business logic and external service integration
- **API Tests**: Endpoint functionality and validation
- **Coverage**: Minimum 80% code coverage requirement

### Frontend Testing
- **Component Tests**: React component rendering and behavior
- **Integration Tests**: Component interaction and API calls
- **E2E Tests**: Playwright for browser automation
- **Visual Regression**: Screenshot comparison testing

## 🚀 Development Workflow

### 0. Initial Setup (One-time)
```bash
# Run setup script once to install dependencies
./setup.sh
```

### 1. Daily Development (After initial setup)
```bash
# Verify prerequisites (optional, but recommended)
just check-prerequisites

# Start everything for development
just start

# Stop everything when done
just stop

# Or use development commands
just dev
just dev-stop
```

**Note**: After the initial setup, you only need to use `just` commands for day-to-day development. The setup script handles dependency installation, database setup, and environment configuration.

### 2. **Choosing Your Development Mode**

#### **Start with Docker Mode if:**
- 🆕 **New to the project** - Get up and running quickly
- 🧪 **Testing integration** - Verify all services work together
- 🎯 **Demo purposes** - Show the complete application
- 🔄 **CI/CD validation** - Test Docker builds and deployment
- 👥 **Team collaboration** - Ensure consistent environment

#### **Switch to Local Mode when:**
- ⚡ **Active development** - Making frequent code changes
- 🐛 **Debugging issues** - Need to inspect variables and set breakpoints
- 🛠️ **IDE integration** - Want full autocomplete and refactoring support
- 🔥 **Hot reloading** - Need immediate feedback on code changes
- 💻 **Resource constraints** - Running on lower-end machines

#### **Use Hybrid Mode for:**
- 🎭 **Selective testing** - Test specific services in production-like conditions
- 🚀 **Performance testing** - Test backend performance while keeping frontend fast
- 🔧 **Service debugging** - Debug one service locally while others run in containers

## 🐳 Two Ways to Run the Application

The AI Language Learning application can be run in two different modes, each with its own advantages and use cases:

### 1. **Docker Mode (Production-like Environment)**
```bash
# Start all services in Docker containers
just start

# Or use the setup script
./setup.sh
```

**What this does:**
- Runs PostgreSQL, Redis, Backend, and Frontend in Docker containers
- Uses production Docker images with nginx serving the frontend
- Backend runs with uvicorn in production mode
- All services are containerized and isolated

**When to use Docker mode:**
- ✅ **Testing production-like environment** - Mimics how the app will run in production
- ✅ **Full-stack integration testing** - Test the complete system end-to-end
- ✅ **Demo purposes** - Show stakeholders the complete application
- ✅ **CI/CD testing** - Verify Docker builds and container orchestration
- ✅ **Team onboarding** - New developers can run the app without local setup
- ✅ **Database persistence** - Data persists between restarts
- ✅ **Consistent environment** - Same behavior across different machines

**Limitations:**
- ❌ **Slower development cycle** - Need to rebuild containers for code changes
- ❌ **Resource intensive** - Uses more memory and CPU
- ❌ **Less debugging** - Harder to attach debuggers or inspect running processes
- ❌ **Hot reload limited** - Backend has basic reload, frontend requires container rebuild

### 2. **Local Development Mode (Fast Iteration)**
```bash
# Start only database services in Docker
just db-start

# Start backend development server locally
just dev-backend

# Start frontend development server locally  
just dev-frontend

# Or start both together
just dev
```

**What this does:**
- Database services (PostgreSQL, Redis) run in Docker containers
- Backend runs locally with `uvicorn --reload` for hot reloading
- Frontend runs locally with `npm start` for hot reloading
- Your local code changes are immediately reflected

**When to use Local mode:**
- ✅ **Fast development iteration** - Code changes are reflected immediately
- ✅ **Debugging** - Easy to attach debuggers, set breakpoints, inspect variables
- ✅ **IDE integration** - Full IDE support for autocomplete, refactoring, etc.
- ✅ **Resource efficient** - Uses less memory and CPU
- ✅ **Hot reloading** - Both frontend and backend reload automatically
- ✅ **Local file access** - Easy to access local files, environment variables
- ✅ **Development tools** - Full access to development tools and extensions

**Limitations:**
- ❌ **Local setup required** - Need Python, Node.js, and dependencies installed
- ❌ **Environment differences** - May behave differently than production
- ❌ **Port conflicts** - Need to ensure ports 8000, 3000, 5432, 6379 are available
- ❌ **Dependency management** - Need to manage Python and Node.js versions locally

### 3. **Hybrid Mode (Best of Both Worlds)**
```bash
# Start database services
just db-start

# Start backend in Docker (for production-like testing)
docker-compose up -d backend

# Start frontend locally (for fast UI development)
just dev-frontend
```

**When to use Hybrid mode:**
- ✅ **Backend production testing** - Test backend in production-like environment
- ✅ **Frontend fast iteration** - Quick UI/UX development and testing
- ✅ **Selective containerization** - Choose which services to containerize
- ✅ **Performance testing** - Test backend performance in production-like conditions

## 🔄 Switching Between Modes

### From Docker to Local Mode
```bash
# Stop all Docker services
just stop

# Start only database services
just db-start

# Start local development servers
just dev
```

### From Local to Docker Mode
```bash
# Stop local development servers
just dev-stop

# Start all Docker services
just start
```

### Clean Slate
```bash
# Stop everything and clean up
just stop
docker-compose down -v

# Start fresh (choose your mode)
just start    # Docker mode
# OR
just dev      # Local mode
```

### 1. Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd language-learning

# Run setup script (recommended)
./setup.sh

# Or manual setup (if you prefer more control)
just db-start
cd backend && uv venv && uv pip install -e ".[dev]"
cd frontend && npm install
```

### 2. Development Mode with just
```bash
# Start complete development environment (DB + Redis + Backend + Frontend)
just dev

# Start all services (same as just dev)
just start

# Or start services individually
just dev-backend      # Backend only
just dev-frontend     # Frontend only

# Show all available commands
just help
```

### 3. Testing Workflow with just
```bash
# Run all tests
just test

# Run specific test types
just test-backend     # Backend tests only
just test-frontend    # Frontend tests only

# Run tests with coverage
just test-cov
```

### 4. Code Quality with just
```bash
# Run all quality checks
just quality

# Format all code
just format

# Lint all code
just lint

# Individual quality checks
just quality-backend   # Backend only
just quality-frontend  # Frontend only
```

**Pre-commit Hooks**: The project is configured with pre-commit hooks that automatically run `just quality` before each commit. This ensures code quality is maintained and prevents commits with formatting, linting, or type checking issues.

### 5. Service Management with just
```bash
# Start everything (DB + Redis + Backend + Frontend)
just start

# Stop everything
just stop

# Development mode (same as start)
just dev

# Stop just development services (keep DB running)
just dev-stop

# Check service status and health
just status

# Health check all services
just health
```

### 6. Development Workflow
```bash
# Complete development workflow
just workflow          # Quality + tests

# Pre-commit checks
just pre-commit        # Quality + unit tests

# CI pipeline simulation
just ci                # Quality + tests + security
```

## 🔧 Configuration Management

### Environment Variables
- **Development**: `.env` files for local development
- **Production**: Environment variables in deployment
- **Testing**: Separate test configuration

### Google Cloud Setup
1. Create Google Cloud project
2. Enable required APIs:
   - Cloud Translation API
   - Cloud Text-to-Speech API
   - Cloud Speech-to-Text API
   - Vertex AI API
3. Create service account and download credentials
4. Place credentials in `credentials/` directory

### OpenAI Setup
1. Get API key from OpenAI
2. Add to backend `.env` file
3. Configure model preferences

## 📊 Database Management

### Database Operations with just
```bash
# Start database services (PostgreSQL + Redis)
just db-start

# Stop database services
just db-stop

# Reset database (WARNING: destroys data)
just db-reset

# Verify database health
just verify-db-health

# Wait for database to be ready
just wait-for-db
```

### Migrations
```bash
cd backend

# Run migrations
just migrate

# Create new migration
just migrate-create "Add user table"

# Rollback migration
just migrate-rollback
```

### Database Seeding
```bash
# Run seeding script
just seed

# Or use Python script directly
uv run python scripts/seed_database.py
```

## 🚀 Deployment

### Docker Management with just
```bash
# Build all images
just docker-build

# Clean Docker resources
just docker-clean

# Show Docker statistics
just docker-stats

# Push images to registry
just docker-push
```

### Google Cloud Deployment
1. Build and push Docker images to Container Registry
2. Deploy to Cloud Run or GKE
3. Configure load balancing and SSL
4. Set up monitoring and logging

## 📈 Monitoring and Observability

### Health Checks with just
```bash
# Check all services
just health

# Show service status
just status

# Show service logs
just logs

# Show specific service logs
just logs-service backend
```

### Logging
- **Structured Logging**: JSON format with structured data
- **Log Levels**: DEBUG, INFO, WARNING, ERROR
- **Context**: Request ID, user ID, operation tracking

### Metrics
- **Application Metrics**: Response times, error rates
- **Business Metrics**: User engagement, learning progress
- **Infrastructure Metrics**: CPU, memory, database performance

## 🔒 Security Considerations

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt
- **Session Management**: Redis-based session storage

### Authorization
- **Role-Based Access**: User roles and permissions
- **Resource Ownership**: Users can only access their data
- **API Rate Limiting**: Prevent abuse and DoS attacks

### Data Protection
- **Input Validation**: Pydantic schemas for all inputs
- **SQL Injection Prevention**: SQLAlchemy ORM
- **XSS Protection**: Content Security Policy headers

## 🧠 AI Integration

### Content Generation
- **Lesson Creation**: AI-generated learning content
- **Exercise Generation**: Personalized practice activities
- **Adaptive Difficulty**: Content adjusts to user performance

### Speech Processing
- **Text-to-Speech**: Natural pronunciation examples
- **Speech Recognition**: User speaking practice
- **Accent Detection**: Pronunciation feedback

### Translation Services
- **Real-time Translation**: Instant language support
- **Context-Aware**: Maintains meaning and nuance
- **Cultural Adaptation**: Localized content and examples

## 🎮 Gamification System

### Achievement System
- **Milestone Achievements**: Learning progress milestones
- **Streak Rewards**: Daily learning consistency
- **Social Achievements**: Collaborative learning goals

### Progress Tracking
- **XP System**: Experience points for activities
- **Level Progression**: User levels and advancement
- **Learning Paths**: Personalized learning journeys

### Motivation Features
- **Daily Goals**: Personalized daily learning targets
- **Progress Visualization**: Charts and progress bars
- **Social Features**: Leaderboards and peer comparison

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# Automated testing on push
# Code quality checks
# Security scanning
# Automated deployment
```

### Testing Pipeline with just
1. **Unit Tests**: Fast feedback on code changes
2. **Integration Tests**: API and database integration
3. **BDD Tests**: Behavior validation with pytest-bdd
4. **E2E Tests**: Full user journey validation

### Deployment Pipeline
1. **Staging**: Automated deployment to staging environment
2. **Testing**: Automated testing in staging
3. **Production**: Manual approval and deployment
4. **Rollback**: Automated rollback on failure

## 📚 Learning Theory Integration

### Spaced Repetition
- **SuperMemo SM-2**: Proven spaced repetition algorithm
- **Adaptive Intervals**: Adjusts based on user performance
- **Optimal Review Timing**: Maximizes retention

### Cognitive Load Theory
- **Chunked Information**: Break complex concepts into digestible pieces
- **Progressive Complexity**: Build from simple to complex
- **Active Recall**: Encourage active engagement

### Metacognition
- **Learning Awareness**: Help users understand their learning process
- **Self-Assessment**: Regular progress evaluation
- **Strategy Development**: Personalized learning strategies

## 🚧 Troubleshooting

### **Mode-Specific Issues**

#### **Docker Mode Issues**
1. **Container not starting**: Check Docker logs with `docker-compose logs <service>`
2. **Port conflicts**: Ensure ports 8000, 3000, 5432, 6379 are available
3. **Memory issues**: Increase Docker memory allocation in Docker Desktop
4. **Build failures**: Clean and rebuild with `docker-compose build --no-cache`

#### **Local Development Mode Issues**
1. **Python version**: Ensure `uv` is using Python 3.11+ (`uv python list`)
2. **Node.js version**: Use `nvm use` to get correct version from `.nvmrc`
3. **Dependencies**: Reinstall with `uv pip install -e ".[dev]"` and `npm install`
4. **Virtual environment**: Recreate with `uv venv` if corrupted

#### **Hybrid Mode Issues**
1. **Service conflicts**: Ensure services aren't running in both modes simultaneously
2. **Port mapping**: Check that Docker and local services use different ports
3. **Environment variables**: Verify `.env` files are properly configured

### **General Issues**
1. **Database Connection**: Check PostgreSQL service and credentials
2. **Redis Connection**: Verify Redis service and configuration
3. **Google Cloud**: Validate service account and API permissions
4. **Port Conflicts**: Ensure ports 8000, 3000, 5432, 6379 are available

### Debug Mode
```bash
# Backend debug
export DEBUG=true
export LOG_LEVEL=DEBUG

# Frontend debug
REACT_APP_DEBUG=true npm start
```

### Service Management with just
```bash
# Check service status and health
just status

# View logs
just logs

# Restart services
just restart

# Health check all services
just health

# Start everything
just start

# Stop everything
just stop

# Development mode
just dev

# Stop development services only
just dev-stop
```

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow Black and isort formatting
2. **Testing**: Write tests for all new features
3. **Documentation**: Update docs for API changes
4. **Code Review**: All changes require review

### Feature Development with just
1. **Feature Branch**: Create feature branch from main
2. **BDD First**: Write feature specifications first with pytest-bdd
3. **Implementation**: Implement feature with tests
4. **Integration**: Ensure all tests pass (`just test`)
5. **Quality**: Run quality checks (`just quality`)
6. **Documentation**: Update relevant documentation

### Bug Fixes
1. **Reproduce**: Create minimal reproduction case
2. **Fix**: Implement fix with regression tests
3. **Test**: Ensure all tests pass (`just test`)
4. **Document**: Document the fix and prevention

## 🆕 New Features: pytest-bdd, uv, and just

### Improved Service Management
- **Comprehensive Start/Stop**: `just start` and `just stop` now handle the entire stack
- **Health Verification**: Automatic database health checks before starting services
- **Development Workflow**: `just dev` and `just dev-stop` for development-specific operations
- **Service Status**: `just status` shows comprehensive service health information
- **Database Health**: `just verify-db-health` ensures PostgreSQL and Redis are ready

### pytest-bdd Benefits
- **Integrated Testing**: BDD tests run with pytest
- **Better Fixtures**: Leverage pytest's powerful fixture system
- **Async Support**: Native async/await support
- **Coverage Integration**: BDD tests included in coverage reports
- **Plugin Ecosystem**: Access to all pytest plugins

### uv Benefits
- **Fast Installation**: Significantly faster than pip
- **Lock Files**: Reproducible dependency resolution
- **Virtual Environments**: Automatic virtual environment management
- **Modern Standards**: Built on modern Python packaging standards
- **Development Tools**: Integrated development tooling

### just Benefits
- **Command Standardization**: Consistent commands across team
- **Task Automation**: Complex workflows in simple commands
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Documentation**: Self-documenting commands with help
- **Integration**: Seamless integration with existing tools
- **Health Verification**: Automatic service health checks
- **Full Stack Management**: Start/stop entire development environment
- **Development Workflow**: Separate commands for development vs. production

### Migration from Traditional Tools
- **Feature Files**: Same Gherkin syntax, no changes needed
- **Step Definitions**: Convert to pytest-bdd decorators
- **Fixtures**: Use pytest fixtures instead of context
- **Async Support**: Better async testing support
- **Integration**: Seamless integration with existing pytest setup
- **Commands**: Replace complex shell scripts with simple just commands

## 🎯 Quick Reference: Essential just Commands

### Development
```bash
just dev              # Start development environment (DB + Redis + Backend + Frontend)
just start            # Start all services (same as dev)
just dev-backend      # Start backend only
just dev-frontend     # Start frontend only
just dev-stop         # Stop development services only (keep DB running)
```

### Testing
```bash
just test             # Run all tests
just test-backend     # Backend tests only
just test-frontend    # Frontend tests only
just test-cov         # All tests with coverage
```

### Quality
```bash
just quality          # Run all quality checks
just format           # Format all code
just lint             # Lint all code
```

### Database
```bash
just db-start         # Start database services (PostgreSQL + Redis)
just db-stop          # Stop database services
just verify-db-health # Verify database health
just migrate          # Run migrations
```

### Services
```bash
just start            # Start all services (DB + Redis + Backend + Frontend)
just stop             # Stop all services
just restart          # Restart all services
just status           # Show status and health checks
just health           # Health check all services
```

### Utilities
```bash
just clean            # Clean generated files
just help             # Show all commands
just info             # Show application info
```

## 📋 Summary: Development Workflow

### **Initial Setup (One-time)**
1. Install core prerequisites (Docker, uv, nvm, just)
2. Clone the repository
3. Run `./setup.sh` to install dependencies and configure environment

### **Daily Development**
- **Prerequisite Check**: `just check-prerequisites` (verify environment)
- **Docker Mode**: `just start-docker` (production-like environment)
- **Local Mode**: `just start` (fast iteration with hot reloading)
- **Database Management**: `just db-start`, `just db-seed`
- **Testing**: `just test`, `just quality`
- **Service Management**: `just status`, `just logs`

### **Key Points**
- The setup script handles dependency installation automatically
- Use `just` commands for day-to-day development
- Choose between Docker and Local modes based on your needs
- Database services always run in Docker for consistency

This development guide provides a comprehensive overview of the AI Language Learning application architecture, development workflow, and best practices. Follow these guidelines to ensure consistent, high-quality development and maintainability.

