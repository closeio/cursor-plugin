# Agent Plugins schemas

The unmodified schemas in `1.0.0/` were retrieved on 2026-10-16 from the canonical, versioned URLs:

- https://agent-plugins.org/schemas/1.0.0/plugin.schema.json
- https://agent-plugins.org/schemas/1.0.0/mcp.schema.json

Source project: https://github.com/agentplugins/agent-plugins-spec

Upstream licenses schemas and other software material under Apache-2.0; the license is included in [LICENSE](LICENSE). See [upstream licensing](https://github.com/agentplugins/agent-plugins-spec/blob/main/LICENSE.md).

Keep these copies unchanged. To target a new specification version, vendor both schemas under a new version directory, update both root `$schema` identifiers and the validator's schema paths, and rerun validation and tests. Validation uses these local copies and does not retrieve schemas from the network.
