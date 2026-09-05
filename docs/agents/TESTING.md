# Testing

## Checks

Use the smallest check that proves the change:

| Profile | Command              | Checks                                                           |
| ------- | -------------------- | ---------------------------------------------------------------- |
| Fast    | `npm run check`      | toolchain, format, lint, types, unit tests                       |
| Push    | `npm run check:push` | Fast, production build, dead code, Playwright                    |
| CI      | `npm run check:ci`   | Push, coverage, clean template installation, React Doctor, audit |

The checks live in the Vite Task graph in `vite.config.ts`. Cached tasks use explicit inputs so verification also works in restricted agent sandboxes.

## Test Scope

Don't test what static analysis catches. Oxlint + TypeScript own type errors, unused vars, hook deps, formatting. Tests own **runtime behavior through public interfaces**.

Lint enforcement is the exception: `lint/rules.test.ts` runs each `rodeo/*` rule through the real Oxlint binary, and `lint/policy.test.ts` tests the actual project's configuration with valid and invalid React, TypeScript, and browser code. `.claude/hooks/pre-tool-guard.test.ts` checks every guard decision. These run in `npm run check`.

## Test Design

- Test observable outcomes: rendered UI, returned values, side effects at boundaries.
- Avoid implementation coupling: no internal call counts, no private helper tests, no brittle mocks.
- Use role-based selectors (`getByRole`) over test IDs.
- One assertion focus per test. Separate happy path from edge cases.

## Unit Tests

- Vitest via `npm run test` with jsdom + Testing Library + user-event.
- Import test helpers from `vite-plus/test`.
- Setup in `src/test/setup.ts` runs `cleanup()` after each test.
- Coverage: `npm run test:coverage` (v8, excludes generated files). Vite+ and the coverage provider stay pinned to the same Vitest version.

## E2E Tests

- Playwright with Chromium. Tests in `e2e/`.
- Run `npm run test:e2e:install` once before the first browser test or push.
- All browser tests exercise the built Nitro server. `npm run test:e2e` builds first; Push and CI reuse the build from the task graph.
- `npm run typecheck` includes `e2e/`. Playwright runs TypeScript without checking types.
- Capture both `pageerror` events and browser `console.error` messages; assert zero errors at test end.
- Use accessible selectors: `page.getByRole(...)`, `page.getByText(...)`.

## Clean template test

`npm run test:template` tests the staged files in a clean temporary directory. It performs `npm ci`, checks that installation and hooks leave those files unchanged, exercises post-edit formatting and lint, checks tool-call restrictions, installs Chromium, executes the actual pre-push hook, and boots the production Nitro server.

Stage intended starter changes before running it. Failures preserve the temporary app automatically and write diagnostics to `test-results/starter-journey/`; `KEEP_TEMPLATE_TEST=1` also preserves successful runs.

## Agent Hooks

- **Before a tool call**: `.claude/hooks/pre-tool-guard.mjs` denies edits to generated files, hook bypasses, and non-npm package managers, and asks a human before destructive Git commands. It matches on raw command text, so a shell heredoc that merely mentions a banned flag is blocked too; write such content with the file tools instead.
- **After a write**: `.claude/hooks/post-edit.mjs` formats the file, lints it, and typechecks TypeScript. Lint errors appear in the hook output immediately.
- Edits made through shell commands bypass the post-edit hook; the commit hook is the backstop.

## Git Hooks

- Vite+ owns `.vite-hooks`; do not add a second hook installer.
- **Pre-commit**: `vp staged` plus advisory React Doctor feedback.
- **Commit-msg**: commitlint enforces Conventional Commits.
- **Pre-push**: `npm run check:push`.

## Dead Code

- `npm run knip` detects unused exports, dependencies, and files; it runs in `npm run check:push`.
