#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const errors = [];

async function json(relativePath) {
  try {
    return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    return null;
  }
}

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    errors.push(`Missing referenced path: ${relativePath}`);
    return false;
  }
}

function frontmatter(source, required, relativePath) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    errors.push(`${relativePath}: missing YAML frontmatter`);
    return;
  }
  for (const key of required) {
    if (!new RegExp(`^${key}:\\s*.+$`, "m").test(match[1])) {
      errors.push(`${relativePath}: missing ${key} in frontmatter`);
    }
  }
}

const manifest = await json(".cursor-plugin/plugin.json");
const mcp = await json(".cursor-mcp.json");

if (manifest) {
  if (!/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(manifest.name ?? "")) {
    errors.push("plugin name must be lowercase and kebab-case");
  }
  for (const key of ["name", "displayName", "version", "description", "author", "license"]) {
    if (!manifest[key]) errors.push(`plugin.json: missing ${key}`);
  }
  for (const key of ["logo", "skills", "commands"]) {
    if (manifest[key]) await exists(manifest[key].replace(/^\.\//, ""));
  }
  if (manifest.mcpServers) {
    const mcpPath = path.normalize(path.join(".cursor-plugin", manifest.mcpServers));
    await exists(mcpPath);
  }
}

if (mcp?.mcpServers?.close?.url !== "https://mcp.close.com/mcp") {
  errors.push(".cursor-mcp.json: Close MCP URL is missing or incorrect");
}

for (const directory of ["commands", "skills/close-crm"]) {
  if (!(await exists(directory))) continue;
  for (const file of await readdir(path.join(root, directory))) {
    if (!file.endsWith(".md")) continue;
    const relativePath = path.join(directory, file);
    frontmatter(await readFile(path.join(root, relativePath), "utf8"), ["name", "description"], relativePath);
  }
}

if (errors.length) {
  console.error(`Validation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("Validation passed.");
