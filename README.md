# AI-Enabled Language Learning Application

A modern, research-driven language learning platform that leverages AI, psychology, and learning theory to bring users to conversational fluency.

## 🚀 Features

- **AI-Powered Learning**: Personalized learning paths using machine learning
- **Research-Based Methods**: Incorporates latest findings in cognitive science and learning theory
- **Gamification**: Achievement systems, progress tracking, and social learning
- **Conversational Focus**: Emphasis on practical speaking and listening skills
- **Adaptive Difficulty**: Content adjusts to user's learning pace and style
- **Multi-Modal Learning**: Text, audio, video, and interactive exercises

## 🏗️ Architecture

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: React 18 + TypeScript
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache**: Redis for sessions and performance
- **AI Services**: Google Cloud AI/ML services
- **Testing**: BDD with pytest-bdd + pytest
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Command Runner**: just

## 🧪 Testing Strategy

- **BDD Testing**: Feature files with pytest-bdd
- **Unit Testing**: pytest for backend, Jest for frontend
- **Integration Testing**: API testing with pytest-asyncio
- **E2E Testing**: Playwright for browser automation
- **Performance Testing**: Locust for load testing

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Google Cloud account

### Development Setup
```bash
# Clone and setup
git clone <repository>
cd language-learning

# Run automated setup (recommended)
chmod +x setup.sh
./setup.sh

# Or manual setup
docker-compose up -d

# Backend setup with uv
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e ".[dev]"

# Frontend setup
cd ../frontend
npm install
```

### Using just Commands (Recommended)
```bash
# Show all available commands
just help

# Complete application setup
just setup

# Start development environment
just dev

# Run all tests
just test

# Run code quality checks
just quality

# Format all code
just format

# Start specific services
just dev-backend      # Backend only
just dev-frontend     # Frontend only

# Database management
just db-start         # Start database
just db-stop          # Stop database
just db-reset         # Reset database (WARNING: destroys data)

# Docker management
just docker-build     # Build images
just docker-clean     # Clean Docker resources
just docker-stats     # Show Docker statistics

# Health checks
just health           # Check all services
just status           # Show service status
just logs             # Show all logs
```

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
just test

# Run unit tests only
just test-unit

# Run BDD tests only
just test-bdd

# Run tests with coverage
just test-cov

# Run specific test file
just test-file tests/test_basic.py

# Run specific test function
just test-func tests/test_basic.py test_settings_loaded
```

### Frontend Testing
```bash
cd frontend

# Run tests
just test

# Run tests with coverage
just test-cov

# Run E2E tests
just test-e2e

# Run tests in watch mode
just test-watch
```

### Full-Stack Testing
```bash
# From project root
just test             # Run all tests
just test-cov         # Run all tests with coverage
just test-backend     # Backend tests only
just test-frontend    # Frontend tests only
```

## 🔧 Development Commands

### Backend Development
```bash
cd backend

# Start development server
just dev

# Code formatting
just format

# Code quality checks
just quality

# Linting
just lint

# Type checking
just type-check

# Security checks
just security

# Database migrations
just migrate
just migrate-create "Add user table"
just migrate-rollback

# Clean up
just clean
just clean-venv
```

### Frontend Development
```bash
cd frontend

# Start development server
just dev

# Build for production
just build

# Code quality checks
just quality

# Linting
just lint

# Format code
just format

# Type checking
just type-check

# Bundle analysis
just analyze

# Performance audit
just audit
```

### Full-Stack Development
```bash
# From project root

# Development environment
just dev              # Start both backend and frontend

# Code quality across all projects
just quality          # Run all quality checks
just format           # Format all code
just lint             # Lint all code

# Testing across all projects
just test             # Run all tests
just test-cov         # Run all tests with coverage

# Development workflow
just workflow         # Quality checks + tests
just pre-commit       # Pre-commit checks
just ci               # CI pipeline simulation
```

## 📚 Learning Theory Integration

- **Spaced Repetition**: Optimized review intervals
- **Interleaving**: Mixed practice patterns
- **Retrieval Practice**: Active recall exercises
- **Metacognition**: Self-reflection and learning awareness
- **Social Learning**: Peer interaction and collaboration

## 🔧 Configuration

- Environment variables for API keys and configuration
- Google Cloud service account setup
- Database connection pooling
- Redis configuration for caching

## 📈 Roadmap

- [x] Project foundation and architecture
- [x] pytest-bdd BDD testing setup
- [x] uv dependency management
- [x] just command runner integration
- [ ] Core learning engine
- [ ] AI-powered content generation
- [ ] Gamification system
- [ ] Progress tracking and analytics
- [ ] Social features
- [ ] Mobile app
- [ ] Advanced AI tutoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests first (BDD approach with pytest-bdd)
4. Implement your changes
5. Ensure all tests pass (`just test`)
6. Run code quality checks (`just quality`)
7. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
