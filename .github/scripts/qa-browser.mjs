import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const moduleUrl = (value, fallback) => value ? pathToFileURL(value).href : fallback;
const playwrightPackage = await import(moduleUrl(process.env.PLAYWRIGHT_MODULE, "playwright"));
const axePackage = await import(moduleUrl(process.env.AXE_MODULE, "axe-core"));
const { chromium } = playwrightPackage;
const axeSource = axePackage.source || axePackage.default?.source;
if (!axeSource) throw new Error("axe-core source is unavailable");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const output = path.resolve(process.env.QA_OUTPUT_DIR || path.join(root, "qa-artifacts", "netfull-3-phase-3", "browser"));
const port = Number(process.env.QA_PORT || 4174);
const candidateSha = process.env.CANDIDATE_SHA || execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const runDate = new Date().toISOString();
fs.mkdirSync(output, { recursive: true });

const mime = new Map([
  [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"], [".woff2", "font/woff2"], [".png", "image/png"],
  [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".webp", "image/webp"],
  [".xml", "application/xml"], [".txt", "text/plain; charset=utf-8"]
]);

const server = http.createServer((request, response) => {
  const rawPath = new URL(request.url, "http://127.0.0.1").pathname;
  const decoded = decodeURIComponent(rawPath).replace(/^\/+/, "");
  const requestedPath = path.resolve(root, decoded);
  const staysInsideRoot = requestedPath === root || requestedPath.startsWith(`${root}${path.sep}`);
  let target = staysInsideRoot ? requestedPath : path.join(root, "404.html");
  if (rawPath.endsWith("/")) target = path.join(target, "index.html");
  const requestedExists = staysInsideRoot && fs.existsSync(target) && !fs.statSync(target).isDirectory();
  if (!requestedExists) target = path.join(root, "404.html");
  response.writeHead(requestedExists ? 200 : 404, {
    "Content-Type": mime.get(path.extname(target)) || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  fs.createReadStream(target).pipe(response);
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(port, "127.0.0.1", resolve);
});

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.BROWSER_EXECUTABLE || (fs.existsSync(edge) ? edge : "");
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });

const viewports = [[360, 800], [375, 812], [390, 844], [430, 932], [768, 1024], [1024, 768], [1366, 768], [1440, 900], [1920, 1080]];
const routes = ["/", "/hogar/", "/empresas/", "/internet-empresarial/", "/internet-dedicado/", "/vpn-empresarial/", "/interconexion-sucursales/", "/ip-publica/", "/soporte-empresarial/", "/tv/", "/cobertura/", "/contacto/", "/nosotros/", "/privacidad.html", "/design-system/", "/esto-no-existe-123"];
const commercialRoutes = routes.filter((route) => !["/privacidad.html", "/design-system/", "/esto-no-existe-123"].includes(route));
const errors = [];
const checks = [];
const axeChecks = [];
const conversionChecks = [];
const menuChecks = [];
const noJsChecks = [];
const screenshotManifest = [];

function overlapReport() {
  const floating = document.querySelector(".whatsapp-float");
  if (!floating) return [];
  const floatingBox = floating.getBoundingClientRect();
  if (floatingBox.width <= 0 || floatingBox.height <= 0) return [];
  return [...document.querySelectorAll("a, button, input, select, textarea, footer a")]
    .filter((element) => element !== floating && !floating.contains(element))
    .map((element) => {
      const box = element.getBoundingClientRect();
      const width = Math.max(0, Math.min(box.right, floatingBox.right) - Math.max(box.left, floatingBox.left));
      const height = Math.max(0, Math.min(box.bottom, floatingBox.bottom) - Math.max(box.top, floatingBox.top));
      return { element, area: width * height, visible: box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight };
    })
    .filter(({ area, visible }) => visible && area > 16)
    .map(({ element }) => element.id || element.getAttribute("href") || element.tagName);
}

for (const [width, height] of viewports) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
  for (const route of routes) {
    const page = await context.newPage();
    const pageErrors = [];
    const consoleErrors = [];
    const assetErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      const value = message.text();
      const localCspNoise = value.includes("Content-Security-Policy directive") || value.includes("Content Security Policy directive");
      if (message.type() === "error" && !localCspNoise) consoleErrors.push(value);
    });
    page.on("requestfailed", (request) => assetErrors.push(`${request.url()} (${request.failure()?.errorText || "unknown"})`));
    page.on("response", (response) => {
      if (response.status() >= 400 && response.request().resourceType() !== "document") assetErrors.push(`${response.status()} ${response.url()}`);
    });

    const response = await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "load", timeout: 20000 });
    const lazyImages = page.locator('img[loading="lazy"]');
    for (let index = 0; index < await lazyImages.count(); index += 1) {
      await lazyImages.nth(index).scrollIntoViewIfNeeded();
    }
    if (await lazyImages.count()) {
      await page.waitForTimeout(150);
      await page.evaluate(() => scrollTo(0, 0));
    }
    const state = await page.evaluate(async () => {
      await document.fonts.ready;
      const uses = [...document.querySelectorAll("svg use")];
      const visibleUses = uses.filter((use) => {
        const svg = use.closest("svg");
        if (!svg) return false;
        const style = getComputedStyle(svg);
        const box = svg.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
      });
      const unrenderedUses = visibleUses.filter((use) => {
        try {
          const box = use.getBBox();
          return box.width <= 0 || box.height <= 0;
        } catch {
          return true;
        }
      }).length;
      const images = [...document.images].map((image) => ({
        source: image.getAttribute("src"),
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        loading: image.loading,
        reservesSpace: Boolean(image.getAttribute("width") && image.getAttribute("height")) || getComputedStyle(image).aspectRatio !== "auto"
      }));
      return {
        title: document.title,
        h1: document.querySelectorAll("h1").length,
        main: document.querySelectorAll("main").length,
        width: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
        bodyVisible: getComputedStyle(document.body).visibility !== "hidden" && Number(getComputedStyle(document.body).opacity) > 0,
        firstHeadingVisible: Boolean(document.querySelector("h1")?.getBoundingClientRect().height),
        computedFontFamily: getComputedStyle(document.body).fontFamily,
        fontCheck: document.fonts.check('16px "Inter Variable"'),
        fontResources: performance.getEntriesByType("resource").filter((entry) => entry.name.includes("/assets/fonts/InterVariable.woff2")).length,
        unrenderedUses,
        images
      };
    });

    const expectedStatus = route === "/esto-no-existe-123" ? 404 : 200;
    const invalidImages = state.images.filter((image) => !image.reservesSpace || (image.loading !== "lazy" && (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0)));
    if (response.status() !== expectedStatus) errors.push(`${route} returned ${response.status()} at ${width}x${height}; expected ${expectedStatus}`);
    if (state.h1 !== 1 || state.main !== 1 || state.width > state.viewport || !state.bodyVisible || !state.firstHeadingVisible) errors.push(`${route} failed layout at ${width}x${height}: ${JSON.stringify(state)}`);
    if (!state.computedFontFamily.includes("Inter Variable") || !state.fontCheck || state.fontResources < 1) errors.push(`${route} failed local font loading at ${width}x${height}`);
    if (state.unrenderedUses) errors.push(`${route} has ${state.unrenderedUses} unrendered SVG use element(s) at ${width}x${height}`);
    if (invalidImages.length) errors.push(`${route} has image/CLS failures at ${width}x${height}: ${JSON.stringify(invalidImages)}`);

    let floatOverlaps = [];
    if (width <= 430) {
      floatOverlaps.push(...await page.evaluate(overlapReport));
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(50);
      floatOverlaps.push(...await page.evaluate(overlapReport));
      if (floatOverlaps.length) errors.push(`${route} floating WhatsApp overlaps controls at ${width}x${height}: ${[...new Set(floatOverlaps)].join(", ")}`);
    }
    const actionableConsoleErrors = route === "/esto-no-existe-123"
      ? consoleErrors.filter((message) => !message.includes("Failed to load resource: the server responded with a status of 404"))
      : consoleErrors;
    if (pageErrors.length || actionableConsoleErrors.length || assetErrors.length) errors.push(`${route} runtime errors at ${width}x${height}: ${JSON.stringify({ pageErrors, consoleErrors: actionableConsoleErrors, assetErrors })}`);
    checks.push({ route, viewport: `${width}x${height}`, status: response.status(), overflow: state.width > state.viewport, floatOverlaps: [...new Set(floatOverlaps)] });
    await page.close();
  }
  await context.close();
}

