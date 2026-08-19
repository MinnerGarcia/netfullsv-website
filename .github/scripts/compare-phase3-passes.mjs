import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const artifactRoot = path.join(root, "qa-artifacts", "netfull-3-phase-3");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(artifactRoot, file), "utf8"));
const passA = readJson("qa-pass-a.json");
const passB = readJson("qa-pass-b.json");
const manifestA = JSON.parse(fs.readFileSync(path.join(artifactRoot, "pass-a", "browser", "manifest.json"), "utf8"));
const manifestB = JSON.parse(fs.readFileSync(path.join(artifactRoot, "pass-b", "browser", "manifest.json"), "utf8"));
const controls = ["Static", "Routes", "Browser", "Accessibility", "Conversion", "Assets", "SEO", "Security"];

const failures = [];
if (passA.candidateSha !== passB.candidateSha) failures.push("Pass A and Pass B audited different commits");
if (passA.status !== "PASS" || passB.status !== "PASS") failures.push("At least one pass is not PASS");
if (manifestA.candidateSha !== passA.candidateSha || manifestB.candidateSha !== passB.candidateSha) failures.push("A manifest SHA differs from its pass SHA");
if (manifestA.screenshots.length !== 40 || manifestB.screenshots.length !== 40) failures.push("Each pass must contain exactly 40 screenshots");
for (const [label, manifest] of [["A", manifestA], ["B", manifestB]]) {
  const uniqueNames = new Set(manifest.screenshots.map((entry) => entry.screenshot));
  const uniqueHashes = new Set(manifest.screenshots.map((entry) => entry.sha256));
  if (uniqueNames.size !== 40) failures.push(`Pass ${label} contains duplicate screenshot names`);
  if (uniqueHashes.size !== 40) failures.push(`Pass ${label} contains duplicate screenshot hashes`);
}
for (const control of controls) {
  if (passA.controls[control]?.status !== "PASS" || passB.controls[control]?.status !== "PASS") failures.push(`${control} differs or failed`);
}

const rows = controls.map((control) => `| ${control} | ${passA.controls[control]?.status || "MISSING"} | ${passB.controls[control]?.status || "MISSING"} |`).join("\n");
const result = failures.length ? "FAIL" : "PASS";
const report = `# NETFULL 3.0 — Double Check Report\n\n- Candidate SHA: \`${passA.candidateSha}\`\n- Pass A: ${passA.startedAt} → ${passA.finishedAt}\n- Pass B: ${passB.startedAt} → ${passB.finishedAt}\n- Result: **${result}**\n\n| Control | Pass A | Pass B |\n| --- | --- | --- |\n${rows}\n\n## Independent execution controls\n\nPass B was launched by a new Node process, on a new HTTP port and with a new browser process/context after \`cleanup-phase3-qa.mjs\` removed prior Pass B/browser output. Pass A evidence was read only for this comparison.\n\n## Differences\n\n${failures.length ? failures.map((entry) => `- ${entry}`).join("\n") : "No differences or hidden failures were detected."}\n`;
fs.writeFileSync(path.join(artifactRoot, "QA-DOUBLE-CHECK-REPORT.md"), report, "utf8");
const canonicalManifest = {
  candidateSha: manifestB.candidateSha,
  date: manifestB.date,
  source: "Pass B — independent final verification",
  screenshots: manifestB.screenshots.map((entry) => ({ ...entry, screenshot: `pass-b/browser/${entry.screenshot}` }))
};
fs.writeFileSync(path.join(artifactRoot, "manifest.json"), JSON.stringify(canonicalManifest, null, 2));
const digest = crypto.createHash("sha256").update(report).digest("hex");
fs.writeFileSync(path.join(artifactRoot, "comparison.json"), JSON.stringify({ candidateSha: passA.candidateSha, result, failures, reportSha256: digest }, null, 2));
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Pass A and Pass B match for ${passA.candidateSha}.`);
