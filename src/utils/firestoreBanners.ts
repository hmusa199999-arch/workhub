import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export interface BannerAd {
  id: string;
  type: 'image' | 'video' | 'youtube' | 'text';
  mediaData?: string;
  mediaUrl?: string;
  title: string;
  subtitle?: string;
  link?: string;
  bgColor?: string;
  startDate: string;
  endDate: string;
  duration: number;
  active: boolean;
  order: number;
  createdAt: string;
}

const BANNERS_COLLECTION = 'banners';

// ── Real-time listeners ───────────────────────────────────────────────────────

// All banners (for admin dashboard)
export function subscribeToAllBanners(callback: (banners: BannerAd[]) => void): () => void {
  const q = query(collection(db, BANNERS_COLLECTION), orderBy('order', 'asc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const banners: BannerAd[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id, ...docSnap.data() as Omit<BannerAd, 'id'>,
    }));
    callback(banners);
  }, (error) => {
    console.error('Error listening to all banners:', error);
    callback([]);
  });
  return unsubscribe;
}

// Active banners only (for homepage)
export function subscribeToBanners(callback: (banners: BannerAd[]) => void): () => void {
  const q = query(collection(db, BANNERS_COLLECTION), orderBy('order', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const today = new Date().toISOString().split('T')[0];
    const banners: BannerAd[] = snapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() as Omit<BannerAd, 'id'> }))
      .filter(ad => ad.active && ad.startDate <= today && ad.endDate >= today);
    callback(banners);
  }, (error) => {
    console.error('Error listening to banners:', error);
    callback([]);
  });

  return unsubscribe;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
export async function getAllBanners(): Promise<BannerAd[]> {
  try {
    const q = query(collection(db, BANNERS_COLLECTION), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() as Omit<BannerAd, 'id'> }));
  } catch (error) {
    console.error('Error getting banners:', error);
    return [];
  }
}

export async function addBanner(ad: Omit<BannerAd, 'id' | 'createdAt'> | (Omit<BannerAd, 'id'> & { createdAt?: string })): Promise<BannerAd> {
  const bannerData = { ...ad, createdAt: (ad as BannerAd).createdAt || new Date().toISOString() };
  const docRef = await addDoc(collection(db, BANNERS_COLLECTION), bannerData);
  return { id: docRef.id, ...bannerData } as BannerAd;
}

export async function updateBannerInDB(id: string, updates: Partial<BannerAd>): Promise<void> {
  await updateDoc(doc(db, BANNERS_COLLECTION, id), updates);
}

export async function deleteBannerFromDB(id: string): Promise<void> {
  await deleteDoc(doc(db, BANNERS_COLLECTION, id));
}
