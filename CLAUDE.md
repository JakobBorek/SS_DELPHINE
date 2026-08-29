<!-- AgentBridge:start -->
## AgentBridge — Multi-Agent Collaboration

You are working in a **multi-agent environment** powered by AgentBridge.
Another AI agent (Codex, by OpenAI) is available in a parallel session on this machine.

### Communication mechanism
- **Claude → Codex**: Use the AgentBridge MCP tools (`reply` / `get_messages`) — these are yours only.
- **Codex → Claude**: Codex has no symmetric tool. The bridge transparently intercepts Codex's normal output and forwards it to you as push notifications (if a push fails, drain the fallback queue with `get_messages`).
- If Codex ever complains it can't find a "send-to-Claude" API, remind it that its side is transparent — it just writes a reply and you'll see it.

### When to collaborate vs. work solo
- **Collaborate** when the task benefits from a second perspective, parallel execution, or capabilities you lack (e.g., sandboxed code execution, independent verification).
- **Work solo** for simple, self-contained tasks where the coordination overhead isn't worth it.
- When in doubt, **propose a task split** to Codex rather than doing everything yourself.

### Capability comparison
| Capability | Claude (you) | Codex |
|---|---|---|
| Architecture & planning | Strong | Moderate |
| Code review & analysis | Strong | Strong |
| Sandboxed code execution | No | Yes |
| File editing & refactoring | Yes (via tools) | Yes (via sandbox) |
| Web search & docs | Yes | Limited |
| Independent verification | Cross-review | Reproduce & test |

### How to start collaborating
1. When you receive a complex task, **proactively propose a division of labor** to Codex via the reply tool.
2. State what you'll handle and what you'd like Codex to take on.
3. Ask for Codex's agreement or counter-proposal before proceeding.
4. After task completion, **cross-review** each other's work.

