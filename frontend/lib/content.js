import { db } from "./firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { fallbackContent } from "./fallback"; // We'll move the fallback here

export async function getContent() {
  try {
    const profileSnap = await getDocs(collection(db, "profile"));
    if (profileSnap.empty) {
      return { ...fallbackContent, _source: "fallback" };
    }
    
    const profile = profileSnap.docs[0].data();
    profile.id = profileSnap.docs[0].id;
    
    const collectionsToFetch = ["skills", "projects", "experience", "education", "certifications"];
    const content = { profile, _source: "firebase" };
    
    const results = await Promise.all(
      collectionsToFetch.map((c) => getDocs(collection(db, c)))
    );

    collectionsToFetch.forEach((c, idx) => {
      const snap = results[idx];
      content[c] = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      content[c].sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    
    return content;
  } catch (err) {
    console.error("Firebase fetch error:", err);
    return { ...fallbackContent, _source: "fallback" };
  }
}

export async function submitContact(payload) {
  try {
    if (payload.website) return { ok: true }; // honeypot
    
    await addDoc(collection(db, "messages"), {
      ...payload,
      created_at: serverTimestamp(),
      handled: false
    });
    return { ok: true, data: { success: true, message: "Message sent successfully" } };
  } catch (err) {
    return { ok: false, data: { detail: err.message } };
  }
}
