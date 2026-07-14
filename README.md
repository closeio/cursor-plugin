# Close for Cursor

The official Close plugin for Cursor connects Cursor to your Close CRM through Close's hosted Model Context Protocol (MCP) server.

Use natural language to research leads, prepare account briefs, review sales activity and pipeline, find tasks, answer Close product questions, and—with the permission scope you choose—create or update CRM records.

## Install

Install **Close** from the Cursor Plugin Marketplace. When Cursor shows that Close needs authentication, select **Connect**, choose your Close organization and access scope, and approve the connection.

Close supports three OAuth scopes:

- `mcp.read` — search and read Close data;
- `mcp.write_safe` — read plus create and update records;
- `mcp.write_destructive` — read, create, update, and delete records.

Choose the least-privileged scope that covers your work. You can revoke the connection from Close at any time.

## Included workflows

- `/close:account-brief <lead>` — prepare a brief from contacts, opportunities, activities, and tasks.
- `/close:pipeline-review [filter]` — identify pipeline risk, stale deals, and next actions.
- `/close:follow-up-plan <lead>` — build a follow-up plan from recent conversations and open work.
- `close-crm` skill — helps Cursor choose appropriate Close tools and handle CRM writes safely.

You can also ask Cursor directly:

- “Which active opportunities need attention this week?”
- “Brief me on Acme before my call.”
- “Find my overdue Close tasks and prioritize them.”
- “How many calls did our team make last week?”
- “Create a follow-up task for Friday on this lead.”

Available tools depend on the OAuth scope you approve. Cursor should ask before ambiguous or destructive changes.

## How it works

The plugin configures Cursor to connect directly to `https://mcp.close.com/mcp` using Streamable HTTP and Close OAuth 2.0. It does not contain API keys, run a local process, or send Close data through an additional service.

## Development

Requirements: Node.js 18 or newer.

```sh
npm run validate
```

To test before marketplace publication, clone this repository and load it as a local Cursor plugin, then authenticate when prompted.

## Support and documentation

- [Close MCP documentation](https://developer.close.com/mcp)
- [Close MCP tool reference](https://developer.close.com/mcp/tools)
- [Close Help Center](https://help.close.com)
- [Close support](mailto:support@close.com)

Security issues should be reported privately as described in [SECURITY.md](SECURITY.md).

## License

MIT
