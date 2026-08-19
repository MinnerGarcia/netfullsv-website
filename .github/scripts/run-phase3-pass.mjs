import fs from "node:fs";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const passName = String(process.argv[2] || "").toUpperCase();
if (!/^[AB]$/.test(passName)) throw new Error("Usage: node .github/scripts/run-phase3-pass.mjs A|B");

const candidateSha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
if (process.env.CANDIDATE_SHA && process.env.CANDIDATE_SHA !== candidateSha) {
  throw new Error(`CANDIDATE_SHA ${process.env.CANDIDATE_SHA} differs from HEAD ${candidateSha}`);
}

const artifactRoot = path.join(root, "qa-artifacts", "netfull-3-phase-3");
const passDirectory = path.join(artifactRoot, `pass-${passName.toLowerCase()}`);
fs.rmSync(passDirectory, { recursive: true, force: true });
fs.mkdirSync(passDirectory, { recursive: true });

const startedAt = new Date().toISOString();
const controls = {};
const logs = [];

function run(control, command, args, options = {}) {
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, CANDIDATE_SHA: candidateSha, ...options.env },
    maxBuffer: 32 * 1024 * 1024
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  const record = {
    control,
    status: result.status === 0 ? "PASS" : "FAIL",
    exitCode: result.status,
    durationMs: Date.now() - started
  };
  controls[control] = record;
  logs.push(`## ${control}\n\nExit: ${result.status}\n\n\`\`\`text\n${output}\n\`\`\``);
  if (result.status !== 0) throw new Error(`${control} failed\n${output}`);
}

let failure = "";
try {
  run("Static", process.execPath, [".github/scripts/validate-site.mjs"]);
  run("Negative validator", process.execPath, [".github/scripts/test-validator.mjs"]);
  run("Shell consistency", process.execPath, [".github/scripts/sync-shell.mjs", "--check"]);
  run("CSS audit", process.execPath, [".github/scripts/audit-css.mjs"], {
    env: { QA_CSS_OUTPUT: path.join(passDirectory, "css-audit.json") }
  });
  run("Browser", process.execPath, [".github/scripts/qa-browser.mjs"], {
    env: {
      QA_OUTPUT_DIR: path.join(passDirectory, "browser"),
      QA_PORT: passName === "A" ? "4174" : "4175"
    }
  });
  if (process.env.QA_SKIP_EXTERNAL !== "1") {
    const externalArgs = process.platform === "win32"
      ? ["--use-system-ca", ".github/scripts/check-external-security.mjs"]
      : [".github/scripts/check-external-security.mjs"];
    run("External security", process.execPath, externalArgs);
  } else {
    controls["External security"] = { control: "External security", status: "SKIP", reason: "QA_SKIP_EXTERNAL=1" };
  }
} catch (error) {
  failure = error instanceof Error ? error.message : String(error);
}

const browserResultPath = path.join(passDirectory, "browser", "browser-results.json");
const browserResult = fs.existsSync(browserResultPath) ? JSON.parse(fs.readFileSync(browserResultPath, "utf8")) : null;
if (browserResult) {
  controls.Routes = { control: "Routes", status: browserResult.summary.errors === 0 ? "PASS" : "FAIL", count: browserResult.summary.routeViewportCombinations };
  controls.Accessibility = { control: "Accessibility", status: browserResult.axeChecks.every((entry) => entry.violations.length === 0) ? "PASS" : "FAIL", count: browserResult.summary.axeScans };
  controls.Conversion = { control: "Conversion", status: browserResult.summary.errors === 0 ? "PASS" : "FAIL", count: browserResult.summary.conversionCases };
  controls.Responsive = { control: "Responsive", status: browserResult.checks.every((entry) => !entry.overflow && entry.floatOverlaps.length === 0) ? "PASS" : "FAIL", count: browserResult.summary.routeViewportCombinations };
  controls.Assets = { control: "Assets", status: browserResult.summary.errors === 0 ? "PASS" : "FAIL" };
  controls.SEO = { control: "SEO", status: controls.Static?.status || "FAIL" };
  controls.Security = { control: "Security", status: controls.Static?.status === "PASS" && !failure ? "PASS" : "FAIL" };
}

const required = ["Static", "Routes", "Browser", "Accessibility", "Conversion", "Assets", "SEO", "Security"];
const status = !failure && required.every((control) => controls[control]?.status === "PASS") ? "PASS" : "FAIL";
const report = {
  pass: passName,
  candidateSha,
  startedAt,
  finishedAt: new Date().toISOString(),
  status,
  controls,
  browserSummary: browserResult?.summary || null,
  failure: failure || null
};

fs.mkdirSync(artifactRoot, { recursive: true });
fs.writeFileSync(path.join(artifactRoot, `qa-pass-${passName.toLowerCase()}.json`), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(passDirectory, "execution.log.md"), `${logs.join("\n\n")}\n`, "utf8");

if (status !== "PASS") {
  console.error(failure || `Pass ${passName} failed`);
  process.exit(1);
}
console.log(`QA Pass ${passName} passed for ${candidateSha}.`);
