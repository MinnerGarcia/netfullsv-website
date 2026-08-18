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

const mime = new Map([[".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"], [".png", "image/png"], [".jpg", "image/jpeg"], [".webp", "image/webp"], [".xml", "application/xml"], [".txt", "text/plain; charset=utf-8"]]);
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
const checks = [];

for (const [width, height] of viewports) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
  const page = await context.newPage();
  let currentRoute = "";
  page.on("pageerror", (error) => errors.push(`${width}x${height}: ${error.message}`));
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
    const state = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelectorAll("h1").length,
      main: document.querySelectorAll("main").length,
      width: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
      bodyVisible: getComputedStyle(document.body).visibility !== "hidden" && Number(getComputedStyle(document.body).opacity) > 0,
      firstHeadingVisible: Boolean(document.querySelector("h1")?.getBoundingClientRect().height)
    }));
    if (route === "/ruta-inexistente" ? response.status() !== 404 : response.status() !== 200) errors.push(`${route} returned ${response.status()} at ${width}x${height}`);
    if (state.h1 !== 1 || state.main !== 1 || state.width > state.viewport || !state.bodyVisible || !state.firstHeadingVisible) errors.push(`${route} failed layout at ${width}x${height}: ${JSON.stringify(state)}`);
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
    noindex: robots.includes("noindex")
  };
});
await accessibilityPage.goto(`http://127.0.0.1:${port}/vpn-empresarial/`, { waitUntil: "load", timeout: 15000 });
accessibilityState.reducedMotionDuration = await accessibilityPage.locator(".pulse").evaluate((element) => getComputedStyle(element).animationDuration);
accessibilityState.publicIconsDecorative = await accessibilityPage.locator(".nf-icon").evaluateAll((icons) => icons.every((icon) => icon.getAttribute("aria-hidden") === "true"));
if (!String(accessibilityState.focusedClass).includes("skip-link") || !accessibilityState.focusedVisible || accessibilityState.outlineWidth === "0px") {
  errors.push(`Keyboard focus contract failed: ${JSON.stringify(accessibilityState)}`);
}
if (accessibilityState.actionHeight < 44 || !accessibilityState.noindex || !accessibilityState.publicIconsDecorative || parseFloat(accessibilityState.reducedMotionDuration) > 0.01) {
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

const shots = [
  ["home", "/", 390, 844], ["home", "/", 1440, 900],
  ["hogar", "/hogar/", 390, 844], ["hogar", "/hogar/", 1440, 900],
  ["empresas", "/empresas/", 390, 844], ["empresas", "/empresas/", 1440, 900],
  ["secure-connect", "/vpn-empresarial/", 390, 844], ["secure-connect", "/vpn-empresarial/", 1440, 900],
  ["tv", "/tv/", 390, 844], ["tv", "/tv/", 1440, 900],
  ["design-system", "/design-system/", 390, 844], ["design-system", "/design-system/", 1440, 900]
];
for (const [name, route, width, height] of shots) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: "load", timeout: 15000 });
  await page.screenshot({ path: path.join(output, `${name}-${width}x${height}.png`), fullPage: false });
  await page.close();
}

if (consoleErrors.length) errors.push(...consoleErrors.map((message) => `Console error: ${message}`));
fs.writeFileSync(path.join(output, "qa-results.json"), JSON.stringify({ checks, noJsState, accessibilityState, openedUrl, consoleErrors, errors }, null, 2));
await browser.close();
await new Promise((resolve) => server.close(resolve));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Browser QA passed: ${checks.length} route/viewport combinations, accessibility contract and ${shots.length} screenshots.`);
