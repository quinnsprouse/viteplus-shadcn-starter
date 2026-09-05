# Verification profiles live in Vite Task

Fast, Push, and CI checks are defined once in `vite.config.ts`. Package scripts, hooks, and CI call the same tasks so check ordering and caching do not drift between callers.