// WCAG 2.2 AA automated subset. axe-core is a development-only dependency.
for (const [width, height] of [[390, 844], [1440, 900]]) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", bypassCSP: true });
  for (const route of routes) {
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "load", timeout: 20000 });
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(async () => window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] }
    }));
    const blocking = result.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
    axeChecks.push({ route, viewport: `${width}x${height}`, violations: blocking.map(({ id, impact, nodes }) => ({
      id,
      impact,
      nodes: nodes.length,
      samples: nodes.slice(0, 3).map((node) => ({ target: node.target, html: node.html, failureSummary: node.failureSummary }))
    })) });
    if (blocking.length) errors.push(`${route} axe violations at ${width}x${height}: ${JSON.stringify(axeChecks.at(-1).violations)}`);
    await page.close();
  }
  await context.close();
}

// Progressive enhancement without JavaScript.
const noJsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
for (const route of [...commercialRoutes, "/esto-no-existe-123"]) {
  const page = await noJsContext.newPage();
  const response = await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "load", timeout: 20000 });
  const state = await page.evaluate(() => ({
    h1Visible: Boolean(document.querySelector("h1")?.getBoundingClientRect().height),
    mainVisible: Boolean(document.querySelector("main")?.getBoundingClientRect().height),
    navigationLinks: document.querySelectorAll(".site-header a, .mobile-menu a, .recovery-links a").length,
    whatsappFallback: document.body.dataset.page === "cobertura" ? Boolean(document.querySelector("noscript")) : true
  }));
  const expectedStatus = route === "/esto-no-existe-123" ? 404 : 200;
  const minimumNavigationLinks = route === "/esto-no-existe-123" ? 4 : 6;
  if (response.status() !== expectedStatus || !state.h1Visible || !state.mainVisible || state.navigationLinks < minimumNavigationLinks || !state.whatsappFallback) errors.push(`No-JS failed for ${route}: ${JSON.stringify(state)}`);
  noJsChecks.push({ route, status: response.status(), ...state });
  await page.close();
}
await noJsContext.close();

