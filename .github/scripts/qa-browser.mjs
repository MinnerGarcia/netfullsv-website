import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const playwrightModule = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(playwrightModule ? pathToFileURL(playwrightModule).href : "playwright");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const output = path.join(root, "artifacts", "qa");
const port = Number(process.env.QA_PORT || 4174);
fs.mkdirSync(output, { recursive: true });

const mime = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".svg", "image/svg+xml"], [".woff2", "font/woff2"], [".png", "image/png"], [".jpg", "image/jpeg"], [".webp", "image/webp"], [".xml", "application/xml"], [".txt", "text/plain; charset=utf-8"]]);
const server = http.createServer((request, response) => {
  const raw = new URL(request.url, "http://127.0.0.1").pathname;
  let target = path.join(root, decodeURIComponent(raw).replace(/^\/+/, ""));
  if (raw.endsWith("/")) target = path.join(target, "index.html");
  if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) target = path.join(root, "404.html");
  response.writeHead(target.endsWith("404.html") && !fs.existsSync(path.join(root, decodeURIComponent(raw).replace(/^\/+/, ""))) ? 404 : 200, { "Content-Type": mime.get(path.extname(target)) || "application/octet-stream" });
  fs.createReadStream(target).pipe(response);
});
await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browser = await chromium.launch({ executablePath: edge, headless: true });
const viewports = [[360, 800], [375, 812], [390, 844], [430, 932], [768, 1024], [1024, 768], [1366, 768], [1440, 900], [1920, 1080]];
const routes = ["/", "/hogar/", "/empresas/", "/internet-empresarial/", "/internet-dedicado/", "/vpn-empresarial/", "/interconexion-sucursales/", "/ip-publica/", "/soporte-empresarial/", "/tv/", "/cobertura/", "/contacto/", "/nosotros/", "/privacidad.html", "/design-system/", "/ruta-inexistente"];
const errors = [];
const consoleErrors = [];
const assetErrors = [];
const checks = [];

for (const [width, height] of viewports) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
  const page = await context.newPage();
  let currentRoute = "";
  page.on("pageerror", (error) => errors.push(`${width}x${height}: ${error.message}`));
  page.on("requestfailed", (request) => assetErrors.push(`${width}x${height} ${currentRoute}: request failed ${request.url()} (${request.failure()?.errorText || "unknown"})`));
  page.on("response", (response) => {
    const request = response.request();
    if (response.status() >= 400 && request.resourceType() !== "document") assetErrors.push(`${width}x${height} ${currentRoute}: ${response.status()} ${response.url()}`);
  });
  page.on("console", (message) => {
    const text = message.text();
    const localSecurityInjection = text.includes("Content-Security-Policy directive") || text.includes("Content Security Policy directive");
    const expectedNotFound = currentRoute === "/ruta-inexistente" && text.includes("404");
    if (message.type() === "error" && !localSecurityInjection && !expectedNotFound) {
      consoleErrors.push(`${width}x${height} ${currentRoute}: ${text}`);
    }
  });
  for (const route of routes) {
    currentRoute = route;
    const response = await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "load", timeout: 15000 });
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
      const loadedInterFaces = [...document.fonts].filter((face) => face.family.includes("Inter Variable") && face.status === "loaded").length;
      const fontResources = performance.getEntriesByType("resource").filter((entry) => entry.name.includes("/assets/fonts/InterVariable.woff2")).length;
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
        loadedInterFaces,
        fontResources,
        iconUses: uses.length,
        visibleIconUses: visibleUses.length,
        unrenderedUses
      };
    });
    if (route === "/ruta-inexistente" ? response.status() !== 404 : response.status() !== 200) errors.push(`${route} returned ${response.status()} at ${width}x${height}`);
    if (state.h1 !== 1 || state.main !== 1 || state.width > state.viewport || !state.bodyVisible || !state.firstHeadingVisible) errors.push(`${route} failed layout at ${width}x${height}: ${JSON.stringify(state)}`);
    if (!state.computedFontFamily.includes("Inter Variable") || !state.fontCheck || state.loadedInterFaces < 1 || state.fontResources < 1) errors.push(`${route} failed local font loading at ${width}x${height}: ${JSON.stringify(state)}`);
    if (state.iconUses > 0 && state.unrenderedUses > 0) errors.push(`${route} has ${state.unrenderedUses} unrendered SVG use element(s) at ${width}x${height}`);
    checks.push({ route, viewport: `${width}x${height}`, status: response.status(), ...state });
  }
  await context.close();
}

// Progressive enhancement: all primary content and navigation must remain usable without JavaScript.
const noJsContext = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
const noJsPage = await noJsContext.newPage();
await noJsPage.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
const noJsState = await noJsPage.evaluate(() => ({
  h1Visible: Boolean(document.querySelector("h1")?.getBoundingClientRect().height),
  primaryRoutes: [...document.querySelectorAll("main a")].filter((link) => ["/hogar/", "/empresas/"].includes(new URL(link.href).pathname)).length,
  mobileMenu: Boolean(document.querySelector("details.mobile-menu")),
  mainTextLength: document.querySelector("main")?.textContent?.trim().length || 0
}));
if (!noJsState.h1Visible || noJsState.primaryRoutes < 2 || !noJsState.mobileMenu || noJsState.mainTextLength < 500) {
  errors.push(`No-JS progressive enhancement failed: ${JSON.stringify(noJsState)}`);
}
await noJsContext.close();

