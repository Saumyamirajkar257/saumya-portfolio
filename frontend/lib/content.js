import { db } from "./firebase";
import { collection, getDocs, addDoc, query, limit, serverTimestamp } from "firebase/firestore";
import { fallbackContent } from "./fallback";

// In-memory cache with 5-minute TTL to reduce read quota consumption and prevent redundant queries
let contentCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

// Helper: Wrap promise with timeout
function withTimeout(promise, ms = 5000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

export async function getContent(forceRefresh = false) {
  if (!db) {
    return { ...fallbackContent, _source: "fallback" };
  }

  const now = Date.now();
  if (!forceRefresh && contentCache && now - lastFetchTime < CACHE_TTL_MS) {
    return contentCache;
  }

  try {
    const fetchPromise = async () => {
      const profileSnap = await getDocs(query(collection(db, "profile"), limit(1)));
      if (profileSnap.empty) {
        return { ...fallbackContent, _source: "fallback" };
      }

      const profile = profileSnap.docs[0].data();
      profile.id = profileSnap.docs[0].id;

      const collectionsToFetch = ["skills", "projects", "experience", "education", "certifications"];
      const content = { profile, _source: "firebase" };

      const results = await Promise.all(
        collectionsToFetch.map((c) =>
          getDocs(query(collection(db, c), limit(30)))
        )
      );

      collectionsToFetch.forEach((c, idx) => {
        const snap = results[idx];
        content[c] = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        content[c].sort((a, b) => (a.order || 0) - (b.order || 0));
      });

      return content;
    };

    const data = await withTimeout(fetchPromise(), 6000);
    contentCache = data;
    lastFetchTime = now;
    return data;
  } catch (err) {
    console.warn("Firestore fetch error or timeout, using verified fallback content:", err.message);
    return { ...fallbackContent, _source: "fallback" };
  }
}

export async function submitContact(payload) {
  try {
    if (payload.website || payload.honeypot) return { ok: true }; // honeypot

    const sanitized = {
      name: String(payload.name || "").substring(0, 80).replace(/[<>]/g, "").trim(),
      email: String(payload.email || "").substring(0, 254).replace(/[<>]/g, "").trim(),
      message: String(payload.message || "").substring(0, 2000).replace(/[<>]/g, "").trim(),
      handled: false,
      created_at: serverTimestamp(),
    };

    await withTimeout(addDoc(collection(db, "messages"), sanitized), 5000);
    return { ok: true, data: { success: true, message: "Message sent successfully." } };
  } catch (err) {
    console.error("Contact submission error:", err);
    return { ok: false, data: { detail: err.message || "Failed to submit message." } };
  }
}
