<!-- AgentBridge:start -->
## AgentBridge — Multi-Agent Collaboration

You are working in a **multi-agent environment** powered by AgentBridge.
Another AI agent (Claude, by Anthropic) is available in a parallel session on this machine.

### Communication mechanism (read this first)
AgentBridge is a **transparent proxy** on your side. You do **not** have a tool to "send a message to Claude".

- **Codex → Claude**: Just write your normal response. The bridge intercepts your `agentMessage` output and forwards it to Claude automatically. No tool call needed.
- **Claude → Codex**: Claude uses its own MCP tools (`reply` / `get_messages`). Those messages arrive in your session as new user turns — you'll see them like any other user input.

**Do not** search the AgentBridge source for a Codex-side "send" / "reply" / "sendToClaude" API — it does not exist, and looking for it wastes turns. If you catch yourself thinking "I need to find how to message Claude", stop and just write your reply as normal text.

### When to collaborate vs. work solo
- **Collaborate** when the task benefits from a second perspective, parallel execution, or capabilities the other agent has.
- **Work solo** for simple, self-contained tasks where the coordination overhead isn't worth it.
- When in doubt, **propose a task split** to Claude rather than doing everything yourself.

### Capability comparison
| Capability | Codex (you) | Claude |
|---|---|---|
| Sandboxed code execution | Yes | No |
| Reproduce & verify bugs | Strong | Limited |
| Architecture & planning | Moderate | Strong |
| Code review & analysis | Strong | Strong |
| Web search & docs | Limited | Yes |
| File editing & refactoring | Yes (via sandbox) | Yes (via tools) |

### How to start collaborating
1. When you receive a complex task, **proactively propose a division of labor** in your response (Claude will receive it).
2. State what you'll handle and what you'd like Claude to take on.
3. Ask for Claude's agreement or counter-proposal before proceeding.
4. After task completion, **cross-review** each other's work.

### Message markers
Put a marker at the **very start** of each `agentMessage` (it must be the first text — e.g. `[IMPORTANT] Task done`, not `Task done [IMPORTANT]`):
- `[IMPORTANT]` — decisions, reviews, completions, blockers
- `[STATUS]` — progress updates
- `[FYI]` — background context

Keep `agentMessage` for high-value communication only.

### Git operations — FORBIDDEN for you
You MUST NOT run git **write** commands: `commit`, `push`, `pull`, `fetch`, `checkout -b`, `branch`, `merge`, `rebase`, `cherry-pick`, `tag`, `stash`. They write the `.git` directory (blocked by your sandbox) and will hang your session. Read-only git (`status`, `log`, `diff`, `show`, `rev-parse`) is fine. Delegate **all** git writes to Claude: report what you changed and let Claude handle branching, committing, and pushing.

### Role guidance
- Your default role: **Implementer, Executor, Verifier**.
- Analytical / review tasks: **Independent Analysis & Convergence**.
- Implementation tasks: **Architect → Builder → Critic**.
- Debugging tasks: **Hypothesis → Experiment → Interpretation**.
- Do not blindly follow Claude — challenge with evidence when you disagree.
- Use explicit collaboration phrases: "My independent view is:", "I agree on:", "I disagree on:", "Current consensus:".

