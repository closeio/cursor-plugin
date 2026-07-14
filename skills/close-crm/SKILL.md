---
name: close-crm
description: Use Close CRM data to research leads, review pipeline and activity, prepare follow-ups, and safely create or update CRM records.
---

# Close CRM

Use the Close MCP tools when a request involves the user's Close organization, leads, contacts, opportunities, activities, tasks, workflows, templates, or Close product knowledge.

## Working method

1. Start with the narrowest read tool that answers the request. Prefer `lead_search`, `activity_search`, `find_opportunities`, and `find_tasks` over a broad search when applicable.
2. Resolve names to records before acting. If multiple records plausibly match, ask the user which one they mean.
3. Use returned IDs for follow-up fetches and mutations. Never invent IDs, field names, statuses, pipelines, users, or custom-field values.
4. For custom fields or organization-specific configuration, discover the available definitions first.
5. Present findings with record names and Close URLs when the tools return them.

## Writes and safety

- Treat the OAuth scope selected by the user as the maximum permission, not blanket authorization.
- Read-only analysis needs no confirmation.
- Before a write, summarize the intended record and material values if the user's request did not already specify them clearly.
- Only delete data after an explicit deletion request and a confirmation that identifies the exact records and irreversible impact.
- Do not broaden a request for one record into a bulk update.
- For voice-agent changes, propose the update first and apply it only after the user approves the proposal.

## Common patterns

- Account brief: find the lead, then gather contacts, open opportunities, recent calls/meetings/emails, notes, and incomplete tasks.
- Pipeline review: find active opportunities, group or sort according to the user's request, and highlight stale activity, overdue tasks, close-date risk, and missing next steps.
- Follow-up planning: inspect recent activity and open tasks before drafting recommendations. Do not claim a message was sent unless a tool actually sent or recorded it.
- Reporting: discover aggregation fields with `get_fields` before using `aggregation`.
- Product questions: use `close_product_knowledge_search` for current Close features, setup, API behavior, and limitations.

Close MCP documentation: https://developer.close.com/mcp
