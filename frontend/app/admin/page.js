"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { fallbackContent } from "@/lib/fallback";
import "./admin.css";

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const parseLines = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const joinLines = (arr = []) => (Array.isArray(arr) ? arr.join("\n") : "");

/* Field config -> auto-generated forms. type: text|textarea|lines|json|checkbox|number */
const MODELS = {
  profile: {
    label: "About / Profile", singular: "Profile", collection: "profile", isSingleton: true,
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
    label: "Skills", singular: "Skill", collection: "skills",
    fields: [
      { key: "name", label: "Skill name", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "icon", label: "Icon key", type: "text" },
      { key: "keywords", label: "Keywords (one per line)", type: "lines" },
      { key: "order", label: "Display Priority / Sequence (0 = Top / First)", type: "number" },
    ],
  },
  projects: {
    label: "Projects", singular: "Project", collection: "projects",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "short_description", label: "Short description", type: "textarea" },
      { key: "description", label: "Full description", type: "textarea" },
      { key: "summary", label: "One-line P→A→R summary", type: "textarea" },
      { key: "problem", label: "Problem", type: "textarea" },
      { key: "approach", label: "Approach", type: "textarea" },
      { key: "result", label: "Result", type: "textarea" },
      { key: "features", label: "Features (one per line)", type: "lines" },
      { key: "contribution", label: "My contribution", type: "textarea" },
      { key: "technologies", label: "Technologies (one per line)", type: "lines" },
      { key: "github_url", label: "GitHub URL", type: "text" },
      { key: "live_url", label: "Live URL", type: "text" },
      { key: "image", label: "Cover image path (e.g. /projects/portfolio-preview.png)", type: "text" },
      { key: "featured", label: "Featured (larger card)", type: "checkbox" },
      { key: "order", label: "Display Priority / Sequence (0 = Top / First)", type: "number" },
    ],
  },
  experience: {
    label: "Experience", singular: "Job", collection: "experience",
    fields: [
      { key: "position", label: "Position", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "start_date", label: "Start (e.g. May 2026)", type: "text" },
      { key: "end_date", label: "End (or Present)", type: "text" },
      { key: "current", label: "Current role", type: "checkbox" },
      { key: "responsibilities", label: "Responsibilities (one per line)", type: "lines" },
      { key: "technologies", label: "Technologies (one per line)", type: "lines" },
      { key: "order", label: "Display Priority / Sequence (0 = Top / First)", type: "number" },
    ],
  },
  education: {
    label: "Education", singular: "School", collection: "education",
    fields: [
      { key: "institution", label: "Institution", type: "text" },
      { key: "degree", label: "Degree / course", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "start_date", label: "Start", type: "text" },
      { key: "end_date", label: "End", type: "text" },
      { key: "current", label: "Currently enrolled", type: "checkbox" },
      { key: "details", label: "Details (one per line)", type: "lines" },
      { key: "grades", label: "Grades (JSON e.g. {\"Sem 1\":\"70.82%\"})", type: "json" },
      { key: "order", label: "Display Priority / Sequence (0 = Top / First)", type: "number" },
    ],
  },
  certifications: {
    label: "Certifications", singular: "Certification", collection: "certifications",
    fields: [
      { key: "name", label: "Certification name", type: "text" },
      { key: "organization", label: "Organization", type: "text" },
      { key: "issuer", label: "Issuer / platform", type: "text" },
      { key: "date", label: "Date (e.g. Jul 2026)", type: "text" },
      { key: "credential_url", label: "Credential URL", type: "text" },
      { key: "logo", label: "Logo URL / Path (e.g. /logos/ibm.svg)", type: "text" },
      { key: "order", label: "Display Priority / Sequence (0 = Top / First, 1 = Second...)", type: "number" },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* UI atoms                                                             */
/* ------------------------------------------------------------------ */
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLogin(userCredential.user);
    } catch (err) {
      setError(err.message || "Login failed.");
    }
    setBusy(false);
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <Link href="/" className="admin-login__back">← back to site</Link>
        <div className="admin-login__logo">SM</div>
        <h1>Admin Panel</h1>
        <p className="admin-login__sub">Sign in to edit your portfolio content.</p>

        <label className="admin-field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>

        {error ? <p className="admin-error" role="alert">{error}</p> : null}

        <button className="admin-btn admin-btn--primary" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
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
  if (field.type === "number") {
    return (
      <input 
        type="number" 
        min="0"
        value={value === undefined || value === null ? "" : value} 
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} 
        placeholder="0"
      />
    );
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
    } else if (f.type === "number") {
      v = v === "" || v === undefined || v === null ? 0 : Number(v);
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
    out[f.key] = v === undefined ? (f.type === "checkbox" ? false : f.type === "number" ? 0 : "") : v;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Manager per content model                                            */
/* ------------------------------------------------------------------ */
function ContentManager({ modelKey }) {
  const model = MODELS[modelKey];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // null | "new" | item
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, model.collection));
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => (Number(a.order ?? 999) - Number(b.order ?? 999)));
      setItems(fetched);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [model.collection]);

  useEffect(() => { refresh(); }, [refresh]);

  const beginNew = () => {
    const initial = valuesFromItem(model.fields, null);
    if ("order" in initial) {
      initial.order = items.length;
    }
    setValues(initial);
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

    try {
      if (editing === "new") {
        if (payload.order === undefined || payload.order === null) {
          payload.order = items.length;
        }
        const docRef = doc(collection(db, model.collection));
        await setDoc(docRef, payload);
      } else if (model.isSingleton) {
        const targetId = editing.id || "main";
        await setDoc(doc(db, model.collection, targetId), payload, { merge: true });
      } else {
        await setDoc(doc(db, model.collection, String(editing.id)), payload, { merge: true });
      }

      setNotice(`${model.singular} saved ✓`);
      setEditing(null);
      refresh();
      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError("Save failed: " + err.message);
    }
  };

  const moveItem = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const currentItem = items[index];
    const targetItem = items[targetIndex];

    try {
      await updateDoc(doc(db, model.collection, String(currentItem.id)), { order: targetIndex });
      await updateDoc(doc(db, model.collection, String(targetItem.id)), { order: index });
      setNotice(`Reordered sequence ✓`);
      refresh();
      setTimeout(() => setNotice(""), 2500);
    } catch (err) {
      setError("Reorder failed: " + err.message);
    }
  };

  const remove = async (item) => {
    if (model.isSingleton) return;
    const confirmName = item.name || item.title || item.position || item.institution || "this item";
    if (!window.confirm(`Are you sure you want to delete "${confirmName}"?`)) return;
    
    try {
      setError("");
      await deleteDoc(doc(db, model.collection, String(item.id)));
      setItems((prev) => prev.filter((i) => String(i.id) !== String(item.id)));
      setNotice(`Deleted ${model.singular} ✓`);
      setTimeout(() => setNotice(""), 3000);
      refresh();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Delete failed: " + err.message);
    }
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
          {!model.isSingleton && <button className="admin-btn admin-btn--primary" onClick={beginNew}>+ New {model.singular}</button>}
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
          {items.map((item, idx) => (
            <li key={item.id} className="admin-list__item">
              <div className="admin-list__left">
                {!model.isSingleton && (
                  <span className="admin-list__orderBadge" title={`Priority / Order: ${item.order ?? idx}`}>
                    #{idx + 1}
                  </span>
                )}
                <div className="admin-list__main">
                  <strong>{headline(item)}</strong>
                  <span className="admin-muted">{item.organization || item.issuer || item.category || item.company || item.institution || ""}</span>
                </div>
              </div>

              <div className="admin-list__tools">
                {!model.isSingleton && (
                  <div className="admin-reorder-btns">
                    <button 
                      type="button" 
                      className="admin-reorder-btn" 
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                      title="Move up (Show higher on website)"
                    >
                      ↑
                    </button>
                    <button 
                      type="button" 
                      className="admin-reorder-btn" 
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === items.length - 1}
                      title="Move down (Show lower on website)"
                    >
                      ↓
                    </button>
                  </div>
                )}
                <button className="admin-btn admin-btn--sm" onClick={() => beginEdit(item)}>Edit</button>
                {!model.isSingleton && (
                  <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => remove(item)}>Delete</button>
                )}
              </div>
            </li>
          ))}
          {!loading && items.length === 0 && <p className="admin-muted">Nothing in Firestore yet. Click "+ New" to add, or sync default data from the Overview tab.</p>}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Messages + overview                                                  */
