import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

// Mirror of StoredAd from adsStore.ts
export interface StoredAd {
  id: string;
  category: 'cars' | 'real_estate' | 'services' | 'car_plates' | 'jobs' | 'job_seeker';
  intent: 'offer' | 'request';
  title: string;
  description?: string;
  price?: number;
  location?: string;
  city?: string;
  phone: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  userId?: string;
  userName?: string;
  createdAt: string;
  // Cars fields
  carBrand?: string; carModel?: string; carYear?: string; carMileage?: string; carColor?: string; carFuel?: string; carTransmission?: string;
  // Real estate fields
  propType?: string; propArea?: string; propRooms?: string; propBath?: string; propFloor?: string;
  // Job fields
  jobTitle?: string; jobSector?: string; jobType?: string; jobExp?: string; jobSalary?: string; targetCountry?: string; targetCity?: string; cvUrl?: string;
  // Job seeker fields
  jsTitle?: string; jsSector?: string; jsExp?: string; jsType?: string; jsNationality?: string; jsCv?: string;
  // Car plate fields
  plateNumber?: string; plateEmirate?: string; plateCode?: string;
  // Services fields
  serviceType?: string;
}

const ADS_COLLECTION = 'ads';

// ── Real-time listener ────────────────────────────────────────────────────────
export function subscribeToAds(callback: (ads: StoredAd[]) => void): () => void {
  const q = query(collection(db, ADS_COLLECTION), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const ads: StoredAd[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data() as Omit<StoredAd, 'id'>,
    }));
    callback(ads);
  }, (error) => {
    console.error('Error listening to ads:', error);
  });

  return unsubscribe;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
export async function getAllAds(): Promise<StoredAd[]> {
  try {
    const q = query(collection(db, ADS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data() as Omit<StoredAd, 'id'>,
    }));
  } catch (error) {
    console.error('Error getting ads:', error);
    return [];
  }
}

export async function saveAd(ad: Partial<StoredAd> & { category: StoredAd['category']; phone: string; createdAt: string }): Promise<string> {
  const adData = {
    ...ad,
    title: ad.title || ad.jsTitle || 'إعلان',
    status: 'approved' as const,
    createdAt: ad.createdAt || new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, ADS_COLLECTION), adData);
  return docRef.id;
}

export async function updateAdStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  await updateDoc(doc(db, ADS_COLLECTION, id), { status });
}

export async function deleteAd(id: string): Promise<void> {
  await deleteDoc(doc(db, ADS_COLLECTION, id));
}

// ── Filtered getters ──────────────────────────────────────────────────────────
export async function getAdsByCategory(category: StoredAd['category']): Promise<StoredAd[]> {
  const allAds = await getAllAds();
  return allAds.filter(ad => ad.category === category && ad.status === 'approved');
}

export async function getAdsByJobSeeker(): Promise<StoredAd[]> {
  return getAdsByCategory('job_seeker');
}

export async function getPendingAds(): Promise<StoredAd[]> {
  const allAds = await getAllAds();
  return allAds.filter(ad => ad.status === 'pending');
}
