import {
  collection, addDoc, onSnapshot,
  query, where, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

const BIDS_COLLECTION = 'bids';

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;       // bid amount in AED
  message?: string;     // optional chat message
  createdAt: string;
}

// ── Subscribe to all bids for a specific auction (real-time) ─────────────────
export function subscribeToBids(
  auctionId: string,
  callback: (bids: Bid[]) => void
): () => void {
  const q = query(
    collection(db, BIDS_COLLECTION),
    where('auctionId', '==', auctionId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const bids: Bid[] = snapshot.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<Bid, 'id'>),
    }));
    callback(bids);
  }, (err) => {
    console.error('subscribeToBids error:', err);
    // fallback without index
    const qFallback = query(
      collection(db, BIDS_COLLECTION),
      where('auctionId', '==', auctionId)
    );
    onSnapshot(qFallback, (snap) => {
      const bids: Bid[] = snap.docs
        .map(d => ({ id: d.id, ...(d.data() as Omit<Bid, 'id'>) }))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      callback(bids);
    });
  });
}

// ── Place a bid ───────────────────────────────────────────────────────────────
export async function placeBid(bid: Omit<Bid, 'id'>): Promise<void> {
  await addDoc(collection(db, BIDS_COLLECTION), bid);
}
