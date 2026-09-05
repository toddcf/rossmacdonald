import { readdir, readFile, writeFile, mkdir, rm, copyFile } from "node:fs/promises";
import { join, relative, extname, basename } from "node:path";

import postcss from "postcss";
import autoprefixer from "autoprefixer";
import CleanCSS from "clean-css";
import { minify as minifyHTML } from "html-minifier-terser";
import { minify as minifyJS } from "terser";

const rootDir = process.cwd();
const distDir = join(rootDir, "dist");

const excludedDirectories = new Set([
  ".git",
  ".github",
  "dist",
  "node_modules"
]);

const excludedFiles = new Set([
  ".gitignore",
  "build.mjs",
  "package.json",
  "package-lock.json",
  "README.md"
]);

async function buildDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) {
        continue;
      }

      await buildDirectory(sourcePath);
      continue;
    }

    if (directory === rootDir && excludedFiles.has(entry.name)) {
      continue;
    }

    const relativePath = relative(rootDir, sourcePath);
    const destinationPath = join(distDir, relativePath);

    await mkdir(join(destinationPath, ".."), { recursive: true });

    const extension = extname(entry.name).toLowerCase();

    if (extension === ".html") {
      const source = await readFile(sourcePath, "utf8");

      const output = await minifyHTML(source, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      });

      await writeFile(destinationPath, output);
    } else if (extension === ".css") {
      const source = await readFile(sourcePath, "utf8");

      const prefixed = await postcss([autoprefixer]).process(source, {
        from: sourcePath,
        to: destinationPath
      });

      const minified = new CleanCSS({
        level: 1
      }).minify(prefixed.css);

      if (minified.errors.length > 0) {
        throw new Error(
          `CSS error in ${relativePath}: ${minified.errors.join(", ")}`
        );
      }

      await writeFile(destinationPath, minified.styles);
    } else if (extension === ".js") {
      const source = await readFile(sourcePath, "utf8");

      const minified = await minifyJS(source);

      if (!minified.code) {
        throw new Error(`JavaScript minification failed for ${relativePath}`);
      }

      await writeFile(destinationPath, minified.code);
    } else {
      await copyFile(sourcePath, destinationPath);
    }

    console.log(`Built: ${relativePath}`);
  }
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await buildDirectory(rootDir);

console.log("\nBuild complete.");