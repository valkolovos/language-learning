# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing and quality checks.

## Workflows

### 1. Test and Quality Checks (`test-and-quality.yml`)

**Triggers:** Push to `main`/`develop` branches, Pull Requests to `main`/`develop`

**Purpose:** Runs the equivalent of `just test` and `just quality` commands in a CI environment.

**What it does:**
- Sets up Python 3.11 and Node.js 18.20.0
- Installs `uv` for Python dependency management
- Installs `just` command runner
- Sets up PostgreSQL and Redis services
- Installs backend and frontend dependencies
- Runs `just test` (backend + frontend tests)
- Runs `just quality` (formatting, linting, type checking)

### 2. Comprehensive CI (`ci.yml`)

**Triggers:** Same as above

**Purpose:** More detailed CI pipeline with separate jobs for different concerns.

**Jobs:**
- **Backend Tests**: Unit and integration tests with coverage
- **Frontend Tests**: React tests with coverage  
- **Backend Quality**: Formatting, linting, type checking, security
- **Frontend Quality**: Formatting, linting, type checking, security
- **Integration Tests**: BDD tests and frontend build verification
- **E2E Tests**: End-to-end testing with running services
- **Test Results**: Summary of all test results

## Environment Variables

The workflows use these environment variables:

```bash
PYTHON_VERSION=3.11
NODE_VERSION=18.20.0
POSTGRES_DB=test_language_learning
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
TEST_DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/test_language_learning
TESTING=true
```

## Database Services

Both workflows include:
- **PostgreSQL 15**: For backend testing
- **Redis 7**: For caching and session management

## Dependencies

The workflows automatically install:
- **Backend**: Uses `uv` to install Python dependencies from `pyproject.toml`
- **Frontend**: Uses `npm ci` to install Node.js dependencies from `package-lock.json`
- **Tools**: `just`, `uv`, Python 3.11, Node.js 18.20.0

## Running Locally

To test the workflows locally before pushing:

```bash
# Run tests
just test

# Run quality checks  
just quality

# Run both
just test && just quality
```

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL and Redis are running locally
2. **Dependencies**: Run `just install` in both backend and frontend directories
3. **Node Version**: Use `just nvm-use` to ensure correct Node.js version

### Workflow Failures

- Check the Actions tab in GitHub for detailed logs
- Verify that `just test` and `just quality` work locally
- Ensure all dependencies are properly specified in `pyproject.toml` and `package.json`

## Adding New Checks

To add new quality checks:

1. Add the command to the appropriate `justfile` (backend or frontend)
2. Update the root `justfile` to include it in the `quality` target
3. The GitHub Actions will automatically pick up the new checks

## Performance

- **Caching**: Dependencies are cached between runs for faster builds
- **Parallel Jobs**: The comprehensive CI runs jobs in parallel where possible
- **Service Health**: Database services include health checks to ensure they're ready before tests run
