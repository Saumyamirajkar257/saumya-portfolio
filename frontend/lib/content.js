import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { fallbackContent } from "./fallback";

// In-memory cache for SSR / initial loads with invalidation capability
let contentCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL, immediately invalidated on admin mutations

// Helper: Wrap promise with timeout
function withTimeout(promise, ms = 6000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Filter items for public view: Only PUBLISHED content appears publicly.
 * Draft and hidden content remain private in the database / Admin.
 */
function isPubliclyVisible(item) {
  if (item.published === false) return false;
  if (item.visible === false) return false;
  if (item.status === "draft" || item.status === "hidden") return false;
  return true;
}

/**
 * Clear the in-memory cache so subsequent fetches are always fresh
 */
export function clearContentCache() {
  contentCache = null;
  lastFetchTime = 0;
}

/**
 * Get Content from Firestore (Single Source of Truth)
 * Public pages call this. If Firestore has data, it is used exclusively.
 */
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
      // 1. Fetch Profile
      let profile = null;
      try {
        const profileDoc = await getDoc(doc(db, "profile", "main"));
        if (profileDoc.exists()) {
          profile = { id: profileDoc.id, ...profileDoc.data() };
        } else {
          const profileSnap = await getDocs(collection(db, "profile"));
          if (!profileSnap.empty) {
            profile = { id: profileSnap.docs[0].id, ...profileSnap.docs[0].data() };
          }
        }
      } catch (err) {
        console.warn("Profile fetch error:", err.message);
      }

      if (!profile) {
        profile = fallbackContent.profile;
      }

      const collectionsToFetch = [
        "skills",
        "projects",
        "experience",
        "education",
        "certifications",
      ];

      const content = { profile, _source: "firebase" };

      // 2. Fetch all collections in parallel without arbitrary 30-item truncation
      const results = await Promise.all(
        collectionsToFetch.map((c) => getDocs(collection(db, c)))
      );

      collectionsToFetch.forEach((c, idx) => {
        const snap = results[idx];
        const fetchedItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (fetchedItems.length > 0) {
          // FIRESTORE IS THE SINGLE SOURCE OF TRUTH:
          let itemsToUse = fetchedItems;
          if (c === "skills" && fallbackContent.skills) {
            const existingNames = new Set(
              fetchedItems.map((s) => (s.name || "").toLowerCase().trim())
            );
            const missingFallbacks = fallbackContent.skills.filter(
              (s) => !existingNames.has((s.name || "").toLowerCase().trim())
            );
            if (missingFallbacks.length > 0) {
              itemsToUse = [...fetchedItems, ...missingFallbacks];
            }
          }

          // Filter out unpublished/draft/hidden items for the public view
          const publicItems = itemsToUse.filter(isPubliclyVisible);
          // Sort strictly by display order
          publicItems.sort(
            (a, b) =>
              Number(a.sortOrder ?? a.order ?? a.displayOrder ?? 999) -
              Number(b.sortOrder ?? b.order ?? b.displayOrder ?? 999)
          );
          content[c] = publicItems;
        } else if (fallbackContent[c]) {
          // If Firestore collection has never been initialized, use initial fallback
          content[c] = fallbackContent[c];
        } else {
          content[c] = [];
        }
      });

      return content;
    };

    const data = await withTimeout(fetchPromise(), 7000);
    contentCache = data;
    lastFetchTime = now;
    return data;
  } catch (err) {
    console.warn(
      "Firestore fetch error or timeout, using verified fallback content:",
      err.message
    );
    return { ...fallbackContent, _source: "fallback" };
  }
}

/**
 * Real-Time Listener for the Public Portfolio
 * Allows changes made in Admin to immediately reflect across all sections without page reload.
 */
