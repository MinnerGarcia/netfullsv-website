import fs from "node:fs";
import path from "node:path";
import { publicPages, renderFooter, renderHeader } from "./site-shell.mjs";

const root = process.cwd();

for (const page of publicPages) {
  const filePath = path.join(root, ...page.file.split("/"));
  const source = fs.readFileSync(filePath, "utf8");
  const withHeader = source.replace(/<header class="site-header"[\s\S]*?<\/header>/, renderHeader(page));
  const output = withHeader.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, renderFooter(page));
  if (output === source) throw new Error(`No shared shell replacement occurred in ${page.file}`);
  fs.writeFileSync(filePath, output, "utf8");
}

console.log(`Shared header and footer synchronized across ${publicPages.length} public routes.`);
