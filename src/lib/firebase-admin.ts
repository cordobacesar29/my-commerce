import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");

// Aplicamos el mismo patrón Singleton que usaste en el cliente
const adminApp = getApps().length === 0 
  ? initializeApp({
      credential: cert(serviceAccount),
    }) 
  : getApp();

export const adminDb = getFirestore(adminApp);