import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

// Same category names as adsStore.ts - MUST match exactly
export type AdCategory = 'car' | 'realestate' | 'service' | 'plate' | 'job_seeker' | 'auction';

export interface FirestoreAd {
  id: string;
  category: AdCategory;
  intent?: 'offer' | 'request';
  status: 'pending' | 'approved' | 'rejected';
  phone: string;
  createdAt: string;
  title?: string;
  name?: string;
  desc?: string;
  price?: number;
  location?: string;
  images?: string[];
  // Cars
  carTitle?: string; carBrand?: string; carModel?: string; carYear?: string;
  carMileage?: string; carColor?: string; carFuel?: string; carTransmission?: string;
  // Real estate
  reTitle?: string; propType?: string; propArea?: string; propRooms?: string;
  propBath?: string; propFloor?: string;
  // Services
  svcTitle?: string; serviceType?: string;
  // Car plates
  plateNumber?: string; plateEmirate?: string; plateCode?: string;
  // Job seeker
  jsTitle?: string; jsSector?: string; jsExp?: string; jsType?: string;
  jsNationality?: string; jsCv?: string;
  // Auction
  auctionSubCat?: string; auctionStartPrice?: number; auctionCondition?: string; auctionEndDate?: string;
  // Extra
  [key: string]: unknown;
}

const ADS_COLLECTION = 'ads';

// ── Real-time: all ads (admin) ────────────────────────────────────────────────
export function subscribeToAds(callback: (ads: FirestoreAd[]) => void): () => void {
  const q = query(collection(db, ADS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ads: FirestoreAd[] = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as any) }));
    callback(ads);
  }, (error) => { console.error('subscribeToAds error:', error); });
}

// ── Real-time: by category (for listing pages) ────────────────────────────────
export function subscribeToAdsByCategory(
  category: AdCategory,
  callback: (ads: FirestoreAd[]) => void
): () => void {
  const q = query(
    collection(db, ADS_COLLECTION),
    where('category', '==', category),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ads: FirestoreAd[] = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as any) }));
    callback(ads);
  }, (error) => {
    console.error('subscribeToAdsByCategory error:', error);
    // Fallback: get all and filter
    const qFallback = query(collection(db, ADS_COLLECTION), orderBy('createdAt', 'desc'));
    onSnapshot(qFallback, (snap) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ads = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
        .filter((a: FirestoreAd) => a.category === category && a.status === 'approved');
      callback(ads);
    });
  });
}

// ── Save ad to Firebase ───────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveAd(ad: Record<string, any>): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...adWithoutId } = ad;
  const adData = {
    ...adWithoutId,
    // Respect the status passed in — auctions use 'pending', others use 'approved'
    status: adWithoutId.status || 'approved',
    createdAt: adWithoutId.createdAt || new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, ADS_COLLECTION), adData);
  return docRef.id;
}

// ── Update / Delete ───────────────────────────────────────────────────────────
export async function updateAdStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  await updateDoc(doc(db, ADS_COLLECTION, id), { status });
}

export async function deleteAd(id: string): Promise<void> {
  await deleteDoc(doc(db, ADS_COLLECTION, id));
}
