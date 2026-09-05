# Vite+ owns Git hooks

Vite+ installs the Git hooks and runs staged checks. A second installer such as Husky would compete for `core.hooksPath`, so commitlint, React Doctor, and pre-push checks run from the tracked `.vite-hooks` files.
