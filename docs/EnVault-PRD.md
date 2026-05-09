# EnVault — Product Requirements Document

**Version:** 1.0  
**Status:** Draft for Review  
**Date:** May 2026  
**Authors:** Product & Engineering Leadership

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users & Personas](#3-target-users--personas)
4. [Product Vision & Principles](#4-product-vision--principles)
5. [Feature Modules](#5-feature-modules)
   - 5.1 Secret Vault & Storage
   - 5.2 Environment Management
   - 5.3 Intelligence Engine
   - 5.4 Key Generation & Rotation
   - 5.5 Breach Detection & Active Mitigation
   - 5.6 IDE Integrations
   - 5.7 Hosting Provider Integrations
   - 5.8 CI/CD & Secret Manager Integrations
   - 5.9 Access Control & Governance
   - 5.10 Audit, Compliance & Reporting
6. [API & SDK Requirements](#6-api--sdk-requirements)
7. [Security Architecture](#7-security-architecture)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Pricing & Packaging](#9-pricing--packaging)
10. [Roadmap](#10-roadmap)
11. [Open Questions](#11-open-questions)
12. [Glossary](#12-glossary)

---

## 1. Executive Summary

**EnVault** is a developer-first secrets and environment variable management platform that unifies how engineering teams store, synchronise, govern, and protect configuration across every environment and tool in their stack.

Unlike existing tools that treat secret management as passive storage, EnVault is an **active intelligence layer** — it cross-references environment configurations, detects conflicts and drift, warns of leaked credentials, automates key rotation, and pushes secrets directly to hosting providers and IDEs in real time. It is designed to eliminate the leading cause of production incidents and security breaches that stem from misconfigured or leaked environment variables.

**Core value proposition:** One platform to define secrets once, govern them everywhere, and never be surprised by a misconfiguration or breach again.

---

## 2. Problem Statement

### 2.1 The Current Reality

Environment variable and secret management is broken at every layer of the modern development workflow:

| Pain Point | Current Workaround | Why It Fails |
|---|---|---|
| Secrets scattered across .env files, Notion docs, Slack messages, and email | Manual copy-paste | No single source of truth; human error inevitable |
| No visibility into differences between dev/staging/prod configs | Manual diffing | Errors discovered at deployment or runtime |
| API keys that never rotate | Ad-hoc scripts or none at all | Leaked keys remain valid indefinitely |
| No awareness when a key is exposed | Reactive GitHub push protection alerts | Alert comes after exposure; remediation is manual |
| Developers onboarding need secrets from a team member | Shared .env file over Slack/email | Keys are forwarded, logged, and never revoked |
| CI/CD pipelines configured independently of staging/prod | Duplicated manual entry | Drift between pipeline and deployed environment |
| No audit trail for who changed what | None | Zero accountability; impossible to diagnose incidents |

### 2.2 The Cost of Getting It Wrong

- The average cost of a data breach attributable to exposed credentials is **$4.5M** (IBM Security 2024).
- **80% of cloud breaches** involve stolen or leaked credentials, not zero-days.
- A misconfigured environment variable is the single most common cause of "works on my machine" incidents that delay releases.
- Developer productivity loss from onboarding, debugging config mismatches, and incident response is estimated at **3–5 hours per engineer per week** in teams without tooling.

### 2.3 Why Existing Tools Are Insufficient

**HashiCorp Vault** — powerful but operationally complex, not developer-friendly, requires dedicated infrastructure team.  
**AWS Secrets Manager / Azure Key Vault** — cloud-vendor-locked, no cross-environment intelligence, UI is hostile to developers.  
**Doppler / Infisical** — good at sync, weak on intelligence, breach detection, and key lifecycle management.  
**1Password Secrets Automation** — password-manager heritage, limited dev workflow integration, no conflict analysis.  
**dotenv-vault** — file-centric model, minimal governance, no active intelligence layer.

**EnVault's differentiation:** All the security of enterprise vault products, combined with the intelligence of a configuration linter, the connectivity of a CI/CD platform, and the UX polish of a developer tool built in 2026.

---

## 3. Target Users & Personas

### Persona 1 — The Solo Developer / Indie Hacker
**Name:** Alex, 27. Freelance full-stack developer building 3 SaaS products.  
**Goal:** Stop copy-pasting .env files between projects and environments. Wants one place to manage Stripe, Supabase, Resend, and Clerk credentials.  
**Frustration:** Accidentally committed a .env file to GitHub six months ago. Still doesn't know if that key was abused.  
**EnVault value:** Free tier with breach monitoring, one-click export to Vercel/Railway, IDE sync.

### Persona 2 — The Engineering Lead
**Name:** Priya, 34. Engineering lead at a 20-person Series A startup.  
**Goal:** Enforce consistent environments across dev/staging/prod. Onboard new engineers without sharing raw credentials. Audit who changed what when things break.  
**Frustration:** Every environment is slightly different. Nobody knows if the staging DB_URL actually points to staging. New engineers take a day to get credentials set up.  
**EnVault value:** Cross-environment diff and conflict alerts, RBAC, onboarding flows, audit log.

### Persona 3 — The Product Owner / Head of Engineering
**Name:** Marcus, 41. VP Engineering at a 200-person scale-up.  
**Goal:** Pass SOC2 Type II audit. Demonstrate key rotation, access control, and breach notification policies to auditors. Remove bus factor from ops knowledge.  
**Frustration:** Audit prep requires pulling evidence from five different places. No automated key rotation. Junior devs have prod access they shouldn't have.  
**EnVault value:** Compliance reports, RBAC with approval workflows, automated rotation schedules, breach response playbooks.

### Persona 4 — The Security Engineer
**Name:** Yuki, 29. Security engineer at a fintech company.  
**Goal:** Enforce zero-trust secret access, detect anomalies, remediate exposed credentials before they are exploited.  
**Frustration:** No visibility into which services are using which credentials. Can't easily revoke a key without knowing all places it's used.  
**EnVault value:** Secret graph (which service uses which key), anomaly detection, automated revocation + rotation workflows.

---

## 4. Product Vision & Principles

### Vision Statement
> EnVault makes secrets invisible to humans and visible to the machines that need them — always correct, always current, never leaked.

### Guiding Principles

**1. Secure by default, not by effort.**  
Every secret is encrypted before it leaves the browser. Defaults are the most secure option. Developers should not need to understand cryptography to use EnVault correctly.

**2. Intelligence is the product, not just storage.**  
Passive storage is a commodity. EnVault's value is in what it knows: drift between environments, compliance gaps, exposure risk, usage patterns. Every stored value is an input to the intelligence engine.

**3. Developer experience is a security control.**  
If the tool is painful to use, developers will route around it. Excellent DX — fast IDE integration, one-click syncs, smart defaults — directly increases the security of the organisations that adopt EnVault.

**4. Meet developers where they work.**  
EnVault must exist in the IDE, the terminal, the CI/CD pipeline, and the hosting dashboard — not just the web app. Friction at the point of use is failure.

**5. Transparency over obscurity.**  
Users should always be able to see exactly what EnVault knows, stores, and does on their behalf. Zero-knowledge architecture means EnVault cannot read your secrets even if subpoenaed.

---

## 5. Feature Modules

---

### 5.1 Secret Vault & Storage

#### Description
The core encrypted store for all secrets and environment variables. Designed as a structured database of key–value pairs with rich metadata, not a file archive.

#### Requirements

**FR-V-01** — Each secret record shall store: key name, encrypted value, description, environment(s), tags, owner, created/updated timestamps, version history (minimum last 20 versions), and expiry date.

**FR-V-02** — Secrets shall be encrypted with AES-256-GCM. Encryption keys shall be derived per-organisation using PBKDF2 with a minimum of 600,000 iterations (NIST SP 800-132 compliant).

**FR-V-03** — EnVault shall offer a **zero-knowledge mode** where the encryption key is derived client-side from a user-controlled master passphrase. In this mode, EnVault servers store only ciphertext and can never decrypt values.

**FR-V-04** — Users shall be able to create, read, update, delete, and restore (from version history) any secret they have permission to access.

**FR-V-05** — Secrets shall support **types**: `string`, `url`, `connection-string`, `api-key`, `jwt-secret`, `certificate`, `private-key`, `oauth-token`, `webhook-url`. Type information drives validation, formatting hints, and intelligent analysis.

**FR-V-06** — The vault shall support **secret references** — one secret can reference the value of another (e.g., `DATABASE_URL` can be composed from `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`). References resolve at sync time.

**FR-V-07** — Secrets shall support **tags** for grouping (e.g., `billing`, `auth`, `infrastructure`, `third-party`).

**FR-V-08** — Bulk import shall be supported via: `.env` file upload, JSON, YAML, and direct paste. The importer shall parse, deduplicate, and flag conflicts before committing.

**FR-V-09** — Bulk export shall be supported in: `.env`, `.json`, `.yaml`, shell `export` script, and Docker `--env-file` format. Exports shall be ephemeral (no server-side logging of the plaintext export).

**FR-V-10** — The vault shall enforce **secret size limits**: 64 KB per value, 1 MB per import. Oversized values suggest a misuse pattern and shall trigger a warning with guidance.

---

### 5.2 Environment Management

#### Description
A structured model for organising secrets across the lifecycle of a project — from local development through to production — with full version control semantics.

#### Environments

Each project has a set of **environments**. Built-in environments: `development`, `staging`, `production`. Users may define custom environments (e.g., `preview`, `qa`, `load-testing`, `sandbox`).

Each environment is an **independent namespace** for secrets, but secrets may be **linked** — a change to a linked secret in one environment triggers a review prompt in related environments.

#### Requirements

**FR-E-01** — Projects shall have unlimited environments. Each environment is versioned independently.

**FR-E-02** — Environments shall support **inheritance**: a child environment (e.g., `staging`) can inherit secrets from a parent (e.g., `production`) and override individual values. Inherited values are visually distinct from overrides.

**FR-E-03** — The **Environment Diff View** shall render a side-by-side comparison of any two environments, highlighting: keys present in one but not the other (missing keys), keys with the same name but different values (value drift), keys present in both with identical values (potential over-sharing), and type mismatches.

**FR-E-04** — The system shall maintain a **Cross-Environment Key Registry** — a unified view of every key name across all environments of a project, with a presence matrix showing which environments contain it and at what version.

**FR-E-05** — Environment **promotion** workflows: a user with sufficient permissions can promote a secret (or all secrets) from one environment to another, with a diff preview and approval step before values are written.

**FR-E-06** — The system shall automatically generate and maintain a `.env.example` file (committed to version control) that contains all key names but no values, with descriptions derived from the vault metadata.

**FR-E-07** — Environments shall support **locking**: a locked environment (typically `production`) requires elevated permissions and mandatory audit notes for any change.

**FR-E-08** — **Snapshot & restore**: at any point, the state of all secrets in an environment can be snapshotted and later restored. Useful before major deployments.

---

### 5.3 Intelligence Engine

#### Description
The core differentiator of EnVault. A continuous analysis layer that processes the vault's contents to surface actionable insights, prevent misconfigurations, and actively improve the quality and security of the configuration state.

#### 5.3.1 Conflict & Anomaly Detection

**FR-I-01 — Duplicate detection:** The system shall detect keys that appear more than once within the same environment (case-insensitive). Severity: `error`. Auto-resolution: merge wizard.

**FR-I-02 — Cross-environment drift alerts:** When the value of a key in `staging` diverges from `production` by more than a configurable tolerance (e.g., same base URL but different path), the system shall raise a `drift` warning. The user defines whether drift is expected (override) or not (alert).

**FR-I-03 — Missing key alerts:** When a key exists in `production` but is absent from `development` or `staging`, the system shall raise a `missing-key` alert with a one-click "copy with placeholder value" resolution.

**FR-I-04 — Type mismatch:** If a key named `DATABASE_URL` contains a value that does not match the URL format, the system shall raise a `type-validation` warning with the detected format and the expected format.

**FR-I-05 — Value in wrong key:** If a value looks like a connection string but is stored under a key named `API_KEY`, the system shall raise a `misclassification` suggestion.

**FR-I-06 — Plaintext secret detection:** The system shall scan all values using a pattern library (regex + ML classifier) to detect secrets stored as non-secret types — e.g., a string field containing a private key or JWT. Severity: `critical`.

**FR-I-07 — Environment variable naming convention enforcement:** The system shall detect inconsistent naming conventions within a project (e.g., mixing `SNAKE_CASE` with `camelCase` or `PascalCase`) and suggest standardisation. Configurable per-project.

**FR-I-08 — Unused key detection:** When integrated with a codebase (via IDE plugin or GitHub integration), the system shall flag keys present in the vault that appear nowhere in the source code. Severity: `info`. Resolution: archive or confirm intentional.

#### 5.3.2 Intelligent Suggestions

**FR-I-09 — Key name suggestions:** When a user creates a new key, the system shall suggest canonical names based on the detected value type and community conventions (e.g., for a Stripe secret key, suggest `STRIPE_SECRET_KEY` not `STRIPE_KEY` or `S_KEY`).

**FR-I-10 — Value improvement suggestions:** The system shall detect weak values (e.g., short JWT secrets, low-entropy passwords) and proactively offer to generate a cryptographically strong replacement.

**FR-I-11 — Description generation:** For known third-party API keys (detected by value pattern), the system shall automatically populate the description field with context — what the key is for, where to find it in the provider's dashboard, and what minimum permissions it requires.

**FR-I-12 — Expiry suggestions:** Based on key type and provider conventions, the system shall suggest a rotation schedule. For example: "Stripe restricted keys: recommend 90-day rotation. AWS IAM access keys: recommend 60-day rotation."

**FR-I-13 — Configuration health score:** Each environment shall receive a continuous health score (0–100) based on: completeness (no missing keys), hygiene (naming, descriptions, types), security posture (secret strength, rotation age, exposure risk), and drift state. The score is visible on the dashboard and surfaced in Slack/email digests.

#### 5.3.3 Smart Grouping

**FR-I-14 — Auto-grouping by service:** The system shall analyse key names and value patterns to automatically group secrets by the third-party service they belong to (e.g., all `STRIPE_*` keys grouped under "Stripe", all `DB_*` under "Database"). Groups are displayed as collapsible sections in the vault UI.

**FR-I-15 — Project template matching:** When a new project is created, the system shall suggest a starter set of environments and keys based on the detected stack (e.g., a Next.js + Supabase + Stripe project gets a pre-populated template with placeholder descriptions).

---

### 5.4 Key Generation & Rotation

#### Description
EnVault goes beyond storing credentials — it actively participates in their lifecycle, from generation through retirement.

#### 5.4.1 Key Generation

**FR-K-01** — The vault shall include a **cryptographic secret generator** accessible from the "New Secret" form and as a standalone tool. Supported formats:

| Format | Example Use Case |
|---|---|
| Random hex string (configurable length) | JWT secrets, encryption keys |
| Random base64 string | Cookie secrets, webhook signing keys |
| UUID v4 | Internal service identifiers |
| API-key format (`sk-live-{32}`) | Custom API key issuance |
| RSA keypair (2048 / 4096 bit) | TLS, SSH, JWT RS256 |
| Ed25519 keypair | Modern SSH, signing |
| ECDSA keypair | TLS, JWT ES256 |
| Bcrypt / Argon2 hash | Storing hashed test passwords |
| Random passphrase (word-based) | Memorable but strong secrets |

All generation happens client-side. Generated values are never transmitted to EnVault servers before the user chooses to save them.

**FR-K-02** — Generated secrets shall display an **entropy indicator** (bits of entropy, crack-time estimate) before saving.

**FR-K-03** — EnVault shall provide a **Secret Forge** — a dedicated page for generating, previewing, and optionally saving groups of secrets (e.g., generate a full set of auth secrets for a new project in one operation).

#### 5.4.2 Key Rotation

**FR-K-04** — Each secret shall have a configurable **rotation policy**: manual, or scheduled (daily / weekly / 30 / 60 / 90 / 180 days). Default: manual.

**FR-K-05** — For supported providers (see Section 5.7), EnVault shall **automatically rotate keys** on schedule: generate a new key via the provider's API, update the vault, push to all connected environments and hosting providers, and mark the old key for revocation after a configurable grace period.

**FR-K-06** — **Rotation events** shall be logged in the audit trail with: who/what triggered the rotation, old key fingerprint (never the full old value), new key fingerprint, provider confirmation, and deployment status.

**FR-K-07** — **Rotation dry run**: before executing a rotation, users can preview every environment and integration that will be updated, and confirm the blast radius.

**FR-K-08** — **Rotation health dashboard**: a view showing all secrets with rotation policies, next rotation date, last rotation date, and rotation status. Overdue rotations are highlighted in red.

**FR-K-09** — For keys that cannot be automatically rotated (e.g., a manually-issued enterprise API key), the system shall generate a **rotation checklist** — a step-by-step guide for performing the rotation, with checkboxes the user works through, and a "mark as rotated" completion action.

#### 5.4.3 API Key Provider Integrations

EnVault shall integrate directly with the following API key providers to issue, inspect, and rotate credentials:

| Provider | Capabilities |
|---|---|
| **Stripe** | List keys, create restricted keys, rotate, revoke |
| **AWS IAM** | Create/rotate access key pairs, inspect policies |
| **GitHub** | Create/rotate personal access tokens and fine-grained tokens |
| **Twilio** | List API keys, create, revoke |
| **SendGrid / Resend** | Create/rotate API keys |
| **Cloudflare** | Create/rotate API tokens with scoped permissions |
| **Supabase** | Rotate anon/service role keys, webhook secrets |
| **OpenAI / Anthropic** | List keys, create, revoke (as APIs permit) |
| **Clerk** | Rotate secret keys, webhook signing secrets |
| **Auth0** | Rotate client secrets, management API tokens |
| **PlanetScale / Neon / Turso** | Rotate database connection credentials |
| **Datadog / New Relic** | Rotate ingest API keys |

Provider integrations authenticate via OAuth or a one-time API key, and request only the minimum necessary permissions (principle of least privilege).

---

### 5.5 Breach Detection & Active Mitigation

#### Description
EnVault continuously monitors for exposure of stored secrets across public channels and responds with automated mitigation, not just alerts.

#### 5.5.1 Breach Detection

**FR-B-01 — Git repository scanning:** EnVault shall monitor connected GitHub/GitLab repositories for committed secrets using a pattern-matching engine covering 400+ secret formats. Detection shall occur within 60 seconds of a push event.

**FR-B-02 — Public internet monitoring:** EnVault shall query breach intelligence sources (GitHub Secret Scanning API, Have I Been Pwned API, Leaked.Domains, BreachDirectory) on a rolling schedule to check fingerprints of stored secrets against known leaked credential databases.

**FR-B-03 — Dark web monitoring** (Enterprise tier): Integration with dark web monitoring APIs (e.g., SpyCloud, Flare.io) to detect credentials appearing on paste sites, Telegram channels, and underground forums.

**FR-B-04 — Behavioural anomaly detection:** When EnVault has API access to a provider, it shall monitor key usage patterns and flag anomalies — e.g., an API key used from 3 new countries in 1 hour, or a sudden spike in request volume from an unexpected IP range.

**FR-B-05 — Value fingerprinting:** EnVault shall store a one-way fingerprint (HMAC-SHA256) of each secret value. The fingerprint enables breach correlation without exposing the plaintext value, even to EnVault's own detection infrastructure.

#### 5.5.2 Active Mitigation

**FR-B-06 — Breach response workflow:** On detecting a breach, EnVault shall immediately:
1. Notify all project admins via email, Slack, and in-app alert (within 30 seconds)
2. Automatically lock the affected environment (preventing new reads)
3. Propose a **one-click mitigation plan**: revoke exposed key → rotate → push new key → verify

**FR-B-07 — Automated revocation** (for supported providers): When a breach is confirmed and the user approves, EnVault shall automatically revoke the compromised key via the provider's API.

**FR-B-08 — Breach impact assessment:** The breach alert shall include: which environments and services use the affected key, estimated exposure window (from last confirmed-safe state to detection), and which hosting integrations are pushing the compromised value.

**FR-B-09 — Post-incident report:** After a breach is resolved, EnVault shall generate a structured incident report covering timeline, affected systems, remediation steps taken, and recommended preventive measures. Report is exportable as PDF for compliance records.

**FR-B-10 — Pre-breach posture hardening:** The system shall proactively warn when secrets are approaching elevated risk — e.g., "This key has been in use for 180 days without rotation and matches a pattern commonly targeted in credential stuffing attacks."

---

### 5.6 IDE Integrations

#### Description
EnVault must exist inside the developer's primary workspace. IDE integrations surface secrets, warnings, and sync controls without leaving the editor.

#### Supported IDEs

- **VS Code** (extension — primary target, GA at launch)
- **JetBrains IDEs** (IntelliJ, WebStorm, PyCharm, GoLand — plugin, GA at launch)
- **Cursor** (VS Code extension compatible — launch)
- **Zed** (extension — post-launch)
- **Neovim** (LSP plugin — community, post-launch)

#### Requirements

**FR-IDE-01 — Authentication:** The IDE extension shall authenticate via a device flow (OAuth) or CLI token. No secrets stored in VS Code's secret storage without explicit user consent.

**FR-IDE-02 — Environment selection:** A status bar item shall display the currently active project and environment. The user can switch environments from a quick-pick menu.

**FR-IDE-03 — Local .env injection:** The extension shall write a local `.env` file (gitignored) populated with the secrets from the selected environment. The file is refreshed on: environment switch, vault change event (push notification), or explicit user action.

**FR-IDE-04 — In-editor annotations:** Lines in `.env` files that reference a key managed by EnVault shall be annotated with: last-updated date, rotation status, health indicator. Hovering shows the key's full metadata.

**FR-IDE-05 — Inline conflict warnings:** If the local `.env` file contains a value that diverges from the vault (e.g., a developer has manually edited it), the extension shall show an inline warning with options to push local → vault or pull vault → local.

**FR-IDE-06 — Secret usage detection:** The extension shall scan source files for hardcoded string literals that match the pattern of known secret formats and surface a warning: "This looks like a hardcoded Stripe key. Move it to EnVault?"

**FR-IDE-07 — New key quick-add:** A command palette action (`EnVault: Add New Secret`) shall open a panel to add a new key to the vault from within the IDE, pre-filling the project and environment from context.

**FR-IDE-08 — Offline mode:** The extension shall cache an encrypted local copy of secrets (configurable TTL, default 24 hours) so the developer can work without connectivity. Cache is invalidated on rotation or remote update.

**FR-IDE-09 — Terminal integration:** The extension shall inject secrets as environment variables into VS Code's integrated terminal sessions on launch, so `process.env.MY_KEY` resolves correctly during local development without a `.env` file.

---

### 5.7 Hosting Provider Integrations

#### Description
EnVault synchronises secrets to hosting providers, eliminating the need to manually manage environment variables in provider dashboards.

#### Supported Providers (GA)

| Provider | Sync Capabilities |
|---|---|
| **Vercel** | Push env vars to projects per environment (production/preview/development), pull current state, detect drift |
| **Render** | Push env vars to services and env groups, trigger redeploy on change |
| **Railway** | Push env vars per environment, pull current state |
| **Fly.io** | Push secrets via Fly API, per-app and per-environment |
| **AWS (ECS / Lambda / EKS)** | Sync to Parameter Store, Secrets Manager, and Lambda environment config |
| **Heroku** | Push config vars, detect drift |
| **Netlify** | Push env vars per site and per context (production/deploy-preview/branch-deploy) |
| **Google Cloud Run** | Sync to Secret Manager, inject at deploy time |
| **Azure** | Sync to Azure Key Vault, App Service application settings |

#### Requirements

**FR-H-01 — Two-way sync:** EnVault shall be capable of reading the current state from the hosting provider and comparing it to the vault, surfacing any drift (values in the provider that differ from the vault).

**FR-H-02 — Sync on change:** When a secret in the vault is updated, all connected hosting environments shall be updated automatically (configurable: auto-sync vs. manual approval required).

**FR-H-03 — Redeploy triggering:** For providers that require a redeploy to pick up new environment variables (e.g., Render, Railway), EnVault shall optionally trigger a redeploy after a successful sync, with confirmation.

**FR-H-04 — Provider drift dashboard:** A view showing, for each connected provider, the last sync time, sync status (in sync / out of sync), number of drifted keys, and a diff panel.

**FR-H-05 — Conflict resolution:** When a drift is detected (provider value ≠ vault value), the user is presented with: diff, which is newer, and options to take vault as source of truth, take provider as source of truth, or merge manually.

**FR-H-06 — Multi-project mapping:** A single EnVault project environment (e.g., `production`) can sync to multiple provider deployments simultaneously (e.g., Vercel production + Railway production + Fly.io production).

**FR-H-07 — Selective sync:** Users shall be able to mark individual secrets as "do not sync" to a specific provider — for example, a development-only debug flag that should never reach the Vercel production deployment.

**FR-H-08 — Sync audit log:** Every push to a hosting provider is logged with: timestamp, user/trigger, secrets changed (key names only — never values), provider response status, and deployment ID where available.

---

### 5.8 CI/CD & Secret Manager Integrations

#### CI/CD Platforms

**FR-CI-01** — EnVault shall provide a native **GitHub Actions integration** that injects vault secrets as step environment variables, eliminating GitHub Secrets as a separate system for teams using EnVault.

**FR-CI-02** — Supported CI/CD platforms: GitHub Actions, GitLab CI/CD, CircleCI, Bitbucket Pipelines, Jenkins, Buildkite. Integration via: official EnVault CLI action/orb, or a service account API token.

**FR-CI-03** — The **EnVault CLI** (`envault run -- <command>`) shall inject the secrets for a configured project and environment as environment variables into any subprocess. This enables any CI/CD system to use EnVault without a native plugin.

**FR-CI-04** — Ephemeral credentials: For CI/CD, EnVault shall issue short-lived (configurable, default 1-hour TTL) read-only tokens scoped to a specific project and environment. These tokens self-expire and cannot be used to write to the vault.

#### Secret Manager Bridges

**FR-CI-05** — EnVault shall support **bidirectional bridge** with: HashiCorp Vault (OSS and Enterprise), AWS Secrets Manager, Azure Key Vault, and GCP Secret Manager. The bridge allows EnVault to serve as the UI and intelligence layer while delegating encrypted storage to an existing enterprise secret manager.

---

### 5.9 Access Control & Governance

#### Role Model

| Role | Permissions |
|---|---|
| **Viewer** | Read non-secret values; see key names of secrets; no value reveal |
| **Developer** | Read and reveal all secrets in assigned environments; add/edit non-production secrets |
| **Senior Developer** | All Developer permissions + staging secret management |
| **Admin** | All secrets across all environments; manage members; configure integrations |
| **Owner** | All Admin permissions + billing, deletion, zero-knowledge key management |
| **Read-only Bot** | Machine account for CI/CD; environment-scoped; read only |
| **Rotation Bot** | Machine account; environment-scoped; write access to specific keys only |

#### Requirements

**FR-AC-01** — Roles are assignable per-project and per-environment. A user can be an Admin on `project-A` and a Viewer on `project-B`.

**FR-AC-02** — **Environment-level access gates:** Production access shall be configurable to require MFA re-authentication at reveal time, regardless of session state.

**FR-AC-03** — **Just-in-time access requests:** A developer without production access can request temporary access (configurable duration: 15 min / 1 hour / 8 hours). Request is sent to project admins via Slack/email for approval. All access during the JIT window is audit-logged.

**FR-AC-04** — **Break-glass access:** A designated break-glass account can access any environment in an emergency. Break-glass use triggers immediate notification to all project owners and an automatic incident record.

**FR-AC-05** — **SAML/SSO support:** EnVault shall support SAML 2.0 and OIDC for enterprise SSO (Okta, Azure AD, Google Workspace). Provisioning via SCIM 2.0.

**FR-AC-06** — **IP allowlisting:** Organisations can restrict vault access to specific IP ranges or CIDR blocks.

**FR-AC-07** — **Secret-level ACLs:** In addition to role-based permissions, individual secrets can have explicit access lists (e.g., only the `payment-team` group can reveal `STRIPE_SECRET_KEY`).

---

### 5.10 Audit, Compliance & Reporting

**FR-AU-01** — Every write action to the vault shall generate an immutable audit event containing: actor (user ID or service account), action type, target (project, environment, key name), timestamp, IP address, user agent, and outcome.

**FR-AU-02** — Audit logs are immutable. EnVault employees cannot modify or delete audit records. Logs are stored in a write-once store with cryptographic integrity (append-only log with Merkle tree anchoring).

**FR-AU-03** — Audit logs are exportable in SIEM-compatible formats: JSON, CEF (ArcSight), LEEF (QRadar), and as direct streaming webhooks to Splunk, Datadog, and Elastic.

**FR-AU-04** — **Compliance report generation:** One-click generation of compliance evidence reports for: SOC 2 Type II (CC6.1, CC6.2, CC6.3), ISO 27001 (A.9, A.10, A.12), PCI-DSS (Requirement 3, 8), HIPAA (§164.312(a)).

**FR-AU-05** — **Access review workflows:** Scheduled (monthly/quarterly/annual) access reviews are sent to project owners listing all members and their permissions. Owners must affirm or revoke access. Non-response after 7 days triggers an escalation.

---

## 6. API & SDK Requirements

### REST API

**FR-API-01** — EnVault shall expose a REST API (OpenAPI 3.1 specification published at launch) covering all vault operations: CRUD on secrets, environment management, integration configuration, audit log query, health score, and key rotation triggers.

**FR-API-02** — API authentication: personal access tokens (PATs) with configurable scopes, and OAuth 2.0 client credentials flow for service accounts.

**FR-API-03** — Rate limiting: 1,000 requests/minute per token (configurable upward for Enterprise). Rate limit headers on all responses. 429 with `Retry-After`.

**FR-API-04** — The API shall support **bulk operations** — read or write up to 500 secrets in a single request — for efficient CI/CD injection.

### SDKs

Official SDKs (GA at launch): **TypeScript/JavaScript**, **Python**, **Go**.  
Post-launch: **Ruby**, **Java**, **Rust**, **PHP**.

Each SDK shall provide:
- Sync and async client
- `getSecret(key)` and `getAllSecrets()` methods returning typed results
- Automatic refresh on rotation events (long-polling or webhook)
- Local caching with configurable TTL
- Type-safe secret maps (TypeScript: auto-generated types from vault schema)

### CLI

**FR-CLI-01** — `envault` CLI (single binary, cross-platform) shall support:
```
envault login             # OAuth device flow
envault env use <name>    # switch environment
envault get <KEY>         # fetch a single secret value
envault run -- <cmd>      # inject all secrets into subprocess env
envault push              # sync local .env → vault
envault pull              # sync vault → local .env
envault diff              # compare local .env with vault
envault rotate <KEY>      # trigger rotation for a key
envault audit             # view recent audit events
```

**FR-CLI-02** — The CLI shall operate fully offline using a local encrypted cache, with TTL-based invalidation.

---

## 7. Security Architecture

### 7.1 Encryption Model

```
User Password / SSO Token
        │
        ▼
   PBKDF2 (600,000 iter, SHA-256)
        │
        ▼
   Organisation Root Key (256-bit, stored client-side in ZK mode)
        │
        ├──► Project Key (per-project, AES-256-GCM encrypted with Root Key)
        │           │
        │           └──► Secret Value (AES-256-GCM encrypted with Project Key)
        │
        └──► Key Encryption Key (wraps Project Keys for zero-knowledge sync)
```

In **standard mode**, the Organisation Root Key is held in EnVault's HSM-backed KMS (AWS CloudHSM / GCP Cloud HSM), allowing server-side decryption for API access and provider sync.

In **zero-knowledge mode**, the Organisation Root Key never leaves the user's device. Server-side operations that require plaintext (provider sync, breach scan) are performed via a secure enclave (AWS Nitro Enclave) that processes the decrypted value ephemerally without persisting it or making it accessible to EnVault staff.

### 7.2 Infrastructure Security

- All data encrypted at rest (AES-256) and in transit (TLS 1.3 minimum).
- Multi-region active-active deployment with automatic failover (AWS, target: 99.99% uptime SLA).
- SOC 2 Type II audit annually; reports available to Enterprise customers under NDA.
- Penetration testing bi-annually by a third-party firm; findings and remediation published in customer trust portal.
- Bug bounty programme (HackerOne) from Day 1.
- No EnVault employee can access customer secret values in standard mode; zero-knowledge mode provides cryptographic enforcement of this property.
- Secrets are never logged in application logs, error reports (Sentry/Datadog), or analytics events. Log scrubbing middleware enforces this at the framework level.

### 7.3 Secret Transmission

When secrets must be transmitted to a hosting provider or CI/CD system, they travel over:
1. mTLS channel from EnVault's secure enclave to the provider's API
2. Short-lived in-memory decryption (never written to disk)
3. Transmission receipt logged (key name + provider confirmation ID — not value)

---

## 8. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **API p99 response time** | < 200 ms for single secret read |
| **Bulk secret read (500 secrets)** | < 800 ms |
| **IDE extension secret inject (cold)** | < 1.5 seconds |
| **IDE extension secret inject (cached)** | < 50 ms |
| **Breach detection → alert time** | < 60 seconds from push event detection |
| **Provider sync propagation** | < 30 seconds from vault write to provider confirmation |
| **Availability SLA** | 99.99% (Pro/Enterprise); 99.9% (Free/Starter) |
| **Data durability** | 99.999999999% (11 nines); multi-region replication |
| **Audit log retention** | 7 years (configurable; Enterprise can bring their own storage) |
| **Secret version history retention** | Indefinite (last 20 versions in UI; full history via API) |
| **Maximum secrets per project** | 10,000 (soft limit, Enterprise: unlimited) |
| **Maximum projects per organisation** | 500 (soft limit, Enterprise: unlimited) |
| **GDPR compliance** | Data residency options: EU, US, APAC |
| **Accessibility** | WCAG 2.1 AA (web app) |

---

## 9. Pricing & Packaging

| Tier | Target User | Price | Limits |
|---|---|---|---|
| **Free** | Solo developers, open source | $0 | 3 projects, 100 secrets, 1 user, basic integrations |
| **Starter** | Small teams | $12/user/month | 10 projects, 1,000 secrets, all integrations, 30-day audit log |
| **Pro** | Growing teams | $29/user/month | Unlimited projects/secrets, key rotation, breach detection, 1-year audit log, SAML |
| **Enterprise** | Large organisations | Custom | Unlimited everything, ZK mode, dark web monitoring, on-prem option, custom audit retention, SLA, dedicated CSM |

All paid tiers include a 14-day free trial. No credit card required for Free.

---

## 10. Roadmap

### Phase 1 — Foundation (Months 1–3)
- Core vault: CRUD, AES-256-GCM encryption, version history
- Environment model: development / staging / production
- Intelligence: conflict detection, missing keys, naming conventions
- Integrations: Vercel, Render, Railway, GitHub
- IDE: VS Code extension (inject + inline warnings)
- CLI: `run`, `pull`, `push`, `diff`
- Roles: Viewer / Developer / Admin
- Audit log (90-day retention)
- Key generator

### Phase 2 — Intelligence & Rotation (Months 4–6)
- Full Intelligence Engine (health score, drift analysis, unused key detection)
- Key rotation: scheduling, provider integrations (Stripe, AWS, GitHub, Twilio)
- Breach detection: git scanning + HIBP fingerprint matching
- JetBrains IDE plugin
- Expanded hosting integrations: Fly.io, Netlify, Heroku, AWS
- GitHub Actions integration
- CI/CD ephemeral tokens
- SAML/SSO (Okta, Azure AD, Google Workspace)
- Compliance reports (SOC 2, PCI-DSS)

### Phase 3 — Enterprise & Scale (Months 7–12)
- Zero-knowledge mode
- Dark web monitoring
- Secret Manager bridges (HashiCorp Vault, AWS SM, Azure KV)
- Secret-level ACLs
- JIT access + break-glass
- SCIM provisioning
- Secure enclave for ZK provider sync
- Behavioural anomaly detection
- Post-incident report generation
- Multi-region data residency
- On-premises deployment option

### Phase 4 — Ecosystem (Year 2)
- Public API GA + SDK for Ruby, Java, Rust
- Zed and Neovim integrations
- EnVault Marketplace: community-contributed provider integrations
- Secrets graph: visual map of which service uses which credential
- AI-assisted security posture recommendations
- Automated compliance evidence packaging

---

## 11. Open Questions

| # | Question | Owner | Target Date |
|---|---|---|---|
| 1 | Zero-knowledge mode: should it be the default for all tiers or an Enterprise-only differentiator? | Product + Security | Sprint 2 |
| 2 | How do we handle secret injection for mobile app secrets (iOS/Android build secrets)? | Engineering | Phase 2 planning |
| 3 | Should EnVault be the issuing authority for API keys (generating keys that services validate against EnVault)? This would enable true zero-rotation architecture. | Product | Year 2 review |
| 4 | What is the legal exposure of holding encrypted credentials if a customer is subpoenaed? | Legal | Pre-launch |
| 5 | Provider drift detection frequency: poll-based (every 5 min) vs. webhook-based. Webhooks not universally supported. | Engineering | Sprint 3 |
| 6 | How should we handle secret sharing with external contractors who should not be added as vault members? (Time-limited share links? Separate guest tier?) | Product | Phase 2 |
| 7 | Pricing model for CI/CD bots: count toward seat limit or separate SKU? | Product + Revenue | Month 2 |

---

## 12. Glossary

| Term | Definition |
|---|---|
| **Secret** | Any sensitive configuration value: API key, database credential, token, certificate, or private key |
| **Environment Variable** | A non-sensitive configuration value (e.g., `LOG_LEVEL=info`, `API_BASE_URL=https://...`) |
| **Environment** | A named deployment context: development, staging, production, or custom |
| **Drift** | A state where the value of a key in one environment diverges from the expected or corresponding value in another environment or external system |
| **Rotation** | The process of replacing an active credential with a new one and revoking the old one |
| **Zero-Knowledge (ZK)** | An architecture where the service provider (EnVault) cannot access plaintext secret values, even with full access to their own infrastructure |
| **Fingerprint** | A one-way HMAC-SHA256 hash of a secret value, used for breach correlation without exposing the plaintext |
| **Promotion** | The act of copying secrets from one environment to another (e.g., staging → production) with review |
| **Health Score** | EnVault's composite metric (0–100) representing the overall security and hygiene posture of an environment's configuration |
| **Break-Glass** | An emergency access procedure that grants elevated permissions outside normal RBAC, with immediate notification and mandatory audit trail |
| **JIT Access** | Just-in-time temporary access, granted for a limited duration via an approval workflow |
| **Provider Bridge** | A bidirectional integration between EnVault and an external secret manager (HashiCorp Vault, AWS SM, etc.) |
| **Secure Enclave** | A hardware-isolated compute environment (AWS Nitro Enclave) that processes plaintext secrets ephemerally for ZK provider sync, without exposing data to EnVault infrastructure or staff |

---

*This document is a living specification. All requirements are subject to revision as product discovery progresses. Major changes require sign-off from Product, Engineering, and Security leadership.*

---
**Document Control**

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | Apr 2026 | Product | Initial draft — core vault + environment model |
| 0.2 | Apr 2026 | Product + Security | Added security architecture, ZK mode, breach detection |
| 1.0 | May 2026 | Product + Engineering | Full feature set, integrations, API, roadmap |
