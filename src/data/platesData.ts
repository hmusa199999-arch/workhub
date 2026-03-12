export type EmirateId =
  | 'dubai'
  | 'abu-dhabi'
  | 'sharjah'
  | 'ajman'
  | 'umm-al-quwain'
  | 'ras-al-khaimah'
  | 'fujairah';

export interface Emirate {
  id: EmirateId;
  nameAr: string;
  nameEn: string;
  abbr: string;
  color: string;
  bg: string;
  borderColor: string;
  flag: string;
}

export interface PlateAd {
  id: string;
  emirate: EmirateId;
  plateNumber: string;
  plateCode?: string;
  price: number;
  priceHidden?: boolean;
  isSold?: boolean;
  isVerified?: boolean;
  category: 'مميز' | 'خماسي' | 'رباعي' | 'ثلاثي' | 'ثنائي' | 'أحادي';
  digits: number;
  description?: string;
  postedAt: string;
  sellerPhone: string;
  sellerName: string;
  featured: boolean;
  views: number;
}

export const emirates: Emirate[] = [
  { id: 'dubai',          nameAr: 'دبي',        nameEn: 'Dubai',        abbr: 'DXB', color: 'text-red-500',   bg: 'bg-red-50',    borderColor: 'border-red-200',   flag: '🏙️' },
  { id: 'abu-dhabi',      nameAr: 'أبوظبي',     nameEn: 'Abu Dhabi',    abbr: 'AUH', color: 'text-green-600', bg: 'bg-green-50',  borderColor: 'border-green-200', flag: '🕌' },
  { id: 'sharjah',        nameAr: 'الشارقة',    nameEn: 'Sharjah',      abbr: 'SHJ', color: 'text-rose-500',  bg: 'bg-rose-50',   borderColor: 'border-rose-200',  flag: '🌊' },
  { id: 'ajman',          nameAr: 'عجمان',      nameEn: 'Ajman',        abbr: 'AJM', color: 'text-purple-600',bg: 'bg-purple-50', borderColor: 'border-purple-200',flag: '⚓' },
  { id: 'umm-al-quwain',  nameAr: 'أم القيوين', nameEn: 'Umm Al Quwain',abbr: 'UAQ', color: 'text-teal-600',  bg: 'bg-teal-50',   borderColor: 'border-teal-200',  flag: '🌿' },
  { id: 'ras-al-khaimah', nameAr: 'رأس الخيمة', nameEn: 'Ras Al Khaimah',abbr: 'RAK',color: 'text-orange-600',bg: 'bg-orange-50',borderColor: 'border-orange-200',flag: '⛰️' },
  { id: 'fujairah',       nameAr: 'الفجيرة',   nameEn: 'Fujairah',     abbr: 'FUJ', color: 'text-red-400',   bg: 'bg-red-50',    borderColor: 'border-red-200',   flag: '🌺' },
];

// لا توجد أرقام افتراضية – الصفحة تستخدم فقط إعلانات المستخدمين المخزّنة في localStorage
export const plateAds: PlateAd[] = [];

