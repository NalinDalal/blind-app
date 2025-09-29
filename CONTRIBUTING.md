---
# Contributing to Blind App

Thank you for your interest in contributing to the Blind App! This document provides guidelines and information for contributors.

---

## Table of Contents
- [Development Environment](#development-environment)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Standards](#documentation-standards)
- [License](#license)
- [Getting Help](#getting-help)

## Development Environment
- Node.js 18.17+
- npm 9+
- PostgreSQL 13+
- Git

### Setup
```bash
# Clone and setup
$ git clone https://github.com/NalinDalal/blind-app.git
$ cd blind-app
$ npm install
$ cp .env.example .env.local # Edit .env.local
$ npx prisma generate
$ npx prisma db push
$ npm run db:seed
$ npm run dev
```

## Code Style Guidelines
- Strict TypeScript typing
- Prefer interfaces for object shapes
- PascalCase for components, camelCase for functions/variables
- Use JSDoc for all functions/components
- Tailwind CSS for styling
- Responsive and accessible design

## Commit Convention
We follow [Conventional Commits](https://conventionalcommits.org/):
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding/updating tests
- chore: Maintenance tasks

## Pull Request Process
- Run `npm run lint` and `npm run format:check`
- Add/update JSDoc comments
- Update API docs for new endpoints
- Use PR template for description, testing, and screenshots
- All CI checks must pass
- At least one maintainer review required

### Example PR Template
```markdown
## Description
- What does this PR do?

## Testing
- How was this tested?

## Screenshots
- (If applicable)

## Checklist
- [ ] Lint/format pass
- [ ] Tests added/updated
- [ ] Docs updated
```

## Testing Guidelines
- Jest + React Testing Library (planned)
- Aim for 80%+ code coverage
- Test API routes, components, and utility functions
- Manual checklist: authentication, forms, responsive design, dark mode, navigation, error states

## Documentation Standards
- JSDoc for all functions/components
- Update README and API docs for new features
- Keep environment variable docs current

## License
By contributing, you agree your contributions are licensed under the project license.

## Getting Help
- [Open Issues](https://github.com/NalinDalal/blind-app/issues)
- [Discussions](https://github.com/NalinDalal/blind-app/discussions)
- [Roadmap](ROADMAP.md)