export function subscribeContent(onUpdate) {
  if (!db || typeof window === "undefined") return () => {};

  const state = {
    profile: fallbackContent.profile,
    skills: fallbackContent.skills,
    projects: fallbackContent.projects,
    experience: fallbackContent.experience,
    education: fallbackContent.education,
    certifications: fallbackContent.certifications,
    _source: "firebase-live",
  };

  const unsubscribes = [];

  const emit = () => {
    onUpdate({ ...state });
  };

  try {
    // 1. Listen to Profile
    const unsubProfile = onSnapshot(
      doc(db, "profile", "main"),
      (docSnap) => {
        if (docSnap.exists()) {
          state.profile = { id: docSnap.id, ...docSnap.data() };
          emit();
        }
      },
      (err) => console.warn("Live profile listener warning:", err.message)
    );
    unsubscribes.push(unsubProfile);

    // 2. Listen to Collections
    const collections = [
      "skills",
      "projects",
      "experience",
      "education",
      "certifications",
    ];

    collections.forEach((colName) => {
      const unsub = onSnapshot(
        collection(db, colName),
        (snap) => {
          const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (items.length > 0) {
            let itemsToUse = items;
            if (colName === "skills" && fallbackContent.skills) {
              const existingNames = new Set(
                items.map((s) => (s.name || "").toLowerCase().trim())
              );
              const missingFallbacks = fallbackContent.skills.filter(
                (s) => !existingNames.has((s.name || "").toLowerCase().trim())
              );
              if (missingFallbacks.length > 0) {
                itemsToUse = [...items, ...missingFallbacks];
              }
            }
            const publicItems = itemsToUse.filter(isPubliclyVisible);
            publicItems.sort(
              (a, b) =>
                Number(a.sortOrder ?? a.order ?? a.displayOrder ?? 999) -
                Number(b.sortOrder ?? b.order ?? b.displayOrder ?? 999)
            );
            state[colName] = publicItems;
          } else if (snap.empty && fallbackContent[colName]) {
            // Keep current if empty
          } else {
            state[colName] = [];
          }
          emit();
        },
        (err) => console.warn(`Live ${colName} listener warning:`, err.message)
      );
      unsubscribes.push(unsub);
    });
  } catch (err) {
    console.warn("Failed to attach real-time Firestore listeners:", err.message);
  }

  return () => {
    unsubscribes.forEach((unsub) => {
      try {
        unsub();
      } catch {}
    });
  };
}

/**
 * Migration Utility:
 * Safely migrate existing hardcoded content into Firestore if collections are empty.
 * Preserves all existing content without duplication.
 */
export async function migrateInitialData(force = false) {
  if (!db) throw new Error("Firebase Firestore is not initialized.");

  const results = { migrated: {}, skipped: {} };

  // 1. Profile
  const profileRef = doc(db, "profile", "main");
  const profileSnap = await getDoc(profileRef);
  if (!profileSnap.exists() || force) {
    await setDoc(profileRef, {
      ...fallbackContent.profile,
      updatedAt: new Date().toISOString(),
    });
    results.migrated.profile = 1;
  } else {
    results.skipped.profile = 1;
  }

  // 2. Collections
  const collections = [
    "skills",
    "projects",
    "experience",
    "education",
    "certifications",
  ];

  for (const c of collections) {
    const snap = await getDocs(collection(db, c));
    results.migrated[c] = 0;
    results.skipped[c] = 0;

    const existingDocs = snap.docs.map((d) => d.data());
    const existingTitles = new Set(
      existingDocs.map((d) =>
        (d.name || d.title || d.position || d.degree || "").toLowerCase().trim()
      )
    );

    const fallbacks = fallbackContent[c] || [];
    for (let i = 0; i < fallbacks.length; i++) {
      const item = fallbacks[i];
      const titleKey = (
        item.name ||
        item.title ||
        item.position ||
        item.degree ||
        ""
      )
        .toLowerCase()
        .trim();

      if (!existingTitles.has(titleKey) || force) {
        const id = String(item.id || `${c}-${i}`);
        await setDoc(
          doc(db, c, id),
          {
            ...item,
            order: item.order ?? i,
            published: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        results.migrated[c]++;
      } else {
        results.skipped[c]++;
      }
    }
  }

  clearContentCache();
  return results;
}

/**
 * Contact Submission Handler
 */
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
