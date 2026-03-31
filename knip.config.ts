import type { KnipConfig } from "knip";

export default {
  // vp (vite-plus) consumes these internally via oxlint bridge — knip can't trace string specifiers
  ignoreDependencies: [
    "oxlint",
    "eslint-plugin-react-hooks",
    "@tanstack/eslint-plugin-router",
    "@tanstack/eslint-plugin-query",
    // Type reference in __root.tsx
    "vite",
  ],
  // skills CLI is invoked in prepare script
  ignoreBinaries: ["skills"],
} satisfies KnipConfig;