/* ------------------------------------------------------------------ */
function MessagesManager() {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "messages"));
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => {
        const ta = a.created_at?.toMillis?.() || 0;
        const tb = b.created_at?.toMillis?.() || 0;
        return tb - ta;
      });
      setMsgs(fetched);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleHandled = async (msg) => {
    try {
      await updateDoc(doc(db, "messages", msg.id), { handled: !msg.handled });
      refresh();
    } catch (err) {
      console.error(err);
    }
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
                <span className="admin-msg__date">
                  {m.created_at?.toDate ? m.created_at.toDate().toLocaleString() : ""}
                </span>
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

function Overview({ onLogout }) {
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const seedDatabase = async () => {
    if (!window.confirm("This will write/sync default profile, skills, projects, experience, education, and certifications into Firestore. Continue?")) return;
    setSeeding(true);
    setSeedMsg("");
    try {
      // 1. Profile
      await setDoc(doc(db, "profile", "main"), fallbackContent.profile, { merge: true });

      // 2. Skills
      for (let i = 0; i < fallbackContent.skills.length; i++) {
        const skill = fallbackContent.skills[i];
        const id = String(skill.id || `skill-${i}`);
        await setDoc(doc(db, "skills", id), { ...skill, order: i }, { merge: true });
      }

      // 3. Projects
      for (let i = 0; i < fallbackContent.projects.length; i++) {
        const proj = fallbackContent.projects[i];
        const id = String(proj.id || `proj-${i}`);
        await setDoc(doc(db, "projects", id), { ...proj, order: i }, { merge: true });
      }

      // 4. Experience
      for (let i = 0; i < fallbackContent.experience.length; i++) {
        const exp = fallbackContent.experience[i];
        const id = String(exp.id || `exp-${i}`);
        await setDoc(doc(db, "experience", id), { ...exp, order: i }, { merge: true });
      }

      // 5. Education
      for (let i = 0; i < fallbackContent.education.length; i++) {
        const edu = fallbackContent.education[i];
        const id = String(edu.id || `edu-${i}`);
        await setDoc(doc(db, "education", id), { ...edu, order: i }, { merge: true });
      }

      // 6. Certifications
      for (let i = 0; i < fallbackContent.certifications.length; i++) {
        const cert = fallbackContent.certifications[i];
        const id = String(cert.id || `cert-${i}`);
        await setDoc(doc(db, "certifications", id), { ...cert, order: i }, { merge: true });
      }

      setSeedMsg("Successfully synced all default content to Firestore! You can now edit, reorder, or delete any item ✓");
    } catch (err) {
      setSeedMsg("Sync failed: " + err.message);
    }
    setSeeding(false);
  };

  return (
    <div className="admin-panel">
      <div className="admin-overview">
        <div className="admin-panel__head">
          <h2>Overview</h2>
          <button className="admin-btn" onClick={onLogout}>Sign out</button>
        </div>
        <p className="admin-muted admin-tip">
          Welcome to your Firebase Serverless Admin Panel!
          Content changes here are instantly saved to Firestore and live on the public site in real time.
        </p>

        <div style={{ marginTop: "32px", padding: "24px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "14px" }}>
          <h3 style={{ fontSize: "17px", marginBottom: "8px", color: "#FFFFFF" }}>Initialize / Sync Firestore Database</h3>
          <p className="admin-muted" style={{ marginBottom: "16px", fontSize: "13.5px" }}>
            If your Firestore collections are empty or you want all initial skills, projects, and certifications available in Firestore for editing and deleting, click below:
          </p>
          <button 
            type="button" 
            className="admin-btn admin-btn--primary" 
            onClick={seedDatabase}
            disabled={seeding}
          >
            {seeding ? "Syncing..." : "⚡ Sync Default Content to Firestore"}
          </button>
          {seedMsg && (
            <p style={{ marginTop: "14px", fontSize: "13.5px", color: seedMsg.includes("failed") ? "#ff8086" : "var(--cyan)" }}>
              {seedMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{ padding: "40px", color: "white" }}>Loading...</div>;

  if (!user) return <LoginScreen onLogin={setUser} />;

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
          <Link href="/" className="admin-btn" style={{ width: "100%", justifyContent: "center" }}>View site ↗</Link>
        </div>
      </aside>
      <main className="admin__main">
        {tab === "overview" && <Overview onLogout={() => signOut(auth)} />}
        {tab in MODELS && <ContentManager modelKey={tab} />}
        {tab === "messages" && <MessagesManager />}
      </main>
    </div>
  );
}
