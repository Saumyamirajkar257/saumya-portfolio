"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/content";
import "./admin.css";

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */
const tokenKey = "portfolio_admin_token";
const userKey = "portfolio_admin_user";

class Api {
  constructor(token) {
    this.token = token;
  }
  headers(extra = {}) {
    return {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...extra,
    };
  }
  async request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, options);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  }
  get(path) {
    return this.request(path, { headers: this.headers() });
  }
  send(method, path, body) {
    return this.request(path, { method, headers: this.headers(), body: JSON.stringify(body) });
  }
}

const parseLines = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const joinLines = (arr = []) => (Array.isArray(arr) ? arr.join("\n") : "");

/* Field config -> auto-generated forms. type: text|textarea|lines|json|checkbox */
const MODELS = {
  profile: {
    label: "About / Profile", singular: "Profile", endpoint: "/api/admin/profile", method: "PUT", emptyId: 1,
    fields: [
      { key: "name", label: "Full name", type: "text" },
      { key: "role", label: "Role / title", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "bio", label: "Bio", type: "textarea" },
      { key: "interests", label: "Interests (one per line)", type: "lines" },
      { key: "career_goals", label: "Career goals (one per line)", type: "lines" },
      { key: "socials", label: "Socials (JSON e.g. {\"github\":\"https://…\"})", type: "json" },
      { key: "highlights", label: "Highlights (JSON array e.g. [{\"value\":\"4\",\"label\":\"Semesters\"}])", type: "json" },
    ],
  },
  skills: {
    label: "Skills", singular: "Skill", endpoint: "/api/admin/skills",
    fields: [
      { key: "name", label: "Skill name", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "icon", label: "Icon key", type: "text" },
      { key: "keywords", label: "Keywords (one per line)", type: "lines" },
    ],
  },
  projects: {
    label: "Projects", singular: "Project", endpoint: "/api/admin/projects",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "short_description", label: "Short description", type: "textarea" },
      { key: "description", label: "Full description", type: "textarea" },
      { key: "features", label: "Features (one per line)", type: "lines" },
      { key: "contribution", label: "My contribution", type: "textarea" },
      { key: "technologies", label: "Technologies (one per line)", type: "lines" },
      { key: "github_url", label: "GitHub URL", type: "text" },
      { key: "live_url", label: "Live URL", type: "text" },
      { key: "featured", label: "Featured (larger card)", type: "checkbox" },
    ],
  },
  experience: {
    label: "Experience", singular: "Job", endpoint: "/api/admin/experience",
    fields: [
      { key: "position", label: "Position", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "start_date", label: "Start (e.g. May 2026)", type: "text" },
      { key: "end_date", label: "End (or Present)", type: "text" },
      { key: "current", label: "Current role", type: "checkbox" },
      { key: "responsibilities", label: "Responsibilities (one per line)", type: "lines" },
      { key: "technologies", label: "Technologies (one per line)", type: "lines" },
    ],
  },
  education: {
    label: "Education", singular: "School", endpoint: "/api/admin/education",
    fields: [
      { key: "institution", label: "Institution", type: "text" },
      { key: "degree", label: "Degree / course", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "start_date", label: "Start", type: "text" },
      { key: "end_date", label: "End", type: "text" },
      { key: "current", label: "Currently enrolled", type: "checkbox" },
      { key: "details", label: "Details (one per line)", type: "lines" },
      { key: "grades", label: "Grades (JSON e.g. {\"Sem 1\":\"70.82%\"})", type: "json" },
    ],
  },
  certifications: {
    label: "Certifications", singular: "Certification", endpoint: "/api/admin/certifications",
    fields: [
      { key: "name", label: "Certification name", type: "text" },
      { key: "organization", label: "Organization", type: "text" },
      { key: "issuer", label: "Issuer / platform", type: "text" },
      { key: "date", label: "Date (e.g. Jul 2026)", type: "text" },
      { key: "credential_url", label: "Credential URL", type: "text" },
    ],
  },
};

const PUBLIC_ENDPOINTS = {
  skills: "/api/skills",
  projects: "/api/projects",
  experience: "/api/experience",
  education: "/api/education",
  certifications: "/api/certifications",
};

/* ------------------------------------------------------------------ */
/* UI atoms                                                             */
/* ------------------------------------------------------------------ */
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const api = new Api(null);
    const res = await api.send("POST", "/api/auth/login", { username, password });
    setBusy(false);
    if (res.ok && res.data?.access_token) {
      try {
        sessionStorage.setItem(tokenKey, res.data.access_token);
        sessionStorage.setItem(userKey, JSON.stringify({ username, role: res.data.role }));
      } catch { /* private mode — fall back to in-memory */ }
      onLogin(res.data.access_token);
    } else {
      setError(res.data?.detail || "Login failed. Is the backend running?");
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <Link href="/" className="admin-login__back">← back to site</Link>
        <div className="admin-login__logo">SM</div>
        <h1>Admin Panel</h1>
        <p className="admin-login__sub">Sign in to edit your portfolio content.</p>

        <label className="admin-field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>

        {error ? <p className="admin-error" role="alert">{error}</p> : null}

        <button className="admin-btn admin-btn--primary" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="admin-login__hint text-mono">default: admin / change-me-admin-password</p>
      </form>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "textarea" || field.type === "lines" || field.type === "json") {
    return <textarea rows={field.type === "textarea" ? 4 : 3} value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === "checkbox") {
    return <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />;
  }
  return <input type="text" value={value === undefined || value === null ? "" : value} onChange={(e) => onChange(e.target.value)} />;
}

