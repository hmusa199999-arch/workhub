export interface BannerAd {
  id: string;
  type: 'image' | 'video' | 'youtube' | 'text';
  mediaData?: string;       // base64 (uploaded file)
  mediaUrl?: string;        // external URL (image/video/youtube)
  title: string;
  subtitle?: string;
  link?: string;
  bgColor?: string;         // for text banners
  startDate: string;        // YYYY-MM-DD
  endDate: string;          // YYYY-MM-DD
  duration: number;         // seconds each banner shows
  active: boolean;
  order: number;
  createdAt: string;
}

const KEY = 'workhub_banner_ads';

export function getBannerAds(): BannerAd[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch { return []; }
}

export function saveBannerAds(ads: BannerAd[]) {
  localStorage.setItem(KEY, JSON.stringify(ads));
}

export function getActiveBannerAds(): BannerAd[] {
  const today = new Date().toISOString().split('T')[0];
  return getBannerAds()
    .filter(ad => ad.active && ad.startDate <= today && ad.endDate >= today)
    .sort((a, b) => a.order - b.order);
}

export function addBannerAd(ad: Omit<BannerAd, 'id' | 'createdAt'>): BannerAd {
  const ads = getBannerAds();
  const newAd: BannerAd = {
    ...ad,
    id: `banner_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveBannerAds([...ads, newAd]);
  return newAd;
}

export function updateBannerAd(id: string, updates: Partial<BannerAd>) {
  saveBannerAds(getBannerAds().map(ad => ad.id === id ? { ...ad, ...updates } : ad));
}

export function deleteBannerAd(id: string) {
  saveBannerAds(getBannerAds().filter(ad => ad.id !== id));
}
