import fs from "node:fs";
import path from "node:path";
import { publicPages, renderFooter, renderHeader } from "./site-shell.mjs";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const mismatches = [];

for (const page of publicPages) {
  const filePath = path.join(root, ...page.file.split("/"));
  const source = fs.readFileSync(filePath, "utf8");
  const withHeader = source.replace(/<header class="site-header"[\s\S]*?<\/header>/, renderHeader(page));
  const output = withHeader.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, renderFooter(page));
  if (checkOnly) {
    if (output !== source) mismatches.push(page.file);
  } else {
    fs.writeFileSync(filePath, output, "utf8");
  }
}

if (checkOnly && mismatches.length) {
  throw new Error(`Shared shell differs in: ${mismatches.join(", ")}`);
}

console.log(checkOnly
  ? `Shared header and footer are synchronized across ${publicPages.length} public routes.`
  : `Shared header and footer synchronized across ${publicPages.length} public routes.`);