/* Convert the field values back to an API payload. */
function buildPayload(model, values) {
  const payload = {};
  for (const f of model.fields) {
    let v = values[f.key];
    if (f.type === "lines") {
      v = parseLines(v);
    } else if (f.type === "json") {
      const raw = String(v || "").trim();
      if (!raw) {
        v = f.key === "highlights" ? [] : {};
      } else {
        try {
          v = JSON.parse(raw);
        } catch {
          v = f.key === "highlights" ? [] : {};
        }
      }
    }
    payload[f.key] = v;
  }
  return payload;
}

/* Restore form values from an object. */
function valuesFromItem(fields, item) {
  const out = {};
  for (const f of fields) {
    let v = item?.[f.key];
    if (f.type === "lines") v = joinLines(v);
    else if (f.type === "json") v = JSON.stringify(v ?? (f.key === "socials" || f.key === "highlights" ? (Array.isArray(v) ? [] : {}) : {}), null, 1);
    out[f.key] = v === undefined ? (f.type === "checkbox" ? false : "") : v;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Manager per content model                                            */
/* ------------------------------------------------------------------ */
function ContentManager({ api, modelKey }) {
  const model = MODELS[modelKey];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // null | "new" | item
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await api.get(PUBLIC_ENDPOINTS[modelKey]);
    setItems(res.ok ? res.data : []);
    setLoading(false);
  }, [api, modelKey]);

  useEffect(() => { refresh(); }, [refresh]);

  const beginNew = () => {
    setValues(valuesFromItem(model.fields, null));
    setEditing("new");
    setError("");
  };
  const beginEdit = (item) => {
    setValues(valuesFromItem(model.fields, item));
    setEditing(item);
    setError("");
  };

  const save = async () => {
    setError("");
    const payload = buildPayload(model, values);

    let res;
    if (editing === "new") {
      res = await api.send("POST", model.endpoint, payload);
    } else if (model.method === "PUT") {
      res = await api.send("PUT", model.endpoint, payload); // profile
    } else {
      res = await api.send("PUT", `${model.endpoint}/${editing.id}`, payload);
    }

    if (res.ok) {
      setNotice(`${model.singular} saved ✓`);
      setEditing(null);
      refresh();
      setTimeout(() => setNotice(""), 3000);
    } else {
      setError(res.data?.detail?.[0]?.msg || res.data?.detail || "Save failed.");
    }
  };

  const remove = async (item) => {
    if (model.method === "PUT") return;
    if (!window.confirm(`Delete "${item.name || item.title || item.position || item.institution}"?`)) return;
    const res = await api.send("DELETE", `${model.endpoint}/${item.id}`);
    if (res.ok) refresh();
    else setError(res.data?.detail || "Delete failed.");
  };

  const headline = (item) =>
    item.name || item.title || item.position || item.degree || item.institution || item.company || item.organization || item.issuer || `#${item.id}`;

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <h2>{model.label}</h2>
        <div className="admin-panel__actions">
          {notice ? <span className="admin-notice">{notice}</span> : null}
          <button className="admin-btn" onClick={refresh}>↻ Refresh</button>
          <button className="admin-btn admin-btn--primary" onClick={beginNew}>+ New {model.singular}</button>
        </div>
      </div>

      {error ? <p className="admin-error" role="alert">{error}</p> : null}
      {loading && <p className="admin-muted">Loading…</p>}

      {editing ? (
        <div className="admin-edit">
          <h3>{editing === "new" ? `New ${model.singular}` : `Edit ${headline(editing)}`}</h3>
          <div className="admin-edit__grid">
            {model.fields.map((f) => (
              <label key={f.key} className={`admin-field ${f.type === "lines" || f.type === "textarea" || f.type === "json" ? "admin-field--wide" : ""}`}>
                <span>{f.label}</span>
                <FieldInput field={f} value={values[f.key]} onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} />
              </label>
            ))}
          </div>
          <div className="admin-edit__foot">
            <button className="admin-btn" onClick={() => setEditing(null)}>Cancel</button>
            <button className="admin-btn admin-btn--primary" onClick={save}>Save</button>
          </div>
        </div>
      ) : (
        <ul className="admin-list">
          {items.map((item) => (
            <li key={item.id} className="admin-list__item">
              <div className="admin-list__main">
                <strong>{headline(item)}</strong>
                <span className="admin-muted">{item.category || item.company || item.institution || item.organization || ""}</span>
              </div>
              <div className="admin-list__tools">
                <button className="admin-btn admin-btn--sm" onClick={() => beginEdit(item)}>Edit</button>
                {model.method !== "PUT" && (
                  <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => remove(item)}>Delete</button>
                )}
              </div>
            </li>
          ))}
          {!loading && items.length === 0 && <p className="admin-muted">Nothing here yet — create one.</p>}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Messages + overview                                                  */
/* ------------------------------------------------------------------ */
function MessagesManager({ api }) {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await api.get("/api/admin/messages");
    setMsgs(res.ok ? res.data : []);
    setLoading(false);
  }, [api]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleHandled = async (msg) => {
    const res = await api.send("PATCH", `/api/admin/messages/${msg.id}`, { handled: !msg.handled });
    if (res.ok) refresh();
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <h2>Contact messages</h2>
        <button className="admin-btn" onClick={refresh}>↻ Refresh</button>
      </div>
      {loading ? <p className="admin-muted">Loading…</p> : (
        <ul className="admin-msgs">
          {msgs.map((m) => (
            <li key={m.id} className={`admin-msg ${m.handled ? "is-handled" : ""}`}>
              <div className="admin-msg__head">
                <strong>{m.name}</strong>
                <a href={`mailto:${m.email}`} className="admin-msg__mail">{m.email}</a>
                <span className="admin-msg__date">{new Date(m.created_at).toLocaleString()}</span>
                <button className="admin-btn admin-btn--sm" onClick={() => toggleHandled(m)}>
                  {m.handled ? "Reopen" : "Mark done"}
                </button>
              </div>
              <p className="admin-msg__subject">{m.subject}</p>
              <p className="admin-msg__body">{m.message}</p>
            </li>
          ))}
          {!loading && msgs.length === 0 && <p className="admin-muted">No messages yet.</p>}
        </ul>
      )}
    </div>
  );
}

