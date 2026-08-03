import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repositoryRoot = process.cwd();
const htmlPath = path.join(repositoryRoot, "index.html");
const cnamePath = path.join(repositoryRoot, "CNAME");
const errors = [];
const passed = [];

function check(condition, successMessage, failureMessage) {
  if (condition) {
    passed.push(successMessage);
    return;
  }
  errors.push(failureMessage);
}

function normalizeAssetReference(reference) {
  return reference
    .split("#", 1)[0]
    .split("?", 1)[0]
    .replace(/^\.\//, "");
}

check(fs.existsSync(htmlPath), "index.html exists", "index.html is missing");
check(fs.existsSync(cnamePath), "CNAME exists", "CNAME is missing");

if (!fs.existsSync(htmlPath) || !fs.existsSync(cnamePath)) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");
const cname = fs.readFileSync(cnamePath, "utf8").trim();

check(cname === "netfullsv.com", "CNAME targets netfullsv.com", `Unexpected CNAME value: ${cname}`);
check(/^<!doctype html>/i.test(html), "HTML doctype is present", "HTML doctype is missing");
check(/<html\b[^>]*\blang="es-SV"/i.test(html), "Document language is es-SV", "Document language must be es-SV");
check(/<meta\s+charset="utf-8"/i.test(html), "UTF-8 charset is declared", "UTF-8 charset declaration is missing");
check(!/http:\/\//i.test(html), "No insecure HTTP resources", "An insecure http:// reference was found");
check(!/javascript\s*:/i.test(html), "No javascript: URLs", "A javascript: URL was found");

const forbiddenJavaScript = [
  [/(^|[^.\w])eval\s*\(/m, "eval()"],
  [/new\s+Function\s*\(/m, "new Function()"],
  [/document\.write\s*\(/m, "document.write()"],
  [/\.innerHTML\s*=/m, "innerHTML assignment"],
  [/\.outerHTML\s*=/m, "outerHTML assignment"],
  [/insertAdjacentHTML\s*\(/m, "insertAdjacentHTML()"]
];

for (const [pattern, label] of forbiddenJavaScript) {
  check(!pattern.test(html), `No unsafe ${label}`, `Unsafe JavaScript primitive found: ${label}`);
}

const blankTargetTags = html.match(/<a\b[^>]*\btarget="_blank"[^>]*>/gi) ?? [];
for (const tag of blankTargetTags) {
  check(
    /\brel="[^"]*\bnoopener\b[^"]*\bnoreferrer\b[^"]*"/i.test(tag),
    "External tab link is isolated",
    `target="_blank" link is missing rel="noopener noreferrer": ${tag.slice(0, 160)}`
  );
}

const assetReferences = new Set();
for (const match of html.matchAll(/(?:src|href)="(assets\/[^"#?]+)(?:[?#][^"]*)?"/gi)) {
  assetReferences.add(normalizeAssetReference(match[1]));
}
for (const match of html.matchAll(/url\(["']?(assets\/[^)"']+)["']?\)/gi)) {
  assetReferences.add(normalizeAssetReference(match[1]));
}

for (const asset of assetReferences) {
  check(
    fs.existsSync(path.join(repositoryRoot, asset)),
    `Asset exists: ${asset}`,
    `Referenced asset does not exist: ${asset}`
  );
}

const scriptPattern = /<script(?<attributes>[^>]*)>(?<source>[\s\S]*?)<\/script>/gi;
let executableScriptCount = 0;
let jsonLdCount = 0;

for (const match of html.matchAll(scriptPattern)) {
  const attributes = match.groups?.attributes ?? "";
  const source = match.groups?.source ?? "";
  if (/type="application\/ld\+json"/i.test(attributes)) {
    try {
      JSON.parse(source);
      jsonLdCount += 1;
    } catch (error) {
      errors.push(`Invalid JSON-LD: ${error.message}`);
    }
    continue;
  }

  try {
    new vm.Script(source, { filename: "index.html:inline-script" });
    executableScriptCount += 1;
  } catch (error) {
    errors.push(`Invalid inline JavaScript: ${error.message}`);
  }
}

check(executableScriptCount > 0, `${executableScriptCount} inline scripts parsed`, "No executable JavaScript was parsed");
check(jsonLdCount > 0, `${jsonLdCount} JSON-LD blocks parsed`, "No valid JSON-LD block was parsed");
check(assetReferences.size > 0, `${assetReferences.size} local assets verified`, "No local asset references were found");

for (const message of passed) console.log(`PASS: ${message}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error(`\nValidation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`\nValidation completed successfully with ${passed.length} checks.`);
