import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const repoRoot = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const packageJson = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"));
const { version: vitePlusVersion } = require("vite-plus/package.json");
const { versions } = require("vite-plus/versions");
const bundledOxlintPlugins = require("vite-plus/package.json").dependencies[
  "@oxlint/plugins"
].replace(/^=/, "");

assert.equal(packageJson.devDependencies["vite-plus"], vitePlusVersion);
assert.equal(packageJson.devDependencies.vitest, versions.vitest);
assert.equal(packageJson.devDependencies["@vitest/coverage-v8"], versions.vitest);
assert.equal(packageJson.overrides.vitest, versions.vitest);
assert.equal(packageJson.overrides.vite, `npm:@voidzero-dev/vite-plus-core@${vitePlusVersion}`);
// lint/rules.js is authored against the plugin API that Vite+'s bundled oxlint loads.
assert.equal(packageJson.devDependencies["@oxlint/plugins"], bundledOxlintPlugins);

console.log(`Vite+ ${packageJson.devDependencies["vite-plus"]} toolchain contract is aligned.`);
