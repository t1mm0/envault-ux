import { useState, useEffect, useRef } from "react";

// ─── Google Fonts ────────────────────────────────────────────────────────────
const FONT_LINK = document.createElement("link");
FONT_LINK.rel = "stylesheet";
FONT_LINK.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600;700&display=swap";
document.head.appendChild(FONT_LINK);

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

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("approvals");
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

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
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
    <div style={S.app}>
      <style>{CSS}</style>

      {/* Header */}
      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoMark}>
            <span style={{ fontSize: 14 }}>🔐</span>
          </div>
          <span style={S.logoText}>EnVault</span>
          <span style={S.logoBadge}>my-saas-app</span>
        </div>

        <nav style={S.nav}>
          {[
            { id: "dashboard", label: "Overview" },
            { id: "approvals", label: "Approvals", count: pending.length },
            { id: "rules",     label: "Auto-Rules" },
            { id: "activity",  label: "Activity" },
            { id: "vault",     label: "Vault" },
          ].map(n => (
            <button key={n.id} style={{ ...S.navBtn, ...(view === n.id ? S.navBtnActive : {}) }}
              onClick={() => setView(n.id)}>
              {n.label}
              {n.count > 0 && <span style={S.navBadge}>{n.count}</span>}
            </button>
          ))}
        </nav>

        <div style={S.headerRight}>
          <div style={S.envIndicator}>
            <span style={{ ...S.envDot, background: "#f43f5e" }} />
            production
          </div>
          <div style={S.avatar}>TW</div>
        </div>
      </header>

      {/* Main */}
      <main style={S.main}>
        {view === "dashboard"  && <DashboardView pending={pending} activity={activity} rules={rules} onNavigate={setView} />}
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
        {view === "vault"     && <VaultView />}
      </main>

      {/* Approve Modal */}
      {showApproveModal && selected && (
        <Modal onClose={() => setShowApproveModal(false)}>
          <div style={S.modalIcon}>✅</div>
          <div style={S.modalTitle}>Confirm Approval</div>
          <div style={S.modalSub}>
            You're approving: <strong>{selected.title}</strong>
          </div>
          <div style={S.impactRow}>
            <ImpactBadge level={selected.impact} />
            <span style={{ color: "#64748b", fontSize: 13 }}>
              Affects: {selected.affectedSystems.join(", ")}
            </span>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={S.formLabel}>Note (optional)</label>
            <textarea style={S.textarea} placeholder="Add a note for the audit log…"
              value={approveNote} onChange={e => setApproveNote(e.target.value)} rows={3} />
          </div>
          <div style={S.modalActions}>
            <button style={S.btnGhost} onClick={() => setShowApproveModal(false)}>Cancel</button>
            <button style={S.btnApprove} onClick={handleApprove}>Approve & Execute</button>
          </div>
          <div style={S.modalHint}>
            This action will be logged in the audit trail with your name and timestamp.
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && selected && (
        <Modal onClose={() => setShowRejectModal(false)}>
          <div style={S.modalIcon}>❌</div>
          <div style={S.modalTitle}>Reject Action</div>
          <div style={S.modalSub}>
            Rejecting: <strong>{selected.title}</strong>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={S.formLabel}>Reason (recommended)</label>
            <textarea style={S.textarea} placeholder="Why are you rejecting this? Helps the team understand…"
              value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3} />
          </div>
          <div style={S.modalActions}>
            <button style={S.btnGhost} onClick={() => setShowRejectModal(false)}>Cancel</button>
            <button style={S.btnReject} onClick={handleReject}>Reject</button>
          </div>
          <div style={S.modalHint}>
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
        <div style={{ ...S.toast, ...(toast.type === "warn" ? S.toastWarn : {}) }}>
          {toast.type === "warn" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({ pending, activity, rules, onNavigate }) {
  const approved = activity.filter(a => a.type === "approved").length;
  const rejected = activity.filter(a => a.type === "rejected").length;
  const autoApproved = activity.filter(a => a.type === "approved" && a.actor === "Auto-Rule").length;

  return (
    <div style={S.viewPad}>
      <PageHeader title="Overview" sub="Your trust dashboard — everything EnVault is doing, at a glance" />

      {/* Stat cards */}
      <div style={S.statGrid}>
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
      <div style={S.sectionRow}>
        <SectionTitle>Pending Your Approval</SectionTitle>
        <button style={S.viewAllBtn} onClick={() => onNavigate("approvals")}>View all →</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pending.slice(0, 3).map(item => (
          <MiniApprovalCard key={item.id} item={item} onClick={() => { onNavigate("approvals"); }} />
        ))}
        {pending.length === 0 && (
          <div style={S.emptyState}>
            <div style={{ fontSize: 28 }}>✅</div>
            <div>All caught up — nothing pending approval</div>
          </div>
        )}
      </div>

      {/* Active rules */}
      <div style={{ marginTop: 32 }}>
        <div style={S.sectionRow}>
          <SectionTitle>Active Auto-Approve Rules</SectionTitle>
          <button style={S.viewAllBtn} onClick={() => onNavigate("rules")}>Manage →</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rules.filter(r => r.active).map(r => (
            <div key={r.id} style={S.miniRuleCard}>
              <span style={S.ruleIndicatorDot} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f1e3d" }}>{r.name}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{r.description}</div>
              </div>
              <div style={S.ruleUsage}>Used {r.usedCount}×</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Approvals View ───────────────────────────────────────────────────────────
function ApprovalsView({ pending, selected, setSelected, revealedKeys, toggleReveal, onApprove, onReject, onCreateRule }) {
  return (
    <div style={S.splitLayout}>
      {/* Left: Queue */}
      <div style={S.queuePanel}>
        <div style={S.queueHeader}>
          <div>
            <div style={S.queueTitle}>Approval Queue</div>
            <div style={S.queueSub}>{pending.length} action{pending.length !== 1 ? "s" : ""} awaiting your review</div>
          </div>
        </div>

        {pending.length === 0 ? (
          <div style={{ ...S.emptyState, padding: "60px 24px" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 600, color: "#0f1e3d" }}>All clear</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>No pending approvals</div>
          </div>
        ) : (
          <div style={S.queueList}>
            {pending.map(item => (
              <ApprovalCard key={item.id} item={item}
                isSelected={selected?.id === item.id}
                onClick={() => setSelected(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Right: Detail */}
      <div style={S.detailPanel}>
        {!selected ? (
          <div style={{ ...S.emptyState, height: "100%" }}>
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
    <div style={{ ...S.approvalCard, ...(isSelected ? S.approvalCardActive : {}) }} onClick={onClick}>
      <div style={S.approvalCardTop}>
        <span style={{ ...S.typePill, color: tm.color, background: `${tm.color}15`, border: `1px solid ${tm.color}30` }}>
          {tm.icon} {tm.label}
        </span>
        <span style={{ ...S.impactPill, color: im.color, background: im.bg, border: `1px solid ${im.border}` }}>
          {im.label}
        </span>
      </div>
      <div style={S.approvalCardTitle}>{item.title}</div>
      <div style={S.approvalCardMeta}>
        <span style={{ ...S.envTag, background: `${ENV_COLOR[item.env]}15`, color: ENV_COLOR[item.env] }}>
          {item.env}
        </span>
        <span style={S.approvalCardTime}>{fmtTime(item.triggeredAt)}</span>
      </div>
    </div>
  );
}

function ApprovalDetail({ item, revealedKeys, toggleReveal, onApprove, onReject, onCreateRule }) {
  const tm = TYPE_META[item.type];
  const im = IMPACT_META[item.impact];

  return (
    <div style={S.detail}>
      {/* Header */}
      <div style={S.detailHeader}>
        <div style={S.detailHeaderTop}>
          <span style={{ ...S.typePill, color: tm.color, background: `${tm.color}15`, border: `1px solid ${tm.color}30`, fontSize: 12 }}>
            {tm.icon} {tm.label}
          </span>
          <ImpactBadge level={item.impact} />
        </div>
        <div style={S.detailTitle}>{item.title}</div>
        <div style={S.detailDesc}>{item.description}</div>

        <div style={S.metaRow}>
          <MetaChip label="Environment" value={item.env} color={ENV_COLOR[item.env]} />
          <MetaChip label="Triggered by" value={item.triggeredBy} />
          <MetaChip label="Provider" value={item.provider} />
          <MetaChip label="Requested" value={fmtTime(item.triggeredAt)} />
        </div>
      </div>

      {/* Affected systems */}
      <div style={S.section}>
        <div style={S.sectionLabel}>Affected systems</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {item.affectedSystems.map(s => (
            <span key={s} style={S.systemTag}>{s}</span>
          ))}
        </div>
      </div>

      {/* Change diff */}
      <div style={S.section}>
        <div style={S.sectionLabel}>
          Proposed changes — {item.changes.length} key{item.changes.length !== 1 ? "s" : ""}
        </div>
        <div style={S.diffTable}>
          <div style={S.diffHeader}>
            <span>Key</span><span>Action</span><span>Before</span><span>After</span>
          </div>
          {item.changes.map((c, i) => {
            const revealed = revealedKeys[`${item.id}-${c.key}`];
            return (
              <div key={i} style={{ ...S.diffRow, ...(c.action === "remove" ? S.diffRowRemove : c.action === "add" ? S.diffRowAdd : c.action === "rotate" || c.action === "generate" ? S.diffRowGenerate : S.diffRowUpdate) }}>
                <span style={S.diffKey}>{c.key}</span>
                <span style={{ ...S.actionBadge, ...ACTION_STYLE[c.action] }}>{c.action}</span>
                <span style={S.diffVal}>
                  {c.before ? (c.isSecret && !revealed ? maskVal(c.before) : c.before) : <em style={{ color: "#94a3b8" }}>—</em>}
                </span>
                <span style={{ ...S.diffVal, display: "flex", alignItems: "center", gap: 4 }}>
                  {c.after ? (c.isSecret && !revealed ? maskVal(c.after) : c.after) : <em style={{ color: "#94a3b8" }}>—</em>}
                  {c.isSecret && (
                    <button style={S.revealBtn} onClick={() => toggleReveal(`${item.id}-${c.key}`)}>
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
        <div style={S.section}>
          <div style={S.sectionLabel}>Rotation details</div>
          <div style={S.rotationCard}>
            <div style={S.rotationRow}><span>Provider</span><strong>{item.rotationDetails.provider}</strong></div>
            <div style={S.rotationRow}><span>Last rotated</span><strong>{item.rotationDetails.lastRotated}</strong></div>
            <div style={S.rotationRow}><span>Age</span><strong style={{ color: "#f43f5e" }}>{item.rotationDetails.daysOld} days</strong></div>
            <div style={S.rotationRow}><span>Grace period</span><strong>{item.rotationDetails.gracePeriod}</strong></div>
          </div>
        </div>
      )}

      {/* Trust notice */}
      <div style={S.trustNotice}>
        <span style={{ fontSize: 16 }}>🔒</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#0f1e3d" }}>Your approval is required before anything executes.</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            This action will not proceed without your explicit confirmation. Your decision is logged in the immutable audit trail.
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={S.actionRow}>
        <button style={S.btnReject} onClick={onReject}>Reject</button>
        {item.canAutoApprove && (
          <button style={S.btnRule} onClick={() => onCreateRule(item)}>
            + Auto-approve rule
          </button>
        )}
        <button style={S.btnApprove} onClick={onApprove}>
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
    <div style={S.viewPad}>
      <PageHeader
        title="Auto-Approve Rules"
        sub="Define when EnVault can act automatically — without asking you each time"
      />

      <div style={S.rulesExplainer}>
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

function RuleCard({ rule, onToggle, onDelete }) {
  return (
    <div style={{ ...S.ruleCard, opacity: rule.active ? 1 : 0.6 }}>
      <div style={S.ruleCardLeft}>
        <div style={S.ruleCardTitle}>{rule.name}</div>
        <div style={S.ruleCardDesc}>{rule.description}</div>
        <div style={S.ruleCardMeta}>
          {rule.lastUsed && <span style={S.ruleMetaChip}>Last used {fmtTime(rule.lastUsed)}</span>}
          <span style={S.ruleMetaChip}>Used {rule.usedCount}× total</span>
        </div>
      </div>
      <div style={S.ruleCardRight}>
        <Toggle active={rule.active} onToggle={onToggle} />
        <button style={S.deleteBtn} onClick={onDelete} title="Delete rule">✕</button>
      </div>
    </div>
  );
}

function Toggle({ active, onToggle }) {
  return (
    <div style={{ ...S.toggle, background: active ? "#10b981" : "#cbd5e1" }} onClick={onToggle}>
      <div style={{ ...S.toggleThumb, transform: active ? "translateX(18px)" : "translateX(2px)" }} />
    </div>
  );
}

// ─── Activity View ────────────────────────────────────────────────────────────
function ActivityView({ activity }) {
  const [filter, setFilter] = useState("all");
  const types = ["all", "queued", "approved", "synced", "rotated", "rejected", "updated"];
  const filtered = filter === "all" ? activity : activity.filter(a => a.type === filter);

  return (
    <div style={S.viewPad}>
      <PageHeader title="Activity Log" sub="Full transparency — every action EnVault has taken or queued, in order" />

      <div style={S.filterRow}>
        {types.map(t => (
          <button key={t} style={{ ...S.filterBtn, ...(filter === t ? S.filterBtnActive : {}) }}
            onClick={() => setFilter(t)}>
            {t}
          </button>
        ))}
      </div>

      <div style={S.activityList}>
        {filtered.map((item, i) => (
          <div key={item.id} style={S.activityItem}>
            <div style={S.activityIconWrap}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {i < filtered.length - 1 && <div style={S.activityLine} />}
            </div>
            <div style={S.activityContent}>
              <div style={S.activityMsg}>{item.msg}</div>
              <div style={S.activityMeta}>
                <span style={{ ...S.envTag, background: `${ENV_COLOR[item.env] || "#64748b"}15`, color: ENV_COLOR[item.env] || "#64748b", fontSize: 11 }}>
                  {item.env}
                </span>
                <span style={{ ...S.activityType, ...ACTIVITY_TYPE_STYLE[item.type] }}>{item.type}</span>
                <span style={S.activityTime}>{fmtTime(item.ts)}</span>
                {item.actor && <span style={S.activityActor}>by {item.actor}</span>}
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
function VaultView() {
  const secrets = [
    { key: "DATABASE_URL",      env: "production", type: "connection-string", isSecret: true,  updated: "2026-05-08", health: "ok" },
    { key: "STRIPE_SECRET_KEY", env: "production", type: "api-key",           isSecret: true,  updated: "2026-02-08", health: "rotation-due" },
    { key: "JWT_SECRET",        env: "production", type: "jwt-secret",        isSecret: true,  updated: "2026-04-01", health: "ok" },
    { key: "API_BASE_URL",      env: "production", type: "url",               isSecret: false, updated: "2026-05-09", health: "ok" },
    { key: "CDN_URL",           env: "production", type: "url",               isSecret: false, updated: "2026-05-09", health: "pending-sync" },
    { key: "LOG_LEVEL",         env: "production", type: "string",            isSecret: false, updated: "2026-01-10", health: "ok" },
  ];
  const [revealed, setRevealed] = useState({});

  return (
    <div style={S.viewPad}>
      <PageHeader title="Vault — Production" sub="Read-only view. Changes are staged for your approval before committing." />
      <div style={S.vaultTable}>
        <div style={S.vaultHeader}>
          <span>Key</span><span>Type</span><span>Value</span><span>Updated</span><span>Status</span>
        </div>
        {secrets.map(s => (
          <div key={s.key} style={S.vaultRow}>
            <span style={S.vaultKey}>{s.key}</span>
            <span style={S.vaultType}>{s.type}</span>
            <span style={S.vaultVal}>
              {s.isSecret ? (revealed[s.key] ? "sk_live_KJH12378akjs" : "••••••••••••••••") : "https://myapp.io"}
              {s.isSecret && (
                <button style={S.revealBtn} onClick={() => setRevealed(r => ({ ...r, [s.key]: !r[s.key] }))}>
                  {revealed[s.key] ? "hide" : "reveal"}
                </button>
              )}
            </span>
            <span style={S.vaultDate}>{s.updated}</span>
            <span>
              {s.health === "ok"           && <span style={{ ...S.healthBadge, background: "#f0fdf4", color: "#16a34a" }}>● OK</span>}
              {s.health === "rotation-due" && <span style={{ ...S.healthBadge, background: "#fff7ed", color: "#f97316" }}>⚠ Rotation due</span>}
              {s.health === "pending-sync" && <span style={{ ...S.healthBadge, background: "#eff6ff", color: "#3b82f6" }}>⏳ Pending sync</span>}
            </span>
          </div>
        ))}
      </div>
      <div style={S.vaultNotice}>
        🔒 Edits to production require approval before being pushed. Changes are staged and shown in your Approval Queue.
      </div>
    </div>
  );
}

// ─── Create Rule Modal ────────────────────────────────────────────────────────
function CreateRuleModal({ item, onSave, onClose }) {
  const [name, setName] = useState(`Auto-approve ${item.type} for ${item.env}`);
  return (
    <Modal onClose={onClose}>
      <div style={S.modalIcon}>⚡</div>
      <div style={S.modalTitle}>Create Auto-Approve Rule</div>
      <div style={S.modalSub}>
        EnVault will automatically approve actions like this in future — without asking you each time.
      </div>
      <div style={{ margin: "16px 0" }}>
        <label style={S.formLabel}>Rule name</label>
        <input style={S.formInput} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={S.rulePreview}>
        <div style={S.rulePreviewRow}><span>When action is</span><strong>{item.type}</strong></div>
        <div style={S.rulePreviewRow}><span>And environment is</span><strong>{item.env}</strong></div>
        <div style={S.rulePreviewRow}><span>And impact is at most</span><strong>{item.impact}</strong></div>
        <div style={S.rulePreviewRow}><span>Then</span><strong style={{ color: "#10b981" }}>auto-approve</strong></div>
      </div>
      <div style={S.trustNotice}>
        <span>⚠️</span>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          Critical actions (production rotation, key generation) are always manually reviewed — rules cannot override this safety gate.
        </div>
      </div>
      <div style={S.modalActions}>
        <button style={S.btnGhost} onClick={onClose}>Cancel</button>
        <button style={S.btnApprove} onClick={() => onSave(name)}>Create Rule</button>
      </div>
    </Modal>
  );
}

// ─── Reusable Components ──────────────────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h1 style={S.pageTitle}>{title}</h1>
      <p style={S.pageSub}>{sub}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ fontWeight: 700, fontSize: 14, color: "#0f1e3d" }}>{children}</div>;
}

function StatCard({ label, value, accent, sub, onClick }) {
  return (
    <div style={{ ...S.statCard, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ ...S.statValue, color: accent }}>{value}</div>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statSub}>{sub}</div>
    </div>
  );
}

function ImpactBadge({ level }) {
  const im = IMPACT_META[level];
  return (
    <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
      padding: "3px 8px", borderRadius: 4, background: im.bg, color: im.color, border: `1px solid ${im.border}` }}>
      {im.label} impact
    </span>
  );
}

function MetaChip({ label, value, color }) {
  return (
    <div style={S.metaChip}>
      <span style={S.metaChipLabel}>{label}</span>
      <span style={{ ...S.metaChipValue, ...(color ? { color } : {}) }}>{value}</span>
    </div>
  );
}

function MiniApprovalCard({ item, onClick }) {
  const tm = TYPE_META[item.type];
  const im = IMPACT_META[item.impact];
  return (
    <div style={S.miniCard} onClick={onClick}>
      <span style={{ ...S.typePill, color: tm.color, background: `${tm.color}15`, border: `1px solid ${tm.color}25`, fontSize: 11 }}>
        {tm.icon} {tm.label}
      </span>
      <span style={S.miniCardTitle}>{item.title}</span>
      <span style={{ ...S.impactPill, color: im.color, background: im.bg, border: `1px solid ${im.border}`, fontSize: 10, marginLeft: "auto" }}>
        {im.label}
      </span>
      <span style={{ ...S.envTag, background: `${ENV_COLOR[item.env]}15`, color: ENV_COLOR[item.env], fontSize: 10 }}>
        {item.env}
      </span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  app: { fontFamily: "'DM Sans', sans-serif", background: "#f8f7f4", minHeight: "100vh", display: "flex", flexDirection: "column", color: "#0f1e3d" },
  header: { display: "flex", alignItems: "center", gap: 0, padding: "0 24px", height: 56, background: "#fff", borderBottom: "1px solid #e8edf5", boxShadow: "0 1px 0 #e8edf5", position: "sticky", top: 0, zIndex: 10, gap: 0 },
  logo: { display: "flex", alignItems: "center", gap: 10, marginRight: 32 },
  logoMark: { width: 32, height: 32, background: "#0f1e3d", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontFamily: "'DM Serif Display', serif", fontSize: 18, fontWeight: 400, color: "#0f1e3d", letterSpacing: "-0.3px" },
  logoBadge: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, padding: "2px 8px", background: "#f1f5f9", borderRadius: 4, color: "#64748b", border: "1px solid #e2e8f0" },
  nav: { display: "flex", gap: 2, flex: 1 },
  navBtn: { padding: "6px 14px", borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#64748b", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "all .15s" },
  navBtnActive: { background: "#f1f5f9", color: "#0f1e3d", fontWeight: 600 },
  navBadge: { background: "#f97316", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 10, minWidth: 16, textAlign: "center" },
  headerRight: { display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" },
  envIndicator: { display: "flex", alignItems: "center", gap: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#64748b", background: "#f8f7f4", padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0" },
  envDot: { width: 7, height: 7, borderRadius: "50%", display: "inline-block" },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#0f1e3d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 },

  main: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" },

  viewPad: { padding: "32px 36px", overflowY: "auto", height: "calc(100vh - 56px)" },
  pageTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: "#0f1e3d", marginBottom: 4 },
  pageSub: { fontSize: 14, color: "#64748b" },

  statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 },
  statCard: { background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e8edf5", boxShadow: "0 1px 3px rgba(0,0,0,.04)", transition: "box-shadow .15s" },
  statValue: { fontFamily: "'DM Serif Display', serif", fontSize: 36, fontWeight: 400, lineHeight: 1 },
  statLabel: { fontWeight: 600, fontSize: 13, color: "#0f1e3d", marginTop: 8 },
  statSub: { fontSize: 12, color: "#94a3b8", marginTop: 4 },

  sectionRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  viewAllBtn: { fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" },

  miniCard: { display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "10px 14px", border: "1px solid #e8edf5", cursor: "pointer", fontSize: 13, transition: "border-color .15s" },
  miniCardTitle: { fontWeight: 500, fontSize: 13, color: "#0f1e3d", flex: 1 },

  miniRuleCard: { display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 8, padding: "10px 14px", border: "1px solid #e8edf5" },
  ruleIndicatorDot: { width: 8, height: 8, borderRadius: "50%", background: "#10b981", flexShrink: 0 },
  ruleUsage: { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#94a3b8", marginLeft: "auto", whiteSpace: "nowrap" },

  // Approvals split
  splitLayout: { display: "grid", gridTemplateColumns: "360px 1fr", height: "calc(100vh - 56px)", overflow: "hidden" },
  queuePanel: { borderRight: "1px solid #e8edf5", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" },
  queueHeader: { padding: "20px 20px 12px", borderBottom: "1px solid #f1f5f9" },
  queueTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#0f1e3d" },
  queueSub: { fontSize: 12, color: "#94a3b8", marginTop: 3 },
  queueList: { overflowY: "auto", flex: 1, padding: "12px 12px" },

  approvalCard: { padding: "14px 16px", borderRadius: 10, border: "1px solid #f1f5f9", marginBottom: 8, cursor: "pointer", background: "#fdfdfd", transition: "all .15s" },
  approvalCardActive: { border: "1px solid #3b82f6", background: "#eff6ff" },
  approvalCardTop: { display: "flex", gap: 6, marginBottom: 8 },
  approvalCardTitle: { fontWeight: 600, fontSize: 13, color: "#0f1e3d", lineHeight: 1.4, marginBottom: 8 },
  approvalCardMeta: { display: "flex", alignItems: "center", gap: 8 },
  approvalCardTime: { fontSize: 11, color: "#94a3b8", marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace" },

  typePill: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: ".3px" },
  impactPill: { display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: ".3px" },
  envTag: { display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace" },
  systemTag: { fontSize: 11, padding: "3px 8px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4, color: "#475569", fontFamily: "'IBM Plex Mono', monospace" },

  // Detail panel
  detailPanel: { overflowY: "auto", background: "#f8f7f4" },
  detail: { padding: "28px 32px" },
  detailHeader: { background: "#fff", borderRadius: 12, padding: "20px 24px", border: "1px solid #e8edf5", marginBottom: 16 },
  detailHeaderTop: { display: "flex", gap: 8, marginBottom: 12 },
  detailTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#0f1e3d", marginBottom: 8 },
  detailDesc: { fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 16 },
  metaRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  metaChip: { display: "flex", flexDirection: "column", background: "#f8f7f4", borderRadius: 6, padding: "6px 10px", border: "1px solid #e8edf5" },
  metaChipLabel: { fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" },
  metaChipValue: { fontSize: 12, fontWeight: 600, color: "#0f1e3d", fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 },

  section: { background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #e8edf5", marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 12, fontFamily: "'IBM Plex Mono', monospace" },

  // Diff table
  diffTable: { borderRadius: 8, overflow: "hidden", border: "1px solid #e8edf5", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  diffHeader: { display: "grid", gridTemplateColumns: "2fr 1fr 2fr 2fr", padding: "8px 12px", background: "#f8fafc", borderBottom: "1px solid #e8edf5", fontWeight: 700, fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px" },
  diffRow: { display: "grid", gridTemplateColumns: "2fr 1fr 2fr 2fr", padding: "9px 12px", borderBottom: "1px solid #f1f5f9", alignItems: "center", gap: 4 },
  diffRowUpdate:   { background: "#fffff8" },
  diffRowAdd:      { background: "#f0fff4" },
  diffRowRemove:   { background: "#fff5f5" },
  diffRowGenerate: { background: "#f5f3ff" },
  diffKey: { fontWeight: 600, color: "#0f1e3d", fontSize: 11 },
  diffVal: { color: "#475569", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 },
  actionBadge: { fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 3, letterSpacing: ".3px", textTransform: "uppercase", whiteSpace: "nowrap" },
  revealBtn: { fontSize: 10, fontFamily: "'DM Sans', sans-serif", color: "#3b82f6", background: "none", border: "none", cursor: "pointer", padding: "1px 4px", textDecoration: "underline", flexShrink: 0, fontWeight: 500 },

  rotationCard: { background: "#f8f7f4", borderRadius: 8, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 },
  rotationRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b" },

  trustNotice: { display: "flex", gap: 12, alignItems: "flex-start", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", marginBottom: 16 },

  actionRow: { display: "flex", gap: 10, alignItems: "center", paddingTop: 8 },
  btnApprove: { background: "#0f1e3d", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginLeft: "auto" },
  btnReject: { background: "#fff", color: "#f43f5e", border: "1px solid #fecdd3", borderRadius: 8, padding: "10px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  btnRule: { background: "#fff", color: "#3b82f6", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  btnGhost: { background: "#f8f7f4", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },

  // Rules view
  rulesExplainer: { display: "flex", gap: 14, alignItems: "flex-start", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px", fontSize: 13, color: "#92400e", lineHeight: 1.6 },
  ruleCard: { display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 12, padding: "18px 20px", border: "1px solid #e8edf5", transition: "opacity .2s" },
  ruleCardLeft: { flex: 1 },
  ruleCardTitle: { fontWeight: 700, fontSize: 14, color: "#0f1e3d" },
  ruleCardDesc: { fontSize: 13, color: "#64748b", marginTop: 4, lineHeight: 1.5 },
  ruleCardMeta: { display: "flex", gap: 8, marginTop: 8 },
  ruleCardRight: { display: "flex", alignItems: "center", gap: 12 },
  ruleMetaChip: { fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#94a3b8", background: "#f8f7f4", padding: "2px 8px", borderRadius: 4, border: "1px solid #e2e8f0" },
  toggle: { width: 38, height: 22, borderRadius: 11, cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0, border: "none" },
  toggleThumb: { position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "transform .2s" },
  deleteBtn: { background: "none", border: "none", color: "#cbd5e1", cursor: "pointer", fontSize: 14, padding: "4px 6px", borderRadius: 4 },

  // Activity
  filterRow: { display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" },
  filterBtn: { padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#64748b", fontWeight: 500 },
  filterBtnActive: { background: "#0f1e3d", color: "#fff", border: "1px solid #0f1e3d" },
  activityList: { display: "flex", flexDirection: "column" },
  activityItem: { display: "flex", gap: 16, position: "relative" },
  activityIconWrap: { display: "flex", flexDirection: "column", alignItems: "center", width: 32, flexShrink: 0 },
  activityLine: { width: 1, flex: 1, background: "#e8edf5", minHeight: 20, marginTop: 4 },
  activityContent: { paddingBottom: 20, flex: 1 },
  activityMsg: { fontSize: 13, color: "#0f1e3d", fontWeight: 500, lineHeight: 1.5 },
  activityMeta: { display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" },
  activityType: { fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: ".3px" },
  activityTime: { fontSize: 11, color: "#94a3b8", fontFamily: "'IBM Plex Mono', monospace" },
  activityActor: { fontSize: 11, color: "#94a3b8" },

  // Vault
  vaultTable: { background: "#fff", borderRadius: 12, border: "1px solid #e8edf5", overflow: "hidden", marginBottom: 16 },
  vaultHeader: { display: "grid", gridTemplateColumns: "2fr 1.5fr 3fr 1fr 1.5fr", padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e8edf5", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px", fontFamily: "'IBM Plex Mono', monospace" },
  vaultRow: { display: "grid", gridTemplateColumns: "2fr 1.5fr 3fr 1fr 1.5fr", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center", fontSize: 12 },
  vaultKey: { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: "#0f1e3d", fontSize: 12 },
  vaultType: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#94a3b8" },
  vaultVal: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#475569", display: "flex", alignItems: "center", gap: 6 },
  vaultDate: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#94a3b8" },
  healthBadge: { fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace" },
  vaultNotice: { fontSize: 13, color: "#64748b", padding: "12px 16px", background: "#f8f7f4", borderRadius: 8, border: "1px solid #e2e8f0" },

  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(15,30,61,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" },
  modal: { background: "#fff", borderRadius: 16, padding: "28px", width: "100%", maxWidth: 480, boxShadow: "0 24px 60px rgba(0,0,0,.18)", border: "1px solid #e8edf5" },
  modalIcon: { fontSize: 28, marginBottom: 10 },
  modalTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#0f1e3d", marginBottom: 6 },
  modalSub: { fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 4 },
  impactRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 12, padding: "10px 14px", background: "#f8f7f4", borderRadius: 8 },
  modalActions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 },
  modalHint: { fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 14, lineHeight: 1.5 },
  formLabel: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".8px", display: "block", marginBottom: 6 },
  formInput: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0f1e3d", outline: "none", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#0f1e3d", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 },

  rulePreview: { background: "#f8f7f4", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
  rulePreviewRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b" },

  // Toast
  toast: { position: "fixed", bottom: 24, right: 24, background: "#0f1e3d", color: "#fff", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 8, animation: "fadeIn .2s ease" },
  toastWarn: { background: "#78350f" },

  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8", fontSize: 13, textAlign: "center", padding: 40 },
};

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f8f7f4; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  .approvalCard:hover { box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  .statCard:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
  input:focus, textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
`;
