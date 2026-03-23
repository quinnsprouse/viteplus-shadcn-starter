# Vite+ Toolchain

`vp` is the global CLI wrapping Vite 8, Rolldown, Vitest, Oxlint, Oxfmt, and Vite Task.

## Commands

| Task                      | Command                          |
| ------------------------- | -------------------------------- |
| Dev server                | `vp dev`                         |
| Format + lint + typecheck | `vp check` (`--fix` to auto-fix) |
| Format                    | `vp fmt`                         |
| Lint                      | `vp lint`                        |
| Tests                     | `vp test run`                    |
| Build                     | `vp build`                       |
| Add dependency            | `vp add <pkg>`                   |
| One-off binary            | `vp dlx <pkg>`                   |
| Tool versions             | `vp --version`                   |

## Import Convention

Always import from `vite-plus`, not `vite` or `vitest`:

```ts
import { defineConfig } from "vite-plus";
```

## Pitfalls

- Do not install vitest, oxlint, oxfmt, or tsdown directly — Vite+ bundles them.
- `vp dev` runs the Vite dev server, not a `package.json` script. Use `vp run dev` for custom scripts.
- Use `vp dlx` instead of `npx`.
- `vp vitest` / `vp oxlint` don't exist — use `vp test` / `vp lint`.

## Pre-commit

`vp staged` runs `vp check --fix` on staged files (configured in `vite.config.ts` → `staged`).