function Overview({ api, onLogout }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/api/admin/stats").then((r) => r.ok && setStats(r.data));
  }, [api]);

  const cards = stats
    ? [
        { label: "Contact messages", value: stats.messages, accent: "var(--cyan)" },
        { label: "Unhandled", value: stats.unhandled_messages, accent: "var(--accent)" },
        { label: "Projects", value: stats.projects, accent: "var(--accent-2)" },
        { label: "Skills", value: stats.skills, accent: "var(--violet)" },
      ]
    : [];

  return (
    <div className="admin-panel">
      <div className="admin-overview">
        <div className="admin-panel__head">
          <h2>Overview</h2>
          <button className="admin-btn" onClick={onLogout}>Sign out</button>
        </div>
        <div className="admin-stats">
          {cards.map((c) => (
            <div key={c.label} className="admin-stat">
              <span className="admin-stat__value" style={{ color: c.accent }}>{c.value}</span>
              <span className="admin-stat__label">{c.label}</span>
            </div>
          ))}
        </div>
        <p className="admin-muted admin-tip">
          Tip: content changes here are instantly live on the public site — no rebuild needed.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
export default function AdminPage() {
  const [token, setToken] = useState("");
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    try {
      const t = sessionStorage.getItem(tokenKey);
      if (t) setToken(t);
    } catch { /* ignore */ }
  }, []);

  const handleLogin = (t) => setToken(t);

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  const api = new Api(token);
  const TABS = ["overview", ...Object.keys(MODELS), "messages"];

  return (
    <div className="admin">
      <aside className="admin__side">
        <div className="admin__brand">
          <span className="admin__logo">SM</span>
          <span className="admin__brandName">Portfolio Admin</span>
        </div>
        <nav className="admin__nav">
          <button className={`admin__navBtn ${tab === "overview" ? "is-active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
          {Object.keys(MODELS).map((k) => (
            <button key={k} className={`admin__navBtn ${tab === k ? "is-active" : ""}`} onClick={() => setTab(k)}>
              {MODELS[k].label}
            </button>
          ))}
          <button className={`admin__navBtn ${tab === "messages" ? "is-active" : ""}`} onClick={() => setTab("messages")}>Messages</button>
        </nav>
        <div className="admin__foot">
          <Link href="/" className="admin-btn">← View site</Link>
        </div>
      </aside>

      <main className="admin__main">
        {tab === "overview" && <Overview api={api} onLogout={() => { sessionStorage.clear(); setToken(""); setTab("overview"); }} />}
        {tab === "messages" && <MessagesManager api={api} />}
        {TABS.filter((t) => t !== "overview" && t !== "messages").map((k) =>
          tab === k ? <ContentManager key={k} api={api} modelKey={k} /> : null
        )}
      </main>
    </div>
  );
}