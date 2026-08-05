import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = process.cwd();
const validator = path.join(repositoryRoot, ".github", "scripts", "validate-site.mjs");
const cases = [
  {
    name: "unsafe DOM injection",
    file: path.join("assets", "site.js"),
    mutate: (source) => `${source}\ndocument.body.innerHTML = userControlledValue;\n`,
    expected: "innerHTML assignment"
  },
  {
    name: "missing consent requirement",
    file: "index.html",
    mutate: (source) => source.replace('id="whatsapp-consent" name="whatsappConsent" type="checkbox" value="accepted" required', 'id="whatsapp-consent" name="whatsappConsent" type="checkbox" value="accepted"'),
    expected: "consent checkbox is missing or is not required"
  },
  {
    name: "broken local asset",
    file: "index.html",
    mutate: (source) => source.replace("assets/favicon.png", "assets/missing-favicon.png"),
    expected: "Broken local reference"
  },
  {
    name: "untrusted CAA policy",
    file: path.join(".github", "scripts", "check-external-security.mjs"),
    mutate: (source) => source.replaceAll("letsencrypt.org", "untrusted.example"),
    expected: "CAA policy"
  }
];

for (const testCase of cases) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "netfull-validator-"));
  try {
    fs.cpSync(repositoryRoot, temporaryRoot, {
      recursive: true,
      filter: (source) => !source.split(path.sep).includes(".git")
    });
    const target = path.join(temporaryRoot, testCase.file);
    fs.writeFileSync(target, testCase.mutate(fs.readFileSync(target, "utf8")), "utf8");
    const result = spawnSync(process.execPath, [path.relative(temporaryRoot, validator)], {
      cwd: temporaryRoot,
      encoding: "utf8"
    });
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status === 0 || !output.includes(testCase.expected)) {
      console.error(`FAIL: validator did not reject ${testCase.name}`);
      console.error(output);
      process.exit(1);
    }
    console.log(`PASS: validator rejects ${testCase.name}`);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

console.log(`\nValidator self-tests completed successfully with ${cases.length} negative cases.`);
