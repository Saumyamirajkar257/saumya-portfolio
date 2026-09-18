import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { fallbackContent } from "./fallback.js";

const firebaseConfig = {
  projectId: "saumya-portfolio-2026",
  appId: "1:711225543955:web:e2afb242455f763fd59ee6",
  storageBucket: "saumya-portfolio-2026.firebasestorage.app",
  apiKey: "AIzaSyBIcBj4D6D4RZJcEZ-127KgnQjmGIxqghw",
  authDomain: "saumya-portfolio-2026.firebaseapp.com",
  messagingSenderId: "711225543955"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding profile...");
  await setDoc(doc(db, "profile", "main"), fallbackContent.profile);

  const collections = ["skills", "projects", "experience", "education", "certifications"];
  for (const c of collections) {
    console.log(`Seeding ${c}...`);
    for (const item of fallbackContent[c]) {
      const id = String(item.id);
      await setDoc(doc(db, c, id), item);
    }
  }
  console.log("Done!");
}

seed().catch(console.error);