// Native mobile menu: pointer, Enter, Space, Tab and Shift+Tab.
for (const width of [360, 375, 390, 430]) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load", timeout: 20000 });
  const summary = page.locator("details.mobile-menu summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  const openedWithEnter = await page.locator("details.mobile-menu").evaluate((element) => element.open);
  await page.keyboard.press("Tab");
  const tabInside = await page.evaluate(() => Boolean(document.activeElement?.closest("details.mobile-menu nav")));
  await page.keyboard.press("Shift+Tab");
  const shiftTabReturns = await summary.evaluate((element) => document.activeElement === element);
  await page.keyboard.press("Space");
  const closedWithSpace = !await page.locator("details.mobile-menu").evaluate((element) => element.open);
  await summary.click();
  const targets = await page.locator("details.mobile-menu nav a").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
  const state = { width, openedWithEnter, tabInside, shiftTabReturns, closedWithSpace, targetCount: targets.length, minTarget: Math.min(...targets) };
  if (!openedWithEnter || !tabInside || !shiftTabReturns || !closedWithSpace || targets.length !== 6 || state.minTarget < 44) errors.push(`Mobile menu failed at ${width}px: ${JSON.stringify(state)}`);
  menuChecks.push(state);
  await page.close();
}

async function conversionPage(url) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => {
    window.__openedUrls = [];
    window.__netfullEvents = [];
    window.__unexpectedDialogs = [];
    window.alert = (value) => window.__unexpectedDialogs.push(`alert:${String(value)}`);
    window.confirm = (value) => { window.__unexpectedDialogs.push(`confirm:${String(value)}`); return false; };
    window.prompt = (value) => { window.__unexpectedDialogs.push(`prompt:${String(value)}`); return null; };
    window.open = (value) => { window.__openedUrls.push(String(value)); return null; };
    window.addEventListener("netfull:interaction", (event) => window.__netfullEvents.push(event.detail));
  });
  await page.goto(`http://127.0.0.1:${port}${url}`, { waitUntil: "load", timeout: 20000 });
  return page;
}

for (const [plan, price] of [[30, 28], [100, 33], [200, 53]]) {
  const page = await conversionPage("/hogar/");
  const link = page.locator(`a[data-plan="${plan}"]`);
  const expectedPath = `/cobertura/?servicio=hogar&plan=${plan}`;
  const href = await link.getAttribute("href");
  await Promise.all([page.waitForURL((url) => url.pathname === "/cobertura/" && url.searchParams.get("plan") === String(plan)), link.click()]);
  const state = await page.evaluate(() => ({
    service: document.querySelector("#service")?.value,
    plan: document.querySelector("#plan")?.value,
    summary: document.querySelector("[data-plan-summary]")?.textContent,
    hidden: document.querySelector("[data-plan-context]")?.hidden
  }));
  if (href !== `../cobertura/?servicio=hogar&plan=${plan}` || state.service !== "Internet para mi hogar" || state.plan !== String(plan) || state.summary !== `${plan} Mbps · $${price}/mes` || state.hidden) errors.push(`Plan funnel failed for ${plan}: ${JSON.stringify({ href, expectedPath, state })}`);
  conversionChecks.push({ case: `hogar-${plan}`, status: "PASS", href, state });
  await page.close();
}

