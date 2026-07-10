# Contributing to Synthora Nano

## Atomic Commit Workflow

All changes follow a structured branch → commit → PR → merge flow.

### Branch Naming

- `phase/{number}-{description}` - Phase implementation
- `fix/{description}` - Bug fixes
- `feat/{description}` - Feature additions
- `docs/{description}` - Documentation

### Commit Messages

Follow conventional commits:

```
type(scope): description

feat(analysis): add section classifier
fix(parsers): handle empty PDF pages
test(comparison): cover matrix generation
docs(readme): update installation guide
```

### Workflow

1. Create branch from `main`
2. Make changes with atomic commits (one logical change per commit)
3. Push branch and create PR
4. Wait for CI to pass (lint, typecheck, test, build)
5. Merge PR and delete branch

### CI Requirements

All PRs must pass:
- `npm run lint` - ESLint with no warnings
- `npm run typecheck` - TypeScript strict mode
- `npm run test` - All unit tests passing
- `npm run build` - Production build succeeds

### Code Style

- TypeScript strict mode
- ESLint flat config
- Prettier for formatting
- No `any` types
- No comments unless asked
- Feature-based architecture

### Testing

- Unit tests with Vitest
- E2E tests with Playwright
- Mock external dependencies
- Test both success and error paths
