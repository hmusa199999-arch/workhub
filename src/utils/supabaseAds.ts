import { supabase } from './supabase';

export type AdCategory = 'car' | 'realestate' | 'service' | 'plate' | 'job_seeker';

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
  carTitle?: string; carBrand?: string; carModel?: string; carYear?: string;
  carMileage?: string; carColor?: string; carFuel?: string; carTransmission?: string;
  reTitle?: string; propType?: string; propArea?: string; propRooms?: string;
  propBath?: string; propFloor?: string;
  svcTitle?: string; serviceType?: string;
  plateNumber?: string; plateEmirate?: string; plateCode?: string; plateNum?: string; plateCat?: string;
  jsTitle?: string; jsSector?: string; jsExp?: string; jsType?: string;
  jsNationality?: string; jsCv?: string;
  [key: string]: unknown;
}

// ── Map DB row → FirestoreAd ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): FirestoreAd {
  return {
    id: row.id,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
    ...row.data,
  } as FirestoreAd;
}

// ── Subscribe to ALL ads (admin) ───────────────────────────────────────────
export function subscribeToAds(callback: (ads: FirestoreAd[]) => void): () => void {
  // Initial fetch
  supabase
    .from('ads')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data }) => {
      if (data) callback(data.map(fromRow));
    });

  // Real-time
  const channel = supabase
    .channel('ads-all')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, async () => {
      const { data } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) callback(data.map(fromRow));
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Subscribe by category (approved only) ────────────────────────────────
export function subscribeToAdsByCategory(
  category: AdCategory,
  callback: (ads: FirestoreAd[]) => void
): () => void {
  const fetch = async () => {
    const { data } = await supabase
      .from('ads')
      .select('*')
      .eq('category', category)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (data) callback(data.map(fromRow));
  };

  fetch();

  const channel = supabase
    .channel(`ads-${category}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, fetch)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Save ad ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveAd(ad: Record<string, any>): Promise<string> {
  const { id: _id, category, status, createdAt, created_at, ...rest } = ad;
  const { data, error } = await supabase
    .from('ads')
    .insert({
      category: category || 'car',
      status: status || 'approved',
      created_at: createdAt || created_at || new Date().toISOString(),
      data: { category, status, createdAt: createdAt || new Date().toISOString(), ...rest },
    })
    .select('id')
    .single();

  if (error) throw error;
  return data?.id ?? '';
}

// ── Update status ──────────────────────────────────────────────────────────
export async function updateAdStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  await supabase.from('ads').update({ status }).eq('id', id);
}

// ── Delete ─────────────────────────────────────────────────────────────────
export async function deleteAd(id: string): Promise<void> {
  await supabase.from('ads').delete().eq('id', id);
}

// ── Aliases for backward compatibility ────────────────────────────────────
export const saveAdCloud   = saveAd;
export const updateAdCloud = updateAdStatus;
export const deleteAdCloud = deleteAd;
