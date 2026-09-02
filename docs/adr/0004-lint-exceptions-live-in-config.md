# Lint exceptions live in config, not inline

Inline `oxlint-disable` and `eslint-disable` comments are lint errors, and warnings fail the gate. Agents reach for a disable comment faster than for a fix, and one example in the tree teaches every later agent the escape hatch; a file-scoped entry under `lint.overrides` in `vite.config.ts` is the only sanctioned exception, so every suppression is visible in one reviewed place with a reason next to it.