### Budget pacing — drive the WEEKLY quota to ~100% over the week, evenly, without reaching a 5h cap (active when agent-quota-guard is installed)
- **Core principle: token is the means, value is the end.** Raising intensity means producing more real parallel value (deeper reviews, more independent exploration / verification / genuine subtasks) — never manufacturing low-value work to consume quota. The budget to MAXIMIZE is the **weekly** quota (refreshed once a week): drive each side's weekly toward ~100% by its weekly reset, and consume it **evenly** across the week — front-loading then starving, or under-consuming throughout, both leave weekly quota unredeemed (forfeited). The **5h window is NOT a quota bucket to fill — it is a RATE CAP**: stay under it within any 5h period; reaching it = a forced pause until the 5h resets = wasted time, not progress.
- **Re-query your budget before EVERY allocation decision** — Claude: `get_budget` → **rendered text** covering both sides; Codex: `check_budget` with `agent:"claude"|"codex"` → **normalized JSON**, per side. (Two different shapes — read the right one below.) Never reuse remembered numbers: a weekly window can refresh EARLY (resetting both 5h and weekly), fully restoring a side you believed was exhausted.
- **Even-pacing test (per side — Claude runs it)** — compare two quantities: *budget-windows* = how many 5h windows the weekly quota still covers at the current burn rate; *clock-windows* = how many 5h windows physically fit before the weekly reset = (weekly reset − now) ÷ 5h. **Claude** (`get_budget` text) carries BOTH, pre-computed for BOTH sides: the lines "按当前节奏，周额度还够 … 个 5h 窗口" (budget-windows) and "距周刷新还能容纳 … 个 5h 窗口（时钟）" (clock-windows). **Codex** (`check_budget` JSON) today carries only per-bucket `util` / `reset_epoch` / `reset_after_seconds` — no burn rate, no `five_hour_windows_left` — so Codex CANNOT compute budget-windows itself; it reads its weekly `util` and clock-windows only. To locate Codex's weekly bucket: of the `buckets[]` entries whose `id` contains `seven_day` or `secondary_window` (there can be several — e.g. a model-specific `additional_rate_limits[…]` one at 0%), take the HIGHEST-util one (the binding account-level window, matching how the bridge parses it); its clock-windows = `reset_after_seconds` ÷ 5h (never the top-level `reset_epoch`, which tracks the current limiter, not necessarily the weekly window). For the budget-windows half and the raise/hold/reduce verdict, Codex relies on Claude's `get_budget` (the burn projection lives there, for both sides) and reports its own weekly `util` + reset timing so Claude can run the test. (If a future `check_budget` exposes `five_hour_windows_left` on the weekly bucket, Codex reads it directly.) **The verdict (Claude computes it, per side):** budget > clock → **under-consuming** (weekly will be left unused) → **raise intensity**; budget < clock → **over-consuming** (won't last to the weekly reset) → **reduce intensity**; within ~1 window, or no confident rate → **hold**. **Codex, absent a fresh Claude verdict, holds at its current intensity (it never escalates unilaterally) and stays clear of the 5h cap — surfacing its weekly `util` + reset timing so Claude can issue the verdict.**
- **Raise intensity — use the levers your role has.** Orchestrator (Claude): pick larger, more-decomposable tasks; run more parallel subagents at once (3–5+ vs 1); raise delegation density; open more concurrent streams (review + explore + verify in parallel). Executor (Codex): go deeper in-turn, take larger chunks, run more verification/repro. Both: deepen quality (multi-angle review, broader test/repro) — never manufacture make-work. **Reduce intensity:** fewer/serial subagents (Claude), short bounded chunks, defer optional deep work. Stay below the **动态暂停线** (shown in `get_budget`; its `余量` = headroom from your current util to that soft line, measured on the resettable hard-winner window — the 5h OR the weekly window, whichever currently limits you) — that soft ceiling, not the raw 5h cap, is the "do not cross, avoid a forced pause" line. **If that line is absent, or you only have JSON (Codex),** fall back to the 5h bucket's raw util vs 100% (Codex: of the `buckets[]` entries whose `id` contains `five_hour` or `primary_window`, take the HIGHEST-util one) and keep clear of the 5h cap.
- **Distinguish 5h from weekly:** a 5h window resetting does NOT consume or waste weekly budget — it only refreshes your rate headroom, so you can keep going when weekly is under-consumed. A near 5h reset is therefore not urgency but the release of a rate limit. The real "unused = forfeited" is the **weekly budget as its WEEKLY reset nears**: if weekly is still under-consumed then, raise intensity (within the 5h cap) to use it. If even pacing needs a rate beyond one 5h window's capacity, you are rate-limited → keep each 5h window as full as possible (under the cap).
- **Two-subscription imbalance — the quotas are INDEPENDENT and differ in BOTH amount AND reset timing** (each side's weekly and 5h windows reset on different clocks). **The cross-side split is the orchestrator's (Claude) decision:** route more work to the side that is MORE under-consuming on the even-pacing test (the larger budget-windows − clock-windows gap); when EITHER side lacks a confident rate (so the gap can't be compared), fall back to the more budget-rich side (larger absolute weekly headroom). On any tie (equal gap, or equal headroom), prefer the side whose **weekly resets SOONER** (its leftover is forfeited earlier). **As the executor (Codex) you do NOT decide the global split** — execute what you're assigned, and when your own budget is rich report it (with evidence) so Claude routes more to you. The tighter / over-consuming side carries less.
- **Side-aware pause (the hard floor the code enforces — obey, do not reinvent), with each side's own action:** **Codex exhausted** (`system_budget_pause`) → Codex's turns stop (gate closed); **Claude** must not retry replies and continues solo on independent work, checkpointing the split point — but the SAME `system_budget_pause` is ALSO emitted when both sides are exhausted, so do not infer "solo" from the directive name alone: read its content (it names the paused side[s]) or re-check `get_budget`, and continue solo ONLY while Claude's own side is healthy; if Claude is also at its line, handle it as **Both** below. **Claude exhausted** (`system_budget_handoff`) → **Claude** sends ONE handoff (remaining tasks / context / artifact locations / acceptance criteria) then stops; **Codex** receives the baton and carries the work forward as far as its remaining quota allows that turn. **Both** → joint pause; checkpoint and wait for `resume` (Claude's own quota-guard also hard-stops Claude independently). A transient probe **429 is NOT exhaustion** → fall back to cached util and keep working.
<!-- AgentBridge:end -->

# Ruflo — Claude Code Configuration

## Rules

- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary — prefer editing existing files
- NEVER create documentation files unless explicitly requested
- NEVER save working files or tests to root — use `/src`, `/tests`, `/docs`, `/config`, `/scripts`
- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or .env files
- NEVER add a `Co-Authored-By` trailer to user commits unless this project's `.claude/settings.json` has `attribution.commit` set (#2078). The Claude Code Bash tool may suggest one in its default commit-message template — ignore it. `Co-Authored-By` is semantic authorship attribution under git/GitHub convention; the tool is the facilitator, not a co-author.
- Keep files under 500 lines
- Validate input at system boundaries

## Ruflo Capability Brain & Implementation Loop

Ruflo is the coordination ledger and policy decision point. Claude Code is the
executor: after a Ruflo coordination call, continue implementing the task.

When it is registered, call
`guidance_brain({ mode: "recommend", task: "..." })` before complex Ruflo
work. Use its live registry instead of guessing tool names. Treat
`registered`, `configured`, `reachable`, `healthy`, and `authorized`
as separate facts. If the brain is unavailable, continue with the compatible
`guidance_recommend` tool, CLI discovery, and repository instructions.

Follow the returned loop:

1. Recall memory and ADR constraints.
2. Inspect source, runtime, dependencies, policy, and health.
3. Route to the smallest capable topology, agents, skills, and tools.
4. Plan acceptance criteria, safety envelope, ownership, and validation.
5. Execute in isolated scopes; the coding agent performs the work.
6. Test focused, regression, and failure paths.
7. Validate types, security, policy, compatibility, and artifacts.
8. Benchmark a source-bound candidate against a source-bound baseline.
9. Optimize measured bottlenecks without weakening safety.
10. Bind claims and evidence to exact source/build receipts.
11. Reconcile concurrent handoffs and disclose limitations.
12. Publish only through a separately authorized release gate.

### Concurrency and authority

- Never allow two writers in one worktree; give each writing agent an isolated
  worktree and explicit file ownership.
- Read-only research may run concurrently and report findings to the owner.
- Only the integration owner edits shared manifests and lockfiles or reconciles
  overlapping changes.
- A child may drop capabilities but cannot add tools, network, secrets, spend,
  concurrency, namespaces, or delegation depth.
- A lease or claim coordinates ownership; it does not authorize a side effect.
- Darwin, Flywheel, MetaHarness, memory, and neural systems may propose or
  evaluate candidates but cannot self-promote or expand their SafetyEnvelope.
- Bind tests, benchmarks, policy decisions, and release evidence to an exact
  commit or immutable dirty-worktree snapshot.

## Agent Comms (SendMessage-First Coordination)

Named agents coordinate via `SendMessage`, not polling or shared state.

```
Lead (you) ←→ architect ←→ developer ←→ tester ←→ reviewer
              (named agents message each other directly)
```

### Spawning a Coordinated Team

```javascript
// ALL agents in ONE message, each knows WHO to message next
Agent({ prompt: "Research the codebase. SendMessage findings to 'architect'.",
  subagent_type: "researcher", name: "researcher", run_in_background: true })
Agent({ prompt: "Wait for 'researcher'. Design solution. SendMessage to 'coder'.",
  subagent_type: "system-architect", name: "architect", run_in_background: true })
Agent({ prompt: "Wait for 'architect'. Implement it. SendMessage to 'tester'.",
  subagent_type: "coder", name: "coder", run_in_background: true })
Agent({ prompt: "Wait for 'coder'. Write tests. SendMessage results to 'reviewer'.",
  subagent_type: "tester", name: "tester", run_in_background: true })
Agent({ prompt: "Wait for 'tester'. Review code quality and security.",
  subagent_type: "reviewer", name: "reviewer", run_in_background: true })

// Kick off the pipeline
SendMessage({ to: "researcher", summary: "Start", message: "[task context]" })
```

### Patterns

| Pattern | Flow | Use When |
|---------|------|----------|
| **Pipeline** | A → B → C → D | Sequential dependencies (feature dev) |
| **Fan-out** | Lead → A, B, C → Lead | Independent parallel work (research) |
| **Supervisor** | Lead ↔ workers | Ongoing coordination (complex refactor) |

### Rules

- ALWAYS name agents — `name: "role"` makes them addressable
- ALWAYS include comms instructions in prompts — who to message, what to send
- Spawn ALL agents in ONE message with `run_in_background: true`
- After spawning, continue independent local work; wait only when a dependency
  genuinely blocks progress
- Do not poll repeatedly — agents message back or complete automatically
- Give every writing agent an isolated worktree and a non-overlapping file scope

## Swarm & Routing

### Config
- **Topology**: hierarchical-mesh (anti-drift)
- **Max Agents**: 15
- **Memory**: hybrid
- **HNSW**: Enabled
- **Neural**: Enabled

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

### Agent Routing

| Task | Agents | Topology |
|------|--------|----------|
| Bug Fix | researcher, coder, tester | hierarchical |
| Feature | architect, coder, tester, reviewer | hierarchical |
| Refactor | architect, coder, reviewer | hierarchical |
| Performance | perf-engineer, coder | hierarchical |
| Security | security-architect, auditor | hierarchical |

### When to Swarm
- **YES**: 3+ files, new features, cross-module refactoring, API changes, security, performance
- **NO**: single file edits, 1-2 line fixes, docs updates, config changes, questions

### 3-Tier Model Routing

| Tier | Handler | Use Cases |
|------|---------|-----------|
| 1 | Agent Booster (WASM) | Simple transforms — skip LLM, use Edit directly |
| 2 | Haiku | Simple tasks, low complexity |
| 3 | Sonnet/Opus | Architecture, security, complex reasoning |

## Memory & Learning

### Before Any Task
```bash
npx @claude-flow/cli@latest memory search --query "[task keywords]" --namespace patterns
npx @claude-flow/cli@latest hooks route --task "[task description]"
```

### After Success
```bash
npx @claude-flow/cli@latest memory store --namespace patterns --key "[name]" --value "[what worked]"
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true --store-results true
```

### MCP Tools (use `ToolSearch("keyword")` to discover)

| Category | Key Tools |
|----------|-----------|
| **Memory** | `memory_store`, `memory_search`, `memory_search_unified` |
| **Bridge** | `memory_import_claude`, `memory_bridge_status` |
| **Swarm** | `swarm_init`, `swarm_status`, `swarm_health` |
| **Agents** | `agent_spawn`, `agent_list`, `agent_status` |
| **Hooks** | `hooks_route`, `hooks_post-task`, `hooks_worker-dispatch` |
| **Security** | `aidefence_scan`, `aidefence_is_safe`, `aidefence_has_pii` |
| **Hive-Mind** | `hive-mind_init`, `hive-mind_consensus`, `hive-mind_spawn` |

### Background Workers

| Worker | When |
|--------|------|
| `audit` | After security changes |
| `optimize` | After performance work |
| `testgaps` | After adding features |
| `map` | Every 5+ file changes |
| `document` | After API changes |

```bash
npx @claude-flow/cli@latest hooks worker dispatch --trigger audit
```

## Agents

**Core**: `coder`, `reviewer`, `tester`, `planner`, `researcher`
**Architecture**: `system-architect`, `backend-dev`, `mobile-dev`
**Security**: `security-architect`, `security-auditor`
**Performance**: `performance-engineer`, `perf-analyzer`
**Coordination**: `hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`
**GitHub**: `pr-manager`, `code-review-swarm`, `issue-tracker`, `release-manager`

Any string works as a custom agent type.

## Build & Test

- ALWAYS run tests after code changes
- ALWAYS verify build succeeds before committing

```bash
npm run build && npm test
```

## CLI Quick Reference

```bash
npx @claude-flow/cli@latest init --wizard           # Setup
npx @claude-flow/cli@latest swarm init --v3-mode     # Start swarm
npx @claude-flow/cli@latest memory search --query "" # Vector search
npx @claude-flow/cli@latest hooks route --task ""    # Route to agent
npx @claude-flow/cli@latest doctor --fix             # Diagnostics
npx @claude-flow/cli@latest security scan            # Security scan
npx @claude-flow/cli@latest performance benchmark    # Benchmarks
```

26 commands, 140+ subcommands. Use `--help` on any command for details.

## Setup

```bash
claude mcp add claude-flow -- npx -y ruflo@latest mcp start
npx ruflo@latest doctor --fix
```

> The background `daemon` is optional. It runs interval workers that each spawn
> a headless `claude` session, so it consumes tokens continuously. Start it only
> if you want those sweeps: `npx ruflo@latest daemon start` (self-stops after 12h
> by default; `--ttl 0` to disable, `daemon status --all` to audit running daemons).

**Agent tool** handles execution (agents, files, code, git). **MCP tools** handle coordination (swarm, memory, hooks). **CLI** is the same via Bash.
