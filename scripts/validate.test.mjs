import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { validatePlugin } from "./validate.mjs";

const source = fileURLToPath(new URL("../", import.meta.url));

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "close-agent-plugin-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const name of ["plugin.json", "mcp.json", "package.json", "skills"]) {
    await cp(path.join(source, name), path.join(root, name), { recursive: true });
  }
  return root;
}

async function editJSON(root, file, change) {
  const target = path.join(root, file);
  const data = JSON.parse(await readFile(target, "utf8"));
  change(data);
  await writeFile(target, JSON.stringify(data));
}

async function rejects(t, mutate, message) {
  const root = await fixture(t);
  await mutate(root);
  assert.match((await validatePlugin(root)).join("\n"), message);
}

test("the portable package and all four skills validate", async () => {
  assert.deepEqual(await validatePlugin(source), []);
});

test("Cursor-only manifest fields are rejected", async t => {
  await rejects(t, root => editJSON(root, "plugin.json", data => {
    data.displayName = "Close";
    data.commands = "./commands/";
  }), /plugin.json:.*additional properties/);
});

test("missing root manifest is rejected", async t => {
  await rejects(t, root => rm(path.join(root, "plugin.json")), /plugin.json:.*ENOENT/);
});

test("manifest name constraints are enforced by the official schema", async t => {
  await rejects(t, root => editJSON(root, "plugin.json", data => { data.name = "close--crm"; }), /plugin.json:.*pattern/);
});

test("mismatched Agent Plugins schema versions are rejected", async t => {
  await rejects(t, root => editJSON(root, "mcp.json", data => {
    data.$schema = "https://agent-plugins.org/schemas/1.1.0/mcp.schema.json";
  }), /mcp.json:.*constant/);
});

test("the legacy MCP shape with no type is rejected", async t => {
  await rejects(t, root => editJSON(root, "mcp.json", data => { delete data.mcpServers.close.type; }), /mcp.json:.*required property 'type'/);
});

test("a different endpoint cannot replace Close", async t => {
  await rejects(t, root => editJSON(root, "mcp.json", data => {
    data.mcpServers.close.url = "https://example.com/mcp";
  }), /close must use streamable-http/);
});

test("fixed authentication headers are rejected", async t => {
  await rejects(t, root => editJSON(root, "mcp.json", data => {
    data.mcpServers.close.headers = { Authorization: "Bearer example" };
  }), /client-managed authentication/);
});

test("package and plugin versions must agree", async t => {
  await rejects(t, root => editJSON(root, "package.json", data => { data.version = "0.0.0"; }), /version must match/);
});

test("valid multiline YAML descriptions are accepted", async t => {
  const root = await fixture(t);
  await writeFile(path.join(root, "skills/account-brief/SKILL.md"),
    "---\nname: account-brief\ndescription: >\n  Prepare a Close account brief\n  before a call.\n---\n\nRead the lead.\n");
  assert.deepEqual(await validatePlugin(root), []);
});

test("malformed or duplicate YAML fields are rejected", async t => {
  await rejects(t, root => writeFile(path.join(root, "skills/account-brief/SKILL.md"),
    "---\nname: account-brief\nname: other\ndescription: Brief a lead.\n---\nRead the lead.\n"), /Map keys must be unique/);
});

test("skills must use their directory name and string descriptions", async t => {
  await rejects(t, root => writeFile(path.join(root, "skills/account-brief/SKILL.md"),
    "---\nname: other\ndescription: 42\n---\nRead the lead.\n"), /name must match[\s\S]*description must be a nonempty string/);
});

test("skill metadata values must be strings", async t => {
  await rejects(t, root => writeFile(path.join(root, "skills/account-brief/SKILL.md"),
    "---\nname: account-brief\ndescription: Brief a lead.\nmetadata:\n  version: 1\n---\nRead the lead.\n"), /metadata must map string keys to string values/);
});

test("a missing skill entry point is rejected", async t => {
  await rejects(t, root => rm(path.join(root, "skills/account-brief/SKILL.md")), /skills\/account-brief\/SKILL.md:.*ENOENT/);
});

test("package files cannot escape the plugin root through symlinks", async t => {
  const root = await fixture(t);
  const external = await fixture(t);
  await rm(path.join(root, "mcp.json"));
  await symlink(path.join(external, "mcp.json"), path.join(root, "mcp.json"));
  assert.match((await validatePlugin(root)).join("\n"), /mcp.json: path resolves outside the plugin root/);
});
