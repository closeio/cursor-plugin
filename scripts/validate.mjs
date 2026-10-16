#!/usr/bin/env node

import { readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { parseDocument } from "yaml";

const ajv = new Ajv2020({ allErrors: true });
const schemas = {};
for (const kind of ["plugin", "mcp"]) {
  const source = await readFile(new URL(`./schemas/1.0.0/${kind}.schema.json`, import.meta.url), "utf8");
  schemas[kind] = ajv.compile(JSON.parse(source));
}

export async function validatePlugin(directory) {
  const root = await realpath(directory);
  const errors = [];

  async function packagePath(relativePath, kind = "file") {
    const resolved = await realpath(path.join(root, relativePath));
    const relative = path.relative(root, resolved);
    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error("path resolves outside the plugin root");
    }
    const info = await stat(resolved);
    if (kind === "file" ? !info.isFile() : !info.isDirectory()) {
      throw new Error(`expected a ${kind}`);
    }
    return resolved;
  }

  async function json(relativePath, schema) {
    try {
      const data = JSON.parse(await readFile(await packagePath(relativePath), "utf8"));
      if (schema && !schema(data)) {
        errors.push(`${relativePath}: ${ajv.errorsText(schema.errors, { separator: "; " })}`);
      }
      return data;
    } catch (error) {
      errors.push(`${relativePath}: ${error.message}`);
      return null;
    }
  }

  const manifest = await json("plugin.json", schemas.plugin);
  const mcp = await json("mcp.json", schemas.mcp);
  const pkg = await json("package.json");

  if (manifest?.version !== pkg?.version) {
    errors.push("plugin.json: version must match package.json");
  }
  // Both schemas pin the same Agent Plugins version. Also preserve this package's
  // single hosted connection rather than accidentally shipping another service.
  const close = mcp?.mcpServers?.close;
  if (close?.type !== "streamable-http" || close?.url !== "https://mcp.close.com/mcp") {
    errors.push("mcp.json: close must use streamable-http at https://mcp.close.com/mcp");
  }
  if (Object.keys(mcp?.mcpServers ?? {}).length !== 1 || close?.headers !== undefined) {
    errors.push("mcp.json: configure only the Close server, with client-managed authentication and no fixed headers");
  }

  try {
    const skillsPath = await packagePath("skills", "directory");
    const entries = await readdir(skillsPath, { withFileTypes: true });
    let count = 0;
    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      count++;
      const relativePath = `skills/${entry.name}/SKILL.md`;
      try {
        const source = await readFile(await packagePath(relativePath), "utf8");
        const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
        if (!match) throw new Error("missing YAML frontmatter");
        const document = parseDocument(match[1], { uniqueKeys: true });
        if (document.errors.length) throw new Error(document.errors.map(error => error.message).join("; "));
        const fields = document.toJS({ maxAliasCount: 0 });
        if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
          throw new Error("frontmatter must be an object");
        }
        const allowed = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
        for (const key of Object.keys(fields)) {
          if (!allowed.has(key)) errors.push(`${relativePath}: unsupported frontmatter field ${key}`);
        }
        if (typeof fields.name !== "string" || fields.name.length > 64 ||
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.name) || fields.name !== entry.name) {
          errors.push(`${relativePath}: name must match its directory and be 1-64 lowercase alphanumeric or hyphen characters, without consecutive hyphens`);
        }
        for (const [key, limit] of [["description", 1024], ["compatibility", 500]]) {
          if (key === "compatibility" && fields[key] === undefined) continue;
          if (typeof fields[key] !== "string" || !fields[key].trim() || fields[key].length > limit) {
            errors.push(`${relativePath}: ${key} must be a nonempty string of at most ${limit} characters`);
          }
        }
        for (const key of ["license", "allowed-tools"]) {
          if (fields[key] !== undefined && typeof fields[key] !== "string") {
            errors.push(`${relativePath}: ${key} must be a string`);
          }
        }
        if (fields.metadata !== undefined && (!fields.metadata || typeof fields.metadata !== "object" ||
            Array.isArray(fields.metadata) || Object.values(fields.metadata).some(value => typeof value !== "string"))) {
          errors.push(`${relativePath}: metadata must map string keys to string values`);
        }
        if (!source.slice(match[0].length).trim()) errors.push(`${relativePath}: missing skill instructions`);
      } catch (error) {
        errors.push(`${relativePath}: ${error.message}`);
      }
    }
    if (!count) errors.push("skills/: at least one skill is required for this package");
  } catch (error) {
    errors.push(`skills/: ${error.message}`);
  }

  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const errors = await validatePlugin(process.cwd());
  if (errors.length) {
    console.error(`Validation failed:\n- ${errors.join("\n- ")}`);
    process.exitCode = 1;
  } else {
    console.log("Validation passed (Agent Plugins 1.0.0, Close MCP, and Agent Skills).");
  }
}
