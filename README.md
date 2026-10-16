# Close Agent Plugin

The official Close plugin connects AI agents to your Close CRM through Close's hosted Model Context Protocol (MCP) server. It follows the [Agent Plugins 1.0.0 standard](https://agent-plugins.org/specification) so the same package can be used by compatible clients and marketplaces.

Use natural language to research leads, prepare account briefs, review sales activity and pipeline, find tasks, answer Close product questions, and—with the permission scope you choose—create or update CRM records.

## Install and connect

Use a client that supports Agent Plugins 1.0.0, skills, Streamable HTTP MCP servers, and MCP OAuth authorization. See the standard's [compatible clients](https://agent-plugins.org/compatible-clients) and your client's documentation for installation instructions.

For clients that accept local plugins, clone this repository and select its root directory in the client's plugin installation flow:

```sh
git clone https://github.com/closeio/agent-plugin.git
```

For clients or marketplaces that accept a Git repository, use `https://github.com/closeio/agent-plugin`. Installation, marketplace approval, and skill invocation are client-specific; this repository does not imply a listing in every marketplace.

After installation, connect the `close` MCP server when your client prompts for authentication. Choose your Close organization and access scope, then approve the connection. Close supports three OAuth scopes:

- `mcp.read` — search and read Close data;
- `mcp.write_safe` — read plus create and update records;
- `mcp.write_destructive` — read, create, update, and delete records.

Choose the least-privileged scope that covers your work. You can revoke the connection from Close at any time. Available tools depend on the scope you approve.

## Included skills

| Skill | Purpose |
| --- | --- |
| `close-crm` | Choose appropriate Close tools, research records, answer product questions, and handle CRM writes safely. |
| `account-brief` | Prepare a lead brief from contacts, opportunities, recent activity, and tasks. |
| `pipeline-review` | Identify pipeline risk, stale deals, and next actions. |
| `follow-up-plan` | Prepare a follow-up plan from recent conversations and open work. |

Ask your agent directly, or select a skill using your client's interface:

- “Brief me on Acme before my call.”
- “Which active opportunities need attention this week?”
- “Prepare a follow-up plan for Acme.”
- “Find my overdue Close tasks and prioritize them.”
- “How many calls did our team make last week?”
- “Create a follow-up task for Friday on this lead.”

The brief, pipeline review, and follow-up plan skills produce read-only analysis. CRM changes require a user request; OAuth access alone does not authorize an action.

## Package structure

```text
plugin.json
mcp.json
skills/
  close-crm/SKILL.md
  account-brief/SKILL.md
  pipeline-review/SKILL.md
  follow-up-plan/SKILL.md
assets/
  mark.png
  mark.svg
```

`plugin.json` contains portable metadata. Compatible clients discover skills from `skills/` and the Close MCP server from `mcp.json`. The server uses `type: "streamable-http"` and connects directly to `https://mcp.close.com/mcp`. OAuth discovery and credential storage are managed by the client; the package contains no API keys, local server process, or additional data proxy.

The brand assets are available for marketplace listings. Agent Plugins 1.0.0 does not define a portable logo field. Future client-specific behavior can use the standard's reverse-domain extension namespaces.

## Migration from the Cursor plugin

This repository continues `closeio/cursor-plugin` as `closeio/agent-plugin`, preserving its Git history. The Cursor manifest and MCP file have been replaced by the standard root files. The three Cursor commands are now portable skills; their selection and invocation depend on the client. The old `/close:...` command names are not part of the portable format.

Cursor marketplace registration is handled separately using this repository. The old listing is not maintained by this package.

## Development

Requirements: Node.js 22 or newer. Node.js and npm dependencies are only needed for development validation; the installed plugin connects to the hosted MCP server directly.

```sh
npm ci
npm run validate
npm test
```

Validation checks the manifest and MCP configuration against vendored official 1.0.0 schemas, the Close endpoint and transport, version consistency, and skill frontmatter. GitHub Actions runs the same checks. Before a marketplace submission, also verify skill discovery, OAuth connection, and a read-only request in the target client; schema validation does not exercise those client flows.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development and marketplace verification guidance.

## Support and documentation

- [Close MCP documentation](https://developer.close.com/mcp)
- [Close MCP tool reference](https://developer.close.com/mcp/tools)
- [Close Help Center](https://help.close.com)
- [Close support](mailto:support@close.com)

Security issues should be reported privately as described in [SECURITY.md](SECURITY.md).

## License

MIT. Vendored Agent Plugins schemas retain their upstream Apache-2.0 license; see [schema provenance](scripts/schemas/README.md).
