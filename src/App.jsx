/*
 * App.jsx — EnVault prototype shell (approvals, vault, add-project flows)
 * Last modified: 2026-05-09 — Cursor Agent
 * Completeness: 93/100 — hierarchy documented (README/PRD); project vault + env slices; workspace fleet
 */
import { useEffect, useState } from "react";
import { appStyles as sx } from "./styles/createAppStyles.js";
import { globalAppCss } from "./styles/globalAppCss.js";
import { loadGoogleFontsOnce } from "./bootstrap/loadFonts.js";
import { useTheme } from "./theme/ThemeProvider.jsx";
import { v } from "./theme/cssVars.js";

// ─── Seed Data ───────────────────────────────────────────────────────────────
const INITIAL_PENDING = [
  {
    id: "pa-001",
    type: "sync",
    title: "Sync 6 secrets to Vercel Production",
    description: "The vault has 6 changes not yet pushed to your Vercel production deployment.",
    env: "production",
    provider: "Vercel",
    impact: "high",
    triggeredBy: "system",
    triggeredAt: "2026-05-09T14:23:00Z",
    changes: [
      { key: "STRIPE_SECRET_KEY", action: "update", before: "sk_live_old•••", after: "sk_live_new•••", isSecret: true },
      { key: "DATABASE_URL", action: "update", before: "postgres://old-host/db", after: "postgres://new-host/db", isSecret: true },
      { key: "JWT_SECRET", action: "update", before: "old-secret•••", after: "new-secret•••", isSecret: true },
      { key: "API_BASE_URL", action: "update", before: "https://api-v1.myapp.io", after: "https://api-v2.myapp.io", isSecret: false },
      { key: "CDN_URL", action: "add", before: null, after: "https://cdn.myapp.io", isSecret: false },
      { key: "LEGACY_DB_URL", action: "remove", before: "postgres://legacy/db", after: null, isSecret: true },
    ],
    affectedSystems: ["Vercel Production", "Railway Staging"],
    canAutoApprove: true,
  },
  {
    id: "pa-002",
    type: "rotate",
    title: "Rotate STRIPE_SECRET_KEY",
    description: "Scheduled 90-day rotation is due. A new key will be generated via Stripe API and pushed to all environments.",
    env: "all",
    provider: "Stripe",
    impact: "critical",
    triggeredBy: "scheduler",
    triggeredAt: "2026-05-09T13:00:00Z",
    changes: [
      { key: "STRIPE_SECRET_KEY", action: "rotate", before: "sk_live_KJH12•••", after: "[new key will be generated]", isSecret: true },
    ],
    affectedSystems: ["Vercel Production", "Railway Staging", "Dev .env"],
    rotationDetails: { provider: "Stripe", lastRotated: "2026-02-08", daysOld: 90, gracePeriod: "24 hours" },
    canAutoApprove: false,
  },
  {
    id: "pa-003",
    type: "generate",
    title: "Generate environment for new branch: feat/payments-v2",
    description: "A new Git branch was detected. EnVault can auto-generate a preview environment by cloning staging secrets.",
    env: "preview",
    provider: "Internal",
    impact: "medium",
    triggeredBy: "github-integration",
    triggeredAt: "2026-05-09T11:45:00Z",
    changes: [
      { key: "DATABASE_URL", action: "generate", before: null, after: "[cloned from staging + suffix -preview]", isSecret: true },
      { key: "API_BASE_URL", action: "generate", before: null, after: "https://feat-payments-v2.preview.myapp.io", isSecret: false },
      { key: "STRIPE_SECRET_KEY", action: "generate", before: null, after: "[cloned from staging]", isSecret: true },
      { key: "JWT_SECRET", action: "generate", before: null, after: "[new generated value]", isSecret: true },
    ],
    affectedSystems: ["Preview Environment", "Vercel Preview"],
    canAutoApprove: true,
  },
  {
    id: "pa-004",
    type: "commit",
    title: "Commit .env.example to GitHub",
    description: "EnVault wants to update your .env.example file with 3 new keys added this week. No values are included — only key names and descriptions.",
    env: "development",
    provider: "GitHub",
    impact: "low",
    triggeredBy: "system",
    triggeredAt: "2026-05-09T09:10:00Z",
    changes: [
      { key: "RESEND_API_KEY", action: "add", before: null, after: "# Your Resend API key — get it at resend.com/api-keys", isSecret: false },
      { key: "UPSTASH_REDIS_URL", action: "add", before: null, after: "# Upstash Redis connection URL", isSecret: false },
      { key: "SENTRY_DSN", action: "add", before: null, after: "# Sentry project DSN for error tracking", isSecret: false },
    ],
    affectedSystems: ["GitHub repo: my-saas-app"],
    canAutoApprove: true,
  },
];

const INITIAL_RULES = [
  {
    id: "rule-001",
    name: "Auto-sync dev environment",
    description: "Automatically sync vault changes to development after any vault update",
    condition: { env: "development", action: "sync", maxImpact: "low" },
    active: true,
    usedCount: 47,
    lastUsed: "2026-05-09T08:30:00Z",
  },
  {
    id: "rule-002",
    name: "Auto-generate preview environments",
    description: "When a new Git branch is created, auto-generate a preview environment by cloning staging",
    condition: { trigger: "git-branch", action: "generate", env: "preview" },
    active: true,
    usedCount: 12,
    lastUsed: "2026-05-08T16:20:00Z",
  },
  {
    id: "rule-003",
    name: "Auto-commit .env.example",
    description: "Automatically commit .env.example updates to GitHub (values-free)",
    condition: { action: "commit", provider: "GitHub", fileType: ".env.example" },
    active: false,
    usedCount: 8,
    lastUsed: "2026-05-01T10:00:00Z",
  },
];

