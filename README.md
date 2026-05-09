# EnVault UI

**Secure environment variable management with human-in-the-loop approval workflows.**

A production-grade React prototype demonstrating the EnVault UX — a developer-first secrets management platform that ensures full transparency, automation with control, and zero-trust architecture.

![EnVault UI](https://img.shields.io/badge/status-prototype-orange) ![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple)

---

## What This Is

EnVault treats every consequential action — syncing secrets to Vercel, rotating API keys, generating preview environments, committing `.env.example` to GitHub — as a **staged approval** before anything executes.

The UX is built around four principles:

- **Nothing commits without your say-so** — every action lands in an approval queue first
- **Full transparency** — the diff view shows exactly what will change, key by key, before and after
- **Delegation without abdication** — auto-approve rules let you say "always approve low-risk dev syncs" without giving up control of production
- **Immutable audit trail** — every approval, rejection, and auto-rule execution is logged with actor + timestamp

---

## Views

| View | Purpose |
|---|---|
| **Overview** | Health dashboard — pending count, recent approvals, active auto-rules |
| **Approval Queue** | The core human-in-the-loop screen — diff view, impact assessment, approve/reject |
| **Auto-Rules** | Create and manage rules for delegating repetitive approvals |
| **Activity Log** | Full transparency feed — every action the system has taken or queued |
| **Vault** | Read-only secret listing (edits go through the approval queue) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

### Publish to GitHub

Uses [GitHub CLI](https://cli.github.com/) with your normal login (browser, SSH, or HTTPS credential helper), not a manual token argument:

```bash
gh auth login   # once per machine
bash publish.sh
```

The script creates `T1MM0/envault-ux` if it does not exist (public), then pushes the current branch. If you already have `origin`, it only runs `git push`.

---

## Key UX Patterns

### Staged Approvals
Every write action creates a pending approval record. The detail panel shows:
- Full before/after diff per key (with reveal for secret values)
- Affected systems (Vercel, Railway, GitHub, etc.)
- Impact level (Low / Medium / High / Critical)
- Who or what triggered the action

### Auto-Approve Rules
Users can create rules like "auto-approve dev environment syncs" to eliminate repetitive approvals for low-risk operations. Rules cannot override the mandatory manual approval gate on critical actions (production key rotation, secret generation).

### Trust Notice
Every approval detail panel includes an explicit trust statement: *"Your approval is required before anything executes. Your decision is logged in the immutable audit trail."* — reinforcing that the human is always in control.

### Impact Levels
- 🔴 **Critical** — always manual (production rotation, key generation)
- 🟠 **High** — always manual (production syncs with secrets)
- 🟡 **Medium** — can be auto-approved via rules
- 🟢 **Low** — can be auto-approved via rules

---

## Stack

- **React 19** — UI components
- **Vite 6** — build tooling
- **DM Serif Display** — headings (institutional, trustworthy)
- **IBM Plex Mono** — keys, values, code (precise, technical)
- **DM Sans** — body text (clean, readable)

---

## Part of the EnVault Product Suite

This prototype accompanies:
- [`EnVault-PRD.md`](./docs/EnVault-PRD.md) — Full product requirements document
- [`EnVault-Agentic-Build-Plan.md`](./docs/EnVault-Agentic-Build-Plan.md) — Autonomous agentic build plan for Squadbox Swarm execution

---

## Licence

MIT
