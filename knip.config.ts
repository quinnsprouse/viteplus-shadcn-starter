import type { KnipConfig } from "knip";

export default {
  // Vite+ is not a stock Vite/Vitest package, so make its executable surfaces explicit.
  entry: [
    ".claude/hooks/*.mjs",
    ".codex/hooks/*.{mjs,test.ts}",
    // Loaded by string specifier from vite.config.ts and doctor.config.ts
    "lint/rules.js",
    "e2e/**/*.ts",
    "scripts/**/*.mjs",
    "src/routes/**/*.{ts,tsx}",
    "src/**/*.test.{ts,tsx}",
  ],
  ignoreDependencies: [
    // The commit-msg shell hook invokes this executable outside Knip's JavaScript analysis.
    "@commitlint/cli",
    // Bundled by vite-plus; lint/rules.test.ts drives the binary directly to test the plugin.
    "oxlint",
  ],
  // Consumed by the react-doctor CLI, which knip has no plugin for
  ignore: ["doctor.config.ts"],
} satisfies KnipConfig;
