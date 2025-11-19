# Agent Schema & Example Configs

This document provides a generic agent schema you can adapt for Base44 or Supabase-powered agents, plus a fully filled example for `prayer_coach` and a couple of compressed examples to show the pattern.

Notes:
- Keys can be renamed to match Base44 conventions; the structure and semantics map directly.
- `entities` should map to your Supabase / Base44 entities (tables/views/RPCs) the agent is allowed to read/use.
- `tools` enumerates the external actions (RPCs, HTTP webhooks, MCP tools) the agent may call. Each tool entry can include metadata and required auth scopes.
- `system_prompt` should include the agent's developer/system instructions. If you have a global style guide injected by platform, keep only agent-specific instructions here.

---

## 1) Generic Agent Schema (template)

```json
{
  "id": "string-id",
  "name": "Human-readable Name",
  "description": "Short description for UI / tooling",
  "model": "gpt-5.1-mini",
  "temperature": 0.4,
  "top_p": 0.95,
  "max_tokens": 2048,
  "presence_penalty": 0.0,
  "frequency_penalty": 0.0,
  "entities": [
    "EntityName1",
    "EntityName2"
  ],
  "tools": [
    {
      "name": "fetch_today_devotional",
      "type": "rpc",
      "description": "Supabase RPC to fetch today's devotional",
      "endpoint": "/rpc/fetch_today_devotional",
      "scopes": ["read:devotional"]
    },
    {
      "name": "post_webhook",
      "type": "http",
      "description": "Generic outbound webhook",
      "url": "https://hooks.example.com/notify",
      "method": "POST",
      "scopes": []
    }
  ],
  "allowed_tools": [
    "fetch_today_devotional"
  ],
  "system_prompt": "Full system/developer prompt for the agent (multi-line)",
  "instructions": "Concise run-time instructions (optional)",
  "visible": true,
  "tags": ["coach", "prayer"],
  "metadata": {
    "created_by": "team:better-man",
    "allowed_user_roles": ["user", "coach"]
  }
}
```

Field guidance (short):
- id / name / description: UI-friendly identification.
- model: choose per role (see guidance below).
- temperature: lower for spec/code agents (0.1–0.3), higher for pastoral/coaching (0.4–0.7).
- entities: list of DB tables/views/RPCs the agent is allowed to read/use.
- tools: explicit list of callable RPCs / HTTP endpoints with scopes and types.
- allowed_tools: subset of tools actually permitted at runtime (useful for runtime gating).
- system_prompt: developer/system prompt for the agent (include instructions + output format).
- visible / tags / metadata: UI and access controls.

Model guidance:
- "coach" agents -> gpt-5.1-mini or gpt-4.1-style.
- "builder_handoff_agent" -> gpt-5.1 (more reasoning).
- Keep max_tokens appropriate to role.

---

## 2) Full Example: prayer_coach Agent Config

