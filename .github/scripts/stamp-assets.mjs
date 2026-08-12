import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const normalize = (value) => value.replace(/\r\n/g, "\n");
const version = (file) => crypto.createHash("sha256").update(normalize(fs.readFileSync(file, "utf8"))).digest("hex").slice(0, 12);

const cssVersion = version(path.join(repositoryRoot, "assets", "site.css"));
const jsVersion = version(path.join(repositoryRoot, "assets", "site.js"));
const indexPath = path.join(repositoryRoot, "index.html");
const index = fs.readFileSync(indexPath, "utf8");
const jsonLd = index.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)?.[1];

if (!jsonLd) throw new Error("JSON-LD block not found in index.html");

const schemaHash = crypto.createHash("sha256").update(normalize(jsonLd), "utf8").digest("base64");
const htmlFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === ".github") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith(".html")) htmlFiles.push(fullPath);
  }
};
walk(repositoryRoot);

for (const htmlPath of htmlFiles) {
  let html = fs.readFileSync(htmlPath, "utf8");
  html = html
    .replace(/(site\.css\?v=)[a-f0-9]{12}/g, `$1${cssVersion}`)
    .replace(/(site\.js\?v=)[a-f0-9]{12}/g, `$1${jsVersion}`)
    .replaceAll("__CSS_VERSION__", cssVersion)
    .replaceAll("__JS_VERSION__", jsVersion)
    .replaceAll("__SCHEMA_HASH__", `sha256-${schemaHash}`);
  fs.writeFileSync(htmlPath, normalize(html), "utf8");
}

console.log(JSON.stringify({ cssVersion, jsVersion, schemaHash, htmlFiles: htmlFiles.length }, null, 2));
