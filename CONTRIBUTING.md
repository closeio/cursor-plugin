# Contributing

Thanks for helping improve the Close Agent Plugin.

1. Open an issue describing the bug or proposed improvement.
2. Make a focused change on a branch.
3. Install development dependencies with `npm ci`, then run `npm run validate` and `npm test`.
4. Open a pull request with testing notes.

Never commit Close API keys, OAuth tokens, customer data, or other credentials. By contributing, you agree that your contribution is licensed under the MIT License.

Keep the portable package aligned with [Agent Plugins 1.0.0](https://agent-plugins.org/specification): metadata belongs in root `plugin.json`, MCP configuration in root `mcp.json`, and skills in `skills/<name>/SKILL.md`. Follow the [Agent Skills specification](https://agentskills.io/specification) for skill frontmatter and layout. Client-specific behavior, if needed, belongs in a documented reverse-domain extension namespace rather than the portable core.

The validator uses vendored, versioned schemas in `scripts/schemas/1.0.0/` so validation does not fetch remote schemas. See [schema provenance](scripts/schemas/README.md) before updating them. A specification upgrade must update both schema identifiers and both vendored schemas together.

Before a marketplace submission, load the plugin in the target client, verify that all four skills are discovered, authenticate to Close, and test a read-only request. Record the client and version in the pull request. Marketplace listings and client-specific installation flows are managed separately from this base package.
