import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { publicPages, renderFooter, renderHeader } from "./site-shell.mjs";

const repositoryRoot = process.cwd();
const errors = [];
const passed = [];
const ignoredDirectories = new Set([".git", "node_modules", "qa-artifacts", "artifacts", ".playwright", "playwright-report", "test-results"]);

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

function contentVersion(filePath) {
  const source = read(filePath).replace(/\r\n/g, "\n");
  return crypto.createHash("sha256").update(source, "utf8").digest("hex").slice(0, 12);
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
const designSystemPath = path.join(repositoryRoot, "design-system", "index.html");
const designSystemDocPath = path.join(repositoryRoot, "DESIGN-SYSTEM-NETFULL.md");
const visualAuditPath = path.join(repositoryRoot, "AUDITORIA-VISUAL-FASE-1.md");
const phaseTwoAuditPath = path.join(repositoryRoot, "AUDITORIA-UX-FASE-2.md");
const phaseTwoReportPath = path.join(repositoryRoot, "FASE-2-NETFULL-REDESIGN.md");
const phaseThreeReportPath = path.join(repositoryRoot, "FASE-3-NETFULL-PREPRODUCTION.md");
const phaseThreeChangelogPath = path.join(repositoryRoot, "NETFULL-3-CHANGELOG.md");
const goLiveChecklistPath = path.join(repositoryRoot, "GO-LIVE-CHECKLIST.md");
const assetInventoryPath = path.join(repositoryRoot, "ASSET-INVENTORY-PHASE-3.md");
const interFontPath = path.join(repositoryRoot, "assets", "fonts", "InterVariable.woff2");
const interLicensePath = path.join(repositoryRoot, "assets", "fonts", "LICENSE-Inter.txt");
const interProvenancePath = path.join(repositoryRoot, "assets", "fonts", "README.md");
const iconSpritePath = path.join(repositoryRoot, "assets", "icons", "netfull-icons.svg");
const cnamePath = path.join(repositoryRoot, "CNAME");
const securityHeadersPath = path.join(repositoryRoot, ".github", "security-headers.json");
const workflowPath = path.join(repositoryRoot, ".github", "workflows", "validate-site.yml");
const externalWorkflowPath = path.join(repositoryRoot, ".github", "workflows", "external-security.yml");
const externalCheckerPath = path.join(repositoryRoot, ".github", "scripts", "check-external-security.mjs");
const allowedSignersPath = path.join(repositoryRoot, ".github", "allowed_signers");
const securityControlsPath = path.join(repositoryRoot, ".github", "SECURITY-CONTROLS.md");
const siteShellPath = path.join(repositoryRoot, ".github", "scripts", "site-shell.mjs");
const syncShellPath = path.join(repositoryRoot, ".github", "scripts", "sync-shell.mjs");
const browserQaPath = path.join(repositoryRoot, ".github", "scripts", "qa-browser.mjs");
const runPassPath = path.join(repositoryRoot, ".github", "scripts", "run-phase3-pass.mjs");
const comparePassesPath = path.join(repositoryRoot, ".github", "scripts", "compare-phase3-passes.mjs");
const packagePath = path.join(repositoryRoot, "package.json");
const packageLockPath = path.join(repositoryRoot, "package-lock.json");

for (const [filePath, label] of [
  [indexPath, "index.html"],
  [privacyPath, "privacidad.html"],
  [designSystemPath, "design-system/index.html"],
  [designSystemDocPath, "Design System documentation"],
  [visualAuditPath, "Phase 1 visual audit"],
  [phaseTwoAuditPath, "Phase 2 UX audit"],
  [phaseTwoReportPath, "Phase 2 redesign report"],
  [phaseThreeReportPath, "Phase 3 preproduction report"],
  [phaseThreeChangelogPath, "Netfull 3 changelog"],
  [goLiveChecklistPath, "go-live checklist"],
  [assetInventoryPath, "Phase 3 asset inventory"],
  [interFontPath, "Inter Variable WOFF2"],
  [interLicensePath, "Inter OFL license"],
  [interProvenancePath, "Inter provenance documentation"],
  [iconSpritePath, "Netfull SVG icon sprite"],
  [cnamePath, "CNAME"],
  [securityHeadersPath, "security header policy"],
  [workflowPath, "validation workflow"],
  [externalWorkflowPath, "external security workflow"],
  [externalCheckerPath, "external security checker"],
  [allowedSignersPath, "allowed signers file"],
  [securityControlsPath, "security controls documentation"],
  [siteShellPath, "shared site shell"],
  [syncShellPath, "site shell synchronizer"],
  [browserQaPath, "browser QA suite"],
  [runPassPath, "Phase 3 pass runner"],
  [comparePassesPath, "Phase 3 pass comparator"],
  [packagePath, "QA package manifest"],
  [packageLockPath, "QA dependency lockfile"]
]) {
  check(fs.existsSync(filePath), `${label} exists`, `${label} is missing`);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

const indexHtml = read(indexPath);
const privacyHtml = read(privacyPath);
const designSystemHtml = read(designSystemPath);
const designSystemDoc = read(designSystemDocPath);
const phaseThreeReport = read(phaseThreeReportPath);
const phaseThreeChangelog = read(phaseThreeChangelogPath);
const goLiveChecklist = read(goLiveChecklistPath);
const assetInventory = read(assetInventoryPath);
const siteCss = read(path.join(repositoryRoot, "assets", "site.css"));
const interLicense = read(interLicensePath);
const interProvenance = read(interProvenancePath);
const iconSprite = read(iconSpritePath);
const siteJavaScript = read(path.join(repositoryRoot, "assets", "site.js"));
const cname = read(cnamePath).trim();
const securityHeaders = JSON.parse(read(securityHeadersPath));
const workflow = read(workflowPath);
const externalWorkflow = read(externalWorkflowPath);
const externalChecker = read(externalCheckerPath);
const allowedSigners = read(allowedSignersPath);
const securityControls = read(securityControlsPath);
const browserQa = read(browserQaPath);
const packageManifest = JSON.parse(read(packagePath));

check(publicPages.length === 13, "13 commercial routes use the shared site shell", `Expected 13 commercial routes in the shared site shell, found ${publicPages.length}`);

for (const page of publicPages) {
  const filePath = path.join(repositoryRoot, ...page.file.split("/"));
  const html = read(filePath);
  const header = html.match(/<header class="site-header"[\s\S]*?<\/header>/)?.[0] || "";
  const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0] || "";
  check(header === renderHeader(page), `Shared header is synchronized in ${page.file}`, `Severe shared-header divergence in ${page.file}; run node .github/scripts/sync-shell.mjs`);
  check(footer === renderFooter(page), `Shared footer is synchronized in ${page.file}`, `Severe shared-footer divergence in ${page.file}; run node .github/scripts/sync-shell.mjs`);
}

for (const [html, page, asset] of [
  [indexHtml, "index.html", "assets/site.css"],
  [indexHtml, "index.html", "assets/site.js"],
  [privacyHtml, "privacidad.html", "assets/site.css"],
  [designSystemHtml, "design-system/index.html", "assets/site.css"],
  [designSystemHtml, "design-system/index.html", "assets/site.js"]
]) {
  const version = contentVersion(path.join(repositoryRoot, ...asset.split("/")));
  check(
    html.includes(`${asset}?v=${version}`),
    `${asset} is content-versioned in ${page}`,
    `${asset} must use its current content hash (?v=${version}) in ${page} to prevent mixed deployments`
  );
}

check(cname === "netfullsv.com", "CNAME targets netfullsv.com", `Unexpected CNAME value: ${cname}`);
check(htmlFiles.length >= 2, `${htmlFiles.length} HTML pages found`, "Expected the home and privacy pages");
check(fs.existsSync(path.join(repositoryRoot, "robots.txt")), "robots.txt exists", "robots.txt is missing");
check(fs.existsSync(path.join(repositoryRoot, "sitemap.xml")), "sitemap.xml exists", "sitemap.xml is missing");
check(/<meta\s+name="robots"\s+content="noindex, nofollow, noarchive"/i.test(designSystemHtml), "Design System is non-indexable", "Design System must remain noindex, nofollow and noarchive");
check(!read(path.join(repositoryRoot, "sitemap.xml")).includes("/design-system/"), "Design System is excluded from sitemap", "Design System must not appear in sitemap.xml");

const requiredDesignTokens = [
  "--color-brand-50", "--color-brand-500", "--color-brand-900",
  "--color-bg-light", "--color-bg-dark", "--color-text-primary",
  "--color-success", "--color-warning", "--color-error", "--color-information",
  "--space-1", "--space-12", "--radius-sm", "--radius-pill",
  "--shadow-subtle", "--shadow-overlay", "--font-display", "--font-body"
];
for (const token of requiredDesignTokens) {
  check(siteCss.includes(`${token}:`), `Design token exists: ${token}`, `Required Design System token is missing: ${token}`);
}
for (const section of ["Brand principles", "Color palette", "Typography", "Spacing", "Grid", "Buttons", "Forms", "Cards", "Icons", "Network diagrams", "Photography", "Section styles", "Navbar", "Footer", "Tokens", "Animations", "Responsive rules", "Accessibility", "Do", "Don't"]) {
  check(designSystemDoc.includes(`## ${section}`), `Design System documents ${section}`, `DESIGN-SYSTEM-NETFULL.md is missing section: ${section}`);
}
check(designSystemDoc.includes("## Production considerations"), "Design System documents production considerations", "DESIGN-SYSTEM-NETFULL.md must document production considerations");
check(designSystemDoc.includes("## Phase 2 reusable UX patterns"), "Design System documents Phase 2 reusable UX patterns", "DESIGN-SYSTEM-NETFULL.md must document Phase 2 reusable UX patterns");
check(phaseThreeReport.includes("## Funnel Hogar → Cobertura → WhatsApp"), "Phase 3 report documents the corrected funnel", "FASE-3-NETFULL-PREPRODUCTION.md must document the corrected funnel");
check(phaseThreeReport.includes("NO IMPLEMENTADO — COMPLEJIDAD > BENEFICIO"), "Phase 3 report records the critical CSS decision", "Phase 3 report must document the critical CSS decision");
check(phaseThreeChangelog.includes("## Fase 1") && phaseThreeChangelog.includes("## Fase 2") && phaseThreeChangelog.includes("## Fase 3"), "Changelog separates all three phases", "NETFULL-3-CHANGELOG.md must contain Fase 1, Fase 2 and Fase 3");
check(/- \[ \] Merge autorizado/.test(goLiveChecklist) && /- \[ \] Deploy autorizado/.test(goLiveChecklist), "Merge and deploy remain unauthorized in the go-live checklist", "GO-LIVE-CHECKLIST.md must leave merge and deploy unchecked");
check(assetInventory.includes("tv-futbol-internacional-generico.webp") && assetInventory.includes("Generado específicamente para NETFULL"), "Authorized TV asset provenance is documented", "The generic TV asset must have explicit provenance in the asset inventory");
check(packageManifest.devDependencies?.playwright && packageManifest.devDependencies?.["axe-core"], "Browser and accessibility QA dependencies are development-only", "playwright and axe-core must be declared as devDependencies");

for (const className of ["journey-panel", "enterprise-command", "decision-split", "category-spectrum", "closing-panel", "contact-route-grid"]) {
  check(siteCss.includes(`.${className}`), `Phase 2 component exists: ${className}`, `Phase 2 component is missing: ${className}`);
}

const requiredSemanticTokens = [
  "--color-success-text", "--color-success-border", "--color-success-soft",
  "--color-dark-border-subtle", "--color-dark-border-standard", "--color-dark-surface-soft",
  "--color-signal-border-faint", "--color-signal-border-subtle", "--color-signal-border-standard",
  "--color-signal-surface-soft", "--color-signal-grid", "--color-signal-link-soft",
  "--color-network-surface-start", "--color-network-surface-end", "--color-network-node",
  "--color-focus-ring"
];
for (const token of requiredSemanticTokens) {
  check(siteCss.includes(`${token}:`), `Semantic token exists: ${token}`, `Required semantic token is missing: ${token}`);
}

const fontBytes = fs.readFileSync(interFontPath);
check(fontBytes.subarray(0, 4).toString("ascii") === "wOF2", "Inter asset has a valid WOFF2 signature", "InterVariable.woff2 is not a valid WOFF2 file");
check(fontBytes.length > 100_000 && fontBytes.length < 500_000, `Inter WOFF2 size is reasonable (${fontBytes.length} bytes)`, `Unexpected Inter WOFF2 size: ${fontBytes.length} bytes`);
check(/SIL OPEN FONT LICENSE Version 1\.1/i.test(interLicense), "Inter OFL 1.1 license is included", "Inter OFL 1.1 license text is missing or invalid");
check(interProvenance.includes("github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip"), "Inter official provenance is documented", "Inter provenance must point to the official 4.1 release");
check(/@font-face\s*\{[\s\S]*?font-family:\s*"Inter Variable";[\s\S]*?url\("fonts\/InterVariable\.woff2"\)[\s\S]*?font-weight:\s*100 900;[\s\S]*?font-display:\s*swap;/m.test(siteCss), "Inter Variable local @font-face is configured", "Local Inter Variable @font-face is missing or incomplete");
check(/--font-body:\s*"Inter Variable",\s*Inter,\s*ui-sans-serif,\s*system-ui/m.test(siteCss), "Inter Variable is the effective first-choice family", "The typography stack does not prioritize local Inter Variable");
check(!/(?:fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.net|rsms\.me\/inter\/inter\.css)/i.test(`${siteCss}\n${htmlFiles.map(read).join("\n")}`), "No external font provider is referenced", "An external font provider is referenced");

const spriteSymbols = [...iconSprite.matchAll(/<symbol\b([^>]*)>/gi)].map((match) => attributes(match[1]));
const spriteIds = spriteSymbols.map((attrs) => attrs.get("id"));
const requiredIconIds = ["nf-home", "nf-building", "nf-screen", "nf-network", "nf-link", "nf-cloud", "nf-shield", "nf-globe", "nf-support", "nf-signal", "nf-server", "nf-message", "nf-user", "nf-route", "nf-chart", "nf-play", "nf-family", "nf-mail", "nf-menu"];
check(spriteIds.length === new Set(spriteIds).size, "SVG sprite symbol IDs are unique", "SVG sprite contains duplicate symbol IDs");
for (const iconId of requiredIconIds) {
  const symbol = spriteSymbols.find((attrs) => attrs.get("id") === iconId);
  check(Boolean(symbol), `SVG symbol exists: ${iconId}`, `SVG symbol is missing: ${iconId}`);
  check(symbol?.get("viewbox") === "0 0 24 24", `SVG symbol uses the 24px grid: ${iconId}`, `SVG symbol must use viewBox 0 0 24 24: ${iconId}`);
}
check(/stroke="currentColor"/.test(iconSprite), "SVG sprite inherits currentColor", "SVG sprite must inherit currentColor");
check(!/<(?:script|foreignObject)\b|\son[a-z]+\s*=|(?:href|src)="https?:/i.test(iconSprite), "SVG sprite contains no executable or external content", "SVG sprite contains executable or external content");
check(!/\.nf-icon-[\w-]+::(?:before|after)|\.menu-glyph::(?:before|after)/.test(siteCss), "Critical icons no longer depend on CSS geometry", "CSS pseudo-element icon geometry remains");

const foundationStart = siteCss.indexOf("/* Netfull 3.0 foundations:");
const foundationEnd = siteCss.indexOf(".site-footer", foundationStart);
const foundationComponents = siteCss.slice(foundationStart, foundationEnd).replace(/mask-image:[^;]+;/g, "");
check(foundationStart >= 0 && foundationEnd > foundationStart, "Netfull 3.0 component scope is identifiable", "Unable to identify Netfull 3.0 component scope");
check(!/#[0-9a-f]{3,8}\b|rgba?\(/i.test(foundationComponents), "Netfull 3.0 components consume semantic color tokens", "A direct color was introduced in the Netfull 3.0 component scope");

const idsByFile = new Map();
const seoRecords = [];
for (const htmlPath of htmlFiles) {
  const fileName = relative(htmlPath);
  const html = read(htmlPath);
  validateBalancedMarkup(html, fileName);

  check(/^<!doctype html>/i.test(html), `Doctype present in ${fileName}`, `HTML doctype is missing in ${fileName}`);
  check(/<html\b[^>]*\blang="es-SV"/i.test(html), `Language declared in ${fileName}`, `Document language must be es-SV in ${fileName}`);
  check(/<meta\s+charset="utf-8"/i.test(html), `UTF-8 declared in ${fileName}`, `UTF-8 charset declaration is missing in ${fileName}`);
  check(/<title>[^<]+<\/title>/i.test(html), `Title present in ${fileName}`, `Title is missing in ${fileName}`);
  check(/<meta\s+name="description"\s+content="[^"]+"/i.test(html), `Description present in ${fileName}`, `Meta description is missing in ${fileName}`);
  check(/<link\s+rel="canonical"\s+href="https:\/\/netfullsv\.com\/[^"]*"/i.test(html), `Canonical present in ${fileName}`, `Canonical is missing or invalid in ${fileName}`);
  check((html.match(/<h1\b/gi) ?? []).length === 1, `One H1 in ${fileName}`, `Expected exactly one H1 in ${fileName}`);
  const headingLevels = Array.from(html.matchAll(/<h([1-6])\b/gi), (match) => Number(match[1]));
  const headingJumps = headingLevels.slice(1).filter((level, index) => level > headingLevels[index] + 1);
  check(headingJumps.length === 0, `Heading hierarchy is sequential in ${fileName}`, `Heading hierarchy skips a level in ${fileName}`);
  check((html.match(/<main\b/gi) ?? []).length === 1, `One main landmark in ${fileName}`, `Expected exactly one <main> in ${fileName}`);
  check(/<meta\s+property="og:title"\s+content="[^"]+"/i.test(html), `Open Graph title present in ${fileName}`, `Open Graph title is missing in ${fileName}`);
  check(/<meta\s+property="og:description"\s+content="[^"]+"/i.test(html), `Open Graph description present in ${fileName}`, `Open Graph description is missing in ${fileName}`);
  check(/<meta\s+property="og:url"\s+content="https:\/\/netfullsv\.com\/[^"]*"/i.test(html), `Open Graph URL present in ${fileName}`, `Open Graph URL is missing or invalid in ${fileName}`);
  check(/<meta\s+name="twitter:card"\s+content="[^"]+"/i.test(html), `Twitter card present in ${fileName}`, `Twitter card is missing in ${fileName}`);
  check(/<meta\s+name="twitter:title"\s+content="[^"]+"/i.test(html), `Twitter title present in ${fileName}`, `Twitter title is missing in ${fileName}`);
  check(/<meta\s+name="twitter:description"\s+content="[^"]+"/i.test(html), `Twitter description present in ${fileName}`, `Twitter description is missing in ${fileName}`);
  check(!/http:\/\//i.test(html), `No insecure HTTP in ${fileName}`, `An insecure http:// reference was found in ${fileName}`);
  check(!/javascript\s*:/i.test(html), `No javascript URLs in ${fileName}`, `A javascript: URL was found in ${fileName}`);
  check(!/<style\b/i.test(html), `No inline styles in ${fileName}`, `An inline style block was found in ${fileName}`);
  check(!/\sstyle="/i.test(html), `No style attributes in ${fileName}`, `An inline style attribute was found in ${fileName}`);
  check(!/\son[a-z]+\s*=/i.test(html), `No inline event handlers in ${fileName}`, `An inline event handler was found in ${fileName}`);
  check(/<meta\s+http-equiv="Content-Security-Policy"/i.test(html), `CSP meta present in ${fileName}`, `CSP meta policy is missing in ${fileName}`);
  check(/<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"/i.test(html), `Referrer policy present in ${fileName}`, `Referrer policy is missing or weak in ${fileName}`);

  const pageCsp = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i)?.[1] ?? "";
  check(/(?:^|;)\s*font-src\s+'self'(?:\s|;|$)/i.test(pageCsp) && !/(?:^|;)\s*font-src\s+\*/i.test(pageCsp), `CSP restricts fonts to self in ${fileName}`, `CSP font-src must be restricted to 'self' in ${fileName}`);

  const preloadTag = (html.match(/<link\b[^>]*>/gi) ?? []).find((tag) => {
    const attrs = attributes(tag);
    return attrs.get("rel") === "preload" && /assets\/fonts\/InterVariable\.woff2$/.test(attrs.get("href") ?? "");
  });
  const preloadAttrs = attributes(preloadTag ?? "");
  check(Boolean(preloadTag) && preloadAttrs.get("as") === "font" && preloadAttrs.get("type") === "font/woff2" && preloadAttrs.has("crossorigin"), `Inter is preloaded correctly in ${fileName}`, `Inter preload is missing or incomplete in ${fileName}`);

  const iconSvgTags = (html.match(/<svg\b[^>]*>/gi) ?? []).filter((tag) => /\b(?:nf-icon|menu-glyph|content-symbol|contact-symbol|whatsapp-symbol)\b/.test(attributes(tag).get("class") ?? ""));
  for (const tag of iconSvgTags) {
    const attrs = attributes(tag);
    const decorative = attrs.get("aria-hidden") === "true";
    const labelled = attrs.get("role") === "img" && Boolean(attrs.get("aria-label") || attrs.get("aria-labelledby"));
    check(decorative || labelled, `SVG icon has accessible semantics in ${fileName}`, `SVG icon lacks accessible semantics in ${fileName}: ${tag}`);
    if (decorative) check(attrs.get("focusable") === "false", `Decorative SVG is not focusable in ${fileName}`, `Decorative SVG must set focusable="false" in ${fileName}: ${tag}`);
  }
  check(!/<span\b[^>]*class="[^"]*\bnf-icon\b/i.test(html), `No legacy span icons in ${fileName}`, `Legacy span-based icon remains in ${fileName}`);
  for (const use of html.matchAll(/<use\b[^>]*\bhref="[^"]*netfull-icons\.svg#([^"]+)"[^>]*>/gi)) {
    check(spriteIds.includes(use[1]), `SVG use references a known symbol: ${use[1]}`, `Unknown SVG symbol in ${fileName}: ${use[1]}`);
  }

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

  for (const imageTag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const attrs = attributes(imageTag);
    check(attrs.has("alt"), `Image has alt text semantics in ${fileName}`, `Image is missing alt in ${fileName}: ${imageTag}`);
    check(Boolean(attrs.get("width") && attrs.get("height")), `Image reserves dimensions in ${fileName}`, `Image must declare width and height to prevent CLS in ${fileName}: ${imageTag}`);
  }

  if (!/noindex/i.test(html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] ?? "")) {
    seoRecords.push({
      fileName,
      title: html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? "",
      description: html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim() ?? "",
      canonical: html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1]?.trim() ?? ""
    });
  }

  if (fileName === "cobertura/index.html") {
    check(html.indexOf('id="zone"') < html.indexOf('id="service"'), "Coverage form starts with approximate zone", "Coverage form must follow zone → service → need");
    check(/no ofrece un resultado automático en tiempo real/i.test(html), "Coverage page discloses that verification is assisted", "Coverage page must not imply a real-time automated result");
  }
}

for (const field of ["title", "description", "canonical"]) {
  const values = seoRecords.map((record) => record[field]);
  const duplicates = values.filter((value, index) => value && values.indexOf(value) !== index);
  check(duplicates.length === 0, `Indexable pages have unique ${field} values`, `Duplicate ${field} values: ${[...new Set(duplicates)].join(" | ")}`);
}

const decorativeAbbreviations = [];
for (const htmlPath of htmlFiles.filter((file) => file !== designSystemPath)) {
  const html = read(htmlPath);
  for (const match of html.matchAll(/<span\s+class="(?:icon|service-icon|metric-badge)">([^<]+)<\/span>/gi)) {
    if (!/^\d{2}$/.test(match[1].trim())) decorativeAbbreviations.push(`${match[1].trim()} in ${relative(htmlPath)}`);
  }
}
check(decorativeAbbreviations.length === 0, "Decorative abbreviations were replaced by the icon system", `Decorative abbreviations remain: ${decorativeAbbreviations.join(", ")}`);
const allHtml = htmlFiles.map(read).join("\n");
check(!/<span\s+class="(?:menu-glyph|content-symbol)"|<span>WA<\/span><strong>Escríbenos<\/strong>|<span>@<\/span><span><small>Correo/i.test(allHtml), "Decorative emojis and abbreviations were replaced by SVG", "A decorative emoji or abbreviation remains outside the SVG system");

const hogarHtml = read(path.join(repositoryRoot, "hogar", "index.html"));
const coverageHtml = read(path.join(repositoryRoot, "cobertura", "index.html"));
for (const [plan, price] of [["30", "28"], ["100", "33"], ["200", "53"]]) {
  check(hogarHtml.includes(`href="../cobertura/?servicio=hogar&amp;plan=${plan}"`), `Hogar plan ${plan} routes through coverage`, `Plan ${plan} must route to /cobertura/?servicio=hogar&plan=${plan}`);
  check(new RegExp(`<strong>${plan}<\\/strong><span>Mbps<\\/span>[\\s\\S]{0,500}?<span class="amount">${price}<\\/span>`).test(hogarHtml), `Commercial value is unchanged: ${plan} Mbps — $${price}`, `Unexpected commercial value for ${plan} Mbps`);
}
const residentialPlanCards = hogarHtml.match(/<article class="plan-card[^>]*>[\s\S]*?<\/article>/gi) ?? [];
check(residentialPlanCards.length === 3 && residentialPlanCards.every((card) => !/href="https:\/\/wa\.me\//i.test(card)), "Residential plan CTAs do not bypass coverage", "A residential plan still links directly to WhatsApp");
check(coverageHtml.includes('name="plan"') && coverageHtml.includes("data-plan-context") && coverageHtml.includes("data-change-plan"), "Coverage exposes safe plan context and change control", "Coverage must show and allow changing the selected plan");
check(siteJavaScript.includes("const allowedPlans = Object.freeze") && siteJavaScript.includes("Object.hasOwn(allowedPlans"), "Plan query uses an explicit allowlist", "Plan query must be validated against an allowlist");
check(siteJavaScript.includes("encodeURIComponent(lines.join"), "WhatsApp text uses explicit URL encoding", "WhatsApp message must be URL encoded");
check(!/\.innerHTML\s*=|insertAdjacentHTML\s*\(/.test(siteJavaScript), "Query parameters are never inserted as HTML", "Untrusted query input reaches an HTML insertion primitive");
for (const eventName of ["seleccionar_plan", "iniciar_cobertura", "enviar_cobertura"]) {
  check(siteJavaScript.includes(`"${eventName}"`) || hogarHtml.includes(`data-event="${eventName}"`), `Funnel event exists: ${eventName}`, `Missing funnel event: ${eventName}`);
}

const prohibitedClaims = [
  /99\.99\s*%/i, /SLA\s+garantizado/i, /sim[eé]trico\s+garantizado/i,
  /soporte\s+24\s*\/\s*7/i, /\bn[uú]mero\s+1\b/i, /\bmejor\s+Internet\b/i,
  /uptime\s+garantizado/i, /cobertura\s+garantizada/i
];
for (const pattern of prohibitedClaims) {
  check(!pattern.test(allHtml), `No prohibited commercial claim matches ${pattern}`, `Unauthorized commercial claim found: ${pattern}`);
}

const publicSurface = `${allHtml}\n${siteCss}\n${siteJavaScript}`;
for (const forbiddenTvReference of ["assets/brands/", "assets/cinema/", "tv-futbol-europeo.webp", "tv-digital-familia.webp", "tv-digital-dispositivos.webp"]) {
  check(!publicSurface.includes(forbiddenTvReference), `Unapproved TV asset is absent from the public surface: ${forbiddenTvReference}`, `Unapproved TV asset is referenced publicly: ${forbiddenTvReference}`);
}
check(read(path.join(repositoryRoot, "tv", "index.html")).includes("tv-futbol-internacional-generico.webp"), "TV uses only the documented generic sports visual", "TV must use the documented generic sports visual");

for (const htmlPath of htmlFiles) {
  const html = read(htmlPath);
  for (const tag of html.match(/<(?:a|img|script|link|source|use)\b[^>]*>/gi) ?? []) {
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
check(/(?:^|;)\s*font-src\s+'self'(?:\s|;|$)/i.test(headerCsp ?? "") && !/(?:^|;)\s*font-src\s+\*/i.test(headerCsp ?? ""), "Edge CSP restricts fonts to self", "Edge CSP font-src must be restricted to 'self'");

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
check(workflow.includes("test-validator.mjs") || workflow.includes("run-phase3-pass.mjs"), "Validator self-tests run in CI", "Validation workflow must run validator self-tests directly or through a Phase 3 pass");

check(/pull_request:[\s\S]*?branches:[\s\S]*?- main/m.test(externalWorkflow), "External checks run on PRs to main", "External security workflow must run on pull requests to main");
check(/push:[\s\S]*?branches:[\s\S]*?- main/m.test(externalWorkflow), "External checks run after main updates", "External security workflow must run after updates to main");
check(/schedule:\s*\r?\n\s+- cron:/m.test(externalWorkflow), "External checks run on a schedule", "External security workflow must define a schedule");
check(/permissions:\s*\r?\n\s+contents:\s+read/m.test(externalWorkflow), "External workflow permissions are read-only", "External security workflow permissions must be read-only");
check(/timeout-minutes:\s*\d+/m.test(externalWorkflow), "External workflow has a timeout", "External security workflow must define a timeout");
check(externalWorkflow.includes("check-external-security.mjs"), "External checker runs in CI", "External security workflow must run check-external-security.mjs");
check(externalWorkflow.includes("name: External DNS security"), "External check has a stable required status name", "External security workflow job must be named External DNS security");
check(externalChecker.includes('const domain = "netfullsv.com"'), "External checker targets the production domain", "External checker must target netfullsv.com");
check(externalChecker.includes('digest: "E4F2FC239CD6793839C23EE1EC99A0481CD32EDB1583D74BB1FB97767A22C3F0"'), "External checker pins the active DS", "External checker must pin the active DNSSEC DS digest");
const configuredCertificateAuthority = externalChecker.match(/^const expectedCertificateAuthority = "([^"\r\n]+)";$/m)?.[1];
check(configuredCertificateAuthority === "letsencrypt.org", "External checker validates the exact CAA policy", "External checker must validate the exact letsencrypt.org CAA policy");
check(externalChecker.includes("dns.google/resolve") && externalChecker.includes("cloudflare-dns.com/dns-query"), "External checker uses two independent DNS paths", "External checker must query Google and Cloudflare DNS");
check(/^MinnerGarcia@users\.noreply\.github\.com ssh-ed25519 [A-Za-z0-9+/=]+\s*$/m.test(allowedSigners), "Allowed signer is a public SSH key", "Allowed signers file must contain the GitHub identity and a public Ed25519 key");
check(!/PRIVATE KEY/.test(allowedSigners), "Allowed signers file contains no private key", "A private key must never be committed");
check(securityControls.includes("required_signatures"), "Required-signature control is documented", "Security controls must document required_signatures");
check(securityControls.includes("DNSSEC") && securityControls.includes("CAA"), "DNSSEC and CAA operations are documented", "Security controls must document DNSSEC and CAA");

const consentPages = htmlFiles.filter((htmlPath) => /\bid="whatsapp-consent"/i.test(read(htmlPath)));
check(consentPages.length >= 2, `${consentPages.length} WhatsApp form pages found`, "Expected coverage and contact forms");
for (const consentPage of consentPages) {
  const html = read(consentPage);
  const consentTag = html.match(/<input\b[^>]*\bid="whatsapp-consent"[^>]*>/i)?.[0] ?? "";
  check(/\btype="checkbox"/i.test(consentTag) && /\brequired\b/i.test(consentTag), `WhatsApp consent is explicit in ${relative(consentPage)}`, `WhatsApp consent checkbox is missing or is not required in ${relative(consentPage)}`);
  check(/href="\.\.\/privacidad\.html"/i.test(html), `Privacy notice is linked in ${relative(consentPage)}`, `The form must link to the privacy notice in ${relative(consentPage)}`);
}
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
