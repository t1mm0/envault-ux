# EnVault — Autonomous Agentic Build Plan
### Squadbox Swarm Execution with Governed, Recursive, Self-Correcting Architecture

**Version:** 2.0 | **Date:** May 2026  
**Classification:** Engineering Execution Document  
**Source:** EnVault PRD v1.0  
**Human Interaction Model:** Phase-boundary confirmation only (via the live product)  
**Autonomy Level:** L4 — Self-governing with human phase sign-off

---

## Table of Contents

1. [Governing Philosophy](#1-governing-philosophy)
2. [Full Swarm Topology](#2-full-swarm-topology)
3. [Agent Taxonomy & Contracts](#3-agent-taxonomy--contracts)
4. [The Governance Council](#4-the-governance-council)
5. [Self-Review & Revision System](#5-self-review--revision-system)
6. [Recursive Test Pyramid](#6-recursive-test-pyramid)
7. [Human Touchpoint Protocol](#7-human-touchpoint-protocol)
8. [Phase 0 — Foundation Bootstrap](#8-phase-0--foundation-bootstrap)
9. [Phase 1 — Core Vault](#9-phase-1--core-vault)
10. [Phase 2 — Environment Intelligence](#10-phase-2--environment-intelligence)
11. [Phase 3 — Key Lifecycle & Rotation](#11-phase-3--key-lifecycle--rotation)
12. [Phase 4 — Breach Detection & Mitigation](#12-phase-4--breach-detection--mitigation)
13. [Phase 5 — IDE & Hosting Integrations](#13-phase-5--ide--hosting-integrations)
14. [Phase 6 — Enterprise & Scale](#14-phase-6--enterprise--scale)
15. [Fixer Agent Playbooks](#15-fixer-agent-playbooks)
16. [Orchestrator State Machine](#16-orchestrator-state-machine)
17. [Build Manifest & Traceability](#17-build-manifest--traceability)
18. [Glossary](#18-glossary)

---

## 1. Governing Philosophy

### 1.1 Core Axioms

This plan treats software construction as a **governed, recursive, self-correcting process** — not a linear pipeline. Every task produces an artifact. Every artifact is reviewed. Every review can trigger revision. Every revision is re-reviewed. The loop closes automatically. Humans are not part of the loop — they confirm each loop's final output by using the product.

**Six Non-Negotiable Principles:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. SECURITY FIRST    Every artifact is security-scanned before     │
│                       any downstream agent may consume it.          │
│                                                                     │
│  2. RECURSIVE PROOF   Nothing is "done" until proven at every       │
│                       scale: unit → component → service →           │
│                       integration → system → adversarial.           │
│                                                                     │
│  3. GOVERNANCE GATE   Three Advisor agents (Security, Quality,      │
│                       Integrity) must all issue APPROVED before     │
│                       any phase can advance.                        │
│                                                                     │
│  4. SELF-REVISION     Build agents read their own validation        │
│                       reports and revise before a Fixer is          │
│                       assigned. Human attention is not the          │
│                       first escalation path — it is the last.       │
│                                                                     │
│  5. INCREMENTAL DEMO  Each phase ends with a deployable product     │
│                       the human can operate. No phase produces      │
│                       code that cannot be shown.                    │
│                                                                     │
│  6. FULL TRACEABILITY Every line of code traces to a task ID,       │
│                       agent ID, PRD requirement ID, and test ID.    │
│                       The build is its own audit log.               │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Build Cadence

```
PHASE CYCLE (repeats for each of 7 phases):

  Bootstrap ──► Parallel Build ──► Recursive Validate ──► Governor Review
      │                                                           │
      │                                                    APPROVED? NO
      │                                                           │
      │                                                    Self-Revise ◄──────┐
      │                                                           │           │
      │                                                    Re-validate        │
      │                                                           │           │
      │                                                    Still failing?     │
      │                                                    Fixer Agents ──────┘
      │
      │                                                    APPROVED? YES
      │                                                           │
      └────────────────────────────────────────────────► Human Gate
                                                                 │
                                                          Human uses product
                                                          and confirms PASS
                                                                 │
                                                          Next Phase Unlocks
```

---

## 2. Full Swarm Topology

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         ORCHESTRATOR AGENT (OA)                             ║
║  Task DAG manager · Agent pool scheduler · Gate enforcer · Escalation router ║
╚═══════════════════════════════════╤══════════════════════════════════════════╝
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
  ┌───────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
  │   LANE A          │  │   LANE B             │  │   LANE C            │
  │   Backend         │  │   Frontend           │  │   Infrastructure    │
  │                   │  │                      │  │                     │
  │  arch-agent       │  │  ui-agent            │  │  infra-agent        │
  │  backend-agent    │  │  component-agent     │  │  devops-agent       │
  │  api-agent        │  │  state-agent         │  │  cicd-agent         │
  │  db-agent         │  │  a11y-agent          │  │  monitoring-agent   │
  │  crypto-agent     │  │                      │  │                     │
  └────────┬──────────┘  └──────────┬───────────┘  └──────────┬──────────┘
           │                        │                          │
           └────────────────────────┼──────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
  ┌───────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
  │   LANE D          │  │   LANE E             │  │   LANE F            │
  │   Security        │  │   Integration        │  │   Intelligence      │
  │                   │  │                      │  │                     │
  │  security-agent   │  │  provider-agent      │  │  ml-agent           │
  │  auth-agent       │  │  ide-agent           │  │  pattern-agent      │
  │  pentest-agent    │  │  webhook-agent       │  │  scoring-agent      │
  │  compliance-agent │  │  sdk-agent           │  │  anomaly-agent      │
  └────────┬──────────┘  └──────────┬───────────┘  └──────────┬──────────┘
           │                        │                          │
           └────────────────────────┼──────────────────────────┘
                                    │ all artifacts flow here
                                    ▼
╔══════════════════════════════════════════════════════════════════════════════╗
║                    RECURSIVE VALIDATOR SYSTEM (RVS)                         ║
║                                                                             ║
║   L1: Static Analysis    L2: Unit Tests      L3: Component Tests           ║
║   L4: Service Tests      L5: Integration     L6: End-to-End                ║
║   L7: Adversarial        L8: Performance     L9: Compliance Scan           ║
╚═══════════════════════════════════╤══════════════════════════════════════════╝
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                 PASS                             FAIL
                    │                               │
                    ▼                               ▼
╔═══════════════════════════╗        ╔══════════════════════════════╗
║   GOVERNANCE COUNCIL      ║        ║   SELF-REVISION ENGINE       ║
║                           ║        ║                              ║
║  Security Advisor (SA)    ║        ║  Agent reads own report      ║
║  Quality Advisor (QA)     ║        ║  Self-patches artifact       ║
║  Integrity Advisor (IA)   ║        ║  Re-triggers RVS             ║
║                           ║        ║                              ║
║  All 3 must APPROVE       ║        ║  Max 2 self-revision cycles  ║
╚═══════════════╤═══════════╝        ║  Then: Fixer Agent assigned  ║
                │                   ║  Max 2 fixer cycles          ║
             APPROVED               ║  Then: Human escalation      ║
                │                   ╚══════════════════════════════╝
                ▼
╔══════════════════════════════════════════════════════════════════════════════╗
║                        MERGE AGENT (MA)                                     ║
║  Integrates all lane outputs · Runs smoke tests · Tags release candidate    ║
║  Generates phase report · Prepares human demo environment                   ║
╚═══════════════════════════════════╤══════════════════════════════════════════╝
                                    │
                                    ▼
╔══════════════════════════════════════════════════════════════════════════════╗
║                     HUMAN CONFIRMATION GATE                                 ║
║  Human is given access to the live product for this phase.                  ║
║  No briefing document — the product itself is the evidence.                 ║
║  Human enters: CONFIRM PASS · CONFIRM FAIL + notes · REQUEST CHANGE        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. Agent Taxonomy & Contracts

### 3.1 Universal Agent Contract

Every agent in the swarm, regardless of specialisation, honours this I/O contract:

```typescript
interface AgentInput {
  task_id:          string;           // e.g. "P1-BE-003"
  phase:            number;           // 0–6
  prd_refs:         string[];         // e.g. ["FR-V-01", "FR-V-02"]
  depends_on:       string[];         // artifact IDs that must exist in registry
  context: {
    repo_state:     string;           // git commit SHA of current codebase
    schema_version: string;           // current DB schema version
    api_version:    string;           // current API version
    env:            "build" | "test" | "staging";
  };
  constraints:      string[];         // hard rules this agent must not violate
  timeout_ms:       number;           // Orchestrator will reassign if exceeded
}

interface AgentOutput {
  task_id:          string;
  agent_id:         string;
  artifact_id:      string;           // unique, deterministic hash of output
  artifact_type:    ArtifactType;
  file_paths:       string[];         // all files written, relative to repo root
  prd_coverage:     string[];         // PRD requirements this output satisfies
  test_ids:         string[];         // tests written that cover this artifact
  self_review: {
    issues_found:   SelfReviewIssue[];
    issues_resolved: SelfReviewIssue[];
    confidence:     number;           // 0.0–1.0
  };
  signal: "DONE" | "BLOCKED" | "NEEDS_HUMAN" | "PARTIAL";
  notes:            string;
}

type ArtifactType =
  | "schema" | "migration" | "api-spec" | "service-code"
  | "test-suite" | "ui-component" | "infrastructure"
  | "documentation" | "config" | "security-policy";
```

### 3.2 Builder Agent Specialisations

| Agent ID | Name | Specialisation | Languages/Tools |
|---|---|---|---|
| `arch-agent` | Architecture Agent | System design, schema, OpenAPI contracts, ADRs | YAML, JSON Schema, OpenAPI 3.1 |
| `db-agent` | Database Agent | Schema design, migrations, indexes, query optimisation | PostgreSQL, Drizzle ORM, migration scripts |
| `crypto-agent` | Cryptography Agent | Encryption, key derivation, HMAC, zero-knowledge primitives | Web Crypto API, libsodium, Node crypto |
| `auth-agent` | Authentication Agent | Auth flows, RBAC, JWT, SAML, OAuth, session management | NextAuth, Passport, JOSE |
| `backend-agent` | Backend Agent | API handlers, business logic, service layer | TypeScript, Node.js, Fastify |
| `api-agent` | API Agent | REST endpoints, validation, rate limiting, versioning | Zod, OpenAPI, rate-limiter-flexible |
| `ui-agent` | UI Agent | Pages, layouts, navigation, data display | React, Next.js, Tailwind |
| `component-agent` | Component Agent | Reusable UI components, design system | React, Storybook, Tailwind |
| `state-agent` | State Agent | Client state, caching, optimistic updates | Zustand, React Query, SWR |
| `infra-agent` | Infrastructure Agent | Cloud resources, networking, storage, HSM | Terraform, AWS CDK, Docker |
| `devops-agent` | DevOps Agent | CI/CD pipelines, deployment, rollback, blue-green | GitHub Actions, Docker, Helm |
| `monitoring-agent` | Monitoring Agent | Observability, alerting, dashboards, SLOs | Datadog, OpenTelemetry, PagerDuty |
| `security-agent` | Security Agent | Threat modelling, penetration patterns, hardening | OWASP, Semgrep, Snyk, custom rules |
| `compliance-agent` | Compliance Agent | SOC2, GDPR, HIPAA controls, audit evidence | Policy documents, control mappings |
| `provider-agent` | Provider Agent | Third-party API integrations, OAuth flows, webhooks | REST, OAuth 2.0, provider SDKs |
| `ide-agent` | IDE Agent | VS Code / JetBrains extensions, LSP | TypeScript, Extension API, LSP protocol |
| `sdk-agent` | SDK Agent | Client SDKs, CLI, language clients | TypeScript, Python, Go |
| `ml-agent` | ML Agent | Pattern classifiers, anomaly detection, scoring models | Python, scikit-learn, regex engines |
| `docs-agent` | Documentation Agent | API docs, changelogs, onboarding guides | Markdown, TypeDoc, Swagger UI |

### 3.3 System Agent Specialisations

| Agent ID | Name | Role |
|---|---|---|
| `orchestrator` | Orchestrator | DAG management, scheduling, gate enforcement, escalation |
| `validator` | Recursive Validator | Executes all 9 validation levels; emits structured findings |
| `fixer-agent` | Fixer Agent | Receives validation failures; patches artifacts; re-triggers validator |
| `merge-agent` | Merge Agent | Integrates lane outputs; runs smoke tests; prepares release candidate |
| `advisor-security` | Security Advisor | Governance council member; security posture review |
| `advisor-quality` | Quality Advisor | Governance council member; code quality and architecture review |
| `advisor-integrity` | Integrity Advisor | Governance council member; system integrity and correctness review |
| `reporter-agent` | Reporter Agent | Generates human-readable phase reports; tracks PRD coverage |

---

## 4. The Governance Council

The Governance Council is a permanent, non-buildng layer. It does not write code. It evaluates every phase before advancement is allowed. All three advisors must issue `APPROVED`. Any single `REJECTED` blocks the phase.

### 4.1 Security Advisor (SA)

**Mandate:** Ensure no phase introduces a security regression or leaves a known vulnerability unaddressed.

**Review Checklist (automated + LLM reasoning):**

```
SA-01  All secrets encrypted at rest with AES-256-GCM — verified by crypto audit
SA-02  No plaintext secrets in logs, error messages, or API responses
SA-03  No hardcoded credentials in any file (Semgrep + Gitleaks scan)
SA-04  All external inputs validated and sanitised (injection prevention)
SA-05  Authentication enforced on all non-public endpoints (auth middleware audit)
SA-06  RBAC correctly applied — permission matrix tested for each role
SA-07  Dependencies scanned for CVEs (Snyk, npm audit) — no HIGH/CRITICAL unresolved
SA-08  Cryptographic primitives used correctly — no homebrew crypto
SA-09  Rate limiting applied to all auth and write endpoints
SA-10  Security headers present on all HTTP responses (CSP, HSTS, X-Frame-Options)
SA-11  TLS 1.3 enforced; no deprecated cipher suites
SA-12  No SSRF, path traversal, or prototype pollution patterns detected
SA-13  JWT/session tokens: correct expiry, rotation, revocation
SA-14  Database queries parameterised — no string concatenation
SA-15  File upload handling safe (if applicable)
```

**Verdict options:** `APPROVED` | `REJECTED (blocking)` | `CONDITIONAL (must fix before merge, not blocking gate)`

### 4.2 Quality Advisor (QA)

**Mandate:** Ensure the codebase is maintainable, well-structured, and built to last.

**Review Checklist:**

```
QA-01  TypeScript strict mode: zero `any` types, no type assertions without justification
QA-02  Test coverage ≥ 80% across all modules; ≥ 90% on crypto, auth, RBAC modules
QA-03  All public API endpoints have integration tests
QA-04  No functions > 50 lines without justification (complexity audit)
QA-05  No circular dependencies (dependency-cruiser)
QA-06  OpenAPI spec matches implementation (contract test pass)
QA-07  Database migrations are reversible (down migration exists and tested)
QA-08  Error handling is explicit — no silent catch blocks
QA-09  Logging is structured (JSON) and at appropriate levels
QA-10  No dead code (knip / ts-prune)
QA-11  Performance benchmarks within defined SLOs (p99 thresholds)
QA-12  Accessibility: WCAG 2.1 AA on all UI components (axe-core scan)
QA-13  Bundle size within budget (UI: main bundle < 200 KB gzipped)
QA-14  API responses are consistent (standard error envelope, pagination)
QA-15  Internationalisation-ready (no hardcoded user-facing strings)
```

### 4.3 Integrity Advisor (IA)

**Mandate:** Ensure the system behaves correctly as a whole — data is consistent, contracts are honoured, and the product matches the PRD.

**Review Checklist:**

```
IA-01  PRD requirement coverage: all requirements in scope for this phase have
       at least one passing test asserting their behaviour
IA-02  Data schema migrations do not destroy or corrupt existing data
       (migration tested against a production-like data snapshot)
IA-03  All async operations handle partial failure safely (no orphaned state)
IA-04  Idempotency: repeated operations produce the same result
IA-05  Distributed consistency: no race conditions in concurrent secret writes
IA-06  Rollback integrity: phase can be rolled back without data loss
IA-07  API versioning: no breaking changes to existing endpoints without version bump
IA-08  Event audit log: every write operation produces a corresponding audit event
IA-09  Configuration is externalised — no environment-specific values in code
IA-10  Feature flags correctly gate in-progress features from production traffic
IA-11  Dependency contracts: all inter-service interfaces match their defined contracts
IA-12  Seed data and fixtures match production-like volume and shape
IA-13  All background jobs are observable (start/end logged, alerting on failure)
IA-14  Graceful degradation: system remains stable if an external dependency fails
IA-15  Phase demo environment is seeded and reachable — human gate is ready
```

### 4.4 Governance Decision Flow

```
                    All 3 Advisors run in parallel
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     SA reviews      QA reviews      IA reviews
           │               │               │
           └───────────────┼───────────────┘
                           │
              All APPROVED? ──── YES ──► Phase advances to Merge Agent
                           │
                          NO
                           │
              Any REJECTED? ──── YES ──► Orchestrator assigns Fixer Agents
                           │             for each REJECTED finding
                           │             Re-run full validation after fixes
                          NO
                           │
              Only CONDITIONAL? ─► Issues logged as tech debt tickets
                                   Phase still advances
                                   Conditionals must clear in next phase
```

---

## 5. Self-Review & Revision System

### 5.1 Philosophy

Every build agent performs a self-review before signalling completion. This is not a checkbox — it is a structured process where the agent:

1. Re-reads its own output against the task requirements
2. Runs its own local test suite
3. Checks its output against the Governance checklists (abridged)
4. Documents what it found and whether it resolved it
5. Only then signals `DONE` — with honesty about remaining uncertainty

### 5.2 Self-Review Loop (Per Agent)

```
Agent completes initial artifact
          │
          ▼
  SELF-REVIEW CYCLE 1
  ├─ Read own output files
  ├─ Run unit tests locally
  ├─ Check against task constraints
  ├─ Run abridged security checklist (SA-01 to SA-05)
  ├─ Run abridged quality checklist (QA-01 to QA-05)
  └─ Identify issues
          │
    Issues found? ──── NO ──► Signal DONE (confidence: high)
          │
         YES
          │
          ▼
  SELF-PATCH (Agent revises own artifact)
          │
          ▼
  SELF-REVIEW CYCLE 2
  (same process)
          │
    Issues found? ──── NO ──► Signal DONE (confidence: medium)
          │
         YES
          │
          ▼
  Signal DONE (confidence: low) + attach issue list
  Orchestrator flags for priority Fixer Agent assignment
```

### 5.3 Revision Escalation Ladder

```
Level 1: Agent Self-Revision     (max 2 cycles, ~minutes)
Level 2: Fixer Agent             (max 2 cycles, ~minutes)
Level 3: Specialist Fixer        (domain-specific Fixer + original agent, ~hours)
Level 4: Human Escalation        (Orchestrator surfaces to human with full context)
```

**The escalation ladder exists to ensure the human is never the first resort, and the system is never permanently stuck.**

### 5.4 Revision Ledger

Every self-revision and fixer action is written to the **Revision Ledger** — a structured log that feeds the Reporter Agent and provides full traceability:

```jsonc
{
  "revision_id": "REV-P1-BE-003-001",
  "task_id": "P1-BE-003",
  "artifact_id": "art-abc123",
  "revision_type": "self-revision | fixer | specialist-fixer",
  "triggered_by": "validation-finding-id",
  "finding_summary": "SQL query uses string concatenation — potential injection",
  "patch_summary": "Replaced string concatenation with parameterised query using Drizzle ORM",
  "validation_result_before": "FAIL",
  "validation_result_after": "PASS",
  "cycles_used": 1,
  "timestamp": "2026-05-09T14:32:11Z"
}
```

---

## 6. Recursive Test Pyramid

All validation runs from the inside out. An outer layer cannot pass if any inner layer is failing.

```
                              ▲
                    L9: Compliance Audit
                  (SOC2/GDPR/PCI controls)
                            ▲
                  L8: Performance & Load
               (SLO thresholds, k6, stress)
                          ▲
              L7: Adversarial / Penetration
           (OWASP Top 10, injection, auth bypass)
                        ▲
          L6: End-to-End Tests
       (Playwright — full user journeys)
                      ▲
        L5: Integration Tests
     (service boundaries, API contracts,
      database interactions, external mocks)
                    ▲
      L4: Service Tests
   (individual service with real DB,
    mocked external dependencies)
                  ▲
    L3: Component Tests
  (UI: React Testing Library
   API: supertest against handlers)
                ▲
  L2: Unit Tests
(pure functions, crypto, pattern matching,
 RBAC rules, validation logic)
              ▲
L1: Static Analysis
(TypeScript strict, ESLint, Semgrep,
 Gitleaks, dependency-audit)
```

### Layer Definitions & Pass Criteria

| Level | Scope | Tools | Pass Criteria | Who Runs It |
|---|---|---|---|---|
| L1 Static | All files | tsc, ESLint, Semgrep, Gitleaks, Snyk | Zero errors, zero hardcoded secrets, zero CVE HIGH+ | Validator Agent |
| L2 Unit | Functions & modules | Vitest | ≥ 80% line coverage; ≥ 90% on security modules; all tests pass | Validator Agent |
| L3 Component | Service handlers, UI components | Vitest + RTL, supertest | All component tests pass; UI renders without errors; a11y scan clean | Validator Agent |
| L4 Service | Single service with real DB | Vitest, Testcontainers | All service tests pass; migrations run clean; no data corruption | Validator Agent |
| L5 Integration | Multi-service, API contract | Vitest, Prism, Pact | OpenAPI contract tests pass; provider mocks aligned; all boundary tests pass | Validator Agent |
| L6 End-to-End | Full application | Playwright | All defined user journeys complete without error; screenshots captured | Validator Agent |
| L7 Adversarial | Security surface | OWASP ZAP, custom pentest scripts | No critical/high findings; all auth checks enforced | Security Advisor |
| L8 Performance | Load-bearing paths | k6, Grafana | p99 < targets; no memory leaks over 10-min soak; error rate < 0.1% | Validator Agent |
| L9 Compliance | Entire phase output | Custom control mapper | All in-scope controls have passing evidence | Compliance Agent |

---

## 7. Human Touchpoint Protocol

### 7.1 Interaction Model

Human interaction is **restricted to one event per phase**: a confirmation that the deployed product for that phase works as expected. The human does not review code, read reports, or approve individual tasks.

**What the human receives at each gate:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ENVAULT PHASE [N] READY FOR CONFIRMATION                       │
│                                                                 │
│  Environment URL:  https://phase-N.envault.dev                  │
│  Demo credentials: [auto-provisioned, displayed once]           │
│  Phase summary:    [3-bullet plain-English summary]             │
│  New capabilities: [list of what's new — no jargon]             │
│                                                                 │
│  INSTRUCTION: Use the product. Complete the tasks below.        │
│  You are testing, not reading. No code review required.         │
│                                                                 │
│  TASKS FOR THIS PHASE:                                          │
│  [ ] Task 1: [specific, concrete action]                        │
│  [ ] Task 2: [specific, concrete action]                        │
│  [ ] Task 3: [specific, concrete action]                        │
│                                                                 │
│  RESPONSE OPTIONS:                                              │
│  [CONFIRM PASS]  — ready to proceed to Phase [N+1]             │
│  [CONFIRM FAIL]  — something is broken (describe below)         │
│  [REQUEST CHANGE] — works but I want something different        │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Human Gate Tasks Per Phase

| Phase | Human Tasks at Gate |
|---|---|
| **Phase 0** | Log in. Create a project. See the empty vault. Confirm the UI loads and feels right. |
| **Phase 1** | Add 5 secrets across 3 environments. Reveal a value. Copy it. Export as .env. Delete one. Confirm all work. |
| **Phase 2** | Add a duplicate key. Confirm the conflict alert fires. Add a key to prod but not dev. Confirm missing-key warning. View the health score. Confirm the diff view. |
| **Phase 3** | Generate a JWT secret using Secret Forge. Set a 30-day rotation policy. Trigger a manual rotation. Confirm the new value is active. |
| **Phase 4** | Simulate a breach (test mode). Confirm the alert fires within 60 seconds. Confirm the mitigation workflow presents correctly. |
| **Phase 5** | Connect to Vercel. Push secrets. Confirm they appear in Vercel dashboard. Install VS Code extension. Confirm secrets inject into terminal. |
| **Phase 6** | Invite a Viewer. Confirm they cannot reveal secrets. Request JIT access. Approve it. Confirm access expiry. Download a SOC2 evidence report. |

### 7.3 Handling Human Failure Reports

If human confirms `FAIL` or `REQUEST CHANGE`:

```
Human input → Reporter Agent formats as structured finding
                         │
                         ▼
             Orchestrator maps to task(s)
                         │
                         ▼
             Relevant build agents assigned revision
                         │
                         ▼
             Full validation cascade re-runs
                         │
                         ▼
             Governance Council re-reviews
                         │
                         ▼
             New demo deployed
                         │
                         ▼
             Human re-confirms (same gate, no phase advance)
```

---

## 8. Phase 0 — Foundation Bootstrap

### Goal
Establish the complete technical foundation: monorepo, toolchain, database schema, API contracts, authentication skeleton, infrastructure, and CI/CD pipeline. No user-visible features. All downstream agents depend on Phase 0 outputs.

### Entry Criteria
- PRD v1.0 locked
- Tech stack decisions finalised (see below)
- Repository created with branch protection enabled

### Tech Stack Decisions (fixed at Phase 0)

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | Node.js 22 LTS + TypeScript 5.5 strict | Ecosystem depth, type safety |
| Framework | Next.js 15 (App Router) | Full-stack, SSR, edge-ready |
| Database | PostgreSQL 16 (Supabase or RDS) | ACID, JSON support, row-level security |
| ORM | Drizzle ORM | Type-safe, migration-native, no magic |
| Auth | NextAuth v5 + custom JWT | Flexible, supports SAML extension |
| Validation | Zod | Runtime + compile-time safety |
| API | REST + tRPC (internal) | REST for external; tRPC for type-safe internal |
| Crypto | Web Crypto API + libsodium-wrappers | Audited primitives, WASM-portable |
| UI | React 19 + Tailwind CSS 4 | Component model, utility-first |
| State | Zustand (client) + React Query (server) | Minimal, predictable |
| Testing | Vitest + Playwright + Testing Library | Fast, unified runner |
| Infrastructure | AWS (ECS Fargate + RDS + CloudHSM + S3) | Production-grade, HSM available |
| IaC | Terraform | Reproducible, auditable |
| CI/CD | GitHub Actions | Native to repo, wide action ecosystem |
| Monitoring | OpenTelemetry → Datadog | Vendor-neutral instrumentation |
| Secrets (meta) | AWS Secrets Manager | EnVault's own config — not circular |

---

### Phase 0 Task DAG

```
P0-ARCH-001 ──────────────────────────────────────────────────────────┐
(System Architecture & ADRs)                                          │
          │                                                            │
          ├──────────────────┬────────────────────┐                   │
          ▼                  ▼                    ▼                   │
P0-DB-001              P0-API-001           P0-INF-001                │
(DB Schema v1)         (OpenAPI Spec v1)    (IaC — core AWS)          │
     │                      │                    │                    │
     ▼                      ▼                    ▼                    │
P0-DB-002              P0-API-002           P0-INF-002                │
(Migration runner)     (API types codegen)  (CI/CD pipeline)          │
     │                      │                    │                    │
     └──────────────┬────────┘                   │                    │
                    ▼                            │                    │
              P0-AUTH-001                        │                    │
              (Auth skeleton)                    │                    │
                    │                            │                    │
                    └────────────────────────────┤                    │
                                                 ▼                    │
                                          P0-MONO-001                 │
                                          (Monorepo config,           │
                                           toolchain, lint,           │
                                           test runner)               │
                                                 │                    │
                                                 ▼                    │
                                          P0-SEC-001  ◄───────────────┘
                                          (Security baseline:
                                           headers, rate limits,
                                           audit log schema,
                                           secrets policy)
```

### Phase 0 Task Definitions

| Task ID | Name | Agent | Depends On | Output Artifacts | Acceptance Criteria |
|---|---|---|---|---|---|
| **P0-ARCH-001** | System Architecture & ADRs | `arch-agent` | None | `docs/adr/*.md`, `docs/architecture.md`, system diagram | All key decisions documented; tech stack locked; no ambiguity in service boundaries |
| **P0-DB-001** | Database Schema v1 | `db-agent` | P0-ARCH-001 | `db/schema.ts`, entity-relationship diagram | Schema covers: users, organisations, projects, environments, secrets (encrypted), audit_events, versions; all foreign keys correct; RLS policies defined |
| **P0-DB-002** | Migration Runner & Seed | `db-agent` | P0-DB-001 | `db/migrations/`, `db/seed.ts` | `drizzle-kit push` runs cleanly; `drizzle-kit generate` produces valid SQL; seed populates test data; `down` migration tested |
| **P0-API-001** | OpenAPI Specification v1 | `arch-agent` | P0-ARCH-001 | `api/openapi.yaml` | Valid OpenAPI 3.1; all Phase 1 endpoints defined; request/response schemas complete; security schemes defined; Prism mock server starts successfully |
| **P0-API-002** | API Types Codegen | `api-agent` | P0-API-001 | `packages/api-types/`, `packages/api-client/` | Generated TypeScript types match spec; no manual type definitions for API shapes; client package builds and exports correctly |
| **P0-INF-001** | Core AWS Infrastructure | `infra-agent` | P0-ARCH-001 | `infra/terraform/`, `infra/docker/` | `terraform plan` shows no errors; VPC, ECS cluster, RDS, S3, CloudHSM, IAM roles provisioned; `docker build` succeeds for all services |
| **P0-INF-002** | CI/CD Pipeline | `devops-agent` | P0-INF-001, P0-MONO-001 | `.github/workflows/*.yml` | Pipeline runs on push; stages: lint → test → build → security scan → deploy to staging; all stages complete in < 10 min; deployment to staging succeeds |
| **P0-AUTH-001** | Authentication Skeleton | `auth-agent` | P0-DB-001, P0-API-001 | `lib/auth/`, `app/api/auth/` | NextAuth configured; email/password and Google OAuth work; session tokens issued; JWT structure validated; protected routes return 401 without valid session |
| **P0-MONO-001** | Monorepo Configuration & Toolchain | `devops-agent` | P0-ARCH-001 | `package.json`, `turbo.json`, `tsconfig.json`, `.eslintrc`, `vitest.config.ts` | `pnpm install` succeeds; `pnpm build` builds all packages in dependency order; `pnpm test` runs all test suites; `pnpm lint` runs with zero violations |
| **P0-SEC-001** | Security Baseline | `security-agent` | P0-AUTH-001, P0-API-001 | `lib/security/`, `middleware.ts`, `docs/security-policy.md` | Security headers middleware applied (CSP, HSTS, X-Frame); rate limiting on auth endpoints (10 req/min); request ID on all responses; audit_event write function implemented; Semgrep baseline scan passes |

### Phase 0 Parallel Execution Plan

```
TIME →
Lane A (arch):     [P0-ARCH-001] ──────────────────────────────────────────────
Lane B (db):                     [P0-DB-001] ──[P0-DB-002]─────────────────────
Lane C (api):                    [P0-API-001]──[P0-API-002]────────────────────
Lane D (infra):                  [P0-INF-001]──[P0-INF-002]────────────────────
Lane E (auth+sec):                            [P0-AUTH-001]──[P0-SEC-001]──────
Lane F (devops):                 [P0-MONO-001]──────────────────────────────────
                                                                        │
                                                              ◄──────── │
                                                          VALIDATE ALL  │
                                                          GOVERNANCE    │
                                                          HUMAN GATE ───┘
```

### Phase 0 Stability Gate Criteria

```
✓ terraform plan: 0 errors, 0 destructive changes
✓ docker build: all images build successfully
✓ pnpm build: zero TypeScript errors across monorepo
✓ pnpm test: all tests pass (expected: ~50 unit tests)
✓ pnpm lint: zero violations
✓ Semgrep: zero critical/high findings
✓ OpenAPI spec: valid, mock server starts
✓ DB migrations: apply and rollback cleanly on empty database
✓ Auth: login/logout/session round-trip works in staging
✓ CI/CD: pipeline deploys to staging in < 10 minutes
✓ PRD coverage: all Phase 0 requirements have passing assertions
```

---

## 9. Phase 1 — Core Vault

### Goal
Implement the encrypted secret vault: full CRUD, AES-256-GCM encryption, version history, secret types, bulk import/export, and the complete vault UI. First fully functional user-facing feature set.

### Entry Criteria
All Phase 0 stability gate criteria met. Human confirmed Phase 0 gate.

### Phase 1 Task DAG

```
P1-CRYPTO-001
(Encryption library:
 AES-256-GCM, PBKDF2,
 key derivation)
     │
     ├────────────────────────────────┐
     ▼                                ▼
P1-BE-001                       P1-BE-002
(Secret service:                (Version history
 CRUD + encrypt/decrypt)         service)
     │                                │
     ├────────────────────────────────┤
     ▼                                │
P1-BE-003                            │
(Bulk import/export service)         │
     │                                │
     └──────────────┬─────────────────┘
                    ▼
              P1-API-001
              (REST endpoints:
               secrets CRUD,
               versions, export)
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
    P1-UI-001             P1-UI-002
    (Vault table UI:      (Secret modal:
     list, search,         add/edit/delete,
     filter, mask/reveal)  type picker, generator stub)
          │                    │
          └─────────┬──────────┘
                    ▼
              P1-UI-003
              (Import/export UI,
               bulk actions)
                    │
                    ▼
              P1-E2E-001
              (Full vault user
               journey tests)
```

### Phase 1 Task Definitions

| Task ID | Name | Agent | Depends On | Output Artifacts | Acceptance Criteria |
|---|---|---|---|---|---|
| **P1-CRYPTO-001** | Encryption Library | `crypto-agent` | P0-SEC-001 | `lib/crypto/encrypt.ts`, `lib/crypto/decrypt.ts`, `lib/crypto/derive-key.ts`, `lib/crypto/__tests__/` | AES-256-GCM encrypt/decrypt round-trip correct; PBKDF2 with 600,000 iterations; IV unique per encryption; ciphertext + IV stored as base64; 100% test coverage on crypto module; known-answer tests pass; no plaintext ever logged |
| **P1-BE-001** | Secret Service | `backend-agent` | P1-CRYPTO-001, P0-DB-001 | `services/secret/`, `repositories/secret.ts` | Create/read/update/delete operations correct; all values encrypted before DB write; all values decrypted after DB read only when authorised; RBAC enforced at service layer; secret type validation applied; audit event emitted on every write |
| **P1-BE-002** | Version History Service | `backend-agent` | P1-BE-001 | `services/version/`, `repositories/version.ts` | Every secret update stores previous version; last 20 versions retained; restore from version works correctly; version timestamps accurate; cascade delete handled |
| **P1-BE-003** | Bulk Import/Export Service | `backend-agent` | P1-BE-001 | `services/import/`, `services/export/` | .env file parsed correctly (comments, quoted values, multiline); duplicate detection on import with conflict report; export in .env / JSON / YAML / shell formats; export never touches server logs; import validated against Zod schema before write |
| **P1-API-001** | Vault REST Endpoints | `api-agent` | P1-BE-001, P1-BE-002, P1-BE-003, P0-API-001 | `app/api/secrets/`, `app/api/export/`, `app/api/import/` | All endpoints match OpenAPI spec; contract tests pass; authentication required on all routes; authorisation tested for each role; rate limiting applied to write routes; paginated list endpoint; input sanitisation on all fields |
| **P1-UI-001** | Vault Table UI | `ui-agent` | P1-API-001 | `app/(vault)/`, `components/vault/VaultTable.tsx`, `components/vault/SearchBar.tsx` | Secrets listed with key name, type badge, masked value, last-updated; search filters in real-time; reveal button shows value (role-permissioned); copy-to-clipboard works; empty state shown; loading skeleton shown; keyboard-accessible |
| **P1-UI-002** | Secret Modal (Add/Edit/Delete) | `component-agent` | P1-API-001 | `components/vault/SecretModal.tsx`, `components/vault/TypePicker.tsx` | Add form: key name (UPPER_SNAKE forced), type picker, value field, description, isSecret toggle; edit pre-fills; delete requires confirmation; validation errors shown inline; form submits optimistically; API errors surfaced gracefully |
| **P1-UI-003** | Import/Export UI | `ui-agent` | P1-BE-003 | `components/vault/ImportModal.tsx`, `components/vault/ExportModal.tsx` | Drag-and-drop .env upload; paste area; conflict preview before commit; format selector for export; download triggered correctly; no value in URL or console log |
| **P1-E2E-001** | Vault E2E Test Suite | `validator` | P1-UI-003 | `e2e/vault.spec.ts` | Full journey: login → create project → add 5 secrets → reveal one → copy one → edit one → delete one → export → import — all assertions pass |

### Phase 1 Parallel Execution Plan

```
TIME →
Lane A (crypto):  [P1-CRYPTO-001]──────────────────────────────────────────────
Lane B (backend):                  [P1-BE-001]──[P1-BE-002]──[P1-BE-003]──────
Lane C (api):                                                [P1-API-001]───────
Lane D (ui):                                                [P1-UI-001]─────────
                                                            [P1-UI-002]─────────
                                                            [P1-UI-003]─────────
Lane E (e2e):                                                           [P1-E2E-001]
                                                                              │
                                                                   VALIDATE ──┤
                                                                   GOVERNANCE  │
                                                                   HUMAN GATE ─┘
```

### Phase 1 Stability Gate Criteria

```
✓ Known-answer cryptography tests: all pass
✓ Encrypt → store → retrieve → decrypt: value matches original for all secret types
✓ Role permission matrix: 36 role/action combinations tested (6 roles × 6 actions)
✓ Bulk import: 500-secret .env file imports correctly in < 2 seconds
✓ Export: exported file parses back to identical set
✓ Version history: 20 versions stored and retrievable
✓ API contract: all endpoints match OpenAPI spec (Prism validation)
✓ Unit test coverage: ≥ 90% crypto, ≥ 80% all other modules
✓ E2E: full vault journey passes on Chromium + Firefox + WebKit
✓ Performance: single secret read p99 < 50ms; list 100 secrets p99 < 200ms
✓ Security: Semgrep, Gitleaks, OWASP ZAP — zero critical/high findings
✓ PRD coverage: FR-V-01 through FR-V-10 all have passing tests
```

**Human Gate Tasks (Phase 1):**
Add 5 secrets across 3 environments. Reveal a secret value and confirm it's correct. Copy a value and paste it. Export the environment as .env and confirm the file contains the right keys. Delete a secret and confirm it disappears.

---

## 10. Phase 2 — Environment Intelligence

### Goal
Implement the multi-environment model, cross-environment diffing, the Intelligence Engine (conflict detection, health scoring, smart grouping), and the environment management UI.

### Entry Criteria
Phase 1 stability gate passed. Human confirmed Phase 1 gate.

### Phase 2 Task DAG

```
P2-BE-001                    P2-ML-001
(Environment service:        (Pattern library:
 CRUD, inheritance,          400+ secret format
 locking, snapshots)         regexes + classifiers)
     │                            │
     │                       P2-ML-002
     │                       (Secret type
     │                        classifier)
     │                            │
     ├────────────────────────────┤
     ▼                            ▼
P2-INTEL-001               P2-INTEL-002
(Diff engine:              (Anomaly detectors:
 cross-env comparison,      duplicates, type mismatch,
 drift calculation)         misclassification,
                            plaintext secrets,
                            naming conventions)
     │                            │
     └──────────────┬─────────────┘
                    ▼
              P2-INTEL-003
              (Health score engine:
               completeness, hygiene,
               security posture,
               drift state)
                    │
              P2-INTEL-004
              (Smart grouping engine:
               auto-group by service,
               tag inference)
                    │
              P2-API-001
              (Intelligence API:
               diff, health score,
               findings, groups)
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
    P2-UI-001             P2-UI-002
    (Env tabs, key         (Diff view:
     registry, presence     side-by-side
     matrix)                comparison)
          │                    │
          ▼                    ▼
    P2-UI-003             P2-UI-004
    (Health score          (Intelligence
     dashboard)             panel: findings,
                            suggestions,
                            smart groups)
                    │
                    ▼
              P2-E2E-001
              (Intelligence journeys:
               conflict detection,
               health score,
               diff view)
```

### Phase 2 Task Definitions

| Task ID | Name | Agent | Depends On | Output Artifacts | Acceptance Criteria |
|---|---|---|---|---|---|
| **P2-BE-001** | Environment Service | `backend-agent` | P0-DB-001 | `services/environment/`, `repositories/environment.ts` | CRUD on environments; inheritance model (child overrides parent); locking prevents writes without elevated auth; snapshot/restore preserves all secrets at point-in-time; promotion workflow creates diff preview before write |
| **P2-ML-001** | Secret Pattern Library | `ml-agent` | None | `lib/detection/patterns.ts`, `lib/detection/patterns.test.ts` | ≥ 400 secret format patterns; coverage: AWS, GCP, Azure, Stripe, GitHub, Twilio, SendGrid, OpenAI, JWT, private keys, connection strings; false positive rate < 2% on test corpus of 10,000 synthetic values |
| **P2-ML-002** | Secret Type Classifier | `ml-agent` | P2-ML-001 | `lib/detection/classifier.ts` | Classify value into: `api-key | connection-string | jwt-secret | private-key | oauth-token | url | generic-string` with confidence score; ≥ 95% accuracy on labelled test set; runs synchronously in < 5ms per value |
| **P2-INTEL-001** | Diff Engine | `backend-agent` | P2-BE-001 | `services/intelligence/diff.ts` | Produces structured diff for any two environments: missing-in-A, missing-in-B, value-drift, identical, type-mismatch; diff is deterministic; handles 1,000-key environments in < 100ms |
| **P2-INTEL-002** | Anomaly Detectors | `ml-agent` | P2-ML-002, P2-INTEL-001 | `services/intelligence/detectors/` | Detector modules: `duplicate`, `type-mismatch`, `misclassification`, `plaintext-secret`, `naming-convention`, `missing-key`, `weak-value`; each emits structured Finding with severity, message, suggested fix; all detectors have ≥ 95% precision on test set |
| **P2-INTEL-003** | Health Score Engine | `ml-agent` | P2-INTEL-002 | `services/intelligence/health-score.ts` | Produces 0–100 score for each environment; score is deterministic given same inputs; sub-scores for: completeness, hygiene, security posture, drift; score changes predictably when issues are resolved; test suite covers score boundary conditions |
| **P2-INTEL-004** | Smart Grouping Engine | `ml-agent` | P2-ML-001 | `services/intelligence/grouping.ts` | Auto-groups keys by detected service (Stripe, AWS, DB, Auth, etc.); unknown keys grouped as "Other"; groups survive key rename; grouping runs in < 50ms for 500-key vault |
| **P2-API-001** | Intelligence REST Endpoints | `api-agent` | P2-INTEL-001 through P2-INTEL-004, P0-API-001 | `app/api/intelligence/` | Endpoints: `GET /diff`, `GET /health-score`, `GET /findings`, `GET /groups`; all cached with 30s TTL (cache invalidated on write); all return structured responses matching OpenAPI spec |
| **P2-UI-001** | Environment Tabs & Key Registry | `ui-agent` | P2-API-001 | `components/environments/EnvTabs.tsx`, `components/environments/KeyRegistry.tsx` | Tab per environment; presence matrix shows which keys exist in which env; missing keys highlighted in red; inherited values visually distinct; environment lock indicator |
| **P2-UI-002** | Diff View | `component-agent` | P2-API-001 | `components/environments/DiffView.tsx` | Side-by-side comparison of any two environments; categories: missing, drifted, identical, type-mismatch; one-click resolution for each finding; colour-coded; keyboard-accessible |
| **P2-UI-003** | Health Score Dashboard | `ui-agent` | P2-API-001 | `components/intelligence/HealthScore.tsx` | Gauge chart 0–100; sub-scores visible; trend over time (7-day sparkline); drill-down to specific findings; real-time refresh on secret write |
| **P2-UI-004** | Intelligence Panel | `ui-agent` | P2-API-001 | `components/intelligence/FindingsPanel.tsx`, `components/intelligence/GroupView.tsx` | Findings listed by severity; each finding shows: key name, issue, suggested fix, one-click resolve; smart groups as collapsible sections; suggestion cards (naming, descriptions, expiry) |
| **P2-E2E-001** | Intelligence E2E Suite | `validator` | All P2-UI | `e2e/intelligence.spec.ts` | Journey 1: add duplicate key → alert fires immediately. Journey 2: add key to prod not dev → missing-key alert. Journey 3: view diff between staging and prod → categories correct. Journey 4: health score changes when finding is resolved |

### Phase 2 Stability Gate Criteria

```
✓ Diff engine: correct output for all 5 diff categories on 20 test case pairs
✓ Duplicate detector: fires within 200ms of key creation
✓ Missing-key detector: fires on all 3 tested scenarios
✓ Plaintext secret detector: detects 400/400 pattern types in test corpus
✓ Health score: deterministic; changes correctly when findings resolve
✓ Smart grouping: correctly categorises 95%+ of keys in test vault
✓ Performance: intelligence scan of 500-key vault completes in < 500ms
✓ API contract: all intelligence endpoints match OpenAPI spec
✓ E2E: all 4 intelligence journeys pass on 3 browsers
✓ PRD coverage: FR-I-01 through FR-I-15 all have passing tests
```

**Human Gate Tasks (Phase 2):**
Add a key that already exists — confirm the duplicate alert appears immediately. Add a key to production but not development — confirm the missing-key warning appears. Open the diff view between staging and production — confirm the differences are shown correctly. Look at the health score and confirm it reflects the issues you've introduced.

---

## 11. Phase 3 — Key Lifecycle & Rotation

### Goal
Implement the Secret Forge (key generator), rotation policies, automated rotation for supported providers, rotation scheduling, and the rotation health dashboard.

### Entry Criteria
Phase 2 stability gate passed. Human confirmed Phase 2 gate.

### Phase 3 Task Definitions

| Task ID | Name | Agent | Depends On | Output Artifacts | Acceptance Criteria |
|---|---|---|---|---|---|
| **P3-CRYPTO-001** | Secret Forge Engine | `crypto-agent` | P1-CRYPTO-001 | `lib/forge/generators.ts` | Generators for all 9 formats (hex, base64, UUID, API-key, RSA, Ed25519, ECDSA, bcrypt, passphrase); all use Web Crypto API or libsodium; entropy calculation correct; known-answer tests; generation time < 100ms for all types |
| **P3-BE-001** | Rotation Policy Service | `backend-agent` | P0-DB-001 | `services/rotation/policy.ts`, `db/migrations/add_rotation_policy.ts` | CRUD on rotation policies per secret; schedule stored as cron expression; next_rotation_at computed correctly; overdue detection; dry-run mode returns blast radius without executing |
| **P3-BE-002** | Rotation Execution Engine | `backend-agent` | P3-BE-001, P3-CRYPTO-001 | `services/rotation/executor.ts`, `workers/rotation-worker.ts` | Executes rotation: generate new value → encrypt → write → emit audit event → mark old for grace-period revocation; idempotent (re-run safe); partial failure rolls back; works for manual and scheduled triggers |
| **P3-INT-001** | Provider Rotation Adapters | `provider-agent` | P3-BE-002 | `lib/providers/rotation/stripe.ts`, `github.ts`, `twilio.ts`, `aws-iam.ts`, `sendgrid.ts`, `clerk.ts` | Each adapter: authenticate, generate new key via provider API, confirm, return new value; test against provider sandboxes; timeout handling; error mapped to structured RotationError; adapter contract tests with Nock mocks |
| **P3-BE-003** | Rotation Scheduler | `devops-agent` | P3-BE-001 | `workers/rotation-scheduler.ts`, `infra/terraform/scheduler.tf` | Runs on configurable interval (default: hourly); queries for due rotations; enqueues rotation jobs; respects business hours config; missed rotations re-enqueued with backoff; no duplicate executions (distributed lock) |
| **P3-API-001** | Rotation REST Endpoints | `api-agent` | P3-BE-002, P3-INT-001 | `app/api/rotation/` | Endpoints: trigger rotation, set policy, get rotation history, get rotation dashboard; admin-only trigger; audit event on all rotation calls |
| **P3-UI-001** | Secret Forge UI | `component-agent` | P3-CRYPTO-001 | `components/forge/SecretForge.tsx`, `components/forge/EntropyMeter.tsx` | Format picker with preview; entropy meter (bits + crack-time); generate button; copy without save option; save to vault option; generate a set of related secrets (e.g., full auth suite) |
| **P3-UI-002** | Rotation Policy UI | `ui-agent` | P3-API-001 | `components/rotation/RotationPolicy.tsx`, `components/rotation/RotationDashboard.tsx` | Policy form: manual / scheduled (preset + custom cron); next rotation date displayed; rotation history timeline; overdue keys highlighted; dry-run preview modal showing blast radius |
| **P3-E2E-001** | Key Lifecycle E2E Suite | `validator` | All P3-UI | `e2e/rotation.spec.ts` | Journey 1: generate JWT secret via Forge → save → confirm entropy shown. Journey 2: set 30-day policy → trigger manual rotation → confirm new value active → confirm audit entry. Journey 3: view rotation dashboard → overdue keys listed |

### Phase 3 Parallel Execution Plan

```
TIME →
Lane A (crypto):  [P3-CRYPTO-001]────────────────────────────────────────────
Lane B (backend): [P3-BE-001]────[P3-BE-002]────[P3-BE-003]──────────────────
Lane C (integ):                  [P3-INT-001]────────────────────────────────
Lane D (api):                               [P3-API-001]─────────────────────
Lane E (ui):                                [P3-UI-001]──[P3-UI-002]──────────
Lane F (e2e):                                                     [P3-E2E-001]
```

### Phase 3 Stability Gate Criteria

```
✓ Secret Forge: all 9 generator types produce cryptographically valid output
✓ Entropy calculation: matches reference values for each format
✓ Rotation execution: end-to-end rotation cycle completes and is audited
✓ Provider adapters: all 6 adapters pass contract tests against mocks
✓ Scheduler: no duplicate executions in 1,000-run stress test
✓ Dry-run: blast radius correctly lists all affected environments/integrations
✓ Partial failure: rotation rolls back cleanly (tested with injected failures)
✓ E2E: all 3 lifecycle journeys pass
✓ PRD coverage: FR-K-01 through FR-K-09 all have passing tests
```

**Human Gate Tasks (Phase 3):**
Open the Secret Forge. Generate a JWT secret and confirm the entropy meter shows a strong rating. Save it to the vault. Set a 30-day rotation policy. Trigger a manual rotation. Confirm the vault shows the new value and the old value appears in version history.

---

## 12. Phase 4 — Breach Detection & Mitigation

### Goal
Implement breach detection (git scanning, HIBP fingerprint matching), real-time alerting, the automated mitigation workflow, value fingerprinting, and the post-incident report generator.

### Entry Criteria
Phase 3 stability gate passed. Human confirmed Phase 3 gate.

### Phase 4 Task Definitions

| Task ID | Name | Agent | Depends On | Output Artifacts | Acceptance Criteria |
|---|---|---|---|---|---|
| **P4-CRYPTO-001** | Value Fingerprinting | `crypto-agent` | P1-CRYPTO-001 | `lib/detection/fingerprint.ts` | HMAC-SHA256 fingerprint generated on every secret write; fingerprint stored separately from encrypted value; fingerprint lookup is O(1); round-trip: fingerprint never reveals original value (property-based tests) |
| **P4-ML-001** | Git Scanning Engine | `ml-agent` | P2-ML-001 | `lib/detection/git-scanner.ts`, `workers/git-scan-worker.ts` | Scans push payloads from GitHub webhook; matches against 400+ pattern library; emits structured Finding within < 60s of push; false positive rate < 2%; processes diffs only (not full repo on each push) |
| **P4-ML-002** | HIBP Fingerprint Checker | `ml-agent` | P4-CRYPTO-001 | `lib/detection/hibp-checker.ts`, `workers/hibp-worker.ts` | Queries HIBP k-Anonymity API with fingerprint prefix; matches against leaked credential DB; runs on schedule per secret; no full value transmitted to HIBP; rate-limited to stay within HIBP API limits |
| **P4-BE-001** | Breach Event Service | `backend-agent` | P4-ML-001, P4-ML-002 | `services/breach/`, `db/migrations/add_breach_events.ts` | Stores breach events with: source, detected_at, affected_secret_id, exposure_window, severity; deduplication (same secret, same source within 1h is one event); status lifecycle: detected → confirmed → mitigated |
| **P4-BE-002** | Mitigation Workflow Engine | `backend-agent` | P4-BE-001, P3-BE-002 | `services/breach/mitigation.ts` | On confirmed breach: lock environment, trigger rotation for affected key, push new value to connected integrations, mark old key for revocation at provider; all steps are logged; partial failure is retried; mitigation plan is a structured object (previewable before execution) |
| **P4-BE-003** | Alert Dispatcher | `backend-agent` | P4-BE-001 | `services/alerts/dispatcher.ts`, `lib/alerts/email.ts`, `lib/alerts/slack.ts` | Sends alert via: in-app notification (< 5s), email (< 30s), Slack webhook (< 30s); alert contains: affected key name, detection source, exposure window, one-click mitigation link; no secret value in alert payload |
| **P4-BE-004** | Incident Report Generator | `backend-agent` | P4-BE-002 | `services/breach/incident-report.ts` | Generates structured incident report post-mitigation; fields: timeline, affected systems, remediation steps taken, prevention recommendations; exportable as PDF; test with 5 synthetic incident scenarios |
| **P4-API-001** | Breach REST Endpoints | `api-agent` | P4-BE-001 through P4-BE-004 | `app/api/breach/` | Endpoints: get breach events, get mitigation plan (preview), execute mitigation, get incident report; admin-only for execute; all actions audit-logged |
| **P4-UI-001** | Breach Alert UI | `ui-agent` | P4-API-001 | `components/breach/BreachAlert.tsx`, `components/breach/MitigationWorkflow.tsx` | Alert banner appears within 5 seconds of breach detection; severity badge; exposure window; step-by-step mitigation workflow with confirm dialog; progress indicator during mitigation; success/failure state |
| **P4-UI-002** | Breach History & Incident Reports | `ui-agent` | P4-API-001 | `components/breach/BreachHistory.tsx`, `components/breach/IncidentReport.tsx` | Timeline of past breach events; status indicators; link to incident report; report rendered in UI and downloadable as PDF |
| **P4-E2E-001** | Breach Detection E2E Suite | `validator` | All P4-UI | `e2e/breach.spec.ts` | Journey 1: simulate git push with exposed secret (test mode) → alert fires within 60 seconds → alert banner visible. Journey 2: open mitigation workflow → preview plan → execute → confirm new value active. Journey 3: download incident report → confirm contents |

### Phase 4 Stability Gate Criteria

```
✓ Fingerprinting: HMAC-SHA256 output stable; collision probability negligible (property tests)
✓ Git scanner: detects 400/400 known-format secrets in test push payloads
✓ Git scanner: false positive rate < 2% on 1,000 benign push payloads
✓ Alert delivery: in-app < 5s, email < 30s, Slack < 30s (measured in test environment)
✓ Mitigation workflow: executes all steps, logs all, handles partial failure
✓ Incident report: all 5 synthetic scenarios produce complete reports
✓ No secret value in any alert, log, or report payload (automated assertion)
✓ E2E: all 3 breach journeys pass
✓ PRD coverage: FR-B-01 through FR-B-10 all have passing tests
```

**Human Gate Tasks (Phase 4):**
The system will simulate a breach in test mode. Observe: does the alert appear within 60 seconds? Open the mitigation workflow and preview the plan. Execute the mitigation. Confirm the secret has been rotated and the breach event is marked as resolved.

---

## 13. Phase 5 — IDE & Hosting Integrations

### Goal
Build the VS Code extension, JetBrains plugin, and full two-way sync with Vercel, Render, Railway, and Fly.io. Implement the provider drift dashboard.

### Entry Criteria
Phase 4 stability gate passed. Human confirmed Phase 4 gate.

### Phase 5 Task Definitions

| Task ID | Name | Agent | Depends On | Output Artifacts | Acceptance Criteria |
|---|---|---|---|---|---|
| **P5-INT-001** | Provider Sync Engine | `provider-agent` | P2-BE-001 | `lib/providers/sync/engine.ts`, `lib/providers/sync/conflict-resolver.ts` | Bidirectional sync: vault → provider and provider → vault; drift detection (value differs between vault and provider); conflict resolution modes: vault-wins, provider-wins, manual; sync is atomic (all-or-nothing per environment) |
| **P5-INT-002** | Vercel Adapter | `provider-agent` | P5-INT-001 | `lib/providers/vercel/` | OAuth with Vercel; list projects; read/write env vars per environment (production/preview/development); selective sync (exclude list); trigger redeploy; detect drift; all operations idempotent |
| **P5-INT-003** | Render Adapter | `provider-agent` | P5-INT-001 | `lib/providers/render/` | API key auth; list services and env groups; sync env vars; trigger deploy on change; drift detection |
| **P5-INT-004** | Railway Adapter | `provider-agent` | P5-INT-001 | `lib/providers/railway/` | OAuth with Railway; list projects and environments; read/write variables; drift detection |
| **P5-INT-005** | Fly.io Adapter | `provider-agent` | P5-INT-001 | `lib/providers/fly/` | API token auth; list apps; sync secrets via Fly API; drift detection |
| **P5-API-001** | Integration REST Endpoints | `api-agent` | P5-INT-001 through P5-INT-005 | `app/api/integrations/` | Endpoints: list connected integrations, connect (OAuth flow), disconnect, sync now, get sync status, get drift, resolve conflict; all audit-logged |
| **P5-UI-001** | Integration Management UI | `ui-agent` | P5-API-001 | `components/integrations/IntegrationList.tsx`, `components/integrations/ConnectModal.tsx` | Integration list with connection status; connect flow (OAuth popup or API key form); disconnect with confirmation; last sync time; sync status badge |
| **P5-UI-002** | Provider Drift Dashboard | `ui-agent` | P5-API-001 | `components/integrations/DriftDashboard.tsx`, `components/integrations/DriftDiff.tsx` | Per-integration: last sync time, in-sync/drifted/error status, number of drifted keys; diff panel showing drifted keys; resolve buttons: vault-wins, provider-wins, edit manually |
| **P5-IDE-001** | VS Code Extension | `ide-agent` | P5-API-001 | `extensions/vscode/` | Extension package: status bar item (project/env), command palette commands (switch env, add secret, pull, push, diff), local .env injection on env switch, inline annotations on .env files, inline conflict warnings, hardcoded secret detection; authenticated via device flow; offline cache (24h TTL); published to VS Code Marketplace |
| **P5-IDE-002** | JetBrains Plugin | `ide-agent` | P5-API-001 | `extensions/jetbrains/` | Plugin package: tool window with vault UI, env switcher, .env injection, inline annotations, conflict warnings; authenticated via device flow; offline cache; published to JetBrains Marketplace |
| **P5-CLI-001** | CLI (envault) | `sdk-agent` | P5-API-001 | `packages/cli/` | Single binary (Go or Node SEA); commands: login, env use, get, run, push, pull, diff, rotate, audit; offline mode with encrypted cache; shell completion for bash/zsh/fish; README + man page |
| **P5-E2E-001** | Integration E2E Suite | `validator` | All P5 | `e2e/integrations.spec.ts` | Journey 1: connect Vercel (mock OAuth) → push secrets → confirm mock Vercel API received correct values. Journey 2: simulate Vercel drift → drift dashboard shows drifted keys → resolve with vault-wins → confirm sync |

### Phase 5 Stability Gate Criteria

```
✓ Sync engine: 500 secrets sync to mock provider in < 5 seconds
✓ All 4 provider adapters: contract tests pass against mock APIs
✓ Drift detection: correctly identifies all 3 drift scenarios in test suite
✓ Conflict resolution: all 3 modes (vault-wins, provider-wins, manual) tested
✓ VS Code extension: installs, authenticates, and injects .env in < 2 seconds (cold)
✓ CLI: all 9 commands work against staging API; binary size < 30MB
✓ Selective sync: excluded keys confirmed absent from provider mock
✓ E2E: all integration journeys pass
✓ PRD coverage: FR-H-01 through FR-H-08, FR-IDE-01 through FR-IDE-09 all passing
```

**Human Gate Tasks (Phase 5):**
Connect your Vercel account. Push your project's secrets. Log into the Vercel dashboard and confirm the variables are there. Install the VS Code extension. Open a project and confirm the .env file is populated. Make a change to a secret in EnVault and confirm it syncs to Vercel within 30 seconds.

---

## 14. Phase 6 — Enterprise & Scale

### Goal
Implement RBAC advanced features (JIT access, break-glass, secret-level ACLs), SAML/SSO, zero-knowledge mode, compliance reporting, audit log streaming, and the access review workflow.

### Entry Criteria
Phase 5 stability gate passed. Human confirmed Phase 5 gate.

### Phase 6 Task Definitions

| Task ID | Name | Agent | Depends On | Output Artifacts | Acceptance Criteria |
|---|---|---|---|---|---|
| **P6-AUTH-001** | SAML 2.0 / OIDC SSO | `auth-agent` | P0-AUTH-001 | `lib/auth/saml.ts`, `lib/auth/oidc.ts` | Okta, Azure AD, Google Workspace SSO flows work; SCIM 2.0 provisioning endpoint; group-to-role mapping; SSO session tied to vault session; test against each provider's sandbox |
| **P6-AUTH-002** | JIT Access & Break-Glass | `auth-agent` | P0-AUTH-001 | `services/access/jit.ts`, `services/access/break-glass.ts` | JIT: request → admin approval (Slack + email) → time-bounded access → auto-expiry; break-glass: one-command elevated access → immediate notification to all owners → incident auto-created; all access logged at entry and exit |
| **P6-RBAC-001** | Secret-Level ACLs | `security-agent` | P1-BE-001 | `lib/rbac/secret-acls.ts`, `services/access/acl.ts` | Individual secrets have explicit allow-list of users/groups; ACL checked in addition to role; deny overrides allow; ACL changes are audit-logged; performance: ACL check adds < 5ms to secret read |
| **P6-CRYPTO-001** | Zero-Knowledge Mode | `crypto-agent` | P1-CRYPTO-001 | `lib/crypto/zk-mode.ts`, `lib/crypto/enclave-client.ts` | Client-side key derivation from user passphrase; org root key never transmitted to server; server-side operations via enclave client (mock enclave in test; real Nitro Enclave in production); ZK mode toggle with migration path for existing vaults |
| **P6-COMP-001** | Compliance Report Generator | `compliance-agent` | All phases | `services/compliance/`, `lib/reports/` | Generates: SOC2 CC6.x, PCI-DSS Req 3/8, ISO27001 A.9/A.10, HIPAA §164.312 reports; each report maps controls to evidence (audit log entries, policy documents, test results); exportable as PDF; reports are reproducible (same inputs = same output) |
| **P6-COMP-002** | Audit Log Streaming | `devops-agent` | P0-SEC-001 | `lib/audit/streaming.ts`, `infra/terraform/audit-stream.tf` | Real-time streaming to: Datadog (JSON), Splunk (HEC), Elastic (Logstash); webhook delivery for custom SIEM; write-once log store with Merkle tree integrity proof; 7-year retention policy enforced |
| **P6-COMP-003** | Access Review Workflow | `backend-agent` | P6-AUTH-001 | `services/access/review.ts`, `workers/access-review-worker.ts` | Scheduled reviews (monthly/quarterly/annual); email to project owners listing all members + permissions; owner must affirm or revoke each member; non-response escalation after 7 days; review completion logged as compliance evidence |
| **P6-API-001** | Enterprise REST Endpoints | `api-agent` | All P6 | `app/api/enterprise/` | Endpoints: SAML config, JIT request/approve, break-glass, ACL CRUD, ZK mode enable/migrate, compliance reports, audit stream config, access review CRUD |
| **P6-UI-001** | Enterprise Settings UI | `ui-agent` | P6-API-001 | `components/enterprise/` | SSO configuration wizard; JIT request/approval flow; break-glass button with double-confirm; ACL editor per secret; ZK mode toggle with clear warning; audit stream configuration |
| **P6-UI-002** | Compliance Dashboard | `ui-agent` | P6-API-001 | `components/compliance/ComplianceDashboard.tsx`, `components/compliance/ReportDownload.tsx` | Compliance status per framework; control pass/fail indicators; one-click report download; last review date; access review status |
| **P6-E2E-001** | Enterprise E2E Suite | `validator` | All P6 | `e2e/enterprise.spec.ts` | Journey 1: invite Viewer → confirm they cannot reveal secrets. Journey 2: request JIT access → approve → use → confirm expiry. Journey 3: set secret-level ACL → confirm non-member cannot read. Journey 4: download SOC2 report → confirm it's populated |

### Phase 6 Stability Gate Criteria

```
✓ SAML: round-trip login works against Okta and Azure AD sandboxes
✓ JIT: access granted, used, and expired correctly in timing tests
✓ Break-glass: notifications sent within 30 seconds; incident created
✓ Secret-level ACL: deny enforced for 100% of tested deny scenarios
✓ ZK mode: client-side key derivation; server never sees plaintext (verified by network inspection)
✓ Compliance reports: all 4 frameworks generate non-empty, structured reports
✓ Audit log: Merkle tree integrity proof valid; streaming delivers to mock Datadog
✓ Access review: 7-day non-response escalation tested with time-travel
✓ E2E: all 4 enterprise journeys pass
✓ PRD coverage: FR-AC-01 through FR-AC-07, FR-AU-01 through FR-AU-05 all passing
```

**Human Gate Tasks (Phase 6):**
Invite a new team member as Viewer. Confirm they cannot see secret values. Request JIT access for that user as a Developer. Approve it. Confirm access expires after the set duration. Open the Compliance dashboard and download the SOC2 report. Confirm it contains meaningful data.

---

## 15. Fixer Agent Playbooks

### 15.1 Fixer Assignment Logic

```
Validation finding received
          │
          ├─ severity: CRITICAL ──► Specialist Fixer assigned immediately
          │                        (crypto-agent for crypto findings;
          │                         security-agent for security findings)
          │
          ├─ severity: HIGH ──────► Standard Fixer Agent assigned
          │
          ├─ severity: MEDIUM ────► Original build agent self-revises first
          │                        Fixer assigned only if self-revision fails
          │
          └─ severity: LOW ───────► Original build agent self-revises
                                   Logged as tech debt if not resolved
```

### 15.2 Fixer Playbooks by Category

**PLAYBOOK: CRYPTO-FAIL**  
Trigger: Crypto module fails any known-answer test, or validator detects incorrect encryption usage.  
Action: `crypto-agent` reviews finding, checks against NIST SP 800-38D (AES-GCM) and SP 800-132 (PBKDF2), rewrites affected function with correct primitives, re-runs known-answer test suite.  
Escalation: If fix attempt 2 fails, pause all downstream tasks that depend on crypto module. Escalate to human with full finding context.

**PLAYBOOK: AUTH-BYPASS**  
Trigger: Security Advisor detects a route that returns non-401 for unauthenticated request, or RBAC check is missing.  
Action: `security-agent` audits auth middleware application, patches missing middleware on identified routes, re-runs adversarial test suite (auth bypass scenarios).  
Escalation: Zero-tolerance. If not resolved in 2 fixer cycles, all affected routes are taken offline in staging until fix is confirmed.

**PLAYBOOK: SQL-INJECTION**  
Trigger: Semgrep detects string concatenation in SQL query, or integration test detects injection vulnerability.  
Action: `backend-agent` replaces all string concatenation with parameterised queries using Drizzle ORM, re-runs SQL injection test suite.  
Escalation: All affected endpoints are feature-flagged off in staging until fix confirmed.

**PLAYBOOK: COVERAGE-FAIL**  
Trigger: Unit test coverage drops below threshold (80% overall, 90% security modules).  
Action: Original build agent identifies uncovered code paths, writes tests for each path, re-runs coverage report.  
Escalation: If coverage < 70% (hard floor), the task is marked INCOMPLETE and the phase cannot advance.

**PLAYBOOK: CONTRACT-FAIL**  
Trigger: API response does not match OpenAPI spec (Prism contract validation failure).  
Action: `api-agent` compares response shape to spec, either updates the implementation to match the spec or (if spec is wrong) updates the spec and re-runs all contract tests. Never silently changes both simultaneously.  
Escalation: If spec and implementation conflict irreconcilably, escalate to human as architectural decision.

**PLAYBOOK: PERFORMANCE-FAIL**  
Trigger: p99 latency exceeds target in k6 load test.  
Action: `backend-agent` and `db-agent` run query analysis (EXPLAIN ANALYZE), identify bottleneck (missing index, N+1 query, synchronous operation), apply fix, re-run load test.  
Escalation: If performance cannot be improved to within 2x of target, escalate to human as architectural review (may require caching, queue, or async redesign).

**PLAYBOOK: SECRET-LEAKED**  
Trigger: Gitleaks or Semgrep finds hardcoded secret in any committed file.  
Immediate action (zero tolerance): Orchestrator halts all agent tasks in current phase. `security-agent` quarantines the commit (reverts or removes affected file from history). Affected credential (if real) is flagged for rotation. Full Governance Council review required before phase resumes.  
Human notification: Mandatory. This is the one finding that escalates to human immediately regardless of attempt count.

---

## 16. Orchestrator State Machine

```
                    ┌─────────────┐
                    │   IDLE      │
                    │  (awaiting  │
                    │   trigger)  │
                    └──────┬──────┘
                           │ Phase N start trigger
                           ▼
                    ┌─────────────┐
                    │  BOOTSTRAP  │◄──────────────────────────────────┐
                    │  (load DAG, │                                   │
                    │   check     │                                   │
                    │   prereqs)  │                                   │
                    └──────┬──────┘                                   │
                           │ prereqs met                              │
                           ▼                                          │
                    ┌─────────────┐                                   │
           ┌────────┤  EXECUTING  ├─────────────────────────┐        │
           │        │  (parallel  │                         │        │
           │        │   lanes     │                         │        │
           │        │   running)  │                         │        │
           │        └──────┬──────┘                         │        │
           │               │ agent signals DONE             │        │
           │               ▼                                │        │
           │        ┌─────────────┐                         │        │
           │        │  VALIDATING │                         │        │
           │        │  (RVS L1–L9 │                         │        │
           │        │   running)  │                         │        │
           │        └──────┬──────┘                         │        │
           │               │                                │        │
           │        ┌──────┴──────┐                         │        │
           │        │             │                         │        │
           │      PASS          FAIL                        │        │
           │        │             │                         │        │
           │        ▼             ▼                         │        │
           │  ┌──────────┐  ┌──────────┐                   │        │
           │  │GOVERNANCE│  │  SELF-   │                   │        │
           │  │ REVIEW   │  │REVISION/ │                   │        │
           │  │(SA+QA+IA)│  │  FIXER   │                   │        │
           │  └────┬─────┘  └────┬─────┘                   │        │
           │       │             │ re-triggers Validating   │        │
           │       │             └──────────────────────────┘        │
           │  ALL APPROVED                                            │
           │       │                                                  │
           │       ▼                                                  │
           │  ┌──────────┐                                            │
           │  │  MERGING │                                            │
           │  │(integrate│                                            │
           │  │ outputs, │                                            │
           │  │ smoke    │                                            │
           │  │ tests,   │                                            │
           │  │ tag RC)  │                                            │
           │  └────┬─────┘                                            │
           │       │ RC deployed to staging                           │
           │       ▼                                                  │
           │  ┌──────────┐                                            │
           │  │  HUMAN   │                                            │
           │  │   GATE   │                                            │
           │  └────┬─────┘                                            │
           │       │                                                  │
           │  ┌────┴────┐                                             │
           │  │         │                                             │
           │PASS      FAIL / CHANGE                                   │
           │  │         │                                             │
           │  ▼         └──────── structured finding ────────────────┘
           │  ┌──────────┐        (re-enters as new task in DAG)
           │  │ COMPLETE │
           │  │(phase N  │
           └─►│ done,    │
              │ phase N+1│
              │ unlocked) │
              └──────────┘
```

### Orchestrator Special States

| State | Trigger | Action |
|---|---|---|
| `STALLED` | Agent heartbeat lost for > timeout_ms | Task reassigned to a fresh agent; stalled agent marked inactive |
| `DEADLOCKED` | Circular dependency detected in DAG | Orchestrator surfaces to human as architectural error |
| `CRITICAL-SECURITY` | Secret-leaked finding from any Validator | All tasks halted; `security-agent` assigned immediately; human notified |
| `GATE-STUCK` | Human gate not confirmed within 72 hours | Orchestrator sends reminder; after 7 days, escalates to project owner |
| `ADVISOR-SPLIT` | SA and QA APPROVE, IA REJECTS (or any split) | Full Governance Council convenes; Orchestrator generates reconciliation report |
| `FIXER-EXHAUSTED` | 4 fixer cycles with no resolution | Human escalation mandatory; task marked BLOCKED; phase cannot advance |

---

## 17. Build Manifest & Traceability

Every phase produces a **Build Manifest** — a complete record linking every line of code to its origin.

### Manifest Schema

```jsonc
{
  "manifest_id": "envault-phase-1-rc-001",
  "phase": 1,
  "generated_at": "2026-05-09T18:00:00Z",
  "git_sha": "abc123def456",
  "prd_version": "1.0",

  "prd_coverage": {
    "total_requirements": 14,
    "covered": 14,
    "coverage_pct": 100,
    "requirements": [
      {
        "id": "FR-V-01",
        "description": "Secret record structure",
        "status": "covered",
        "test_ids": ["P1-CRYPTO-001.test.ts#L22", "P1-BE-001.test.ts#L45"]
      }
      // ... all requirements
    ]
  },

  "artifacts": [
    {
      "artifact_id": "art-abc123",
      "task_id": "P1-CRYPTO-001",
      "agent_id": "crypto-agent-v2",
      "files": ["lib/crypto/encrypt.ts", "lib/crypto/decrypt.ts"],
      "prd_refs": ["FR-V-02", "FR-V-03"],
      "revision_count": 1,
      "final_validation": "PASS",
      "governance_approved": true
    }
    // ... all artifacts
  ],

  "test_summary": {
    "unit_tests": {"total": 284, "passed": 284, "failed": 0, "coverage_pct": 91.3},
    "integration_tests": {"total": 47, "passed": 47, "failed": 0},
    "e2e_tests": {"total": 12, "passed": 12, "failed": 0},
    "adversarial_tests": {"total": 28, "passed": 28, "failed": 0}
  },

  "governance_verdict": {
    "security_advisor": "APPROVED",
    "quality_advisor": "APPROVED",
    "integrity_advisor": "APPROVED",
    "approved_at": "2026-05-09T17:45:00Z"
  },

  "revision_summary": {
    "total_revisions": 7,
    "self_revisions": 5,
    "fixer_revisions": 2,
    "human_escalations": 0
  },

  "human_gate": {
    "status": "PENDING",
    "demo_url": "https://phase-1.envault.dev",
    "confirmed_at": null
  }
}
```

### Traceability Matrix

The Reporter Agent maintains a live traceability matrix throughout the build:

```
PRD Requirement ──► Task(s) ──► Agent(s) ──► Artifact(s) ──► Test(s) ──► Validation Result
FR-V-01             P1-BE-001   backend      services/         P1-BE-001    PASS
                                -agent       secret/           .test.ts
                                             secret.ts         #L45–L89
```

This matrix is queryable at any time to answer: "Which PRD requirements are not yet covered?", "Which artifacts are untested?", "Which tests are failing?", "What did the Fixer Agent change to fix finding X?"

---

## 18. Glossary

| Term | Definition |
|---|---|
| **ADR** | Architecture Decision Record — a document capturing a key technical decision, its context, and the alternatives considered |
| **Artifact** | Any file or set of files produced by a build agent as the output of a task |
| **Blast Radius** | The set of environments, integrations, and dependent services affected by a rotation or change operation |
| **Contract Test** | A test that verifies a service's API responses match the OpenAPI specification, without requiring the real backend |
| **DAG** | Directed Acyclic Graph — the dependency graph of tasks, ensuring no circular dependencies and enabling parallel execution of independent tasks |
| **Device Flow** | An OAuth 2.0 flow for authenticating CLI tools and IDE extensions without a browser redirect |
| **Drift** | A state where the value of a key in one system (e.g., the vault) differs from the same key in another system (e.g., a hosting provider) |
| **Fixer Agent** | A specialised agent assigned to repair a build artifact after a validation failure |
| **Governance Council** | The three permanent advisor agents (Security, Quality, Integrity) whose unanimous approval is required before any phase can advance |
| **Human Gate** | The single human interaction point at the end of each phase, where the human confirms the deployed product works as expected |
| **Idempotent** | An operation that produces the same result regardless of how many times it is executed |
| **Known-Answer Test** | A cryptographic test that verifies a function produces the expected output for a fixed, pre-computed input — used to validate crypto correctness |
| **L4 Autonomy** | Level 4 autonomy: the system self-governs, self-corrects, and self-reports, with human input only at defined boundary events |
| **Merkle Tree** | A cryptographic data structure that enables efficient and verifiable proof of the integrity and completeness of a log |
| **Nock** | A Node.js HTTP mocking library used to simulate provider API responses in tests without real network calls |
| **Property-Based Test** | A test that verifies a function satisfies a general property (e.g., "encrypt then decrypt always returns the original value") across many randomly generated inputs |
| **RC** | Release Candidate — a tagged build that has passed all automated validation and is ready for human confirmation |
| **RLS** | Row-Level Security — a PostgreSQL feature that enforces access control at the database row level |
| **RVS** | Recursive Validator System — the 9-level automated test and analysis cascade |
| **Self-Revision** | The process by which a build agent reviews and corrects its own output before signalling completion |
| **Soak Test** | A performance test that runs at sustained load for an extended period (typically 10–60 minutes) to detect memory leaks and resource exhaustion |
| **Swarm** | The full collection of agents (builder, validator, fixer, governance, orchestrator) operating together on the build |
| **TTL** | Time-to-live — the duration after which a cached value is considered stale and must be refreshed |

---

*This document is the single source of truth for the EnVault autonomous build. All agents read from this document. All outputs trace back to this document. Revisions to this document must be approved by the Governance Council before tasks are re-assigned.*

---
**Document Control**

| Version | Date | Change |
|---|---|---|
| 1.0 | May 2026 | Initial autonomous build plan — Phase 0 through Phase 6 |
