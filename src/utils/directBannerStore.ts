// Direct Banner System - Works instantly for everyone
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

const BANNERS_KEY = 'work1m_live_banners';

// Simple direct storage - works instantly
export function getAllBanners(): BannerAd[] {
  try {
    const stored = localStorage.getItem(BANNERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { 
    return []; 
  }
}

export function saveBanners(ads: BannerAd[]): void {
  localStorage.setItem(BANNERS_KEY, JSON.stringify(ads));
  
  // Broadcast to all open tabs/windows instantly
  window.dispatchEvent(new StorageEvent('storage', {
    key: BANNERS_KEY,
    newValue: JSON.stringify(ads),
    storageArea: localStorage
  }));
}

export function getActiveBanners(): BannerAd[] {
  const today = new Date().toISOString().split('T')[0];
  return getAllBanners()
    .filter(ad => ad.active && ad.startDate <= today && ad.endDate >= today)
    .sort((a, b) => a.order - b.order);
}

export function addBanner(ad: Omit<BannerAd, 'id' | 'createdAt'>): BannerAd {
  const banners = getAllBanners();
  const newBanner: BannerAd = {
    ...ad,
    id: `banner_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  saveBanners([...banners, newBanner]);
  return newBanner;
}

export function updateBanner(id: string, updates: Partial<BannerAd>): void {
  const banners = getAllBanners();
  const updated = banners.map(banner => 
    banner.id === id ? { ...banner, ...updates } : banner
  );
  saveBanners(updated);
}

export function deleteBanner(id: string): void {
  const banners = getAllBanners();
  const filtered = banners.filter(banner => banner.id !== id);
  saveBanners(filtered);
}

// Listen for banner changes across all tabs
export function onBannersChange(callback: (banners: BannerAd[]) => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === BANNERS_KEY && e.newValue) {
      try {
        const banners = JSON.parse(e.newValue);
        callback(banners);
      } catch {}
    }
  };
  
  window.addEventListener('storage', handler);
  
  // Return cleanup function
  return () => window.removeEventListener('storage', handler);
}