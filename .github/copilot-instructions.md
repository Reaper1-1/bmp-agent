# Better Man Project - Agent Configuration Repository

## Project Overview

This repository documents agent schemas and configuration patterns for the Better Man Project, designed to work with Base44 or Supabase-powered agent systems. The primary deliverable is JSON configuration schemas for pastoral/coaching AI agents that help men with prayer, leadership, and spiritual growth.

This repo is documentation-only: there is no application code, build, or test pipeline. The GitHub Actions workflow in `.github/workflows/blank.yml` is a starter CI template and does not currently validate schemas.

## Agent Configuration Architecture

### Core Schema Structure

All agent configs follow a standard JSON schema with these key sections:
- **Identity**: `id`, `name`, `description` - UI-friendly agent identification
- **Model params**: `model`, `temperature`, `top_p`, `max_tokens`, presence/frequency penalties
- **Data access**: `entities` array lists Supabase tables/views/RPCs the agent can access (e.g., `JournalEntry`, `DailyProgress`, `Devotional`)
- **Tools**: `tools` array declares callable RPCs/HTTP webhooks with scopes; `allowed_tools` gates runtime execution
- **Instructions**: `system_prompt` contains full developer/system instructions; `instructions` provides runtime guidance
- **Metadata**: `visible`, `tags`, `metadata` for UI filtering and access control

### Platform Flexibility

Configurations are designed to map to both generic schemas and Base44-specific key names:
- `id` → `agent_id`
- `name` → `title`
- `system_prompt` → `developer_instructions` or `system`
- `entities` → `allowed_entities`
- `tools` → `integrations`

When writing Base44-specific examples, prefer showing both the generic schema and a short mapped snippet (see "4) Mapping / Base44 alignment" in `README.md`) instead of inventing new key names.

## Agent Type Patterns

### Model & Temperature Guidelines

Follow these established patterns when creating new agents:
- **Coach/pastoral agents** (e.g., `prayer_coach`, `leadership_mentor`): Use `gpt-5.1-mini`, temperature `0.4-0.7` for empathetic, conversational responses
- **Builder/reasoning agents** (e.g., `builder_handoff_agent`): Use `gpt-5.1`, temperature `0.1-0.3` for structured, precise outputs
- **Orchestrator agents** (e.g., `workflow_meta_agent`): Use `gpt-5.1-mini`, temperature `0.3` for classification and routing logic

### System Prompt Structure

The `system_prompt` field should reference a "Better Man Project — Unified Style Guide" (platform-injected or included), then provide agent-specific instructions including:
1. Role identity and core purpose
2. Interaction approach (empathy level, directness)
3. Output format specification (e.g., "Heart Check / Guidance / Sample Prayer / Scripture Anchor")
4. Security/runtime rules (qualified entity names, allowed_tools enforcement, scope/role compliance)
5. Explicit reminder: "Use internal reasoning silently; output only the final [coaching/analysis/etc]"

New `system_prompt` values should mirror the examples in `README.md` (especially `prayer_coach` and `leadership_mentor`): reference the unified style guide once, then define role, outline a named output structure, and end with an explicit "use internal reasoning silently" reminder.

### Tool Definition Pattern

Tools follow this structure:

```json
{
  "name": "rpc.fetch_today_devotional",
  "type": "rpc|http",
  "description": "Supabase RPC: get today's devotional",
  "endpoint": "/rpc/fetch_today_devotional",
  "scopes": ["read:devotional"]
}
```

HTTP tools add `url` and `method` fields. Always specify `scopes` for access control.

## Key Files

- `README.md`: Generic schema template (section "1) Generic Agent Schema"), full `prayer_coach` example (section "2) Full Example"), and compressed examples for `leadership_mentor` and `workflow_meta_agent`. Mirror these patterns when adding new agents.

## Agent Creation Checklist

When adding new agent configurations to README.md:
1. Choose model and temperature appropriate to role (see patterns above)
2. Enumerate `entities` the agent needs (DB tables/views/RPCs)
3. Declare `tools` with types, endpoints, and scopes
4. Set `allowed_tools` to subset of `tools` for runtime gating
5. Write `system_prompt` with clear output format and security rules
6. Add `tags` for UI filtering (e.g., `["prayer","coach","pastoral"]`)
7. Set `visible: true` and appropriate `metadata.allowed_user_roles`

## Working in this Repo (for AI agents)

- When adding or updating agents, edit `README.md` rather than creating new top-level files, unless a human explicitly requests new files.
- Keep at least one full, detailed example (currently `prayer_coach`) and add new agents as compressed examples unless a new pattern needs a full example.
- Preserve existing JSON field names and ordering in examples where possible; only introduce new fields when documenting intentional schema changes.
- Do not modify `.github/workflows/blank.yml` unless asked; it is not wired to any validation and is only a starter template.

## Documentation Conventions

- Use "compressed" examples for brevity in lists; provide one "full example" with all fields and detailed comments
- Include field guidance sections explaining purpose and expected values
- Provide mapping/alignment sections when documenting cross-platform compatibility
- Use JSON code blocks with proper syntax highlighting
- Reference the global style guide assumption in system prompts
