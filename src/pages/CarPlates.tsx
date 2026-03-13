import { useState, useEffect } from 'react';
import { Phone, Search, Filter, Plus, ChevronLeft, Eye, CheckCircle, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { emirates, plateAds, type EmirateId, type PlateAd } from '../data/platesData';
import PostAdModal from '../components/PostAdModal';
import { useAuth } from '../context/AuthContext';

const categories = ['الكل', 'أحادي', 'ثنائي', 'ثلاثي', 'رباعي', 'خماسي'];

// price filter will be free text (min / max), no fixed ranges

const emirateNameOnPlate: Record<EmirateId, { en: string; ar: string }> = {
  'dubai':           { en: 'DUBAI',        ar: 'دبي'      },
  'abu-dhabi':       { en: 'ABU DHABI',    ar: 'أبوظبي'   },
  'sharjah':         { en: 'SHARJAH',      ar: 'الشارقة'  },
  'ajman':           { en: 'AJMAN',        ar: 'عجمان'    },
  'umm-al-quwain':   { en: 'UAQ',          ar: 'أم القيوين'},
  'ras-al-khaimah':  { en: 'RAK',          ar: 'رأس الخيمة'},
  'fujairah':        { en: 'FUJAIRAH',     ar: 'الفجيرة'  },
};

function formatViews(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function maskPhone(phone: string) {
  return phone;
}

/** Real UAE-style plate visual */
function PlateVisual({
  emirate,
  plateCode,
  plateNumber,
  isSold = false,
  size = 'md',
}: {
  emirate: EmirateId;
  plateCode?: string;
  plateNumber: string;
  isSold?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const nameData = emirateNameOnPlate[emirate];
  const isDubai = emirate === 'dubai';
  const isAbuDhabi = emirate === 'abu-dhabi';

  const sizeMap = {
    sm: { plate: 'text-xl', code: 'text-sm', em: 'text-[7px]', strip: 'h-1.5' },
    md: { plate: 'text-3xl', code: 'text-base', em: 'text-[8px]', strip: 'h-2' },
    lg: { plate: 'text-4xl', code: 'text-xl', em: 'text-[10px]', strip: 'h-2.5' },
  };
  const s = sizeMap[size];

  // Emirate accent color for left section
  const accentColor = isDubai
    ? 'bg-amber-400'
    : isAbuDhabi
    ? 'bg-green-600'
    : emirate === 'sharjah'
    ? 'bg-red-500'
    : emirate === 'ajman'
    ? 'bg-rose-500'
    : 'bg-gray-400';

  return (
    <div className="relative mx-auto" style={{ maxWidth: 280 }}>
      {isSold && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rotate-[-20deg]">
          <span className="bg-red-600 text-white font-black text-lg px-4 py-1 rounded border-2 border-red-800 shadow-lg tracking-widest opacity-90">
            SOLD
          </span>
        </div>
      )}
      {/* Main plate */}
      <div className="border-[3px] border-gray-700 rounded-md overflow-hidden shadow-md">
        {/* Top color bar - UAE flag colors */}
        <div className={`${s.strip} flex`}>
          <div className="w-1/5 bg-black" />
          <div className="w-1/5 bg-red-600" />
          <div className="flex-1 bg-gray-900" />
          <div className="w-1/5 bg-green-600" />
        </div>

        {/* Plate body */}
        <div className="bg-gray-900 flex items-stretch">
          {/* Left: emirate section */}
          <div className={`${accentColor} flex flex-col items-center justify-center px-2 py-2 shrink-0 min-w-[52px]`}>
            <span className={`${s.em} font-black text-white text-center leading-tight uppercase tracking-tight`}>
              {nameData.en}
            </span>
            {plateCode && (
              <span className={`${s.code} font-black text-white mt-0.5 leading-none`}>
                {plateCode}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="w-px bg-gray-300" />

          {/* Right: number */}
          <div className="flex-1 flex items-center justify-center px-2 py-2 overflow-hidden">
            <span className={`${s.plate} font-black tracking-wide text-gray-100 font-mono truncate max-w-full`}
              style={{ letterSpacing: plateNumber.length > 5 ? '0.05em' : '0.1em' }}>
              {plateNumber}
            </span>
          </div>

          {/* Far right: UAE */}
          <div className="flex flex-col items-center justify-center pr-2 pl-1 shrink-0">
            <span className={`${s.em} font-bold text-gray-500 leading-tight`}>UAE</span>
            <span className={`${s.em} font-bold text-gray-500 leading-tight`}>الإمارات</span>
          </div>
        </div>

        {/* Bottom color bar */}
        <div className={`${s.strip} flex`}>
          <div className="w-1/5 bg-black" />
          <div className="w-1/5 bg-red-600" />
          <div className="flex-1 bg-gray-900" />
          <div className="w-1/5 bg-green-600" />
        </div>
      </div>
    </div>
  );
}

/** xPlate-style card — mock data uses PlateVisual */
function PlateCard({ plate }: { plate: PlateAd }) {
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-700">
      {plate.featured && (
        <div className="bg-amber-500 flex items-center justify-center gap-2 py-1.5">
          <span className="text-white font-black text-xs tracking-wider uppercase">⭐ Featured</span>
        </div>
      )}

      {/* Plate visual (generated) */}
      <div className="bg-gray-50 px-4 py-5 flex items-center justify-center">
        <PlateVisual
          emirate={plate.emirate}
          plateCode={plate.plateCode}
          plateNumber={plate.plateNumber}
          isSold={plate.isSold}
          size="md"
        />
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 mb-0.5">
          {plate.priceHidden ? (
            <span className="text-red-500 font-black text-lg">السعر محجوب</span>
          ) : (
            <span className="text-red-500 font-black text-lg">
              AED {plate.price >= 1000000
                ? `${(plate.price / 1000000).toFixed(1)}M`
                : plate.price.toLocaleString()}
            </span>
          )}
          {plate.isVerified && (
            <CheckCircle className="w-4 h-4 text-green-500 fill-green-100 shrink-0" />
          )}
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">{plate.featured ? 'مميز' : plate.category}</span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Eye className="w-3.5 h-3.5" />{formatViews(plate.views)}
          </span>
        </div>
        <a href={`https://wa.me/${plate.sellerPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
          className="w-full mb-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-700 text-gray-700 text-sm font-semibold hover:bg-gray-800 transition-colors">
          <MessageCircle className="w-4 h-4 text-gray-500" /> Negotiation
        </a>
        <a href={`tel:${plate.sellerPhone}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-semibold hover:bg-gray-800 transition-colors">
          <Phone className="w-4 h-4 text-gray-500" /> <span dir="ltr">{maskPhone(plate.sellerPhone)}</span>
        </a>
      </div>
    </div>
  );
}

/** User-posted plate card — shows the uploaded photo only */
function UserPlateCard({ ad }: { ad: import('../utils/adsStore').StoredAd }) {
  const hasImage = ad.images && ad.images.length > 0;
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-700">
      {/* Image or placeholder */}
      {hasImage ? (
        <div className="relative">
          <img
            src={ad.images[0]}
            alt="صورة الرقم"
            className="w-full h-44 object-contain bg-gray-50"
          />
          {ad.images.length > 1 && (
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md">
              +{ad.images.length - 1} صور
            </span>
          )}
        </div>
      ) : (
        <div className="w-full h-44 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
          <span className="text-4xl mb-1">🚘</span>
          <span className="text-xs">لا توجد صورة</span>
        </div>
      )}

      <div className="px-4 pb-4 pt-3">
        {/* Plate number - big & bold like a real plate */}
        {ad.plateNum && (
          <div className="mb-3 bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-red-700/40 rounded-xl py-3 px-2 text-center overflow-hidden">
            {ad.plateCode && (
              <p className="text-red-400 text-xs font-bold tracking-widest mb-1">{ad.plateCode}</p>
            )}
            <p className="text-white font-black text-3xl sm:text-4xl leading-none truncate w-full text-center" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              {ad.plateNum}
            </p>
            {ad.plateEmirate && (
              <p className="text-gray-400 text-xs mt-1.5">📍 {ad.plateEmirate}</p>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-3">
          {ad.price > 0 ? (
            <span className="text-red-500 font-black text-lg">
              AED {ad.price >= 1000000
                ? `${(ad.price / 1000000).toFixed(1)}M`
                : ad.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-red-500 font-black text-base">السعر قابل للتفاوض</span>
          )}
        </div>

        {/* Buttons */}
        <a href={`https://wa.me/${ad.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
          className="w-full mb-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-700 text-gray-700 text-sm font-semibold hover:bg-gray-800 transition-colors">
          <MessageCircle className="w-4 h-4 text-gray-500" /> Negotiation
        </a>
        <a href={`tel:${ad.phone}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm font-semibold hover:bg-gray-800 transition-colors">
          <Phone className="w-4 h-4 text-gray-500" /> <span dir="ltr">{maskPhone(ad.phone)}</span>
        </a>
      </div>
    </div>
  );
}

export default function CarPlates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedEmirate, setSelectedEmirate] = useState<EmirateId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userAds, setUserAds] = useState<import('../utils/adsStore').StoredAd[]>([]);

  useEffect(() => {
    import('../utils/adsStore').then(m => setUserAds(m.getAdsByCategory('plate')));
    import('../utils/firestoreAds').then(({ subscribeToAdsByCategory }) => {
      const unsub = subscribeToAdsByCategory('plate', (cloudAds) => {
        setUserAds(cloudAds as import('../utils/adsStore').StoredAd[]);
      });
      return unsub;
    });
  }, []);

  const filtered = plateAds.filter(p => {
    const matchEmirate = selectedEmirate === 'all' || p.emirate === selectedEmirate;
    const matchCat = selectedCategory === 'الكل' || p.category === selectedCategory;
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    const matchPrice =
      (min == null || Number.isNaN(min) || p.price >= min) &&
      (max == null || Number.isNaN(max) || p.price <= max);
    const matchSearch = !search || p.plateNumber.includes(search) || (p.plateCode || '').toUpperCase().includes(search.toUpperCase());
    return matchEmirate && matchCat && matchPrice && matchSearch;
  });

  const featuredPlates = filtered.filter(p => p.featured);
  const regularPlates = filtered.filter(p => !p.featured);
  const totalByEmirate = (id: EmirateId) => plateAds.filter(p => p.emirate === id).length;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-950 via-red-950/60 to-gray-950 text-white py-12 px-4 border-b border-red-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/" className="text-red-300 hover:text-white text-sm transition-colors">الرئيسية</Link>
            <ChevronLeft className="w-4 h-4 text-gray-500" />
            <span className="text-white text-sm">أرقام السيارات</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-4xl">🚘</div>
                <h1 className="text-3xl font-black">أرقام السيارات</h1>
              </div>
              <p className="text-red-300/70 text-sm">أرقام مركبات مميزة للبيع من جميع إمارات الدولة</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 bg-gray-900/10 rounded-full text-xs">{plateAds.length} إعلان</span>
                <span className="px-3 py-1 bg-gray-900/10 rounded-full text-xs">7 إمارات</span>
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold">مجاني للنشر</span>
              </div>
            </div>
            <button onClick={() => user ? setShowModal(true) : navigate('/login')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-red-700 to-red-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-red-500 transition-all shrink-0 shadow-lg shadow-red-900/40">
              <Plus className="w-5 h-5" />
              {user ? 'أضف رقمك — مجاناً' : 'سجّل دخول لإضافة إعلان'}
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-gray-900 border-b border-red-900/20 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن رقم..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-500 text-sm"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${showFilters ? 'bg-red-600 text-white border-red-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}`}>
            <Filter className="w-4 h-4" />
            فلترة
          </button>
        </div>

        {showFilters && (
          <div className="border-t border-gray-800 px-4 py-4 bg-gray-900/80">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">تصنيف الرقم</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${selectedCategory === cat ? 'bg-red-600 text-white' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">نطاق السعر</label>
                <div className="flex items-end gap-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-500 mb-1">من (AED)</span>
                    <input
                      type="number"
                      min={0}
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="w-28 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-500 mb-1">إلى (AED)</span>
                    <input
                      type="number"
                      min={0}
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      placeholder="كل الأسعار"
                      className="w-28 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 bg-gray-950 min-h-screen">
        {/* Emirates tabs */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-400 mb-3">اختر الإمارة</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => setSelectedEmirate('all')}
              className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border-2 shrink-0 transition-all ${selectedEmirate === 'all' ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-900/30' : 'border-gray-700 bg-gray-900 hover:border-red-500/50 text-gray-300'}`}>
              <span className="text-xl">🇦🇪</span>
              <span className="text-xs font-bold whitespace-nowrap">كل الإمارات</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${selectedEmirate === 'all' ? 'bg-gray-900/20 text-white' : 'bg-gray-800 text-gray-500'}`}>{plateAds.length}</span>
            </button>
            {emirates.map(em => (
              <button key={em.id} onClick={() => setSelectedEmirate(em.id)}
                className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border-2 shrink-0 transition-all ${selectedEmirate === em.id ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-900/30' : 'border-gray-700 bg-gray-900 hover:border-red-500/50 text-gray-300'}`}>
                <span className="text-xl">{em.flag}</span>
                <span className="text-xs font-bold whitespace-nowrap">{em.nameAr}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${selectedEmirate === em.id ? 'bg-gray-900/20 text-white' : 'bg-gray-800 text-gray-500'}`}>{totalByEmirate(em.id)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{filtered.length > 0 ? `${filtered.length} رقم متاح` : 'لا توجد نتائج'}</p>
          {(selectedEmirate !== 'all' || selectedCategory !== 'الكل' || search) && (
            <button onClick={() => { setSelectedEmirate('all'); setSelectedCategory('الكل'); setMinPrice(''); setMaxPrice(''); setSearch(''); }}
              className="text-xs text-red-500 hover:underline">مسح الفلاتر</button>
          )}
        </div>

        {filtered.length === 0 && userAds.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🚘</div>
            <h3 className="text-lg font-bold text-gray-600 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-400 text-sm">جرب تغيير معايير البحث</p>
          </div>
        ) : (
          <>
            {/* User-posted plate offers */}
            {userAds.filter(a => a.intent !== 'request').length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-red-500">📸</span>
                  <h3 className="font-bold text-gray-800">إعلانات الأعضاء على الأرقام</h3>
                  <span className="text-xs bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-full font-semibold">{userAds.filter(a => a.intent !== 'request').length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userAds.filter(a => a.intent !== 'request').map(ad => <UserPlateCard key={ad.id} ad={ad} />)}
                </div>
              </div>
            )}

            {/* User plate requests */}
            {userAds.filter(a => a.intent === 'request').length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-amber-400">📩</span>
                  <h3 className="font-bold text-amber-300">طلبات الأشخاص على الأرقام ({userAds.filter(a => a.intent === 'request').length})</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userAds.filter(a => a.intent === 'request').map(ad => <UserPlateCard key={ad.id} ad={ad} />)}
                </div>
              </div>
            )}

            {/* Featured mock ads */}
            {featuredPlates.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-amber-500">⭐</span>
                  <h3 className="font-bold text-gray-800">إعلانات مميزة</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featuredPlates.map(p => <PlateCard key={p.id} plate={p} />)}
                </div>
              </div>
            )}

            {regularPlates.length > 0 && (
              <div>
                {(featuredPlates.length > 0 || userAds.length > 0) && (
                  <h3 className="font-bold text-gray-800 mb-4">جميع الإعلانات</h3>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {regularPlates.map(p => <PlateCard key={p.id} plate={p} />)}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-l from-red-900/60 to-red-950/80 border border-red-800/30 rounded-3xl p-8 text-center text-white">
          <div className="text-4xl mb-3">🚘</div>
          <h3 className="text-2xl font-black mb-2">لديك رقم للبيع؟</h3>
          <p className="text-red-300/60 mb-5 text-sm">أضف إعلانك مجاناً وتواصل مع آلاف المشترين</p>
          <button onClick={() => user ? setShowModal(true) : navigate('/login')}
            className="px-8 py-3.5 bg-gradient-to-l from-red-700 to-red-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-red-500 transition-all shadow-lg shadow-red-900/40">
            {user ? 'أضف إعلانك الآن — مجاناً' : 'سجّل دخول لإضافة إعلان'}
          </button>
        </div>
      </div>

      {showModal && <PostAdModal category="plate" onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); }} />}
    </div>
  );
}
