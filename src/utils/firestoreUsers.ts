import {
  collection, doc, getDocs, setDoc, updateDoc,
  query, orderBy, onSnapshot, getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface CloudUser {
  id: string;
  username: string;
  name: string;
  phone: string;
  email?: string;
  role: 'seeker' | 'company' | 'admin';
  companyName?: string;
  companySize?: string;
  companyDesc?: string;
  sector?: string;
  experience?: string;
  targetCountry?: string;
  targetCity?: string;
  cvUrl?: string;
  createdAt: string;
  lastLogin?: string;
}

const USERS_COLLECTION = 'users';

// ── Real-time listener ────────────────────────────────────────────────────────
export function subscribeToUsers(callback: (users: CloudUser[]) => void): () => void {
  const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const users: CloudUser[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data() as Omit<CloudUser, 'id'>,
    }));
    callback(users);
  }, (error) => {
    console.error('Error listening to users:', error);
  });

  return unsubscribe;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
export async function saveUserToDB(user: CloudUser): Promise<void> {
  const { id, ...userData } = user;
  await setDoc(doc(db, USERS_COLLECTION, id), userData);
}

export async function getUserFromDB(id: string): Promise<CloudUser | null> {
  try {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() as Omit<CloudUser, 'id'> };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAllUsersFromDB(): Promise<CloudUser[]> {
  try {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data() as Omit<CloudUser, 'id'>,
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

export async function updateUserInDB(id: string, updates: Partial<CloudUser>): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, id), updates);
}

export async function checkUsernameExists(username: string, excludeId?: string): Promise<boolean> {
  const users = await getAllUsersFromDB();
  return users.some(u => u.username === username && u.id !== excludeId);
}
