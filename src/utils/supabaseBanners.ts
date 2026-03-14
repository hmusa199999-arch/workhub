import { supabase } from './supabase';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): BannerAd {
  return { id: row.id, ...row.data } as BannerAd;
}

// ── All banners real-time (admin) ──────────────────────────────────────────
export function subscribeToAllBanners(callback: (banners: BannerAd[]) => void): () => void {
  const fetch = async () => {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) callback(data.map(fromRow));
  };

  fetch();

  const channel = supabase
    .channel('banners-all')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, fetch)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Active banners only (homepage) ─────────────────────────────────────────
export function subscribeToBanners(callback: (banners: BannerAd[]) => void): () => void {
  const fetch = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (data) {
      const active = data.map(fromRow).filter(b =>
        b.startDate <= today && b.endDate >= today
      );
      callback(active);
    }
  };

  fetch();

  const channel = supabase
    .channel('banners-active')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, fetch)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Get all banners ────────────────────────────────────────────────────────
export async function getAllBanners(): Promise<BannerAd[]> {
  const { data } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true });
  return (data || []).map(fromRow);
}

// ── Add banner ─────────────────────────────────────────────────────────────
export async function addBanner(
  ad: Omit<BannerAd, 'id' | 'createdAt'> | (Omit<BannerAd, 'id'> & { createdAt?: string })
): Promise<BannerAd> {
  const bannerData = { ...ad, createdAt: (ad as BannerAd).createdAt || new Date().toISOString() };
  const { data, error } = await supabase
    .from('banners')
    .insert({
      active: bannerData.active ?? true,
      sort_order: bannerData.order ?? 0,
      data: bannerData,
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id, ...bannerData } as BannerAd;
}

// ── Update banner ──────────────────────────────────────────────────────────
export async function updateBannerInDB(id: string, updates: Partial<BannerAd>): Promise<void> {
  const { data: existing } = await supabase.from('banners').select('data').eq('id', id).single();
  const merged = { ...(existing?.data || {}), ...updates };
  await supabase.from('banners').update({
    active: merged.active ?? true,
    sort_order: merged.order ?? 0,
    data: merged,
  }).eq('id', id);
}

// ── Delete banner ──────────────────────────────────────────────────────────
export async function deleteBannerFromDB(id: string): Promise<void> {
  await supabase.from('banners').delete().eq('id', id);
}
