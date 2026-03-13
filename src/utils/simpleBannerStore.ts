// Simple banner system - reads from cloud, saves locally for admin
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

const CLOUD_BANNERS_URL = '/api/banners';
const LOCAL_KEY = 'work1m_admin_banners';
const CACHE_KEY = 'work1m_banners_cache';
const CACHE_TIME_KEY = 'work1m_banners_cache_time';
const CACHE_DURATION = 10000; // 10 seconds cache

// Read banners (cloud first, then admin local, then cache)
export async function getBannerAds(): Promise<BannerAd[]> {
  try {
    // Try to get from cloud first
    const cloudBanners = await getCloudBanners();
    if (cloudBanners.length > 0) {
      // Cache cloud banners
      localStorage.setItem(CACHE_KEY, JSON.stringify(cloudBanners));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      return cloudBanners;
    }
  } catch (error) {
    console.warn('Cloud banners not available, trying admin local');
  }

  // Fallback to admin local banners
  try {
    const adminBanners = getAdminLocalBanners();
    if (adminBanners.length > 0) {
      return adminBanners;
    }
  } catch (error) {
    console.warn('Admin local banners not available, using cache');
  }

  // Final fallback to cache
  return getCachedBanners();
}

async function getCloudBanners(): Promise<BannerAd[]> {
  const response = await fetch(CLOUD_BANNERS_URL + '?t=' + Date.now());
  if (response.ok) {
    const banners = await response.json();
    return Array.isArray(banners) ? banners : [];
  }
  throw new Error('Cloud banners not available');
}

function getAdminLocalBanners(): BannerAd[] {
  try {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function getCachedBanners(): BannerAd[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
    
    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < CACHE_DURATION) {
        return JSON.parse(cached);
      }
    }
  } catch {}
  return [];
}

// Admin functions - save locally and provide export
export function saveAdminBanners(ads: BannerAd[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ads));
  // Also update cache so it shows immediately
  localStorage.setItem(CACHE_KEY, JSON.stringify(ads));
  localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
}

export async function getActiveBannerAds(): Promise<BannerAd[]> {
  const today = new Date().toISOString().split('T')[0];
  const allBanners = await getBannerAds();
  return allBanners
    .filter(ad => ad.active && ad.startDate <= today && ad.endDate >= today)
    .sort((a, b) => a.order - b.order);
}

export function addBannerAd(ad: Omit<BannerAd, 'id' | 'createdAt'>): BannerAd {
  const adminBanners = getAdminLocalBanners();
  const newAd: BannerAd = {
    ...ad,
    id: `banner_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  saveAdminBanners([...adminBanners, newAd]);
  return newAd;
}

export function updateBannerAd(id: string, updates: Partial<BannerAd>): void {
  const adminBanners = getAdminLocalBanners();
  const updatedBanners = adminBanners.map(ad => 
    ad.id === id ? { ...ad, ...updates } : ad
  );
  saveAdminBanners(updatedBanners);
}

export function deleteBannerAd(id: string): void {
  const adminBanners = getAdminLocalBanners();
  const filteredBanners = adminBanners.filter(ad => ad.id !== id);
  saveAdminBanners(filteredBanners);
}

// Export banners for manual upload
export function exportBannersForUpload(): void {
  const adminBanners = getAdminLocalBanners();
  const blob = new Blob([JSON.stringify(adminBanners, null, 2)], { 
    type: 'application/json' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'banners.json';
  link.click();
  URL.revokeObjectURL(url);
}

// Auto-upload via API
export async function autoUploadBanners(): Promise<boolean> {
  try {
    const adminBanners = getAdminLocalBanners();
    
    // Use Vercel API endpoint
    const response = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminBanners)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Banners uploaded automatically:', result.message);
      
      // Clear cache to force refresh
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);
      
      return true;
    } else {
      const error = await response.text();
      console.warn('Auto-upload failed:', error);
    }
  } catch (error) {
    console.warn('Auto-upload failed, manual upload required:', error);
  }
  
  return false;
}