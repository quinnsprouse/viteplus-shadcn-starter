# Lint Rules

Rodeo's lint gate has three layers. All three run on every `vp lint`, in Edit Feedback after each write, in `vp staged` at commit, and in every Verification Profile. Warnings fail the gate: `lint.options.denyWarnings` is on.

1. **Oxlint categories** — `correctness`, `suspicious`, and `perf`, plus type-aware `typescript/*` rules through tsgolint.
2. **Named restriction rules** — individually chosen Oxlint rules that ban known agent mistakes.
3. **Project rules** — the `rodeo/*` plugin in `lint/rules.js`, written for patterns no stock rule expresses.

## No inline suppression

`oxlint-disable` and `eslint-disable` comments are lint errors (`rodeo/no-disable-directives`), and Oxlint ignores `eslint-disable` comments even where they appear. When a rule is wrong for a file, add a file-scoped entry under `lint.overrides` in `vite.config.ts` with a comment explaining why. That keeps every exception in one reviewed place instead of scattered through the code. See [ADR 0004](../adr/0004-lint-exceptions-live-in-config.md).

## Named restriction rules

| Rule                                  | Why                                                                     | Do this instead                                        |
| ------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| `no-restricted-imports`               | `useEffect` family from React; icon and animation packages we don't use | `useMountEffect`, `@/components/icons`, `motion/react` |
| `import/no-relative-parent-imports`   | `../../lib/x` paths break when files move                               | `@/lib/x`                                              |
| `import/no-default-export`            | Default exports defeat rename refactors and Knip                        | Named exports (config files are exempt)                |
| `typescript/no-explicit-any`          | `any` turns off the type checker where it matters most                  | `unknown` plus narrowing, or a real type               |
| `typescript/no-non-null-assertion`    | `x!` hides a null path the compiler found                               | Narrow with `if`, or `?.` with a fallback              |
| `typescript/ban-ts-comment`           | `@ts-ignore` hides errors silently                                      | `@ts-expect-error` with a description, or fix it       |
| `typescript/no-misused-promises`      | Promises in `if` or as `void` callbacks run unawaited                   | `await`, or `void` an intentional fire-and-forget      |
| `typescript/no-unsafe-*`              | Values typed `any` leaking through calls, returns, and members          | Type the boundary                                      |
| `typescript/no-unsafe-type-assertion` | `as unknown as T` bypasses checking                                     | Validate at the boundary                               |
| `react/no-danger`                     | `dangerouslySetInnerHTML` is the XSS path                               | Render data as text or sanitize server-side            |
| `no-console`                          | Stray debug output ships to production                                  | `console.warn` / `console.error` are allowed           |
| `unicorn/no-array-for-each`           | `forEach(async …)` silently drops awaits                                | `for … of`, or `Promise.all(items.map(…))`             |
| `unicorn/no-abusive-eslint-disable`   | Bare `eslint-disable` turns off everything                              | Fix the code                                           |

## Project rules (`rodeo/*`)

| Rule                              | Catches                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `no-effect-hooks`                 | `useEffect`, `useLayoutEffect`, `useInsertionEffect` via any import shape, including `React.useEffect`    |
| `no-disable-directives`           | Any `oxlint-disable` or `eslint-disable` comment                                                          |
| `server-fn-requires-validator`    | A `createServerFn` handler that reads `data` without `.validator()` or `.inputValidator()`                |
| `mount-effect-cleanup`            | A `useMountEffect` that starts a timer, listener, or subscription and returns no cleanup; async callbacks |
| `no-hex-colors-in-classname`      | `[#hex]` arbitrary values in `className` outside `src/components/ui/`                                     |
| `no-state-from-props`             | `useState(prop)` seeded from a prop not named `default*` or `initial*`                                    |
| `no-module-scope-browser-globals` | `window`, `document`, `localStorage`, `navigator`, `location` read at module scope (SSR crash)            |
| `no-window-navigation`            | `window.location.href = …`, `location.assign()`, `location.replace()`                                     |

Rules live in `lint/rules.js` and are tested end to end through the real Oxlint binary in `lint/rules.test.ts`. React Doctor loads the same plugin through `doctor.config.ts`, so the rules also appear in `npm run doctor` and the PR summary comment.

## Adding a rule

1. Write the rule with `defineRule` from `@oxlint/plugins` in `lint/rules.js`. Rules see the AST, scopes, and comments; they do not get type information.
2. Give it a message that names the fix and links the doc that explains the pattern.
3. Add a describe block in `lint/rules.test.ts` with one failing and one passing fixture.
4. Enable it under `lint.rules` in `vite.config.ts` and add a row above.
