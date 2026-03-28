import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");

const adminApp = initializeApp({
  credential: cert(serviceAccount),
});

export const adminDb = getFirestore(adminApp);