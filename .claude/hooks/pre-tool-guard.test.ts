import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vite-plus/test";

const hooksDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(hooksDir, "..", "..");
const guard = join(hooksDir, "pre-tool-guard.mjs");

type Decision = "allow" | "ask" | "deny";

function decide(toolName: string, toolInput: Record<string, string>): Decision {
  const result = spawnSync(process.execPath, [guard], {
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: repoRoot },
    input: JSON.stringify({
      hook_event_name: "PreToolUse",
      tool_name: toolName,
      tool_input: toolInput,
    }),
  });
  expect(result.status).toBe(0);
  if (!result.stdout.trim()) return "allow";
  const output: unknown = JSON.parse(result.stdout);
  if (
    typeof output === "object" &&
    output !== null &&
    "hookSpecificOutput" in output &&
    typeof output.hookSpecificOutput === "object" &&
    output.hookSpecificOutput !== null &&
    "permissionDecision" in output.hookSpecificOutput
  ) {
    const decision = output.hookSpecificOutput.permissionDecision;
    if (decision === "ask" || decision === "deny") return decision;
  }
  throw new Error(`Unexpected guard output: ${result.stdout}`);
}

const bash = (command: string) => decide("Bash", { command });
const edit = (file: string) => decide("Edit", { file_path: join(repoRoot, file) });

describe("pre-tool guard", () => {
  it("denies edits to generated and tool-owned files", () => {
    expect(edit("src/routeTree.gen.ts")).toBe("deny");
    expect(edit("package-lock.json")).toBe("deny");
    expect(edit(".vite-hooks/_/h")).toBe("deny");
    expect(edit(".output/server/index.mjs")).toBe("deny");
  });

  it("allows edits to source, tracked hooks, and files outside the project", () => {
    expect(edit("src/routes/index.tsx")).toBe("allow");
    expect(edit(".vite-hooks/pre-commit")).toBe("allow");
    expect(decide("Write", { file_path: "/tmp/elsewhere/notes.md" })).toBe("allow");
  });

  it("denies hook bypasses and foreign package managers", () => {
    expect(bash('git commit -m "feat: x" --no-verify')).toBe("deny");
    expect(bash("git commit -n -m x")).toBe("deny");
    expect(bash("pnpm add left-pad")).toBe("deny");
    expect(bash("yarn install")).toBe("deny");
    expect(bash("npx oxlint src")).toBe("deny");
  });

  it("escalates destructive git commands to the human", () => {
    expect(bash("git push --force origin main")).toBe("ask");
    expect(bash("git push -f")).toBe("ask");
    expect(bash("git reset --hard HEAD~1")).toBe("ask");
    expect(bash("git checkout -- .")).toBe("ask");
    expect(bash("git clean -fd")).toBe("ask");
  });

  it("allows ordinary commands", () => {
    expect(bash('git commit -m "feat: normal"')).toBe("allow");
    expect(bash("git push origin HEAD")).toBe("allow");
    expect(bash("npm run check")).toBe("allow");
    expect(bash("npm install")).toBe("allow");
    expect(bash("vp lint src")).toBe("allow");
  });

  it("never blocks on malformed input", () => {
    const result = spawnSync(process.execPath, [guard], { encoding: "utf8", input: "not json" });
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
  });
});
