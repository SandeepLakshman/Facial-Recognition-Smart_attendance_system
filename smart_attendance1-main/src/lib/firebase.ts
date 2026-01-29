// Firebase Configuration and Initialization
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, Timestamp, onSnapshot, Unsubscribe } from "firebase/firestore";
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";

// Firebase configuration from the project
const firebaseConfig = {
  apiKey: "AIzaSyCOW5FCDP9NsrJthn7i03RdO_FU85M3QQg",
  authDomain: "cloud-attendance-system-26aca.firebaseapp.com",
  projectId: "cloud-attendance-system-26aca",
  storageBucket: "cloud-attendance-system-26aca.firebasestorage.app",
  messagingSenderId: "24662385624",
  appId: "1:24662385624:web:b648140c69c5302cf308ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const auth: Auth = getAuth(app);

// Firestore Collection Names - Organized and Professional
export const COLLECTIONS = {
  STUDENTS: "students",
  TEACHERS: "teachers",
  SECTIONS: "sections",
  SUBJECTS: "subjects",
  ATTENDANCE_LOGS: "attendance_logs", // More descriptive name
  TIMETABLE: "timetable",
  SESSIONS: "sessions", // New: For managing active attendance sessions

  // Deprecated - Moving to core collections
  TOPICS: "topics",
  AUDITS: "audits",
  SETTINGS: "settings",
  FACE_DATA: "faceData",
  FACE_IMAGES: "faceImages"
} as const;

// Helper function to convert Firestore Timestamp to number
export const timestampToNumber = (timestamp: any): number => {
  if (timestamp?.toMillis) {
    return timestamp.toMillis();
  }
  if (timestamp?.seconds) {
    return timestamp.seconds * 1000;
  }
  return timestamp || Date.now();
};

// Helper function to convert number to Firestore Timestamp
export const numberToTimestamp = (num: number): Timestamp => {
  return Timestamp.fromMillis(num);
};

// Helper function to convert Firestore document to plain object
export const docToObject = <T>(doc: any): T | null => {
  if (!doc.exists()) return null;
  const data = doc.data();
  return { id: doc.id, ...data } as T;
};

// Helper function to convert array of docs to objects
export const docsToArray = <T>(docs: any[]): T[] => {
  return docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

