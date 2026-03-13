// Fully automated cloud banner system using GitHub API
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

const GITHUB_REPO = 'hmusa199999-arch/workhub';
const FILE_PATH = 'public/banners.json';
const BRANCH = 'main';

// GitHub Personal Access Token (read-only for fetching, write for admin)
const GITHUB_TOKEN = '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';

const CACHE_KEY = 'banners_cache';
const CACHE_TIME_KEY = 'banners_cache_time';
const CACHE_DURATION = 30000; // 30 seconds

// Get banners from GitHub (with caching)
export async function getBannerAds(): Promise<BannerAd[]> {
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
    
    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < CACHE_DURATION) {
        return JSON.parse(cached);
      }
    }

    // Fetch from GitHub
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${BRANCH}&t=${Date.now()}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'work1m-banner-system'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const content = atob(data.content.replace(/\s/g, ''));
      const banners = JSON.parse(content);
      
      // Cache the result
      localStorage.setItem(CACHE_KEY, JSON.stringify(banners));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      
      return banners;
    } else {
      console.warn('Failed to fetch banners from GitHub, using cache or empty array');
      return cached ? JSON.parse(cached) : [];
    }
  } catch (error) {
    console.error('Error fetching banners:', error);
    // Return cached data if available
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}

// Save banners to GitHub (admin only)
export async function saveBannerAds(ads: BannerAd[]): Promise<boolean> {
  try {
    // Get current file info
    const fileResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'work1m-banner-system'
        }
      }
    );

    let sha = '';
    if (fileResponse.ok) {
      const fileData = await fileResponse.json();
      sha = fileData.sha;
    }

    // Prepare content
    const content = btoa(JSON.stringify(ads, null, 2));
    
    // Update file
    const updateResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'work1m-banner-system'
        },
        body: JSON.stringify({
          message: `Update banners - ${ads.length} ads`,
          content: content,
          sha: sha || undefined,
          branch: BRANCH
        })
      }
    );

    if (updateResponse.ok) {
      // Clear cache to force refresh
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);
      
      console.log('✅ Banners saved to GitHub successfully!');
      return true;
    } else {
      const error = await updateResponse.text();
      console.error('Failed to save banners to GitHub:', error);
      return false;
    }
  } catch (error) {
    console.error('Error saving banners to GitHub:', error);
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
  
  const success = await saveBannerAds([...ads, newAd]);
  if (!success) {
    throw new Error('Failed to save banner');
  }
  
  return newAd;
}

export async function updateBannerAd(id: string, updates: Partial<BannerAd>): Promise<void> {
  const ads = await getBannerAds();
  const updatedAds = ads.map(ad => ad.id === id ? { ...ad, ...updates } : ad);
  const success = await saveBannerAds(updatedAds);
  if (!success) {
    throw new Error('Failed to update banner');
  }
}

export async function deleteBannerAd(id: string): Promise<void> {
  const ads = await getBannerAds();
  const filteredAds = ads.filter(ad => ad.id !== id);
  const success = await saveBannerAds(filteredAds);
  if (!success) {
    throw new Error('Failed to delete banner');
  }
}

// Clear cache manually (for testing)
export function clearBannersCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
}