const INITIAL_ACTIVITY = [
  { id: "a-001", ts: "2026-05-09T14:20:00Z", type: "queued",   actor: "system",     msg: "Sync queued: 6 changes pending for Vercel Production", env: "production", icon: "⏳" },
  { id: "a-002", ts: "2026-05-09T13:01:00Z", type: "queued",   actor: "scheduler",  msg: "Rotation due: STRIPE_SECRET_KEY (90 days old)", env: "all", icon: "🔄" },
  { id: "a-003", ts: "2026-05-09T11:46:00Z", type: "queued",   actor: "github",     msg: "New branch detected: feat/payments-v2 — preview env queued", env: "preview", icon: "🌿" },
  { id: "a-004", ts: "2026-05-09T09:11:00Z", type: "queued",   actor: "system",     msg: ".env.example update queued (3 new keys)", env: "development", icon: "📄" },
  { id: "a-005", ts: "2026-05-09T08:30:00Z", type: "approved", actor: "Auto-Rule",  msg: "Auto-approved: Dev sync (rule: Auto-sync dev environment)", env: "development", icon: "✅" },
  { id: "a-006", ts: "2026-05-09T08:30:00Z", type: "synced",   actor: "system",     msg: "Synced 2 changes to development environment", env: "development", icon: "🚀" },
  { id: "a-007", ts: "2026-05-08T17:15:00Z", type: "approved", actor: "Tim",        msg: "Approved: Sync 4 secrets to Vercel Staging", env: "staging", icon: "✅" },
  { id: "a-008", ts: "2026-05-08T17:16:00Z", type: "synced",   actor: "system",     msg: "Synced 4 changes to Vercel Staging", env: "staging", icon: "🚀" },
  { id: "a-009", ts: "2026-05-08T16:21:00Z", type: "approved", actor: "Auto-Rule",  msg: "Auto-approved: Preview env for feat/auth-redesign", env: "preview", icon: "✅" },
  { id: "a-010", ts: "2026-05-07T14:00:00Z", type: "rejected", actor: "Tim",        msg: "Rejected: Sync to production — database URL mismatch (manual review needed)", env: "production", icon: "❌" },
  { id: "a-011", ts: "2026-05-07T14:05:00Z", type: "updated",  actor: "Tim",        msg: "Updated DATABASE_URL in production vault", env: "production", icon: "✏️" },
  { id: "a-012", ts: "2026-05-06T11:00:00Z", type: "rotated",  actor: "system",     msg: "Rotated JWT_SECRET (approved by Tim on May 5)", env: "all", icon: "🔐" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = iso => {
  const d = new Date(iso);
  const now = new Date("2026-05-09T15:00:00Z");
  const diff = (now - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
};

const IMPACT_META = {
  critical: { label: "Critical", bg: "#fff1f2", color: "#f43f5e", border: "#fecdd3", dot: "#f43f5e" },
  high:     { label: "High",     bg: "#fff7ed", color: "#f97316", border: "#fed7aa", dot: "#f97316" },
  medium:   { label: "Medium",   bg: "#fefce8", color: "#ca8a04", border: "#fef08a", dot: "#ca8a04" },
  low:      { label: "Low",      bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", dot: "#16a34a" },
};

const TYPE_META = {
  sync:     { label: "Sync",     icon: "⇄",  color: "#3b82f6" },
  rotate:   { label: "Rotate",   icon: "↻",  color: "#8b5cf6" },
  generate: { label: "Generate", icon: "✦",  color: "#06b6d4" },
  commit:   { label: "Commit",   icon: "⬆",  color: "#10b981" },
};

const ENV_COLOR = { production:"#f43f5e", staging:"#f97316", preview:"#8b5cf6", development:"#3b82f6", all:"#64748b" };

const HEALTH_META = {
  ok: { label: "Healthy", dot: "#10b981" },
  attention: { label: "Needs review", dot: "#f97316" },
  error: { label: "Blocked", dot: "#f43f5e" },
};

const INITIAL_PROJECTS = [
  {
    id: "p-default",
    name: "my-saas-app",
    slug: "my-saas-app",
    source: "github",
    detail: "GitHub · acme/my-saas-app",
    health: "attention",
    stats: {
      pendingApprovals: 4,
      activeRules: 2,
      vaultKeys: 18,
      lastEvent: "Sync queued for production · 2h ago",
    },
  },
  {
    id: "p-payments",
    name: "payments-api",
    slug: "payments-api",
    source: "github",
    detail: "GitHub · acme/payments-api · Render",
    health: "ok",
    stats: {
      pendingApprovals: 0,
      activeRules: 5,
      vaultKeys: 12,
      lastEvent: "Secret rotated · 1d ago",
    },
  },
  {
    id: "p-marketing",
    name: "marketing-site",
    slug: "marketing-site",
    source: "paste",
    detail: "Pasted env · Vercel static",
    health: "attention",
    stats: {
      pendingApprovals: 1,
      activeRules: 1,
      vaultKeys: 6,
      lastEvent: "Preview env queued · 5h ago",
    },
  },
];

/**
 * Vault model: `vaultScope: "project"` = one vault per app; each environment is a slice (namespace) inside it.
 * Alternate model `environment` would treat each env as its own top-level vault — not used in this prototype.
 * Canonical hierarchy: Project → Vault → Environment → Variable; key name + value as paired fields on the variable.
 */
const VAULT_SCOPE_PRODUCT = /** @type {"project"} */ ("project");

function inferVaultSecretType(key) {
  const u = key.toUpperCase();
  if ((/URL|URI|DSN|HOST/.test(u) && !/API_KEY/.test(u)) || u.endsWith("_URL")) return "connection-string";
  if (/JWT/.test(u)) return "jwt-secret";
  if (/SECRET|KEY|TOKEN|PASSWORD|PASS|CRED/.test(u)) return "api-key";
  return "string";
}

/** Map wizard KEY=value rows into vault secret rows (prototype). */
function wizardKeysToVaultSecrets(keys, updated) {
  const d = updated ?? new Date().toISOString().slice(0, 10);
  return keys.map(k => ({
    key: k.key,
    type: inferVaultSecretType(k.key),
    isSecret: k.isSecret,
    demoPlain: k.isSecret ? undefined : (k.value.length > 72 ? `${k.value.slice(0, 69)}…` : k.value || "—"),
    updated: d,
    health: "ok",
  }));
}

/** Demo vaults: project → environments[] → secrets[]. */
const INITIAL_PROJECT_VAULTS = {
  "p-default": {
    vaultScope: VAULT_SCOPE_PRODUCT,
    environments: [
      {
        id: "production",
        label: "Production",
        secrets: [
          { key: "DATABASE_URL", type: "connection-string", isSecret: true, updated: "2026-05-08", health: "ok" },
          { key: "STRIPE_SECRET_KEY", type: "api-key", isSecret: true, updated: "2026-02-08", health: "rotation-due" },
          { key: "JWT_SECRET", type: "jwt-secret", isSecret: true, updated: "2026-04-01", health: "ok" },
          { key: "API_BASE_URL", type: "string", isSecret: false, demoPlain: "https://api.myapp.io", updated: "2026-05-09", health: "ok" },
          { key: "CDN_URL", type: "string", isSecret: false, demoPlain: "https://cdn.myapp.io", updated: "2026-05-09", health: "pending-sync" },
          { key: "LOG_LEVEL", type: "string", isSecret: false, demoPlain: "info", updated: "2026-01-10", health: "ok" },
        ],
      },
      {
        id: "staging",
        label: "Staging",
        secrets: [
          { key: "DATABASE_URL", type: "connection-string", isSecret: true, updated: "2026-05-07", health: "ok" },
          { key: "STRIPE_SECRET_KEY", type: "api-key", isSecret: true, updated: "2026-04-20", health: "ok" },
          { key: "JWT_SECRET", type: "jwt-secret", isSecret: true, updated: "2026-04-01", health: "ok" },
          { key: "API_BASE_URL", type: "string", isSecret: false, demoPlain: "https://api-staging.myapp.io", updated: "2026-05-08", health: "ok" },
        ],
      },
      {
        id: "preview",
        label: "Preview",
        secrets: [
          { key: "DATABASE_URL", type: "connection-string", isSecret: true, updated: "2026-05-06", health: "ok" },
          { key: "API_BASE_URL", type: "string", isSecret: false, demoPlain: "https://feat-x.preview.myapp.io", updated: "2026-05-06", health: "ok" },
          { key: "JWT_SECRET", type: "jwt-secret", isSecret: true, updated: "2026-05-05", health: "ok" },
        ],
      },
      {
        id: "development",
        label: "Development",
        secrets: [
          { key: "DATABASE_URL", type: "connection-string", isSecret: true, updated: "2026-05-01", health: "ok" },
          { key: "API_BASE_URL", type: "string", isSecret: false, demoPlain: "http://localhost:3000", updated: "2026-04-28", health: "ok" },
          { key: "JWT_SECRET", type: "jwt-secret", isSecret: true, updated: "2026-04-15", health: "ok" },
          { key: "LOG_LEVEL", type: "string", isSecret: false, demoPlain: "debug", updated: "2026-04-10", health: "ok" },
          { key: "DEV_FLAGS", type: "string", isSecret: false, demoPlain: "hot_reload=1", updated: "2026-03-01", health: "ok" },
        ],
      },
    ],
  },
  "p-payments": {
    vaultScope: VAULT_SCOPE_PRODUCT,
    environments: [
      {
        id: "production",
        label: "Production",
        secrets: [
          { key: "DATABASE_URL", type: "connection-string", isSecret: true, updated: "2026-05-07", health: "ok" },
          { key: "STRIPE_WEBHOOK_SECRET", type: "api-key", isSecret: true, updated: "2026-05-01", health: "ok" },
          { key: "INTERNAL_API_KEY", type: "api-key", isSecret: true, updated: "2026-04-12", health: "ok" },
          { key: "REDIS_URL", type: "connection-string", isSecret: true, updated: "2026-04-30", health: "ok" },
          { key: "PAYMENTS_ENV", type: "string", isSecret: false, demoPlain: "production", updated: "2026-01-01", health: "ok" },
        ],
      },
      {
        id: "staging",
        label: "Staging",
        secrets: [
          { key: "DATABASE_URL", type: "connection-string", isSecret: true, updated: "2026-05-05", health: "ok" },
          { key: "STRIPE_WEBHOOK_SECRET", type: "api-key", isSecret: true, updated: "2026-04-28", health: "ok" },
          { key: "INTERNAL_API_KEY", type: "api-key", isSecret: true, updated: "2026-04-10", health: "ok" },
          { key: "PAYMENTS_ENV", type: "string", isSecret: false, demoPlain: "staging", updated: "2026-01-01", health: "ok" },
        ],
      },
      {
        id: "development",
        label: "Development",
        secrets: [
          { key: "DATABASE_URL", type: "connection-string", isSecret: true, updated: "2026-04-01", health: "ok" },
          { key: "INTERNAL_API_KEY", type: "api-key", isSecret: true, updated: "2026-04-01", health: "ok" },
          { key: "PAYMENTS_ENV", type: "string", isSecret: false, demoPlain: "development", updated: "2026-01-01", health: "ok" },
        ],
      },
    ],
  },
  "p-marketing": {
    vaultScope: VAULT_SCOPE_PRODUCT,
    environments: [
      {
        id: "production",
        label: "Production",
        secrets: [
          { key: "NEXT_PUBLIC_SITE_URL", type: "string", isSecret: false, demoPlain: "https://www.acme.com", updated: "2026-05-08", health: "ok" },
          { key: "CONTACT_FORM_SECRET", type: "api-key", isSecret: true, updated: "2026-04-01", health: "ok" },
          { key: "ANALYTICS_ID", type: "string", isSecret: false, demoPlain: "G-XXXX", updated: "2026-03-15", health: "ok" },
          { key: "PREVIEW_PASSWORD", type: "api-key", isSecret: true, updated: "2026-02-01", health: "ok" },
        ],
      },
      {
        id: "preview",
        label: "Preview",
        secrets: [
          { key: "NEXT_PUBLIC_SITE_URL", type: "string", isSecret: false, demoPlain: "https://preview.acme.com", updated: "2026-05-07", health: "ok" },
          { key: "CONTACT_FORM_SECRET", type: "api-key", isSecret: true, updated: "2026-04-01", health: "ok" },
        ],
      },
    ],
  },
};

const MOCK_GITHUB_REPOS = [
  { id: "gh-1", fullName: "acme/payments-api", private: true, defaultBranch: "main" },
  { id: "gh-2", fullName: "acme/marketing-site", private: false, defaultBranch: "main" },
  { id: "gh-3", fullName: "acme/data-pipeline", private: true, defaultBranch: "develop" },
  { id: "gh-4", fullName: "t1mm0/envault-ux", private: false, defaultBranch: "main" },
];

const MOCK_RENDER_SERVICES = [
  { id: "rs-1", name: "payments-api-prod", envCount: 12, region: "Oregon" },
  { id: "rs-2", name: "web-static", envCount: 4, region: "Frankfurt" },
  { id: "rs-3", name: "worker-emails", envCount: 7, region: "Oregon" },
];

/** Parse pasted .env–style lines (KEY=value, optional export, # comments). */
function parseEnvPaste(text) {
  const out = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const unquoted = line.replace(/^export\s+/i, "");
    const eq = unquoted.indexOf("=");
    if (eq < 1) continue;
    let key = unquoted.slice(0, eq).trim();
    let value = unquoted.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) out.push({ key, value, isSecret: /SECRET|KEY|TOKEN|PASSWORD|PASS|CRED/i.test(key) });
  }
  return out;
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const { mode, toggleMode } = useTheme();

  useEffect(() => {
    loadGoogleFontsOnce();
  }, []);

  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState(INITIAL_PROJECTS[0].id);
  const [view, setView] = useState("workspace");
  const [pending, setPending] = useState(INITIAL_PENDING);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [selected, setSelected] = useState(INITIAL_PENDING[0]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleTarget, setRuleTarget] = useState(null);
  const [approveNote, setApproveNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [toast, setToast] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState({});
  const [projectVaults, setProjectVaults] = useState(INITIAL_PROJECT_VAULTS);

  const currentProject = projects.find(p => p.id === currentProjectId) ?? projects[0];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddProjectComplete = ({ name, source, detail, keys }) => {
    const id = `p-${Date.now()}`;
    const k = keys.length;
    const today = new Date().toISOString().slice(0, 10);
    const devSecrets = wizardKeysToVaultSecrets(keys, today);
    setProjectVaults(v => ({
      ...v,
      [id]: {
        vaultScope: VAULT_SCOPE_PRODUCT,
        environments: [{ id: "development", label: "Development", secrets: devSecrets }],
      },
    }));
    setProjects(ps => [
      ...ps,
      {
        id,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project",
        source,
        detail,
        health: "ok",
        stats: {
          pendingApprovals: 0,
          activeRules: 0,
          vaultKeys: k,
          lastEvent: "Created just now",
        },
      },
    ]);
    setCurrentProjectId(id);
    const now = new Date().toISOString();
    setActivity(a => [
      {
        id: `a-proj-${Date.now()}`,
        ts: now,
        type: "updated",
        actor: "Tim",
        msg: `Added project "${name}" (${k} environment variable${k !== 1 ? "s" : ""}) — ${detail}`,
        env: "development",
        icon: "📦",
      },
      ...a,
    ]);
    showToast(`Project "${name}" added — ${k} key${k !== 1 ? "s" : ""} seeded in Development.`);
    setView("workspace");
  };

  const handleApprove = () => {
    const item = selected;
    const now = new Date().toISOString();
    setPending(p => p.filter(x => x.id !== item.id));
    setActivity(a => [
      { id: `a-new-${Date.now()}`, ts: now, type: "approved", actor: "Tim", msg: `Approved: ${item.title}`, env: item.env, icon: "✅" },
      { id: `a-new2-${Date.now()}`, ts: now, type: item.type === "sync" ? "synced" : "rotated", actor: "system", msg: `Executed: ${item.title}`, env: item.env, icon: "🚀" },
      ...a,
    ]);
    setSelected(null);
    setShowApproveModal(false);
    setApproveNote("");
    showToast(`Approved and executed: ${item.title}`);
  };

  const handleReject = () => {
    const item = selected;
    const now = new Date().toISOString();
    setPending(p => p.filter(x => x.id !== item.id));
    setActivity(a => [
      { id: `a-rej-${Date.now()}`, ts: now, type: "rejected", actor: "Tim", msg: `Rejected: ${item.title}${rejectNote ? ` — ${rejectNote}` : ""}`, env: item.env, icon: "❌" },
      ...a,
    ]);
    setSelected(null);
    setShowRejectModal(false);
    setRejectNote("");
    showToast(`Rejected: ${item.title}`, "warn");
  };

  const handleCreateRule = (item) => {
    setRuleTarget(item);
    setShowRuleModal(true);
  };

  const handleSaveRule = (ruleName) => {
    const item = ruleTarget;
    const newRule = {
      id: `rule-${Date.now()}`,
      name: ruleName,
      description: `Auto-approve: ${item.title}`,
      condition: { env: item.env, action: item.type, maxImpact: item.impact },
      active: true,
      usedCount: 0,
      lastUsed: null,
    };
    setRules(r => [...r, newRule]);
    setShowRuleModal(false);
    setRuleTarget(null);
    showToast(`Auto-approve rule created: "${ruleName}"`);
  };

  const toggleRule = id => setRules(r => r.map(x => x.id === id ? { ...x, active: !x.active } : x));
  const deleteRule = id => { setRules(r => r.filter(x => x.id !== id)); showToast("Rule deleted", "warn"); };

  const toggleReveal = key => setRevealedKeys(r => ({ ...r, [key]: !r[key] }));

  return (
    <div style={sx.app}>
      <style>{globalAppCss}</style>

      {/* Header */}
      <header style={sx.header}>
        <div style={sx.logo}>
          <div style={sx.logoMark}>
            <span style={{ fontSize: 14 }}>🔐</span>
          </div>
          <span style={sx.logoText}>EnVault</span>
          <div style={sx.projectSwitcher}>
            <label htmlFor="project-select" style={sx.srOnly}>Active project</label>
            <select
              id="project-select"
              value={currentProjectId}
              onChange={e => setCurrentProjectId(e.target.value)}
              style={sx.projectSelect}
              aria-label="Active project"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              type="button"
              style={sx.addProjectHeaderBtn}
              onClick={() => setView("add-project")}
              title="Add project"
            >
              +
            </button>
          </div>
        </div>

        <nav style={sx.nav}>
          {[
            { id: "workspace", label: "Workspace" },
            { id: "dashboard", label: "Overview" },
            { id: "add-project", label: "Add project" },
            { id: "approvals", label: "Approvals", count: pending.length },
            { id: "rules",     label: "Auto-Rules" },
            { id: "activity",  label: "Activity" },
            { id: "vault",     label: "Vault" },
          ].map(n => (
            <button key={n.id} style={{ ...sx.navBtn, ...(view === n.id ? sx.navBtnActive : {}) }}
              onClick={() => setView(n.id)}>
              {n.label}
              {n.count > 0 && <span style={sx.navBadge}>{n.count}</span>}
            </button>
          ))}
        </nav>

        <div style={sx.headerRight}>
          <button
            type="button"
            style={sx.themeToggleBtn}
            onClick={toggleMode}
            title={mode === "light" ? "Switch to dark theme" : "Switch to light theme"}
            aria-label={mode === "light" ? "Switch to dark theme" : "Switch to light theme"}
          >
            {mode === "light" ? "Dark" : "Light"}
          </button>
          <div style={sx.envIndicator}>
            <span style={{ ...sx.envDot, background: "#f43f5e" }} />
            production
          </div>
          <div style={sx.avatar}>TW</div>
        </div>
      </header>

      {/* Main */}
      <main style={sx.main}>
        {view === "workspace" && (
          <WorkspaceView
            projects={projects}
            currentProjectId={currentProjectId}
            pendingDemoCount={pending.length}
            onNavigate={setView}
            onSelectProject={setCurrentProjectId}
            onOpenProjectOverview={id => {
              setCurrentProjectId(id);
              setView("dashboard");
            }}
            onAddProject={() => setView("add-project")}
          />
        )}
        {view === "dashboard"  && (
          <DashboardView
            currentProject={currentProject}
            pending={pending}
            activity={activity}
            rules={rules}
            onNavigate={setView}
            onAddProject={() => setView("add-project")}
          />
        )}
        {view === "add-project" && (
          <AddProjectView onComplete={handleAddProjectComplete} onCancel={() => setView("workspace")} />
        )}
        {view === "approvals"  && (
          <ApprovalsView
            pending={pending} selected={selected} setSelected={setSelected}
            revealedKeys={revealedKeys} toggleReveal={toggleReveal}
            onApprove={() => setShowApproveModal(true)}
            onReject={() => setShowRejectModal(true)}
            onCreateRule={handleCreateRule}
          />
        )}
        {view === "rules"     && <RulesView rules={rules} toggleRule={toggleRule} deleteRule={deleteRule} />}
        {view === "activity"  && <ActivityView activity={activity} />}
        {view === "vault"     && (
          <VaultView
            projectId={currentProjectId}
            projectName={currentProject.name}
            projectVaults={projectVaults}
          />
        )}
      </main>

      {/* Approve Modal */}
      {showApproveModal && selected && (
        <Modal onClose={() => setShowApproveModal(false)}>
          <div style={sx.modalIcon}>✅</div>
          <div style={sx.modalTitle}>Confirm Approval</div>
          <div style={sx.modalSub}>
            You're approving: <strong>{selected.title}</strong>
          </div>
          <div style={sx.impactRow}>
            <ImpactBadge level={selected.impact} />
            <span style={{ color: "#64748b", fontSize: 13 }}>
              Affects: {selected.affectedSystems.join(", ")}
            </span>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={sx.formLabel}>Note (optional)</label>
            <textarea style={sx.textarea} placeholder="Add a note for the audit log…"
              value={approveNote} onChange={e => setApproveNote(e.target.value)} rows={3} />
          </div>
          <div style={sx.modalActions}>
            <button style={sx.btnGhost} onClick={() => setShowApproveModal(false)}>Cancel</button>
            <button style={sx.btnApprove} onClick={handleApprove}>Approve & Execute</button>
          </div>
          <div style={sx.modalHint}>
            This action will be logged in the audit trail with your name and timestamp.
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && selected && (
        <Modal onClose={() => setShowRejectModal(false)}>
          <div style={sx.modalIcon}>❌</div>
          <div style={sx.modalTitle}>Reject Action</div>
          <div style={sx.modalSub}>
            Rejecting: <strong>{selected.title}</strong>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={sx.formLabel}>Reason (recommended)</label>
            <textarea style={sx.textarea} placeholder="Why are you rejecting this? Helps the team understand…"
              value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3} />
          </div>
          <div style={sx.modalActions}>
            <button style={sx.btnGhost} onClick={() => setShowRejectModal(false)}>Cancel</button>
            <button style={sx.btnReject} onClick={handleReject}>Reject</button>
          </div>
          <div style={sx.modalHint}>
            The action will be cancelled and logged. You can re-trigger it from the Vault.
          </div>
        </Modal>
      )}

      {/* Create Rule Modal */}
      {showRuleModal && ruleTarget && (
        <CreateRuleModal
          item={ruleTarget}
          onSave={handleSaveRule}
          onClose={() => { setShowRuleModal(false); setRuleTarget(null); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ ...sx.toast, ...(toast.type === "warn" ? sx.toastWarn : {}) }}>
          {toast.type === "warn" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Workspace (fleet) ───────────────────────────────────────────────────────
function WorkspaceView({
  projects,
  currentProjectId,
  pendingDemoCount,
  onNavigate,
  onSelectProject,
  onOpenProjectOverview,
  onAddProject,
}) {
  const fleetPending = projects.reduce((s, p) => s + (p.stats?.pendingApprovals ?? 0), 0);
  const fleetKeys = projects.reduce((s, p) => s + (p.stats?.vaultKeys ?? 0), 0);
  const fleetRulesRollup = projects.reduce((s, p) => s + (p.stats?.activeRules ?? 0), 0);
  const attentionProjects = projects.filter(p => p.health !== "ok").length;

  return (
    <div style={sx.viewPad}>
      <div style={sx.overviewTop}>
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <PageHeader
            title="Workspace"
            sub="Fleet view — scan every linked project before you drill into approvals, vault, or rules for a single app."
          />
        </div>
        <button type="button" style={sx.btnPrimaryOutline} onClick={onAddProject}>
          + Add project
        </button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <button type="button" style={{ ...sx.viewAllBtn, fontSize: 13 }} onClick={() => onNavigate("dashboard")}>
          ← Project overview ({projects.find(p => p.id === currentProjectId)?.name ?? "—"})
        </button>
      </div>

      <p style={sx.workspaceHint}>
        Roll-up numbers below are mocked per-project stats for navigation; the shared <strong>Approvals</strong> queue in this prototype
        ({pendingDemoCount} items) stays global — a future backend attaches actions to projects.
      </p>

      <div style={{ ...sx.statGrid, marginBottom: 24 }} className="statGrid4">
        <StatCard label="Projects linked" value={projects.length} accent="#3b82f6"
          sub="Repos, paste imports, Renderer services" />
        <StatCard label="Fleet pending" value={fleetPending} accent="#f97316"
          sub={`${attentionProjects} project${attentionProjects !== 1 ? "s need" : " needs"} attention`}
          onClick={() => onNavigate("approvals")} />
        <StatCard label="Active auto-rules" value={fleetRulesRollup} accent="#10b981"
          sub="Per-project rule counts (mock rollup)" />
        <StatCard label="Indexed secrets (all)" value={fleetKeys} accent="#8b5cf6"
          sub="Keys across vault snapshots" />
      </div>

      <div style={sx.sectionRow}>
        <SectionTitle>Projects</SectionTitle>
        <button style={sx.viewAllBtn} onClick={() => onNavigate("approvals")}>Approvals ({pendingDemoCount}) →</button>
      </div>

      <div className="workspaceFleetGrid">
        {projects.map(p => (
          <div
            key={p.id}
            style={{
              ...sx.projectFleetCard,
              ...(p.health === "error" ? sx.projectFleetCardError : {}),
              ...(p.health === "attention" ? sx.projectFleetCardAttention : {}),
            }}
          >
            <div style={sx.projectFleetHeader}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <h2 style={sx.projectFleetName}>{p.name}</h2>
                  {p.id === currentProjectId && (
                    <span style={sx.activeProjectBadge}>Active in header</span>
                  )}
                </div>
                <div style={sx.projectFleetDetail}>{p.detail}</div>
              </div>
              <ProjectHealthBadge health={p.health} />
            </div>

            <div style={sx.projectFleetStatsRow}>
              <span style={sx.projectFleetStatChip}>
                {p.stats?.pendingApprovals ?? 0} pending
              </span>
              <span style={sx.projectFleetStatChip}>
                {p.stats?.activeRules ?? 0} auto-rules
              </span>
              <span style={sx.projectFleetStatChip}>
                {p.stats?.vaultKeys ?? 0} keys
              </span>
            </div>

            <div style={sx.projectFleetLastLine}>{p.stats?.lastEvent ?? "No recent activity"}</div>

            <div style={sx.projectFleetActions}>
              <button
                type="button"
                style={sx.btnPrimaryOutline}
                onClick={() => onOpenProjectOverview(p.id)}
              >
                Open overview
              </button>
              <button
                type="button"
                style={sx.btnFleetSecondary}
                onClick={() => {
                  onSelectProject(p.id);
                  onNavigate("vault");
                }}
              >
                Vault
              </button>
              {(p.stats?.pendingApprovals ?? 0) > 0 && (
                <button
                  type="button"
                  style={sx.btnFleetSecondary}
                  onClick={() => {
                    onSelectProject(p.id);
                    onNavigate("approvals");
                  }}
                >
                  Queue
                </button>
              )}
              <button
                type="button"
                style={sx.btnFleetSecondary}
                onClick={() => onSelectProject(p.id)}
              >
                Set active
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectHealthBadge({ health }) {
  const h = HEALTH_META[health] ?? HEALTH_META.ok;
  return (
    <div style={sx.projectFleetHealth}>
      <span style={{ ...sx.healthDot, background: h.dot }} aria-hidden />
      <span>{h.label}</span>
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({ currentProject, pending, activity, rules, onNavigate, onAddProject }) {
  const approved = activity.filter(a => a.type === "approved").length;
  const rejected = activity.filter(a => a.type === "rejected").length;
  const autoApproved = activity.filter(a => a.type === "approved" && a.actor === "Auto-Rule").length;

  return (
    <div style={sx.viewPad}>
      <div style={sx.overviewTop}>
        <div style={{ flex: "1 1 260px", minWidth: 0 }}>
          <PageHeader
            title="Overview"
            eyebrow={`Active project · ${currentProject.name}`}
            sub="Trust dashboard for the project selected in the header — approvals, rules, and activity at a glance."
          />
        </div>
        <button type="button" style={sx.btnPrimaryOutline} onClick={onAddProject}>
          + Add project
        </button>
      </div>

      {/* Stat cards */}
      <div style={sx.statGrid} className="statGrid4">
        <StatCard label="Pending Approvals" value={pending.length} accent="#f97316"
          sub="Awaiting your review" onClick={() => onNavigate("approvals")} />
        <StatCard label="Auto-approved (7d)" value={autoApproved} accent="#10b981"
          sub="Via your rules — no action needed" />
        <StatCard label="Manually Approved" value={approved - autoApproved} accent="#3b82f6"
          sub="You reviewed and confirmed" />
        <StatCard label="Rejected" value={rejected} accent="#f43f5e"
          sub="Blocked before execution" />
      </div>

      {/* Pending preview */}
      <div style={sx.sectionRow}>
        <SectionTitle>Pending Your Approval</SectionTitle>
        <button style={sx.viewAllBtn} onClick={() => onNavigate("approvals")}>View all →</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pending.slice(0, 3).map(item => (
          <MiniApprovalCard key={item.id} item={item} onClick={() => { onNavigate("approvals"); }} />
        ))}
        {pending.length === 0 && (
          <div style={sx.emptyState}>
            <div style={{ fontSize: 28 }}>✅</div>
            <div>All caught up — nothing pending approval</div>
          </div>
        )}
      </div>

      {/* Active rules */}
      <div style={{ marginTop: 32 }}>
        <div style={sx.sectionRow}>
          <SectionTitle>Active Auto-Approve Rules</SectionTitle>
          <button style={sx.viewAllBtn} onClick={() => onNavigate("rules")}>Manage →</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rules.filter(r => r.active).map(r => (
            <div key={r.id} style={sx.miniRuleCard}>
              <span style={sx.ruleIndicatorDot} />
              <div>
                <div style={sx.ruleCardTitle}>{r.name}</div>
                <div style={sx.ruleCardDesc}>{r.description}</div>
              </div>
              <div style={sx.ruleUsage}>Used {r.usedCount}×</div>
            </div>
          ))}
        </div>
      </div>

      <div style={sx.calloutInfo}>
        <div style={sx.calloutInfoTitle}>Add another project</div>
        <div style={{ ...sx.calloutInfoText, marginBottom: 12 }}>
          Link GitHub, paste Render-style KEY=value pairs, or connect Render for deploy sync — demo flows only, no real OAuth.
        </div>
        <button type="button" style={sx.btnGhost} onClick={onAddProject}>Add project →</button>
      </div>
    </div>
  );
}
function ApprovalsView({ pending, selected, setSelected, revealedKeys, toggleReveal, onApprove, onReject, onCreateRule }) {
  return (
    <div style={sx.splitLayout} className="splitResponsive">
      {/* Left: Queue */}
      <div style={sx.queuePanel}>
        <div style={sx.queueHeader}>
          <div>
            <div style={sx.queueTitle}>Approval Queue</div>
            <div style={sx.queueSub}>{pending.length} action{pending.length !== 1 ? "s" : ""} awaiting your review</div>
          </div>
        </div>

        {pending.length === 0 ? (
          <div style={{ ...sx.emptyState, padding: "60px 24px" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 600, color: "#0f1e3d" }}>All clear</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>No pending approvals</div>
          </div>
        ) : (
          <div style={sx.queueList}>
            {pending.map(item => (
              <ApprovalCard key={item.id} item={item}
                isSelected={selected?.id === item.id}
                onClick={() => setSelected(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Right: Detail */}
      <div style={sx.detailPanel}>
        {!selected ? (
          <div style={{ ...sx.emptyState, height: "100%" }}>
            <div style={{ fontSize: 32, opacity: 0.4 }}>←</div>
            <div style={{ color: "#94a3b8", fontSize: 14 }}>Select an action to review</div>
          </div>
        ) : (
          <ApprovalDetail
            item={selected}
            revealedKeys={revealedKeys}
            toggleReveal={toggleReveal}
            onApprove={onApprove}
            onReject={onReject}
            onCreateRule={onCreateRule}
          />
        )}
      </div>
    </div>
  );
}

function ApprovalCard({ item, isSelected, onClick }) {
  const tm = TYPE_META[item.type];
  const im = IMPACT_META[item.impact];
  return (
    <div style={{ ...sx.approvalCard, ...(isSelected ? sx.approvalCardActive : {}) }} onClick={onClick}>
      <div style={sx.approvalCardTop}>
        <span style={{ ...sx.typePill, color: tm.color, background: `${tm.color}15`, border: `1px solid ${tm.color}30` }}>
          {tm.icon} {tm.label}
        </span>
        <span style={{ ...sx.impactPill, color: im.color, background: im.bg, border: `1px solid ${im.border}` }}>
          {im.label}
        </span>
      </div>
      <div style={sx.approvalCardTitle}>{item.title}</div>
      <div style={sx.approvalCardMeta}>
        <span style={{ ...sx.envTag, background: `${ENV_COLOR[item.env]}15`, color: ENV_COLOR[item.env] }}>
          {item.env}
        </span>
        <span style={sx.approvalCardTime}>{fmtTime(item.triggeredAt)}</span>
      </div>
    </div>
  );
}

function ApprovalDetail({ item, revealedKeys, toggleReveal, onApprove, onReject, onCreateRule }) {
  const tm = TYPE_META[item.type];
  const im = IMPACT_META[item.impact];

  return (
    <div style={sx.detail}>
      {/* Header */}
      <div style={sx.detailHeader}>
        <div style={sx.detailHeaderTop}>
          <span style={{ ...sx.typePill, color: tm.color, background: `${tm.color}15`, border: `1px solid ${tm.color}30`, fontSize: 12 }}>
            {tm.icon} {tm.label}
          </span>
          <ImpactBadge level={item.impact} />
        </div>
        <div style={sx.detailTitle}>{item.title}</div>
        <div style={sx.detailDesc}>{item.description}</div>

        <div style={sx.metaRow}>
          <MetaChip label="Environment" value={item.env} color={ENV_COLOR[item.env]} />
          <MetaChip label="Triggered by" value={item.triggeredBy} />
          <MetaChip label="Provider" value={item.provider} />
          <MetaChip label="Requested" value={fmtTime(item.triggeredAt)} />
        </div>
      </div>

      {/* Affected systems */}
      <div style={sx.section}>
        <div style={sx.sectionLabel}>Affected systems</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {item.affectedSystems.map(s => (
            <span key={s} style={sx.systemTag}>{s}</span>
          ))}
        </div>
      </div>

      {/* Change diff */}
      <div style={sx.section}>
        <div style={sx.sectionLabel}>
          Proposed changes — {item.changes.length} key{item.changes.length !== 1 ? "s" : ""}
        </div>
        <div style={sx.diffTable}>
          <div style={sx.diffHeader}>
            <span>Key</span><span>Action</span><span>Before</span><span>After</span>
          </div>
          {item.changes.map((c, i) => {
            const revealed = revealedKeys[`${item.id}-${c.key}`];
            return (
              <div key={i} style={{ ...sx.diffRow, ...(c.action === "remove" ? sx.diffRowRemove : c.action === "add" ? sx.diffRowAdd : c.action === "rotate" || c.action === "generate" ? sx.diffRowGenerate : sx.diffRowUpdate) }}>
                <span style={sx.diffKey}>{c.key}</span>
                <span style={{ ...sx.actionBadge, ...ACTION_STYLE[c.action] }}>{c.action}</span>
                <span style={sx.diffVal}>
                  {c.before ? (c.isSecret && !revealed ? maskVal(c.before) : c.before) : <em style={{ color: "#94a3b8" }}>—</em>}
                </span>
                <span style={{ ...sx.diffVal, display: "flex", alignItems: "center", gap: 4 }}>
                  {c.after ? (c.isSecret && !revealed ? maskVal(c.after) : c.after) : <em style={{ color: "#94a3b8" }}>—</em>}
                  {c.isSecret && (
                    <button style={sx.revealBtn} onClick={() => toggleReveal(`${item.id}-${c.key}`)}>
                      {revealed ? "hide" : "reveal"}
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rotation details */}
      {item.rotationDetails && (
        <div style={sx.section}>
          <div style={sx.sectionLabel}>Rotation details</div>
          <div style={sx.rotationCard}>
            <div style={sx.rotationRow}><span>Provider</span><strong>{item.rotationDetails.provider}</strong></div>
            <div style={sx.rotationRow}><span>Last rotated</span><strong>{item.rotationDetails.lastRotated}</strong></div>
            <div style={sx.rotationRow}><span>Age</span><strong style={{ color: "#f43f5e" }}>{item.rotationDetails.daysOld} days</strong></div>
            <div style={sx.rotationRow}><span>Grace period</span><strong>{item.rotationDetails.gracePeriod}</strong></div>
          </div>
        </div>
      )}

      {/* Trust notice */}
      <div style={sx.trustNotice}>
        <span style={{ fontSize: 16 }}>🔒</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#0f1e3d" }}>Your approval is required before anything executes.</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            This action will not proceed without your explicit confirmation. Your decision is logged in the immutable audit trail.
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={sx.actionRow}>
        <button style={sx.btnReject} onClick={onReject}>Reject</button>
        {item.canAutoApprove && (
          <button style={sx.btnRule} onClick={() => onCreateRule(item)}>
            + Auto-approve rule
          </button>
        )}
        <button style={sx.btnApprove} onClick={onApprove}>
          Approve & Execute →
        </button>
      </div>
    </div>
  );
}

const ACTION_STYLE = {
  update:   { background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" },
  add:      { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" },
  remove:   { background: "#fff1f2", color: "#f43f5e", border: "1px solid #fecdd3" },
  rotate:   { background: "#f5f3ff", color: "#8b5cf6", border: "1px solid #ddd6fe" },
  generate: { background: "#ecfeff", color: "#06b6d4", border: "1px solid #a5f3fc" },
};

const maskVal = v => {
  if (!v || v.length <= 4) return "••••••••";
  return v.slice(0, 3) + "•".repeat(8) + v.slice(-2);
};

// ─── Rules View ───────────────────────────────────────────────────────────────
function RulesView({ rules, toggleRule, deleteRule }) {
  return (
    <div style={sx.viewPad}>
      <PageHeader
        title="Auto-Approve Rules"
        sub="Define when EnVault can act automatically — without asking you each time"
      />

      <div style={sx.rulesExplainer}>
        <span style={{ fontSize: 18 }}>💡</span>
        <div>
          <strong>You're always in control.</strong> Rules let you delegate low-risk, repetitive approvals to EnVault.
          High-impact actions (production syncs, key rotations) always require manual approval — rules can't override this.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {rules.map(rule => (
          <RuleCard key={rule.id} rule={rule} onToggle={() => toggleRule(rule.id)} onDelete={() => deleteRule(rule.id)} />
        ))}
      </div>

      <div style={{ marginTop: 32, padding: "20px 24px", background: "#f8f7f4", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
        <div style={{ fontWeight: 600, color: "#0f1e3d", marginBottom: 4 }}>How rules work</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {[
            ["✅", "Auto-approved", "Action matches a rule and executes immediately, logged as 'Auto-Rule'"],
            ["⏳", "Queued for review", "No matching rule — appears in your Approval Queue"],
            ["🚫", "Always manual", "Critical actions (production rotation, key generation) always require your approval"],
          ].map(([icon, label, desc]) => (
            <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span>{icon}</span>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{label}:</span>
                <span style={{ fontSize: 13, color: "#64748b", marginLeft: 6 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddProjectView({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [githubQuery, setGithubQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [pasteText, setPasteText] = useState("");
  const [renderConnected, setRenderConnected] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [projectName, setProjectName] = useState("");

  const pickMethod = (m) => {
    setMethod(m);
    setSelectedRepo(null);
    setSelectedService(null);
    setStep(2);
  };

  const filteredRepos = MOCK_GITHUB_REPOS.filter(r =>
    r.fullName.toLowerCase().includes(githubQuery.trim().toLowerCase()));

  const keysForReview = () => {
    if (method === "github" && selectedRepo) {
      return [
        { key: "NODE_ENV", value: "development", isSecret: false },
        { key: "DATABASE_URL", value: "postgresql://user:•••@cluster/db", isSecret: true },
        { key: "API_SECRET_KEY", value: "sk_live_••••••••", isSecret: true },
        { key: "PUBLIC_APP_URL", value: "https://" + selectedRepo.fullName.replace(/\//g, "-") + ".example.com", isSecret: false },
        { key: "NEXTAUTH_SECRET", value: "generated_••••••••", isSecret: true },
      ];
    }
    if (method === "paste") return parseEnvPaste(pasteText);
    if (method === "render" && selectedService) {
      const labels = [
        { key: "NODE_ENV", value: "production", isSecret: false },
        { key: "PORT", value: "10000", isSecret: false },
        { key: "DATABASE_URL", value: "postgresql://••••••••", isSecret: true },
        { key: "SESSION_SECRET", value: "••••••••", isSecret: true },
        { key: "STRIPE_SECRET_KEY", value: "••••••••", isSecret: true },
        { key: "RENDER_EXTERNAL_URL", value: "https://" + selectedService.name + ".onrender.com", isSecret: false },
        { key: "REDIS_URL", value: "••••••••", isSecret: true },
        { key: "SMTP_URL", value: "••••••••", isSecret: true },
        { key: "WEBHOOK_SECRET", value: "••••••••", isSecret: true },
      ];
      return labels.slice(0, Math.min(selectedService.envCount, labels.length));
    }
    return [];
  };

  const goToReview = () => {
    const keys = keysForReview();
    if (method === "github") {
      if (!selectedRepo) return;
      setProjectName(selectedRepo.fullName.split("/").pop());
    } else if (method === "paste") {
      if (keys.length === 0) return;
      setProjectName(prev => prev.trim() || `env-import-${keys.length}-keys`);
    } else if (method === "render") {
      if (!renderConnected || !selectedService) return;
      setProjectName(selectedService.name);
    }
    setStep(3);
  };

  const handleSubmit = () => {
    const name = projectName.trim();
    const keys = keysForReview();
    if (!name || keys.length === 0) return;
    let detail = "";
    if (method === "github") detail = `GitHub · ${selectedRepo.fullName}`;
    else if (method === "paste") detail = "Pasted KEY=value list";
    else if (method === "render") detail = `Render · ${selectedService.name} (${selectedService.region})`;
    onComplete({ name, source: method, detail, keys });
  };

  const pasteParsed = parseEnvPaste(pasteText);

  const keysPreview = step === 3 ? keysForReview() : [];

  return (
    <div style={sx.viewPad}>
      <div style={sx.addProjectBar}>
        <button type="button" style={sx.btnGhost} onClick={onCancel}>← Back</button>
        <div style={sx.stepDots} aria-hidden>
          {[1, 2, 3].map(s => (
            <span key={s} style={{ ...sx.stepDot, ...(step >= s ? sx.stepDotOn : {}) }} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <>
          <PageHeader
            title="Add a project"
            sub="Bring a new app into EnVault — link GitHub, paste environment variables (like Render's editor), or connect Render for publish-time sync. Prototype: no real OAuth."
          />
          <div style={sx.pathGrid} className="pathGrid3">
            <button type="button" style={sx.pathCard} onClick={() => pickMethod("github")}>
              <span style={sx.pathIcon}>🐙</span>
              <div style={sx.pathTitle}>GitHub repository</div>
              <p style={sx.pathDesc}>Pick a repo you already granted EnVault. We'll attach the project and seed keys from your default environment (demo list).</p>
              <span style={sx.pathCta}>Select repo →</span>
            </button>
            <button type="button" style={sx.pathCard} onClick={() => pickMethod("paste")}>
              <span style={sx.pathIcon}>📋</span>
              <div style={sx.pathTitle}>Paste KEY=value pairs</div>
              <p style={sx.pathDesc}>Copy from Render, Railway, Vercel, or a local .env file. Same flow as pasting into a host's environment editor.</p>
              <span style={sx.pathCta}>Paste keys →</span>
            </button>
            <button type="button" style={sx.pathCard} onClick={() => pickMethod("render")}>
              <span style={sx.pathIcon}>◆</span>
              <div style={sx.pathTitle}>Render</div>
              <p style={sx.pathDesc}>Connect your Render account, choose a web service or worker, and import its environment for publishing &amp; rotation workflows.</p>
              <span style={sx.pathCta}>Connect Render →</span>
            </button>
          </div>
        </>
      )}

      {step === 2 && method === "github" && (
        <>
          <PageHeader title="Choose a GitHub repository" sub="Filtered from your connected organizations (mock data)." />
          <input
            type="search"
            style={{ ...sx.formInput, maxWidth: 400, marginBottom: 16 }}
            placeholder="Search repositories…"
            value={githubQuery}
            onChange={e => setGithubQuery(e.target.value)}
            aria-label="Search GitHub repositories"
          />
          <div style={sx.repoList}>
            {filteredRepos.map(r => (
              <button
                type="button"
                key={r.id}
                style={{ ...sx.repoRow, ...(selectedRepo?.id === r.id ? sx.repoRowActive : {}) }}
                onClick={() => setSelectedRepo(r)}
              >
                <span style={sx.repoName}>{r.fullName}</span>
                <span style={sx.repoMeta}>{r.private ? "Private" : "Public"} · {r.defaultBranch}</span>
              </button>
            ))}
            {filteredRepos.length === 0 && <div style={sx.mutedBox}>No repos match that search.</div>}
          </div>
          <div style={sx.wizardActions}>
            <button type="button" style={sx.btnGhost} onClick={() => { setStep(1); setMethod(null); }}>Change method</button>
            <button type="button" style={sx.btnApprove} onClick={goToReview} disabled={!selectedRepo}>Continue</button>
          </div>
        </>
      )}

      {step === 2 && method === "paste" && (
        <>
          <PageHeader title="Paste environment variables" sub="Supports # comments, export FOO=bar, and quoted values." />
          <textarea
            style={{ ...sx.textarea, minHeight: 220, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}
            placeholder={"DATABASE_URL=postgresql://localhost/mydb\nAPI_KEY=\nPUBLIC_APP_URL=http://localhost:3000"}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            aria-label="Environment variables paste area"
          />
          <div style={sx.inlineHint}>{pasteParsed.length} key{pasteParsed.length !== 1 ? "s" : ""} detected</div>
          <div style={sx.wizardActions}>
            <button type="button" style={sx.btnGhost} onClick={() => { setStep(1); setMethod(null); }}>Change method</button>
            <button type="button" style={sx.btnApprove} onClick={goToReview} disabled={pasteParsed.length === 0}>Continue</button>
          </div>
        </>
      )}

      {step === 2 && method === "render" && (
        <>
          <PageHeader title="Connect Render" sub="Prototype: simulate OAuth, then choose a service to import env from." />
          {!renderConnected ? (
            <div style={sx.renderConnectCard}>
              <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
                EnVault requests read access to environment variables on the services you select. Writes (sync on deploy) stay behind your approval queue.
              </p>
              <button type="button" style={sx.btnApprove} onClick={() => setRenderConnected(true)}>
                Connect Render account (demo)
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 10 }}>
                Select a service
              </div>
              <div style={sx.repoList}>
                {MOCK_RENDER_SERVICES.map(s => (
                  <button
                    type="button"
                    key={s.id}
                    style={{ ...sx.repoRow, ...(selectedService?.id === s.id ? sx.repoRowActive : {}) }}
                    onClick={() => setSelectedService(s)}
                  >
                    <span style={sx.repoName}>{s.name}</span>
                    <span style={sx.repoMeta}>{s.envCount} env vars · {s.region}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          <div style={sx.wizardActions}>
            <button type="button" style={sx.btnGhost} onClick={() => { setStep(1); setMethod(null); setRenderConnected(false); setSelectedService(null); }}>Change method</button>
            <button type="button" style={sx.btnApprove} onClick={goToReview} disabled={!renderConnected || !selectedService}>Continue</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <PageHeader title="Review &amp; create" sub="Name your project and confirm imported keys — they'll land in development first; pushes to hosts stay gated." />
          <div style={{ marginBottom: 16 }}>
            <label style={sx.formLabel} htmlFor="proj-name">Project name</label>
            <input
              id="proj-name"
              style={{ ...sx.formInput, maxWidth: 420 }}
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
            />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 10 }}>
            Imported keys ({keysPreview.length})
          </div>
          <div style={sx.previewTable}>
            <div style={sx.previewHead}><span>Key</span><span>Value preview</span></div>
            {keysPreview.slice(0, 12).map((row) => (
              <div key={row.key} style={sx.previewRow}>
                <span style={sx.vaultKey}>{row.key}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#64748b" }}>
                  {row.isSecret ? "••••••••" : row.value.slice(0, 48)}{(row.value.length > 48 ? "…" : "")}
                </span>
              </div>
            ))}
            {keysPreview.length > 12 && (
              <div style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8" }}>+ {keysPreview.length - 12} more…</div>
            )}
          </div>
          <div style={sx.wizardActions}>
            <button type="button" style={sx.btnGhost} onClick={() => setStep(2)}>Back</button>
            <button type="button" style={sx.btnApprove} onClick={handleSubmit} disabled={!projectName.trim() || keysPreview.length === 0}>
              Add to vault
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function RuleCard({ rule, onToggle, onDelete }) {
  return (
    <div style={{ ...sx.ruleCard, opacity: rule.active ? 1 : 0.6 }}>
      <div style={sx.ruleCardLeft}>
        <div style={sx.ruleCardTitle}>{rule.name}</div>
        <div style={sx.ruleCardDesc}>{rule.description}</div>
        <div style={sx.ruleCardMeta}>
          {rule.lastUsed && <span style={sx.ruleMetaChip}>Last used {fmtTime(rule.lastUsed)}</span>}
          <span style={sx.ruleMetaChip}>Used {rule.usedCount}× total</span>
        </div>
      </div>
      <div style={sx.ruleCardRight}>
        <Toggle active={rule.active} onToggle={onToggle} />
        <button style={sx.deleteBtn} onClick={onDelete} title="Delete rule">✕</button>
      </div>
    </div>
  );
}

function Toggle({ active, onToggle }) {
  return (
    <div
      role="switch"
      aria-checked={active}
      tabIndex={0}
      style={{
        ...sx.toggleTrack,
        ...(active ? sx.toggleTrackOn : sx.toggleTrackOff),
      }}
      onClick={onToggle}
    >
      <div style={{ ...sx.toggleThumb, transform: active ? "translateX(18px)" : "translateX(2px)" }} />
    </div>
  );
}

// ─── Activity View ────────────────────────────────────────────────────────────
function ActivityView({ activity }) {
  const [filter, setFilter] = useState("all");
  const types = ["all", "queued", "approved", "synced", "rotated", "rejected", "updated"];
  const filtered = filter === "all" ? activity : activity.filter(a => a.type === filter);

  return (
    <div style={sx.viewPad}>
      <PageHeader title="Activity Log" sub="Full transparency — every action EnVault has taken or queued, in order" />

      <div style={sx.filterRow}>
        {types.map(t => (
          <button key={t} style={{ ...sx.filterBtn, ...(filter === t ? sx.filterBtnActive : {}) }}
            onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
      </div>

      <div style={sx.activityList}>
        {filtered.map((item, i) => (
          <div key={item.id} style={sx.activityItem}>
            <div style={sx.activityIconWrap}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {i < filtered.length - 1 && <div style={sx.activityLine} />}
            </div>
            <div style={sx.activityContent}>
              <div style={sx.activityMsg}>{item.msg}</div>
              <div style={sx.activityMeta}>
                <span style={{ ...sx.envTag, background: `${ENV_COLOR[item.env] || "#64748b"}15`, color: ENV_COLOR[item.env] || "#64748b", fontSize: 11 }}>
                  {item.env}
                </span>
                <span style={{ ...sx.activityType, ...ACTIVITY_TYPE_STYLE[item.type] }}>{item.type}</span>
                <span style={sx.activityTime}>{fmtTime(item.ts)}</span>
                {item.actor && <span style={sx.activityActor}>by {item.actor}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ACTIVITY_TYPE_STYLE = {
  queued:   { background: "#fff7ed", color: "#f97316" },
  approved: { background: "#f0fdf4", color: "#16a34a" },
  synced:   { background: "#eff6ff", color: "#3b82f6" },
  rotated:  { background: "#f5f3ff", color: "#8b5cf6" },
  rejected: { background: "#fff1f2", color: "#f43f5e" },
  updated:  { background: "#f8fafc", color: "#64748b" },
};

// ─── Vault View ───────────────────────────────────────────────────────────────
function VaultSecretHealth({ health }) {
  if (health === "rotation-due") {
    return (
      <span style={{ ...sx.healthBadge, background: "#fff7ed", color: "#f97316" }}>⚠ Rotation due</span>
    );
  }
  if (health === "pending-sync") {
    return (
      <span style={{ ...sx.healthBadge, background: "#eff6ff", color: "#3b82f6" }}>⏳ Pending sync</span>
    );
  }
  return <span style={{ ...sx.healthBadge, background: "#f0fdf4", color: "#16a34a" }}>● OK</span>;
}

function VaultView({ projectId, projectName, projectVaults }) {
  const vault = projectVaults[projectId];
  const environments = vault?.environments ?? [];
  const [activeEnvId, setActiveEnvId] = useState(environments[0]?.id ?? "");
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    const first = vault?.environments?.[0]?.id ?? "";
    setActiveEnvId(first);
    setRevealed({});
  }, [projectId, vault]);

  const activeSlice = environments.find(e => e.id === activeEnvId) ?? environments[0];
  const secrets = activeSlice?.secrets ?? [];
  const revealPrefix = `${activeSlice?.id ?? "_"}:`;

  return (
    <div style={sx.viewPad}>
      <PageHeader
        title="Vault"
        eyebrow={`Project · ${projectName ?? "—"}`}
        sub="Each project owns one vault. Switch environment tabs to inspect that slice — not a separate top-level vault."
      />

      <div style={sx.vaultScopeBanner} role="note">
        <strong style={{ color: v("textPrimary") }}>Scope: project vault.</strong>{" "}
        EnVault stores secrets under <strong style={{ fontFamily: v("fontMono") }}>{VAULT_SCOPE_PRODUCT}</strong>-level containment
        and namespaces values by deployment environment (production, staging, preview, …) inside it.
        A pure <strong>environment-first</strong> model (standalone vault per env only) would be a different UX — not shown here.
      </div>

      {environments.length === 0 ? (
        <div style={sx.emptyState}>
          <div style={{ fontSize: 28 }}>📭</div>
          <div>No environments in this vault yet.</div>
        </div>
      ) : (
        <>
          <div style={sx.vaultEnvTabRow} role="tablist" aria-label="Vault environment">
            {environments.map(env => (
              <button
                key={env.id}
                type="button"
                role="tab"
                aria-selected={activeSlice?.id === env.id}
                style={{
                  ...sx.vaultEnvTab,
                  ...(activeSlice?.id === env.id ? sx.vaultEnvTabActive : {}),
                }}
                onClick={() => {
                  setActiveEnvId(env.id);
                  setRevealed({});
                }}
              >
                {env.label}
                <span style={sx.vaultEnvTabCount}>{env.secrets.length}</span>
              </button>
            ))}
          </div>

          <div style={sx.vaultEnvTitle}>
            {activeSlice?.label ?? "Environment"} slice ·{" "}
            <span style={{ fontWeight: 400, fontFamily: v("fontMono"), color: v("textSubtle") }}>{vault?.vaultScope ?? VAULT_SCOPE_PRODUCT} scope</span>
          </div>

          <div style={sx.vaultTable}>
            <div style={sx.vaultHeader}>
              <span>Key</span><span>Type</span><span>Value</span><span>Updated</span><span>Status</span>
            </div>
            {secrets.length === 0 ? (
              <div style={{ ...sx.emptyState, padding: 28, borderBottom: `1px solid ${v("borderHairline")}` }}>
                No keys stored in this environment yet.
              </div>
            ) : (
              secrets.map(s => (
                <div key={`${activeSlice.id}-${s.key}`} style={sx.vaultRow}>
                  <span style={sx.vaultKey}>{s.key}</span>
                  <span style={sx.vaultType}>{s.type}</span>
                  <span style={sx.vaultVal}>
                    {s.isSecret ? (
                      <>
                        {revealed[`${revealPrefix}${s.key}`]
                          ? "sk_demo_reveal_placeholder"
                          : "••••••••••••••••"}
                        <button
                          style={sx.revealBtn}
                          type="button"
                          onClick={() =>
                            setRevealed(r => ({
                              ...r,
                              [`${revealPrefix}${s.key}`]: !r[`${revealPrefix}${s.key}`],
                            }))
                          }
                        >
                          {revealed[`${revealPrefix}${s.key}`] ? "hide" : "reveal"}
                        </button>
                      </>
                    ) : (
                      s.demoPlain ?? "—"
                    )}
                  </span>
                  <span style={sx.vaultDate}>{s.updated}</span>
                  <VaultSecretHealth health={s.health ?? "ok"} />
                </div>
              ))
            )}
          </div>

          <div style={sx.vaultNotice}>
            🔒 Writes to{" "}
            <strong>{activeSlice?.label?.toLowerCase() ?? "this environment"}</strong> still route through approvals.
            Scoped by project vault + environment slice.
          </div>
        </>
      )}
    </div>
  );
}

// ─── Create Rule Modal ────────────────────────────────────────────────────────
function CreateRuleModal({ item, onSave, onClose }) {
  const [name, setName] = useState(`Auto-approve ${item.type} for ${item.env}`);
  return (
    <Modal onClose={onClose}>
      <div style={sx.modalIcon}>⚡</div>
      <div style={sx.modalTitle}>Create Auto-Approve Rule</div>
      <div style={sx.modalSub}>
        EnVault will automatically approve actions like this in future — without asking you each time.
      </div>
      <div style={{ margin: "16px 0" }}>
        <label style={sx.formLabel}>Rule name</label>
        <input style={sx.formInput} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={sx.rulePreview}>
        <div style={sx.rulePreviewRow}><span>When action is</span><strong>{item.type}</strong></div>
        <div style={sx.rulePreviewRow}><span>And environment is</span><strong>{item.env}</strong></div>
        <div style={sx.rulePreviewRow}><span>And impact is at most</span><strong>{item.impact}</strong></div>
        <div style={sx.rulePreviewRow}><span>Then</span><strong style={{ color: "#10b981" }}>auto-approve</strong></div>
      </div>
      <div style={sx.trustNotice}>
        <span>⚠️</span>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Critical actions (production rotation, key generation) are always manually reviewed — rules cannot override this safety gate.
        </div>
      </div>
      <div style={sx.modalActions}>
        <button style={sx.btnGhost} onClick={onClose}>Cancel</button>
        <button style={sx.btnApprove} onClick={() => onSave(name)}>Create Rule</button>
      </div>
    </Modal>
  );
}

// ─── Reusable Components ──────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div style={sx.overlay} onClick={onClose}>
      <div style={sx.modal} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function PageHeader({ title, sub, eyebrow }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {eyebrow && <div style={sx.pageEyebrow}>{eyebrow}</div>}
      <h1 style={sx.pageTitle}>{title}</h1>
      <p style={sx.pageSub}>{sub}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={sx.sectionTitle}>{children}</div>;
}

function StatCard({ label, value, accent, sub, onClick }) {
  return (
    <div style={{ ...sx.statCard, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ ...sx.statValue, color: accent }}>{value}</div>
      <div style={sx.statLabel}>{label}</div>
      <div style={sx.statSub}>{sub}</div>
    </div>
  );
}

function ImpactBadge({ level }) {
  const im = IMPACT_META[level];
  return (
    <span style={{ fontSize: 11, fontFamily: v("fontMono"), fontWeight: 600,
      padding: "3px 8px", borderRadius: 4, background: im.bg, color: im.color, border: `1px solid ${im.border}` }}>
      {im.label} impact
    </span>
  );
}

function MetaChip({ label, value, color }) {
  return (
    <div style={sx.metaChip}>
      <span style={sx.metaChipLabel}>{label}</span>
      <span style={{ ...sx.metaChipValue, ...(color ? { color } : {}) }}>{value}</span>
    </div>
  );
}

function MiniApprovalCard({ item, onClick }) {
  const tm = TYPE_META[item.type];
  const im = IMPACT_META[item.impact];
  return (
    <div style={sx.miniCard} onClick={onClick}>
      <span style={{ ...sx.typePill, color: tm.color, background: `${tm.color}15`, border: `1px solid ${tm.color}25`, fontSize: 11 }}>
        {tm.icon} {tm.label}
      </span>
      <span style={sx.miniCardTitle}>{item.title}</span>
      <span style={{ ...sx.impactPill, color: im.color, background: im.bg, border: `1px solid ${im.border}`, fontSize: 10, marginLeft: "auto" }}>
        {im.label}
      </span>
      <span style={{ ...sx.envTag, background: `${ENV_COLOR[item.env]}15`, color: ENV_COLOR[item.env], fontSize: 10 }}>
        {item.env}
      </span>
    </div>
  );
}