{
  const page = await conversionPage("/cobertura/");
  const state = await page.evaluate(() => ({ service: document.querySelector("#service")?.value, plan: document.querySelector("#plan")?.value, planHidden: document.querySelector("[data-plan-context]")?.hidden }));
  if (state.service || state.plan || !state.planHidden) errors.push(`Direct coverage state failed: ${JSON.stringify(state)}`);
  conversionChecks.push({ case: "direct", status: "PASS", state });
  await page.close();
}

{
  const page = await conversionPage("/cobertura/?servicio=hogar&plan=999");
  const state = await page.evaluate(() => ({ service: document.querySelector("#service")?.value, plan: document.querySelector("#plan")?.value, planHidden: document.querySelector("[data-plan-context]")?.hidden, bodyHas999: document.body.textContent.includes("999") }));
  if (state.service !== "Internet para mi hogar" || state.plan || !state.planHidden || state.bodyHas999) errors.push(`Invalid plan was not ignored: ${JSON.stringify(state)}`);
  conversionChecks.push({ case: "invalid-plan", status: "PASS", state });
  await page.close();
}

const payloads = ["<script>alert(1)</script>", '"><img src=x onerror=alert(1)>', "javascript:alert(1)", "../../etc/passwd", "<svg onload=alert(1)>"];
for (const payload of payloads) {
  const page = await conversionPage(`/cobertura/?servicio=hogar&plan=${encodeURIComponent(payload)}`);
  const state = await page.evaluate(() => ({
    plan: document.querySelector("#plan")?.value,
    planHidden: document.querySelector("[data-plan-context]")?.hidden,
    injectedElements: document.querySelectorAll("main img[src='x'], main svg[onload], main script:not([src])").length,
    unexpectedDialogs: window.__unexpectedDialogs
  }));
  if (state.unexpectedDialogs.length || state.plan || !state.planHidden || state.injectedElements) errors.push(`XSS payload affected DOM: ${payload} => ${JSON.stringify(state)}`);
  conversionChecks.push({ case: "xss-query", payloadHash: crypto.createHash("sha256").update(payload).digest("hex"), status: "PASS", state });
  await page.close();
}

{
  const page = await conversionPage("/cobertura/?servicio=hogar&plan=30");
  await page.click("[data-change-plan]");
  await page.selectOption("#plan", "200");
  await page.fill("#zone", "Zona de prueba");
  await page.fill("#need", "Trabajo y estudio");
  await page.check("#whatsapp-consent");
  await page.locator("form[data-whatsapp-form]").evaluate((form) => form.requestSubmit());
  const state = await page.evaluate(() => ({ opened: window.__openedUrls.at(-1) || "", events: window.__netfullEvents }));
  const message = state.opened ? new URL(state.opened).searchParams.get("text") || "" : "";
  if (!message.includes("200 Mbps — $53/mes") || message.includes("30 Mbps — $28/mes")) errors.push(`Changed plan not reflected in WhatsApp: ${message}`);
  if (JSON.stringify(state.events).includes("Zona de prueba") || JSON.stringify(state.events).includes("Trabajo y estudio")) errors.push("Analytics contains personal form content");
  conversionChecks.push({ case: "change-plan", status: "PASS", message, events: state.events });
  await page.close();
}

{
  const page = await conversionPage("/cobertura/?servicio=hogar&plan=100");
  await page.fill("#zone", "Zona de prueba");
  await page.locator("form[data-whatsapp-form]").evaluate((form) => form.requestSubmit());
  const opened = await page.evaluate(() => window.__openedUrls.length);
  if (opened) errors.push("WhatsApp opened without consent");
  conversionChecks.push({ case: "consent-required", status: "PASS", opened });
  await page.close();
}

{
  const page = await conversionPage("/cobertura/?servicio=hogar&plan=100");
  await page.check("#whatsapp-consent");
  await page.locator("form[data-whatsapp-form]").evaluate((form) => form.requestSubmit());
  const opened = await page.evaluate(() => window.__openedUrls.length);
  if (opened) errors.push("WhatsApp opened without approximate zone");
  conversionChecks.push({ case: "zone-required", status: "PASS", opened });
  await page.close();
}

