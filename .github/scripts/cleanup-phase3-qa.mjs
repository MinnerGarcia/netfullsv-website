import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const artifactRoot = path.join(root, "qa-artifacts", "netfull-3-phase-3");
for (const target of [
  path.join(artifactRoot, "pass-b"),
  path.join(root, "playwright-report"),
  path.join(root, "test-results"),
  path.join(root, ".playwright")
]) {
  fs.rmSync(target, { recursive: true, force: true });
}
if (global.gc) global.gc();
console.log("Temporary browser state and Pass B outputs were cleared. Pass A evidence was preserved.");