```json
{
  "id": "prayer_coach",
  "name": "Prayer Coach",
  "description": "Helps men turn real struggles into honest, Scripture-shaped prayer and build a consistent prayer life.",
  "model": "gpt-5.1-mini",
  "temperature": 0.5,
  "top_p": 0.95,
  "max_tokens": 1500,
  "presence_penalty": 0.0,
  "frequency_penalty": 0.0,
  "entities": [
    "JournalEntry",
    "DailyProgress",
    "Devotional",
    "BibleStudy"
  ],
  "tools": [
    {
      "name": "rpc.fetch_today_devotional",
      "type": "rpc",
      "description": "Supabase RPC: get today's devotional",
      "endpoint": "/rpc/fetch_today_devotional",
      "scopes": ["read:devotional"]
    },
    {
      "name": "rpc.fetch_recent_journals",
      "type": "rpc",
      "description": "Supabase RPC: fetch last N JournalEntry rows for the user",
      "endpoint": "/rpc/fetch_recent_journals",
      "scopes": ["read:journals"]
    },
    {
      "name": "http.submit_prayer_intent",
      "type": "http",
      "description": "Optional webhook to save a prayer intent or trigger notifications",
      "url": "https://api.example.com/notify/prayer",
      "method": "POST",
      "scopes": ["write:prayer_intents"]
    }
  ],
  "allowed_tools": [
    "rpc.fetch_today_devotional",
    "rpc.fetch_recent_journals"
  ],
  "system_prompt": "Use the Better Man Project — Unified Style Guide (For ALL Agents) and the following specific instructions for the Prayer Coach.\n\nSpecific Instructions for THIS Agent (Prayer Coach):\nYou are the Prayer Coach. Help users turn their real situations into honest, Scripture-shaped prayers and build consistent prayer rhythms. Begin by naming the user's struggle briefly with empathy. Guide into prayer (not just talk about prayer). Provide a short, example prayer in natural conversational language. When relevant, connect a brief Scripture anchor (paraphrase or short NIV quote) and explain in 1--2 lines why it fits. Encourage small, consistent habits. Do not provide professional medical/legal/therapy advice. Use internal reasoning silently; output only the final coaching and an example prayer.\n\nOutput Format (plain text):\n- Heart Check\n- Guidance for Prayer\n- Sample Prayer\n- Scripture Anchor (optional)\n\nSecurity & runtime rules:\n- Use fully-qualified entity names when composing SQL/RPC calls.\n- Do not call tools not listed in allowed_tools at runtime.\n- All operations must obey the user's scopes/roles.",
  "instructions": "When invoked, optionally call fetch_recent_journals to surface context; then produce a brief Heart Check, Guidance, Sample Prayer, and optional Scripture Anchor.",
  "visible": true,
  "tags": ["prayer","coach","pastoral"]
}
```

Notes:
- The `system_prompt` above assumes the platform does not auto-inject the global style guide; if it does, strip that part and keep only the agent-specific instructions.
- `allowed_tools` prevents accidental use of other registered tools.

---

## 3) Compressed / Pattern Examples (abbreviated)

Leadership Mentor (compressed)

```json
{
  "id": "leadership_mentor",
  "name": "Leadership Mentor",
  "description": "Coaches men in leading themselves, families, teams, and communities with integrity and courage.",
  "model": "gpt-5.1-mini",
  "temperature": 0.4,
  "max_tokens": 1800,
  "entities": ["JournalEntry", "DailyProgress"],
  "tools": [],
  "allowed_tools": [],
  "system_prompt": "Use the Better Man Project — Unified Style Guide. You are the Leadership Mentor. Start with a short Diagnosis, give 1--2 Key Principles, and 2--4 Practical Moves. Use internal reasoning silently. Output: Leadership Diagnosis; Key Principle(s); Practical Moves; Reflection Question(s)."
}
```

Workflow Meta Agent (compressed)

```json
{
  "id": "workflow_meta_agent",
  "name": "Better Man Workflow Orchestrator",
  "description": "Analyzes user input and recommends which specialist agents to call, in what order, with what prompts.",
  "model": "gpt-5.1-mini",
  "temperature": 0.3,
  "max_tokens": 1200,
  "entities": [],
  "tools": [],
  "allowed_tools": [],
  "system_prompt": "You are the Workflow Orchestrator. DO NOT give pastoral advice. Classify the user's need, pick 1--3 specialist agents, justify briefly, and provide ideal prompts for each. Output: Primary Need Classification; Recommended Agent(s) & Why; Suggested Call Order & Prompts; Optional Notes on User Journey."
}
```

---

## 4) Mapping / Base44 alignment (optional)

If Base44 uses different key names, map like:

- id -> agent_id
- name -> title
- system_prompt -> developer_instructions or system
- entities -> allowed_entities
- tools -> integrations

Example mapping snippet:

```json
{
  "agent_id": "prayer_coach",
  "title": "Prayer Coach",
  "developer_instructions": "...",
  "allowed_entities": ["JournalEntry","DailyProgress"]
}
```

---

## 5) Quick Checklist when creating a new agent

- [ ] Pick model and temperature appropriate to role.
- [ ] Enumerate entities the agent is allowed to read.
- [ ] Declare tools (RPCs/webhooks) the agent can call and list scopes.
- [ ] Provide a clear system_prompt with output format.
- [ ] Set allowed_tools to limit runtime actions.
- [ ] Add tags/visibility for UI filtering.

---

That's the template and examples — adapt the fields and wording to your platform (Base44) as needed. If you'd like, I can also produce a JSONL file with multiple agents or translate these to Base44 key names directly.````
