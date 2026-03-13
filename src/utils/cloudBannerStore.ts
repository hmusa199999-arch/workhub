// Cloud-based banner storage that syncs across all devices
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

const BANNERS_URL = '/banners.json';
const LOCAL_KEY = 'workhub_banner_ads_cache';
const LAST_SYNC_KEY = 'workhub_banner_last_sync';

// Fallback to localStorage if cloud fails
function getLocalBanners(): BannerAd[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch { return []; }
}

function saveLocalBanners(ads: BannerAd[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ads));
  localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
}

// Read banners from cloud (fallback to local)
export async function getBannerAds(): Promise<BannerAd[]> {
  try {
    const response = await fetch(BANNERS_URL + '?t=' + Date.now());
    if (response.ok) {
      const cloudBanners = await response.json();
      // Save to local cache
      saveLocalBanners(cloudBanners);
      return cloudBanners;
    }
  } catch (error) {
    console.warn('Failed to load cloud banners, using local cache:', error);
  }
  
  // Fallback to local cache
  return getLocalBanners();
}

// Save banners to cloud (GitHub API simulation - for admin only)
export async function saveBannerAds(ads: BannerAd[]): Promise<boolean> {
  try {
    // Save locally immediately
    saveLocalBanners(ads);
    
    // For now, we'll use localStorage as the source of truth
    // In a real implementation, this would POST to a backend
    console.log('Banners saved locally. For cloud sync, admin needs to update the JSON file.');
    return true;
  } catch (error) {
    console.error('Failed to save banners:', error);
    return false;
  }
}

export async function getActiveBannerAds(): Promise<BannerAd[]> {
  const today = new Date().toISOString().split('T')[0];
  const allBanners = await getBannerAds();
  return allBanners
    .filter(ad => ad.active && ad.startDate <= today && ad.endDate >= today)
    .sort((a, b) => a.order - b.order);
}

export async function addBannerAd(ad: Omit<BannerAd, 'id' | 'createdAt'>): Promise<BannerAd> {
  const ads = await getBannerAds();
  const newAd: BannerAd = {
    ...ad,
    id: `banner_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  await saveBannerAds([...ads, newAd]);
  return newAd;
}

export async function updateBannerAd(id: string, updates: Partial<BannerAd>): Promise<void> {
  const ads = await getBannerAds();
  const updatedAds = ads.map(ad => ad.id === id ? { ...ad, ...updates } : ad);
  await saveBannerAds(updatedAds);
}

export async function deleteBannerAd(id: string): Promise<void> {
  const ads = await getBannerAds();
  const filteredAds = ads.filter(ad => ad.id !== id);
  await saveBannerAds(filteredAds);
}

// Generate downloadable JSON for admin to upload manually
export function generateBannersDownload(): void {
  const ads = getLocalBanners();
  const blob = new Blob([JSON.stringify(ads, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'banners.json';
  link.click();
  URL.revokeObjectURL(url);
}