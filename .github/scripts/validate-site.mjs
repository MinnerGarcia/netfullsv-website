import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repositoryRoot = process.cwd();
const htmlPath = path.join(repositoryRoot, "index.html");
const cnamePath = path.join(repositoryRoot, "CNAME");
const securityHeadersPath = path.join(repositoryRoot, ".github", "security-headers.json");
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
check(fs.existsSync(securityHeadersPath), "Security header policy exists", "Security header policy is missing");

if (!fs.existsSync(htmlPath) || !fs.existsSync(cnamePath) || !fs.existsSync(securityHeadersPath)) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");
const cname = fs.readFileSync(cnamePath, "utf8").trim();
const securityHeaders = JSON.parse(fs.readFileSync(securityHeadersPath, "utf8"));

check(cname === "netfullsv.com", "CNAME targets netfullsv.com", `Unexpected CNAME value: ${cname}`);
check(/^<!doctype html>/i.test(html), "HTML doctype is present", "HTML doctype is missing");
check(/<html\b[^>]*\blang="es-SV"/i.test(html), "Document language is es-SV", "Document language must be es-SV");
check(/<meta\s+charset="utf-8"/i.test(html), "UTF-8 charset is declared", "UTF-8 charset declaration is missing");
check(!/http:\/\//i.test(html), "No insecure HTTP resources", "An insecure http:// reference was found");
check(!/javascript\s*:/i.test(html), "No javascript: URLs", "A javascript: URL was found");
check(!/<style\b/i.test(html), "No inline style blocks", "An inline style block was found");
check(!/\sstyle="/i.test(html), "No inline style attributes", "An inline style attribute was found");

const cspMeta = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)">/i)?.[1];
const referrerMeta = html.match(/<meta\s+name="referrer"\s+content="([^"]+)">/i)?.[1];
const headerCsp = securityHeaders["Content-Security-Policy"];
const expectedMetaCsp = headerCsp?.replace(/; frame-ancestors 'none'/, "");

check(Boolean(cspMeta), "CSP meta policy is present", "CSP meta policy is missing");
check(cspMeta === expectedMetaCsp, "CSP meta matches the edge policy", "CSP meta does not match the edge policy");
check(!cspMeta?.includes("'unsafe-inline'"), "CSP blocks unsafe inline code", "CSP contains 'unsafe-inline'");
check(!cspMeta?.includes("'unsafe-eval'"), "CSP blocks eval-like code", "CSP contains 'unsafe-eval'");
check(referrerMeta === "strict-origin-when-cross-origin", "Referrer policy meta is strict", "Unexpected or missing referrer policy meta");

const requiredHeaders = {
  "Strict-Transport-Security": "max-age=31536000",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
  check(securityHeaders[header] === expectedValue, `${header} policy is correct`, `${header} policy is missing or incorrect`);
}

check(headerCsp?.includes("frame-ancestors 'none'"), "CSP blocks framing", "CSP must contain frame-ancestors 'none'");
check(Boolean(securityHeaders["Permissions-Policy"]), "Permissions Policy is defined", "Permissions-Policy is missing");

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
let jsonLdHash = "";

for (const match of html.matchAll(scriptPattern)) {
  const attributes = match.groups?.attributes ?? "";
  const source = match.groups?.source ?? "";
  if (/type="application\/ld\+json"/i.test(attributes)) {
    try {
      JSON.parse(source);
      jsonLdCount += 1;
      jsonLdHash = crypto.createHash("sha256").update(source, "utf8").digest("base64");
    } catch (error) {
      errors.push(`Invalid JSON-LD: ${error.message}`);
    }
    continue;
  }

  if (/\bsrc="[^"]+"/i.test(attributes)) continue;

  try {
    new vm.Script(source, { filename: "index.html:inline-script" });
    executableScriptCount += 1;
  } catch (error) {
    errors.push(`Invalid inline JavaScript: ${error.message}`);
  }
}

const externalScripts = Array.from(html.matchAll(/<script\b[^>]*\bsrc="(assets\/[^"]+)"[^>]*><\/script>/gi));
for (const [, scriptReference] of externalScripts) {
  const scriptSource = fs.readFileSync(path.join(repositoryRoot, normalizeAssetReference(scriptReference)), "utf8");
  try {
    new vm.Script(scriptSource, { filename: scriptReference });
  } catch (error) {
    errors.push(`Invalid external JavaScript in ${scriptReference}: ${error.message}`);
  }
}

check(executableScriptCount === 0, "No executable inline scripts", `${executableScriptCount} executable inline script(s) found`);
check(externalScripts.length >= 2, `${externalScripts.length} external scripts parsed`, "Expected external JavaScript files were not found");
check(jsonLdCount > 0, `${jsonLdCount} JSON-LD blocks parsed`, "No valid JSON-LD block was parsed");
check(cspMeta?.includes(`'sha256-${jsonLdHash}'`), "JSON-LD hash is allowed by CSP", "CSP does not contain the current JSON-LD hash");
check(assetReferences.size > 0, `${assetReferences.size} local assets verified`, "No local asset references were found");

for (const message of passed) console.log(`PASS: ${message}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error(`\nValidation failed with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`\nValidation completed successfully with ${passed.length} checks.`);