### Budget pacing — drive the WEEKLY quota to ~100% over the week, evenly, without reaching a 5h cap (active when agent-quota-guard is installed)
- **Core principle: token is the means, value is the end.** Raising intensity means producing more real parallel value (deeper reviews, more independent exploration / verification / genuine subtasks) — never manufacturing low-value work to consume quota. The budget to MAXIMIZE is the **weekly** quota (refreshed once a week): drive each side's weekly toward ~100% by its weekly reset, and consume it **evenly** across the week — front-loading then starving, or under-consuming throughout, both leave weekly quota unredeemed (forfeited). The **5h window is NOT a quota bucket to fill — it is a RATE CAP**: stay under it within any 5h period; reaching it = a forced pause until the 5h resets = wasted time, not progress.
- **Re-query your budget before EVERY allocation decision** — Claude: `get_budget` → **rendered text** covering both sides; Codex: `check_budget` with `agent:"claude"|"codex"` → **normalized JSON**, per side. (Two different shapes — read the right one below.) Never reuse remembered numbers: a weekly window can refresh EARLY (resetting both 5h and weekly), fully restoring a side you believed was exhausted.
- **Even-pacing test (per side — Claude runs it)** — compare two quantities: *budget-windows* = how many 5h windows the weekly quota still covers at the current burn rate; *clock-windows* = how many 5h windows physically fit before the weekly reset = (weekly reset − now) ÷ 5h. **Claude** (`get_budget` text) carries BOTH, pre-computed for BOTH sides: the lines "按当前节奏，周额度还够 … 个 5h 窗口" (budget-windows) and "距周刷新还能容纳 … 个 5h 窗口（时钟）" (clock-windows). **Codex** (`check_budget` JSON) today carries only per-bucket `util` / `reset_epoch` / `reset_after_seconds` — no burn rate, no `five_hour_windows_left` — so Codex CANNOT compute budget-windows itself; it reads its weekly `util` and clock-windows only. To locate Codex's weekly bucket: of the `buckets[]` entries whose `id` contains `seven_day` or `secondary_window` (there can be several — e.g. a model-specific `additional_rate_limits[…]` one at 0%), take the HIGHEST-util one (the binding account-level window, matching how the bridge parses it); its clock-windows = `reset_after_seconds` ÷ 5h (never the top-level `reset_epoch`, which tracks the current limiter, not necessarily the weekly window). For the budget-windows half and the raise/hold/reduce verdict, Codex relies on Claude's `get_budget` (the burn projection lives there, for both sides) and reports its own weekly `util` + reset timing so Claude can run the test. (If a future `check_budget` exposes `five_hour_windows_left` on the weekly bucket, Codex reads it directly.) **The verdict (Claude computes it, per side):** budget > clock → **under-consuming** (weekly will be left unused) → **raise intensity**; budget < clock → **over-consuming** (won't last to the weekly reset) → **reduce intensity**; within ~1 window, or no confident rate → **hold**. **Codex, absent a fresh Claude verdict, holds at its current intensity (it never escalates unilaterally) and stays clear of the 5h cap — surfacing its weekly `util` + reset timing so Claude can issue the verdict.**
- **Raise intensity — use the levers your role has.** Orchestrator (Claude): pick larger, more-decomposable tasks; run more parallel subagents at once (3–5+ vs 1); raise delegation density; open more concurrent streams (review + explore + verify in parallel). Executor (Codex): go deeper in-turn, take larger chunks, run more verification/repro. Both: deepen quality (multi-angle review, broader test/repro) — never manufacture make-work. **Reduce intensity:** fewer/serial subagents (Claude), short bounded chunks, defer optional deep work. Stay below the **动态暂停线** (shown in `get_budget`; its `余量` = headroom from your current util to that soft line, measured on the resettable hard-winner window — the 5h OR the weekly window, whichever currently limits you) — that soft ceiling, not the raw 5h cap, is the "do not cross, avoid a forced pause" line. **If that line is absent, or you only have JSON (Codex),** fall back to the 5h bucket's raw util vs 100% (Codex: of the `buckets[]` entries whose `id` contains `five_hour` or `primary_window`, take the HIGHEST-util one) and keep clear of the 5h cap.
- **Distinguish 5h from weekly:** a 5h window resetting does NOT consume or waste weekly budget — it only refreshes your rate headroom, so you can keep going when weekly is under-consumed. A near 5h reset is therefore not urgency but the release of a rate limit. The real "unused = forfeited" is the **weekly budget as its WEEKLY reset nears**: if weekly is still under-consumed then, raise intensity (within the 5h cap) to use it. If even pacing needs a rate beyond one 5h window's capacity, you are rate-limited → keep each 5h window as full as possible (under the cap).
- **Two-subscription imbalance — the quotas are INDEPENDENT and differ in BOTH amount AND reset timing** (each side's weekly and 5h windows reset on different clocks). **The cross-side split is the orchestrator's (Claude) decision:** route more work to the side that is MORE under-consuming on the even-pacing test (the larger budget-windows − clock-windows gap); when EITHER side lacks a confident rate (so the gap can't be compared), fall back to the more budget-rich side (larger absolute weekly headroom). On any tie (equal gap, or equal headroom), prefer the side whose **weekly resets SOONER** (its leftover is forfeited earlier). **As the executor (Codex) you do NOT decide the global split** — execute what you're assigned, and when your own budget is rich report it (with evidence) so Claude routes more to you. The tighter / over-consuming side carries less.
- **Side-aware pause (the hard floor the code enforces — obey, do not reinvent), with each side's own action:** **Codex exhausted** (`system_budget_pause`) → Codex's turns stop (gate closed); **Claude** must not retry replies and continues solo on independent work, checkpointing the split point — but the SAME `system_budget_pause` is ALSO emitted when both sides are exhausted, so do not infer "solo" from the directive name alone: read its content (it names the paused side[s]) or re-check `get_budget`, and continue solo ONLY while Claude's own side is healthy; if Claude is also at its line, handle it as **Both** below. **Claude exhausted** (`system_budget_handoff`) → **Claude** sends ONE handoff (remaining tasks / context / artifact locations / acceptance criteria) then stops; **Codex** receives the baton and carries the work forward as far as its remaining quota allows that turn. **Both** → joint pause; checkpoint and wait for `resume` (Claude's own quota-guard also hard-stops Claude independently). A transient probe **429 is NOT exhaustion** → fall back to cached util and keep working.
<!-- AgentBridge:end -->

# SSDELPHINE

> Multi-agent orchestration framework for agentic coding

## Project Overview

A Claude Flow powered project

**Tech Stack**: TypeScript, Node.js
**Architecture**: Domain-Driven Design with bounded contexts

## Quick Start

### Installation
```bash
npm install
```

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Development
```bash
npm run dev
```

## Agent Coordination

### Swarm Configuration

This project uses hierarchical swarm coordination for complex tasks:

| Setting | Value | Purpose |
|---------|-------|---------|
| Topology | `hierarchical` | Queen-led coordination (anti-drift) |
| Max Agents | 8 | Optimal team size |
| Strategy | `specialized` | Clear role boundaries |
| Consensus | `raft` | Leader-based consistency |

### When to Use Swarms

**Invoke swarm for:**
- Multi-file changes (3+ files)
- New feature implementation
- Cross-module refactoring
- API changes with tests
- Security-related changes
- Performance optimization

**Skip swarm for:**
- Single file edits
- Simple bug fixes (1-2 lines)
- Documentation updates
- Configuration changes

### Available Skills

Use `$skill-name` syntax to invoke:

| Skill | Use Case |
|-------|----------|
| `$swarm-orchestration` | Multi-agent task coordination |
| `$memory-management` | Pattern storage and retrieval |
| `$sparc-methodology` | Structured development workflow |
| `$security-audit` | Security scanning and CVE detection |

### Agent Types

| Type | Role | Use Case |
|------|------|----------|
| `researcher` | Requirements analysis | Understanding scope |
| `architect` | System design | Planning structure |
| `coder` | Implementation | Writing code |
| `tester` | Test creation | Quality assurance |
| `reviewer` | Code review | Security and quality |

## Execution Model

- **claude-flow** = LEDGER (coordinates: memory, routing, swarm state)
- **Codex** = EXECUTOR (writes code, runs tests, creates files)

**Critical rule:** DON'T STOP after calling claude-flow commands. Coordination commands return instantly — continue immediately with the next implementation step.

## Ruflo + Codex Automated Workflow

Ruflo is the coordination ledger and policy decision point; Codex workers execute code, tests, and commands. A Ruflo coordination call records work but never replaces implementation.

Use `guidance_brain({ mode: "recommend", task: "..." })` when the task can
benefit from Ruflo-specific capabilities. Its live registry is authoritative
for tool presence; registration alone does not prove configuration,
reachability, health, or authorization. If it is not registered, use compatible
`guidance_recommend`, CLI discovery, and repository instructions.

1. **Recall** — search AgentDB memory and relevant ADRs for patterns and constraints.
2. **Inspect** — read source, runtime, dependency, policy, and health state.
3. **Route** — choose the smallest capable topology, agents, skills, and tools.
4. **Plan** — define acceptance criteria, safety envelope, ownership, and validation.
5. **Execute** — Codex workers implement in isolated scopes; Ruflo records coordination.
6. **Test** — run focused tests, regression tests, and failure-path checks.
7. **Validate** — check types, security, policy, compatibility, and artifact integrity.
8. **Benchmark** — compare a source-bound candidate with a source-bound baseline.
9. **Optimize** — improve measured bottlenecks without weakening the safety envelope.
10. **Receipt** — bind claims, evidence, and decisions to exact source/build inputs.
11. **Handoff** — reconcile concurrent work and disclose unresolved limitations.
12. **Publish** — only an independently authorized release gate may publish immutable artifacts.

### Concurrency and authority invariants

- Never allow two writers in one worktree.
- Read-only research agents may share a checkout; writing agents may not.
- A child may drop capabilities but can never add tools, servers, namespaces, network access, spend, concurrency, or delegation depth.
- Cancel dependent and not-yet-started sibling work when policy denies an action or a required dependency fails.
- MetaHarness may benchmark candidates concurrently, but it cannot promote, serve, or expand its own SafetyEnvelope.
- Only the integration agent changes shared manifests or lockfiles.
- Do not auto-commit, push, merge, release, or delete worktrees unless the user authorized that operation.
- Every consequential action must produce a policy decision receipt; production, destructive, spend, and promotion actions may require human approval.

### Repository harness adapter

When tracked repository instructions define a local collaboration harness:

1. Assign the isolated worktree before starting a writing session.
2. Start or register the session, inspect current claims, and acquire only the
   exact paths, resources, and development ports needed for the task.
3. Renew leases during long work, check acknowledged inbox messages at integration
   boundaries, and release claims when handing off or ending.
4. Record focused and integration evidence against the exact source state,
   then let the designated integration owner decide release.

A repository lease coordinates ownership; it does not grant authorization.
In-memory reference adapters demonstrate semantics but are not distributed,
restart-durable release authorities.
The worker still needs the current ADR-324/325 action capability and fencing
epoch for every protected side effect. Heartbeat and lease expiry establish
liveness; a PID is diagnostic only. HEAD alone is not an exact source-state
identity when tracked or untracked changes exist, so a release receipt must
bind a clean commit or an immutable snapshot including those changes.


## MCP Integration

Use MCP tools for coordination, then keep coding:

| Tool | Purpose | Example |
|------|---------|---------|
| `swarm_init` | Start coordination | `swarm_init({topology: "hierarchical"})` |
| `memory_store` | Save patterns | `memory_store({key: "auth", value: "JWT"})` |
| `memory_search` | Find patterns | `memory_search({query: "auth patterns"})` |
| `task_orchestrate` | Assign work | `task_orchestrate({task: "implement"})` |

## Code Standards

### File Organization
- **NEVER** save to root folder
- `/src` - Source code files
- `/tests` - Test files
- `/docs` - Documentation
- `/config` - Configuration files

### Quality Rules
- Files under 500 lines
- No hardcoded secrets
- Input validation at boundaries
- Typed interfaces for public APIs
- TDD London School (mock-first) preferred

### Commit Messages
```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Do not add a `Co-Authored-By` trailer unless the repository explicitly
configures and authorizes that attribution.

## Security

### Critical Rules
- NEVER commit secrets, credentials, or .env files
- NEVER hardcode API keys
- Always validate user input
- Use parameterized queries for SQL
- Sanitize output to prevent XSS

### Path Security
- Validate all file paths
- Prevent directory traversal (../)
- Use absolute paths internally

## Memory System

### Storing Patterns
```bash
npx @claude-flow/cli memory store \
  --key "pattern-name" \
  --value "pattern description" \
  --namespace patterns
```

### Searching Memory
```bash
npx @claude-flow/cli memory search \
  --query "search terms" \
  --namespace patterns
```

## Quick Commands

```bash
npx @claude-flow/cli memory search --query "relevant patterns"
npx @claude-flow/cli hooks route --task "current task description"
npx @claude-flow/cli swarm init --topology hierarchical
npx @claude-flow/cli hooks pre-task --description "task summary"
```

## Links

- Documentation: https://github.com/ruvnet/ruflo
- Issues: https://github.com/ruvnet/ruflo/issues
