import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const repositoryRoot = process.cwd();
const errors = [];
const passed = [];
const ignoredDirectories = new Set([".git", "node_modules"]);

function check(condition, successMessage, failureMessage) {
  if (condition) {
    passed.push(successMessage);
    return;
  }
  errors.push(failureMessage);
}

function relative(filePath) {
  return path.relative(repositoryRoot, filePath).replaceAll(path.sep, "/");
}

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(entryPath));
    else files.push(entryPath);
  }
  return files;
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function attributes(tag) {
  const result = new Map();
  for (const match of tag.matchAll(/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function extractScriptBlocks(html, fileName) {
  const blocks = [];
  const lowerHtml = html.toLowerCase();
  let cursor = 0;

  while (cursor < html.length) {
    const openStart = lowerHtml.indexOf("<script", cursor);
    if (openStart === -1) break;
    const openEnd = lowerHtml.indexOf(">", openStart + 7);
    if (openEnd === -1) {
      errors.push(`Malformed <script> opening tag in ${fileName}`);
      break;
    }

    const closeStart = lowerHtml.indexOf("</script", openEnd + 1);
    if (closeStart === -1) {
      errors.push(`Missing </script> closing tag in ${fileName}`);
      break;
    }
    const closeEnd = lowerHtml.indexOf(">", closeStart + 8);
    if (closeEnd === -1) {
      errors.push(`Malformed </script> closing tag in ${fileName}`);
      break;
    }

    blocks.push({
      attributes: html.slice(openStart + 7, openEnd),
      source: html.slice(openEnd + 1, closeStart)
    });
    cursor = closeEnd + 1;
  }

  return blocks;
}

function validateBalancedMarkup(html, fileName) {
  const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  const stack = [];
  const mismatches = [];

  for (const match of html.matchAll(/<\/?([a-z][\w:-]*)\b[^>]*>/gi)) {
    const fullTag = match[0];
    const name = match[1].toLowerCase();
    if (fullTag.startsWith("</")) {
      const open = stack.pop();
      if (open !== name) mismatches.push(`expected </${open ?? "none"}> but found </${name}>`);
      continue;
    }
    if (!voidElements.has(name) && !fullTag.endsWith("/>")) stack.push(name);
  }

  check(mismatches.length === 0 && stack.length === 0, `HTML structure is balanced in ${fileName}`, `Malformed HTML in ${fileName}: ${[...mismatches, ...(stack.length ? [`unclosed ${stack.join(", ")}`] : [])].join("; ")}`);
}

function localTarget(sourceFile, reference) {
  if (!reference || /^(?:https?:|mailto:|tel:|data:|about:)/i.test(reference)) return null;
  const [pathnamePart, fragment = ""] = reference.split("#", 2);
  const pathname = pathnamePart.split("?", 1)[0];
  let targetPath;

  if (!pathname) targetPath = sourceFile;
  else if (pathname.startsWith("/")) targetPath = path.join(repositoryRoot, pathname.slice(1));
  else targetPath = path.resolve(path.dirname(sourceFile), pathname);

  if (pathname.endsWith("/")) targetPath = path.join(targetPath, "index.html");
  const traversal = path.relative(repositoryRoot, targetPath);
  return { targetPath, fragment, staysInsideRepository: traversal !== ".." && !traversal.startsWith(`..${path.sep}`) };
}

const allFiles = walk(repositoryRoot);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
const cssFiles = allFiles.filter((file) => file.endsWith(".css"));
const jsFiles = allFiles.filter((file) => /\.(?:js|mjs)$/.test(file) && !relative(file).startsWith(".github/scripts/"));
const textFiles = allFiles.filter((file) => /(?:\.(?:html|css|js|mjs|json|ya?ml|md)|CNAME)$/.test(file));
const indexPath = path.join(repositoryRoot, "index.html");
const privacyPath = path.join(repositoryRoot, "privacidad.html");
const cnamePath = path.join(repositoryRoot, "CNAME");
const securityHeadersPath = path.join(repositoryRoot, ".github", "security-headers.json");
const workflowPath = path.join(repositoryRoot, ".github", "workflows", "validate-site.yml");
const externalWorkflowPath = path.join(repositoryRoot, ".github", "workflows", "external-security.yml");
const externalCheckerPath = path.join(repositoryRoot, ".github", "scripts", "check-external-security.mjs");
const allowedSignersPath = path.join(repositoryRoot, ".github", "allowed_signers");
const securityControlsPath = path.join(repositoryRoot, ".github", "SECURITY-CONTROLS.md");

for (const [filePath, label] of [
  [indexPath, "index.html"],
  [privacyPath, "privacidad.html"],
  [cnamePath, "CNAME"],
  [securityHeadersPath, "security header policy"],
  [workflowPath, "validation workflow"],
  [externalWorkflowPath, "external security workflow"],
  [externalCheckerPath, "external security checker"],
  [allowedSignersPath, "allowed signers file"],
  [securityControlsPath, "security controls documentation"]
]) {
  check(fs.existsSync(filePath), `${label} exists`, `${label} is missing`);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

const indexHtml = read(indexPath);
const privacyHtml = read(privacyPath);
const siteJavaScript = read(path.join(repositoryRoot, "assets", "site.js"));
const cname = read(cnamePath).trim();
const securityHeaders = JSON.parse(read(securityHeadersPath));
const workflow = read(workflowPath);
const externalWorkflow = read(externalWorkflowPath);
const externalChecker = read(externalCheckerPath);
const allowedSigners = read(allowedSignersPath);
const securityControls = read(securityControlsPath);

check(cname === "netfullsv.com", "CNAME targets netfullsv.com", `Unexpected CNAME value: ${cname}`);
check(htmlFiles.length >= 2, `${htmlFiles.length} HTML pages found`, "Expected the home and privacy pages");

const idsByFile = new Map();
for (const htmlPath of htmlFiles) {
  const fileName = relative(htmlPath);
  const html = read(htmlPath);
  validateBalancedMarkup(html, fileName);

  check(/^<!doctype html>/i.test(html), `Doctype present in ${fileName}`, `HTML doctype is missing in ${fileName}`);
  check(/<html\b[^>]*\blang="es-SV"/i.test(html), `Language declared in ${fileName}`, `Document language must be es-SV in ${fileName}`);
  check(/<meta\s+charset="utf-8"/i.test(html), `UTF-8 declared in ${fileName}`, `UTF-8 charset declaration is missing in ${fileName}`);
  check(/<title>[^<]+<\/title>/i.test(html), `Title present in ${fileName}`, `Title is missing in ${fileName}`);
  check((html.match(/<main\b/gi) ?? []).length === 1, `One main landmark in ${fileName}`, `Expected exactly one <main> in ${fileName}`);
  check(!/http:\/\//i.test(html), `No insecure HTTP in ${fileName}`, `An insecure http:// reference was found in ${fileName}`);
  check(!/javascript\s*:/i.test(html), `No javascript URLs in ${fileName}`, `A javascript: URL was found in ${fileName}`);
  check(!/<style\b/i.test(html), `No inline styles in ${fileName}`, `An inline style block was found in ${fileName}`);
  check(!/\sstyle="/i.test(html), `No style attributes in ${fileName}`, `An inline style attribute was found in ${fileName}`);
  check(!/\son[a-z]+\s*=/i.test(html), `No inline event handlers in ${fileName}`, `An inline event handler was found in ${fileName}`);
  check(/<meta\s+http-equiv="Content-Security-Policy"/i.test(html), `CSP meta present in ${fileName}`, `CSP meta policy is missing in ${fileName}`);
  check(/<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"/i.test(html), `Referrer policy present in ${fileName}`, `Referrer policy is missing or weak in ${fileName}`);

  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/gi), (match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  check(duplicateIds.length === 0, `Unique IDs in ${fileName}`, `Duplicate IDs in ${fileName}: ${[...new Set(duplicateIds)].join(", ")}`);
  idsByFile.set(htmlPath, new Set(ids));

  const labels = new Set(Array.from(html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/gi), (match) => match[1]));
  const controls = html.match(/<(?:input|select|textarea)\b[^>]*>/gi) ?? [];
  for (const control of controls) {
    const attrs = attributes(control);
    const type = attrs.get("type")?.toLowerCase();
    if (type === "hidden" || type === "submit" || type === "button") continue;
    const id = attrs.get("id");
    check(Boolean(id && labels.has(id)), `Control ${id ?? "without-id"} is labelled`, `Form control is missing an associated label in ${fileName}: ${control}`);
  }

  for (const tag of html.match(/<a\b[^>]*\btarget="_blank"[^>]*>/gi) ?? []) {
    const rel = attributes(tag).get("rel") ?? "";
    check(/\bnoopener\b/i.test(rel) && /\bnoreferrer\b/i.test(rel), `External tab isolated in ${fileName}`, `target="_blank" link is missing rel="noopener noreferrer" in ${fileName}: ${tag}`);
  }
}

for (const htmlPath of htmlFiles) {
  const html = read(htmlPath);
  for (const tag of html.match(/<(?:a|img|script|link|source)\b[^>]*>/gi) ?? []) {
    const attrs = attributes(tag);
    const reference = attrs.get("href") ?? attrs.get("src") ?? attrs.get("srcset");
    if (!reference || reference.includes(",")) continue;
    const target = localTarget(htmlPath, reference);
    if (!target) continue;
    check(target.staysInsideRepository, `Reference stays inside repository: ${reference}`, `Path traversal reference in ${relative(htmlPath)}: ${reference}`);
    if (!target.staysInsideRepository) continue;
    check(fs.existsSync(target.targetPath), `Local reference exists: ${reference}`, `Broken local reference in ${relative(htmlPath)}: ${reference}`);
    if (target.fragment && fs.existsSync(target.targetPath) && target.targetPath.endsWith(".html")) {
      check(idsByFile.get(target.targetPath)?.has(target.fragment), `Fragment exists: ${reference}`, `Broken fragment in ${relative(htmlPath)}: ${reference}`);
    }
  }
}

for (const cssPath of cssFiles) {
  const css = read(cssPath);
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    const target = localTarget(cssPath, match[1]);
    if (!target) continue;
    check(target.staysInsideRepository && fs.existsSync(target.targetPath), `CSS asset exists: ${match[1]}`, `Broken CSS asset in ${relative(cssPath)}: ${match[1]}`);
  }
}

const cspMeta = indexHtml.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)">/i)?.[1];
const headerCsp = securityHeaders["Content-Security-Policy"];
const expectedMetaCsp = headerCsp?.replace(/; frame-ancestors 'none'/, "");
check(cspMeta === expectedMetaCsp, "Home CSP meta matches edge policy", "Home CSP meta does not match the edge policy");
check(!cspMeta?.includes("'unsafe-inline'"), "CSP blocks unsafe inline code", "CSP contains 'unsafe-inline'");
check(!cspMeta?.includes("'unsafe-eval'"), "CSP blocks eval-like code", "CSP contains 'unsafe-eval'");

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

for (const jsPath of jsFiles) {
  const source = read(jsPath);
  try {
    new vm.Script(source, { filename: relative(jsPath) });
    passed.push(`Valid JavaScript: ${relative(jsPath)}`);
  } catch (error) {
    errors.push(`Invalid JavaScript in ${relative(jsPath)}: ${error.message}`);
  }
  for (const [pattern, label] of forbiddenJavaScript) {
    check(!pattern.test(source), `No unsafe ${label} in ${relative(jsPath)}`, `Unsafe JavaScript primitive in ${relative(jsPath)}: ${label}`);
  }
}

let executableInlineScripts = 0;
let jsonLdCount = 0;
for (const htmlPath of htmlFiles) {
  const html = read(htmlPath);
  for (const block of extractScriptBlocks(html, relative(htmlPath))) {
    const attrs = block.attributes;
    const source = block.source;
    if (/type="application\/ld\+json"/i.test(attrs)) {
      try {
        JSON.parse(source);
        jsonLdCount += 1;
        if (htmlPath === indexPath) {
          const hash = crypto.createHash("sha256").update(source.replace(/\r\n/g, "\n"), "utf8").digest("base64");
          check(cspMeta?.includes(`'sha256-${hash}'`), "JSON-LD hash is allowed by CSP", "CSP does not contain the current JSON-LD hash");
        }
      } catch (error) {
        errors.push(`Invalid JSON-LD in ${relative(htmlPath)}: ${error.message}`);
      }
      continue;
    }
    if (!/\bsrc="[^"]+"/i.test(attrs)) executableInlineScripts += 1;
  }
}
check(executableInlineScripts === 0, "No executable inline scripts", `${executableInlineScripts} executable inline script(s) found`);
check(jsonLdCount > 0, `${jsonLdCount} JSON-LD block(s) parsed`, "No valid JSON-LD block was parsed");

const secretPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/, "GitHub token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key"],
  [/\bxox[baprs]-[A-Za-z0-9-]{20,}\b/, "Slack token"],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, "Google API key"]
];
const potentialSecrets = [];
for (const filePath of textFiles) {
  const source = read(filePath);
  for (const [pattern, label] of secretPatterns) {
    if (pattern.test(source)) potentialSecrets.push(`${label} in ${relative(filePath)}`);
  }
}
check(potentialSecrets.length === 0, `${textFiles.length} text files scanned for secrets`, `Potential secrets found: ${potentialSecrets.join(", ")}`);

for (const workflowSource of [workflow, externalWorkflow]) {
  for (const match of workflowSource.matchAll(/^\s*uses:\s*([^\s#]+)\s*(?:#.*)?$/gm)) {
    const reference = match[1];
    const version = reference.split("@")[1] ?? "";
    check(reference.startsWith("./") || /^[0-9a-f]{40}$/i.test(version), `Action pinned: ${reference}`, `GitHub Action is not pinned to a full commit SHA: ${reference}`);
  }
}
check(/pull_request:[\s\S]*?branches:[\s\S]*?- main/m.test(workflow), "Validation runs on PRs to main", "Validation workflow must run on pull requests to main");
check(/permissions:\s*\r?\n\s+contents:\s+read/m.test(workflow), "Workflow permissions are read-only", "Validation workflow permissions must be read-only");
check(/timeout-minutes:\s*\d+/m.test(workflow), "Workflow has a timeout", "Validation workflow must define a timeout");
check(workflow.includes("test-validator.mjs"), "Validator self-tests run in CI", "Validation workflow must run validator self-tests");

check(/pull_request:[\s\S]*?branches:[\s\S]*?- main/m.test(externalWorkflow), "External checks run on PRs to main", "External security workflow must run on pull requests to main");
check(/push:[\s\S]*?branches:[\s\S]*?- main/m.test(externalWorkflow), "External checks run after main updates", "External security workflow must run after updates to main");
check(/schedule:\s*\r?\n\s+- cron:/m.test(externalWorkflow), "External checks run on a schedule", "External security workflow must define a schedule");
check(/permissions:\s*\r?\n\s+contents:\s+read/m.test(externalWorkflow), "External workflow permissions are read-only", "External security workflow permissions must be read-only");
check(/timeout-minutes:\s*\d+/m.test(externalWorkflow), "External workflow has a timeout", "External security workflow must define a timeout");
check(externalWorkflow.includes("check-external-security.mjs"), "External checker runs in CI", "External security workflow must run check-external-security.mjs");
check(externalWorkflow.includes("name: External DNS security"), "External check has a stable required status name", "External security workflow job must be named External DNS security");
check(externalChecker.includes('const domain = "netfullsv.com"'), "External checker targets the production domain", "External checker must target netfullsv.com");
check(externalChecker.includes('digest: "E4F2FC239CD6793839C23EE1EC99A0481CD32EDB1583D74BB1FB97767A22C3F0"'), "External checker pins the active DS", "External checker must pin the active DNSSEC DS digest");
check(externalChecker.includes("letsencrypt.org"), "External checker validates the CAA policy", "External checker must validate the letsencrypt.org CAA policy");
check(externalChecker.includes("dns.google/resolve") && externalChecker.includes("cloudflare-dns.com/dns-query"), "External checker uses two independent DNS paths", "External checker must query Google and Cloudflare DNS");
check(/^MinnerGarcia@users\.noreply\.github\.com ssh-ed25519 [A-Za-z0-9+/=]+\s*$/m.test(allowedSigners), "Allowed signer is a public SSH key", "Allowed signers file must contain the GitHub identity and a public Ed25519 key");
check(!/PRIVATE KEY/.test(allowedSigners), "Allowed signers file contains no private key", "A private key must never be committed");
check(securityControls.includes("required_signatures"), "Required-signature control is documented", "Security controls must document required_signatures");
check(securityControls.includes("DNSSEC") && securityControls.includes("CAA"), "DNSSEC and CAA operations are documented", "Security controls must document DNSSEC and CAA");

const consentTag = indexHtml.match(/<input\b[^>]*\bid="whatsapp-consent"[^>]*>/i)?.[0] ?? "";
check(/\btype="checkbox"/i.test(consentTag) && /\brequired\b/i.test(consentTag), "WhatsApp consent is an explicit required checkbox", "WhatsApp consent checkbox is missing or is not required");
check(/href="privacidad\.html"/i.test(indexHtml), "Privacy notice is linked from the form", "The form must link to privacidad.html");
check(!/name="(?:nombre|ubicacion)"/i.test(indexHtml), "Form does not collect name or location", "The site form must not collect name or location");
check(!/autocomplete="street-address"/i.test(indexHtml), "Exact-address autocomplete is disabled", "The form must not request a street address");
check(!/data\.get\(["'](?:nombre|ubicacion)["']\)/i.test(siteJavaScript), "Personal data is excluded from the WhatsApp URL", "Personal data is still interpolated into the WhatsApp URL");
check(/zona aproximada/i.test(siteJavaScript), "WhatsApp message requests only an approximate zone", "WhatsApp message must ask only for an approximate zone in the chat");
check(/política de privacidad de WhatsApp/i.test(privacyHtml), "Third-party privacy policy is disclosed", "Privacy notice must disclose WhatsApp's policy");
check(/no solicita tu nombre, dirección exacta/i.test(privacyHtml), "Data minimization is documented", "Privacy notice must document data minimization");
check(/corrección o eliminación/i.test(privacyHtml), "Data control instructions are documented", "Privacy notice must explain correction or deletion requests");

for (const message of passed) console.log(`PASS: ${message}`);
if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error(`\nValidation failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`\nValidation completed successfully with ${passed.length} checks.`);
