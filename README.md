# AI Language Learning Platform

A research-driven language learning application that uses AI to create personalized learning experiences. The platform combines cognitive science principles with modern technology to help users achieve conversational fluency efficiently.

## What This Project Does

This is a full-stack web application that:

- **Personalizes Learning**: Uses AI to adapt content difficulty and pacing to individual users
- **Tracks Progress**: Monitors learning patterns and provides insights into strengths/weaknesses  
- **Gamifies Experience**: Includes achievement systems, XP rewards, and social learning features
- **Supports Multiple Languages**: Built to handle various target languages with AI-powered translation
- **Focuses on Conversation**: Emphasizes practical speaking and listening skills over rote memorization

## Current Status

**🚧 Early Development** - This project is in active development with core architecture in place:

- ✅ Backend API structure (FastAPI + SQLAlchemy)
- ✅ Database models for lessons, exercises, and user progress
- ✅ AI service integration (Google Cloud + OpenAI)
- ✅ Basic frontend setup (React + TypeScript)
- ✅ Testing infrastructure (pytest + BDD)
- ✅ Development tooling (just, uv, Docker)

**🔄 In Progress:**
- Core learning engine implementation
- AI-powered content generation
- User interface development
- Gamification system

## Quick Start for Contributors

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- [just](https://just.systems/) command runner

### Get Started
```bash
# Clone the repository
git clone <repository-url>
cd language-learning

# Run automated setup
chmod +x setup.sh
./setup.sh

# Or use just commands
just setup
just dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## How to Contribute

### 1. Choose What to Work On

**Frontend Development:**
- Build React components for lessons and exercises
- Implement user dashboard and progress tracking
- Create responsive, accessible UI components
- Add animations and micro-interactions

**Backend Development:**
- Implement core learning algorithms
- Build AI content generation services
- Create user progress analytics
- Develop gamification mechanics

**AI/ML Features:**
- Improve content personalization algorithms
- Enhance speech recognition accuracy
- Optimize learning path recommendations
- Implement adaptive difficulty systems

**Testing & Quality:**
- Write BDD feature tests
- Add unit tests for new functionality
- Improve test coverage
- Performance testing and optimization

### 2. Development Workflow

```bash
# Start development environment
just dev

# Run tests before making changes
just test

# Make your changes...

# Run quality checks
just quality

# Format code
just format

# Run tests again
just test

# Commit with descriptive messages
git commit -m "feat: add user progress dashboard"
```

### 3. Code Standards

- **Python**: Follow PEP 8, use type hints, docstrings
- **TypeScript**: Strict mode, proper typing, ESLint rules
- **Testing**: Write tests first (BDD approach), maintain >80% coverage
- **Commits**: Use conventional commit format (feat:, fix:, docs:, etc.)

### 4. Testing Strategy

We use Behavior-Driven Development (BDD) with pytest-bdd:

```bash
# Run all tests
just test

# Run specific test types
just test-backend      # Backend tests only
just test-frontend     # Frontend tests only
just test-bdd          # BDD feature tests only

# Run with coverage
just test-cov
```

### 5. Project Structure

```
language-learning/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── models/   # Database models
│   │   ├── services/ # Business logic
│   │   └── schemas/  # Data validation
│   └── tests/        # Backend tests
├── frontend/          # React application
│   └── src/          # Source code
├── database/          # Database setup
└── features/          # BDD feature files
```

## Key Technologies

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Redis
- **Frontend**: React 18, TypeScript, CSS Modules
- **AI Services**: Google Cloud AI, OpenAI, Speech Recognition
- **Testing**: pytest, pytest-bdd, Jest, Playwright
- **DevOps**: Docker, just, uv, GitHub Actions

## Learning Theory Integration

The platform incorporates research-backed learning methods:

- **Spaced Repetition**: Optimized review intervals for long-term retention
- **Interleaving**: Mixed practice patterns to improve learning transfer
- **Retrieval Practice**: Active recall exercises for better memory
- **Adaptive Difficulty**: Content adjusts based on user performance
- **Social Learning**: Peer interaction and collaborative exercises

## Getting Help

- **Issues**: Check existing issues or create new ones
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check `project_docs/` for detailed technical docs
- **Code**: Review existing code for examples and patterns

## Roadmap

- [ ] Core learning engine with AI personalization
- [ ] Interactive lesson content and exercises
- [ ] Speech recognition and pronunciation feedback
- [ ] Gamification system (achievements, leaderboards)
- [ ] Social features and peer learning
- [ ] Mobile application
- [ ] Advanced AI tutoring capabilities

## License

MIT License - see LICENSE file for details

---

**Ready to contribute?** Start by running `just setup` and exploring the codebase. Pick an issue labeled "good first issue" or suggest a new feature that aligns with the project's learning science approach.