{
  const page = await conversionPage("/cobertura/?servicio=hogar&plan=100");
  await page.fill("#zone", "Zona de prueba");
  await page.fill("#need", "Necesidad general de prueba");
  await page.check("#whatsapp-consent");
  await page.locator("form[data-whatsapp-form]").evaluate((form) => form.requestSubmit());
  const opened = await page.evaluate(() => window.__openedUrls.at(-1) || "");
  const message = opened ? new URL(opened).searchParams.get("text") || "" : "";
  if (!opened.startsWith("https://wa.me/50379031293?text=") || !message.includes("100 Mbps — $33/mes") || !message.includes("Zona aproximada: Zona de prueba")) errors.push(`Valid WhatsApp flow failed: ${opened}`);
  conversionChecks.push({ case: "valid-form", status: "PASS", message });
  await page.close();
}

// Text zoom and print checks.
for (const route of ["/", "/hogar/", "/empresas/", "/cobertura/", "/tv/"]) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, bypassCSP: true, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "load", timeout: 20000 });
  await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  const zoomState = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
    mainHeight: document.querySelector("main")?.getBoundingClientRect().height || 0,
    offenders: [...document.querySelectorAll("body *")].filter((element) => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && (box.right > document.documentElement.clientWidth + 1 || box.left < -1);
    }).slice(0, 12).map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent?.trim().slice(0, 80) }))
  }));
  if (zoomState.width > zoomState.viewport || zoomState.mainHeight <= 0) errors.push(`200% text zoom failed for ${route}: ${JSON.stringify(zoomState)}`);
  await page.emulateMedia({ media: "print" });
  const printVisible = await page.locator("main").evaluate((element) => getComputedStyle(element).display !== "none" && element.getBoundingClientRect().height > 0);
  if (!printVisible) errors.push(`Print runtime failed for ${route}`);
  await page.close();
  await context.close();
}

// Exactly 40 full-page screenshots required for external review.
const visualRoutes = [
  ["home", "/"], ["hogar", "/hogar/"], ["empresas", "/empresas/"],
  ["internet-empresarial", "/internet-empresarial/"], ["internet-dedicado", "/internet-dedicado/"],
  ["secure-connect", "/vpn-empresarial/"], ["interconexion", "/interconexion-sucursales/"],
  ["ip-publica", "/ip-publica/"], ["soporte-empresarial", "/soporte-empresarial/"],
  ["tv", "/tv/"], ["nosotros", "/nosotros/"], ["cobertura", "/cobertura/"],
  ["contacto", "/contacto/"], ["404", "/esto-no-existe-123"], ["design-system", "/design-system/"]
];
const requiredShots = visualRoutes.flatMap(([name, route]) => [[name, route, 390, 844], [name, route, 1440, 900]]);
for (const name of ["home", "hogar", "empresas", "tv", "cobertura"]) {
  const route = visualRoutes.find(([candidate]) => candidate === name)[1];
  requiredShots.push([name, route, 360, 800], [name, route, 1920, 1080]);
}
const screenshotDirectory = path.join(output, "screenshots");
fs.mkdirSync(screenshotDirectory, { recursive: true });
for (const [name, route, width, height] of requiredShots) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
  await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "load", timeout: 20000 });
  const fileName = `${name}-${width}x${height}.jpg`;
  const absolutePath = path.join(screenshotDirectory, fileName);
  await page.screenshot({ path: absolutePath, fullPage: true, type: "jpeg", quality: 86 });
  const bytes = fs.readFileSync(absolutePath);
  screenshotManifest.push({
    route,
    viewport: `${width}x${height}`,
    screenshot: `screenshots/${fileName}`,
    date: runDate,
    commitSha: candidateSha,
    result: "PASS",
    sha256: crypto.createHash("sha256").update(bytes).digest("hex")
  });
  await page.close();
}

const result = {
  candidateSha,
  date: runDate,
  browser: executablePath || "Playwright Chromium",
  summary: {
    routeViewportCombinations: checks.length,
    axeScans: axeChecks.length,
    conversionCases: conversionChecks.length,
    mobileMenuViewports: menuChecks.length,
    noJsRoutes: noJsChecks.length,
    screenshots: screenshotManifest.length,
    errors: errors.length
  },
  checks,
  axeChecks,
  conversionChecks,
  menuChecks,
  noJsChecks,
  errors
};

fs.writeFileSync(path.join(output, "browser-results.json"), JSON.stringify(result, null, 2));
fs.writeFileSync(path.join(output, "manifest.json"), JSON.stringify({ candidateSha, date: runDate, screenshots: screenshotManifest }, null, 2));

await browser.close();
await new Promise((resolve) => server.close(resolve));

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Browser QA passed for ${candidateSha}: ${checks.length} responsive checks, ${axeChecks.length} axe scans, ${conversionChecks.length} conversion cases and ${screenshotManifest.length} screenshots.`);
