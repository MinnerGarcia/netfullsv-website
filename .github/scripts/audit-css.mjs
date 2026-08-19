import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const cssPath = path.join(root, "assets", "site.css");
const css = fs.readFileSync(cssPath, "utf8");
const sources = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if ([".git", "node_modules", "qa-artifacts", "artifacts"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (/\.(?:html|js|mjs)$/.test(entry.name)) sources.push(fs.readFileSync(absolute, "utf8"));
  }
};
walk(root);
const surface = sources.join("\n");
const classes = [...new Set([...css.matchAll(/\.([a-z][a-z0-9_-]*)/gi)].map((match) => match[1]))].sort();
const candidates = classes.filter((name) => !new RegExp(`(?:class=["'][^"']*\\b${name}\\b|["'\\s.]${name}["'\\s])`).test(surface));
const hardcodedColors = [...css.matchAll(/#[0-9a-f]{3,8}\b|\brgba?\([^)]*\)/gi)].map((match) => match[0]);
const mediaQueries = [...css.matchAll(/@media\s*\(([^)]+)\)/gi)].map((match) => match[1].trim());
const duplicateMedia = [...new Set(mediaQueries.filter((value, index) => mediaQueries.indexOf(value) !== index))];
const result = {
  candidateSha: process.env.CANDIDATE_SHA || null,
  cssBytes: Buffer.byteLength(css),
  selectorClassCount: classes.length,
  reviewCandidates: candidates,
  decision: "No selectors were removed automatically. Candidates require route coverage or Design System confirmation before deletion.",
  criticalCss: "NO IMPLEMENTADO — COMPLEJIDAD > BENEFICIO",
  hardcodedColorOccurrences: hardcodedColors.length,
  mediaQueryCount: mediaQueries.length,
  repeatedMediaConditions: duplicateMedia
};
const output = path.resolve(process.env.QA_CSS_OUTPUT || path.join(root, "qa-artifacts", "netfull-3-phase-3", "css-audit.json"));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(result, null, 2));
console.log(`CSS audit completed: ${classes.length} classes, ${candidates.length} review candidates, 0 automatic deletions.`);