// Accessibility contract: visible keyboard focus, non-indexable internal docs,
// minimum action size, decorative icon semantics and reduced motion.
const accessibilityPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
await accessibilityPage.goto(`http://127.0.0.1:${port}/design-system/`, { waitUntil: "load", timeout: 15000 });
await accessibilityPage.keyboard.press("Tab");
const accessibilityState = await accessibilityPage.evaluate(() => {
  const active = document.activeElement;
  const primaryButton = document.querySelector(".button-primary");
  const actionBox = primaryButton?.getBoundingClientRect();
  const robots = document.querySelector('meta[name="robots"]')?.getAttribute("content") || "";
  return {
    focusedClass: active?.className || "",
    focusedVisible: Boolean(active && active.getBoundingClientRect().top >= 0 && active.getBoundingClientRect().height > 0),
    outlineWidth: active ? getComputedStyle(active).outlineWidth : "0px",
    actionHeight: actionBox?.height || 0,
    noindex: robots.includes("noindex"),
    meaningfulIconsLabelled: [...document.querySelectorAll(".nf-icon[role='img']")].every((icon) => {
      const labelledBy = icon.getAttribute("aria-labelledby");
      return Boolean(labelledBy && document.getElementById(labelledBy)?.textContent?.trim());
    })
  };
});
await accessibilityPage.goto(`http://127.0.0.1:${port}/vpn-empresarial/`, { waitUntil: "load", timeout: 15000 });
accessibilityState.reducedMotionDuration = await accessibilityPage.locator(".pulse").evaluate((element) => getComputedStyle(element).animationDuration);
accessibilityState.publicIconsDecorative = await accessibilityPage.locator(".nf-icon").evaluateAll((icons) => icons.every((icon) => icon.getAttribute("aria-hidden") === "true"));
if (!String(accessibilityState.focusedClass).includes("skip-link") || !accessibilityState.focusedVisible || accessibilityState.outlineWidth === "0px") {
  errors.push(`Keyboard focus contract failed: ${JSON.stringify(accessibilityState)}`);
}
if (accessibilityState.actionHeight < 44 || !accessibilityState.noindex || !accessibilityState.meaningfulIconsLabelled || !accessibilityState.publicIconsDecorative || parseFloat(accessibilityState.reducedMotionDuration) > 0.01) {
  errors.push(`Accessibility contract failed: ${JSON.stringify(accessibilityState)}`);
}
await accessibilityPage.close();

// Conversion flow: verify the local form builds a WhatsApp URL without transmitting data to analytics.
const formPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await formPage.addInitScript(() => {
  window.__openedUrl = "";
  window.open = (url) => { window.__openedUrl = String(url); return null; };
});
await formPage.goto(`http://127.0.0.1:${port}/contacto/?servicio=Internet%20dedicado`, { waitUntil: "load", timeout: 15000 });
await formPage.selectOption("#service", { label: "Internet dedicado" });
await formPage.fill("#zone", "Zona de prueba");
await formPage.fill("#need", "Necesidad general de prueba");
await formPage.check("#whatsapp-consent");
await formPage.click("button[type='submit']");
const openedUrl = await formPage.evaluate(() => window.__openedUrl);
const whatsappMessage = openedUrl ? new URL(openedUrl).searchParams.get("text") || "" : "";
if (!openedUrl.startsWith("https://wa.me/") || !whatsappMessage.includes("Internet dedicado") || !whatsappMessage.includes("Zona de prueba")) {
  errors.push(`WhatsApp conversion flow failed: ${openedUrl}`);
}
await formPage.close();

const visualRoutes = [
  ["home", "/"], ["hogar", "/hogar/"], ["empresas", "/empresas/"],
  ["secure-connect", "/vpn-empresarial/"], ["tv", "/tv/"], ["design-system", "/design-system/"]
];
const shots = visualRoutes.flatMap(([name, route]) => viewports.map(([width, height]) => [name, route, width, height]));
for (const [name, route, width, height] of shots) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "load", timeout: 15000 });
  await page.screenshot({ path: path.join(output, `${name}-${width}x${height}.png`), fullPage: false });
  await page.close();
}
const designSystemDetails = [["typography", "#tipografia"], ["icons", "#iconos"]];
for (const [name, selector] of designSystemDetails) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://127.0.0.1:${port}/design-system/`, { waitUntil: "load", timeout: 15000 });
  await page.locator(selector).screenshot({ path: path.join(output, `design-system-${name}-1440.png`) });
  await page.close();
}

if (consoleErrors.length) errors.push(...consoleErrors.map((message) => `Console error: ${message}`));
if (assetErrors.length) errors.push(...assetErrors.map((message) => `Asset error: ${message}`));
fs.writeFileSync(path.join(output, "qa-results.json"), JSON.stringify({ checks, noJsState, accessibilityState, openedUrl, consoleErrors, assetErrors, errors }, null, 2));
await browser.close();
await new Promise((resolve) => server.close(resolve));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Browser QA passed: ${checks.length} route/viewport combinations, accessibility contract and ${shots.length + designSystemDetails.length} screenshots.`);
