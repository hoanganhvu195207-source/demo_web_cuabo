import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import fs from "fs/promises";
import path from "path";
import { 
  initialRotations, 
  initialBoardingRooms, 
  initialMaintenanceTickets, 
  initialAppraisals,
  initialSoKhambenh,
  initialPhatthuoc,
  initialBaocaoton
} from "./src/mockData";

const DB_PATH = path.join(process.cwd(), "db.json");

let firestoreDb: Firestore | null = null;
let firebaseInitialized = false;

/**
 * Safely initializes Firebase Admin SDK on-demand.
 * Returns the Firestore DB instance if successful, otherwise null.
 */
export function getFirestoreDB(): Firestore | null {
  if (firebaseInitialized) return firestoreDb;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  try {
    const existingApps = getApps();
    let app: App;

    if (serviceAccountJson) {
      const credentials = JSON.parse(serviceAccountJson);
      if (existingApps.length === 0) {
        app = initializeApp({
          credential: cert(credentials)
        });
      } else {
        app = existingApps[0];
      }
      firestoreDb = getFirestore(app);
      firebaseInitialized = true;
      console.log("[DATABASE] Connected successfully to Cloud Firestore via Service Account JSON!");
      return firestoreDb;
    } else if (projectId && clientEmail && privateKey) {
      // Format private key correctly if there are escaped newlines
      const formattedKey = privateKey.replace(/\\n/g, '\n');
      if (existingApps.length === 0) {
        app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: formattedKey
          })
        });
      } else {
        app = existingApps[0];
      }
      firestoreDb = getFirestore(app);
      firebaseInitialized = true;
      console.log("[DATABASE] Connected successfully to Cloud Firestore via individual credentials!");
      return firestoreDb;
    }
  } catch (error: any) {
    console.error("[DATABASE WARNING] Could not connect to Firebase Admin Firestore:", error.message);
    console.log("[DATABASE] Falling back to local file-based database (db.json).");
  }

  firebaseInitialized = true; // Mark as attempted to prevent redundant crash loops
  return null;
}

/**
 * Gets the default starter database state
 */
export function getDefaultData() {
  return {
    rotations: initialRotations,
    rooms: initialBoardingRooms,
    tickets: initialMaintenanceTickets,
    appraisals: initialAppraisals,
    soKhambenhData: initialSoKhambenh,
    phatthuocData: initialPhatthuoc,
    baocaotonData: initialBaocaoton
  };
}

/**
 * Ensures the database is ready (creates db.json if not using Firestore)
 */
export async function ensureLocalDatabase() {
  try {
    await fs.access(DB_PATH);
    const content = await fs.readFile(DB_PATH, "utf-8");
    const data = JSON.parse(content);
    // Auto migrate if any excel keys are missing
    if (!data.soKhambenhData || !data.phatthuocData || !data.baocaotonData) {
      data.soKhambenhData = data.soKhambenhData || initialSoKhambenh;
      data.phatthuocData = data.phatthuocData || initialPhatthuoc;
      data.baocaotonData = data.baocaotonData || initialBaocaoton;
      await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch {
    const defaultData = getDefaultData();
    await fs.writeFile(DB_PATH, JSON.stringify(defaultData, null, 2), "utf-8");
    console.log("[DATABASE] Initialized local db.json with mock defaults.");
  }
}

/**
 * Loads full database state
 */
export async function loadDatabaseState(): Promise<any> {
  const db = getFirestoreDB();
  if (db) {
    try {
      const docRef = db.collection("system_config").doc("app_state");
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const data = docSnap.data();
        console.log("[DATABASE] Loaded state from Cloud Firestore.");
        return data;
      } else {
        // Document doesn't exist yet, seed it with defaults
        const defaultData = getDefaultData();
        await docRef.set(defaultData);
        console.log("[DATABASE] Cloud Firestore seeded with initial data.");
        return defaultData;
      }
    } catch (err: any) {
      console.error("[DATABASE ERROR] Failed to load from Firestore, falling back to local file:", err.message);
    }
  }

  // Local JSON fallback
  await ensureLocalDatabase();
  const content = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(content);
}

/**
 * Saves full database state
 */
export async function saveDatabaseState(data: any): Promise<boolean> {
  const db = getFirestoreDB();
  if (db) {
    try {
      const docRef = db.collection("system_config").doc("app_state");
      await docRef.set(data, { merge: true });
      console.log("[DATABASE] Saved state to Cloud Firestore.");
      return true;
    } catch (err: any) {
      console.error("[DATABASE ERROR] Failed to save to Firestore, falling back to local file:", err.message);
    }
  }

  // Local JSON fallback
  await ensureLocalDatabase();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log("[DATABASE] Saved state to local db.json.");
  return true;
}

/**
 * Resets database state
 */
export async function resetDatabaseState(): Promise<any> {
  const defaultData = getDefaultData();
  const db = getFirestoreDB();
  if (db) {
    try {
      const docRef = db.collection("system_config").doc("app_state");
      await docRef.set(defaultData);
      console.log("[DATABASE] Reset Cloud Firestore state to defaults.");
      return defaultData;
    } catch (err: any) {
      console.error("[DATABASE ERROR] Failed to reset Firestore state, falling back to local file:", err.message);
    }
  }

  // Local JSON reset
  await fs.writeFile(DB_PATH, JSON.stringify(defaultData, null, 2), "utf-8");
  console.log("[DATABASE] Reset local db.json to defaults.");
  return defaultData;
}
