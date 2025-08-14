# Development Guide

## 📋 Prerequisites

Before you can develop or run the AI Language Learning application, you need to install and configure the following tools and services:

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

### 6. Verify All Prerequisites
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

### 2. Run Automated Setup (Recommended)
```bash
# Make setup script executable (if not already)
chmod +x setup.sh

# Run setup
./setup.sh
```

### 3. Manual Setup (Alternative)
```bash
# Start database services
just db-start

# Setup backend
cd backend
uv venv
uv pip install -e ".[dev]"

# Setup frontend
cd ../frontend
nvm use  # Ensures correct Node.js version
npm install

# Start development environment
just dev
```

## ✅ Verification

After setup, verify everything is working:

```bash
# Check all services
just health

# Run tests
just test

# Start development
just dev
```

## 🆘 Troubleshooting Prerequisites

### Docker Issues
- **Docker not running**: Start Docker Desktop or Docker service
- **Permission denied**: Add user to docker group: `sudo usermod -aG docker $USER`
- **Port conflicts**: Ensure ports 8000, 3000, 5432, 6379 are available

### Python Issues
- **Wrong Python version**: Use `pyenv global 3.11.7` to set correct version
- **uv not found**: Ensure uv is in your PATH
- **Virtual environment issues**: Delete and recreate with `uv venv`

### Node.js Issues
- **Wrong Node.js version**: Run `nvm use` to use version from `.nvmrc`
- **nvm not found**: Source your profile file: `source ~/.bashrc`
- **npm install fails**: Clear cache: `npm cache clean --force`

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

### 1. Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd language-learning

# Run setup script (recommended)
./setup.sh

# Or manual setup
docker-compose up -d
cd backend && uv venv && uv pip install -e ".[dev]"
cd frontend && npm install
```

### 2. Development Mode with just
```bash
# Start complete development environment
just dev

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

# Run specific test files
just test-file backend/tests/test_basic.py
just test-file frontend/src/components/__tests__/App.test.tsx

# Run specific test functions
just test-func backend/tests/test_basic.py test_settings_loaded
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

### 5. Development Workflow
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
# Start database services
just db-start

# Stop database services
just db-stop

# Reset database (WARNING: destroys data)
just db-reset

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

### Common Issues
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
# Check service status
just status

# View logs
just logs

# Restart services
just restart

# Health check
just health
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
just dev              # Start development environment
just dev-backend      # Start backend only
just dev-frontend     # Start frontend only
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
just db-start         # Start database
just db-stop          # Stop database
just migrate          # Run migrations
```

### Services
```bash
just start            # Start all services
just stop             # Stop all services
just restart          # Restart all services
just status           # Show status
just health           # Health check
```

### Utilities
```bash
just clean            # Clean generated files
just help             # Show all commands
just info             # Show application info
```

This development guide provides a comprehensive overview of the AI Language Learning application architecture, development workflow, and best practices. Follow these guidelines to ensure consistent, high-quality development and maintainability.
