const KEY = 'workhub_ads';

export type AdStatus = 'pending' | 'approved' | 'rejected';

export interface StoredAd {
  id: string;
  category: 'car' | 'realestate' | 'service' | 'plate' | 'job_seeker';
  // offer = إعلان عرض، request = طلب شخصي
  intent?: 'offer' | 'request';
  status: AdStatus;
  createdAt: string;
  // contact
  name: string;
  phone: string;
  price: number;
  priceHidden?: boolean;
  desc?: string;
  images: string[];
  // car
  carTitle?: string;
  carYear?: string;
  carKm?: string;
  carFuel?: string;
  carTrans?: string;
  carColor?: string;
  // realestate
  reTitle?: string;
  reType?: string;
  rePurpose?: string;
  reBeds?: string;
  reBaths?: string;
  reArea?: string;
  // service
  svcTitle?: string;
  svcCat?: string;
  svcPer?: string;
  // plate
  plateEmirate?: string;
  plateNum?: string;
  plateCode?: string;
  plateCat?: string;
  // job seeker
  jsTitle?: string;       // المسمى الوظيفي المطلوب
  jsSector?: string;      // القطاع
  jsExp?: string;         // سنوات الخبرة
  jsType?: string;        // نوع الدوام
  jsNationality?: string; // الجنسية
  jsCv?: string;          // base64 صورة السيرة الذاتية
  // shared
  location?: string;
}

export function saveAd(ad: Omit<StoredAd, 'status'>): void {
  const existing = getAllAds();
  const full: StoredAd = { intent: 'offer', ...ad, status: 'approved' };
  existing.unshift(full);
  try {
    localStorage.setItem(KEY, JSON.stringify(existing));
  } catch { /* storage full */ }
}

export function getAllAds(): StoredAd[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as any[];

    // تطبيع البيانات القديمة: أي إعلان بدون status نعتبره معتمد
    return parsed.map((item) => {
      const withStatus: StoredAd = {
        // default intent for الإعلانات القديمة
        intent: item.intent === 'request' ? 'request' : 'offer',
        status: (item.status === 'pending' || item.status === 'rejected' || item.status === 'approved')
          ? item.status
          : 'approved',
        ...item,
      };
      return withStatus;
    });
  } catch {
    return [];
  }
}

export function getAdsByCategory(category: StoredAd['category']): StoredAd[] {
  return getAllAds().filter(a => a.category === category && a.status === 'approved');
}

export function getPendingAds(): StoredAd[] {
  return getAllAds().filter(a => a.status === 'pending');
}

export function getAllAdsAdmin(): StoredAd[] {
  return getAllAds();
}

export function updateAdStatus(id: string, status: AdStatus): void {
  const ads = getAllAds().map(a => a.id === id ? { ...a, status } : a);
  localStorage.setItem(KEY, JSON.stringify(ads));
}

export function deleteAd(id: string): void {
  const ads = getAllAds().filter(a => a.id !== id);
  localStorage.setItem(KEY, JSON.stringify(ads));
}

export function getAdsByJobSeeker(): StoredAd[] {
  return getAllAds().filter(a => a.category === 'job_seeker' && a.status === 'approved');
}

export function getAdLabel(ad: StoredAd): string {
  if (ad.category === 'car') return ad.carTitle || 'سيارة للبيع';
  if (ad.category === 'realestate') return ad.reTitle || 'عقار';
  if (ad.category === 'service') return ad.svcTitle || 'خدمة';
  if (ad.category === 'plate') return `رقم ${ad.plateNum || ''}${ad.plateCode ? ` / ${ad.plateCode}` : ''}`;
  if (ad.category === 'job_seeker') return ad.jsTitle || 'باحث عن عمل';
  return 'إعلان';
}

export function getCategoryLabel(cat: StoredAd['category']): string {
  const map: Record<StoredAd['category'], string> = {
    car: '🚗 سيارة',
    realestate: '🏡 عقار',
    service: '🛠️ خدمة',
    plate: '🚘 رقم سيارة',
    job_seeker: '👤 باحث عمل',
  };
  return map[cat];
}
