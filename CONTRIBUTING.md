# Contributing to AURVA

Thank you for your interest in contributing to AURVA! This document provides guidelines and instructions for contributing to the project.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a positive community

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MySQL (for production) or SQLite (for development)
- Git
- Code editor (VS Code recommended)

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/aurva.git
cd aurva
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

3. **Admin Panel Setup**
```bash
cd admin-panel
npm install
cp .env.example .env
npm run dev
```

## 📋 Development Workflow

### Git Workflow

We use **Git Flow** with the following branches:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Branch Naming Convention

```
feature/add-email-notifications
bugfix/fix-contact-form-validation
hotfix/security-patch-jwt
docs/update-api-documentation
```

### Creating a Feature

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Make your changes
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes

### Examples

```bash
feat(backend): add email field to contact form
fix(admin): resolve login redirect issue
docs(readme): update installation instructions
test(api): add integration tests for news endpoints
chore(deps): update dependencies to latest versions
```

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Run specific test file
npm test -- src/tests/auth.test.ts

# Test coverage
npm run test:coverage
```

### Writing Tests

- Write tests for all new features
- Maintain minimum 80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

**Example:**
```typescript
describe('POST /api/contacts', () => {
  it('should create a new contact with valid data', async () => {
    // Arrange
    const contactData = {
      name: 'Test Company',
      phone: '+996550123456',
      email: 'test@example.com'
    };

    // Act
    const response = await request(app)
      .post('/api/contacts')
      .send(contactData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.contact.name).toBe(contactData.name);
  });
});
```

## 📐 Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises
- Add JSDoc comments for public APIs

### File Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   ├── utils/         # Helper functions
│   ├── types/         # TypeScript types
│   └── tests/         # Test files
```

## 🔍 Code Review Process

### Before Submitting PR

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log statements (use logger)
- [ ] No commented-out code
- [ ] Commit messages follow convention

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
Describe testing performed

## Checklist
- [ ] Tests pass
- [ ] Code reviewed
- [ ] Documentation updated
```

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try to reproduce on latest version
3. Gather system information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 10]
- Node version: [e.g., 18.17.0]
- Browser: [e.g., Chrome 120]
```

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Is your feature related to a problem?**
Description of the problem

**Proposed solution**
How you'd like it to work

**Alternatives considered**
Other solutions you've considered

**Additional context**
Any other context
```

## 📚 Documentation

- Update README.md for user-facing changes
- Update API documentation for API changes
- Add inline code comments for complex logic
- Update CHANGELOG.md

## 🔐 Security

- **Never** commit secrets (.env files, API keys)
- Report security vulnerabilities privately
- Use environment variables for sensitive data
- Follow OWASP security best practices

### Reporting Security Issues

Email: aurva.kg@gmail.com with subject "SECURITY"

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## ❓ Questions?

- Create a discussion on GitHub
- Email: aurva.kg@gmail.com
- Telegram: [if applicable]

---

**Thank you for contributing to AURVA!** 🎉
