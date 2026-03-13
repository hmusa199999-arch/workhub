import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, Gavel, Clock, ChevronLeft, Plus, MapPin, Tag } from 'lucide-react';
import PostAuctionModal from '../components/PostAuctionModal';
import { subscribeToAdsByCategory, type FirestoreAd } from '../utils/firestoreAds';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const SUBCATS = [
  { value: 'all',    label: 'الكل',            labelEn: 'All',           icon: '🏷️' },
  { value: 'car',    label: 'سيارات',           labelEn: 'Cars',          icon: '🚗' },
  { value: 'plate',  label: 'أرقام سيارات',    labelEn: 'Car Plates',    icon: '🔢' },
  { value: 'animal', label: 'حيوانات',          labelEn: 'Animals',       icon: '🐄' },
  { value: 'scrap',  label: 'قطع سكراب',       labelEn: 'Scrap',         icon: '🔩' },
  { value: 'bike',   label: 'دراجات',           labelEn: 'Bikes',         icon: '🏍️' },
  { value: 'watch',  label: 'ساعات',            labelEn: 'Watches',       icon: '⌚' },
  { value: 'other',  label: 'سلع أخرى',        labelEn: 'Other',         icon: '📦' },
];

const SUBCAT_LABELS: Record<string, string> = {
  car: '🚗 سيارات', plate: '🔢 أرقام', animal: '🐄 حيوانات',
  scrap: '🔩 سكراب', bike: '🏍️ دراجات', watch: '⌚ ساعات', other: '📦 سلع أخرى',
};

function daysLeft(dateStr?: string): string | null {
  if (!dateStr) return null;
  const end = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'انتهى المزاد';
  if (diff === 1) return 'آخر يوم!';
  return `${diff} يوم متبقي`;
}

function AuctionCard({ ad }: { ad: FirestoreAd }) {
  const img = ad.images?.[0];
  const remaining = daysLeft(ad.auctionEndDate);
  const subLabel = SUBCAT_LABELS[ad.auctionSubCat || ''] || '📦 سلع أخرى';

  return (
    <div className="bg-gray-900 rounded-2xl border-2 border-yellow-900/40 shadow hover:shadow-xl hover:border-yellow-600/50 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-yellow-950/30 to-gray-900 overflow-hidden">
        {img ? (
          <img src={img} alt={ad.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl opacity-40">🏷️</div>
        )}
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow">
            🔨 مزاد
          </span>
          <span className="bg-gray-800/90 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-900/50">
            {subLabel}
          </span>
        </div>
        {remaining && (
          <div className={`absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
            remaining === 'انتهى المزاد' ? 'bg-red-800/90 text-red-200' :
            remaining === 'آخر يوم!' ? 'bg-red-600/90 text-white animate-pulse' :
            'bg-gray-800/90 text-yellow-300 border border-yellow-900/50'
          }`}>
            <Clock className="w-3 h-3" /> {remaining}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-black text-gray-100 text-sm leading-tight line-clamp-2">{ad.title || 'عنصر للمزاد'}</h3>

        {ad.auctionCondition && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2 py-1 rounded-lg w-fit">
            <Tag className="w-3 h-3" /> {ad.auctionCondition}
          </span>
        )}

        {ad.desc && <p className="text-xs text-gray-500 line-clamp-2">{ad.desc}</p>}

        <div className="mt-auto pt-2 border-t border-gray-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-500 mb-0.5">سعر البداية</div>
            <div className="text-lg font-black text-yellow-400">
              {ad.auctionStartPrice ? `${Number(ad.auctionStartPrice).toLocaleString()} AED` : 'يُحدَّد لاحقاً'}
            </div>
          </div>
          {ad.location && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500 max-w-[40%] text-left">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{ad.location}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        {ad.phone && (
          <div className="flex gap-2 mt-1">
            <a href={`https://wa.me/${ad.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl text-center transition">
              واتساب
            </a>
            <a href={`tel:${ad.phone}`}
              className="flex items-center gap-1 px-3 py-2 border-2 border-gray-700 hover:bg-gray-800 text-xs font-semibold rounded-xl transition text-gray-300">
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        <div className="text-[10px] text-gray-600 text-center">
          {ad.name} • {new Date(ad.createdAt).toLocaleDateString('ar-AE')}
        </div>
      </div>
    </div>
  );
}

export default function Auctions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();

  const [ads, setAds] = useState<FirestoreAd[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSubCat, setActiveSubCat] = useState('all');

  useEffect(() => {
    const unsub = subscribeToAdsByCategory('auction', (fetched) => {
      setAds(fetched);
    });
    return unsub;
  }, []);

  const filtered = ads.filter(ad => {
    const matchesSub = activeSubCat === 'all' || ad.auctionSubCat === activeSubCat;
    const matchesSearch = !search ||
      (ad.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (ad.desc || '').toLowerCase().includes(search.toLowerCase()) ||
      (ad.location || '').includes(search);
    return matchesSub && matchesSearch;
  });

  // Counts per sub-category
  const subcatCounts: Record<string, number> = { all: ads.length };
  SUBCATS.forEach(s => {
    if (s.value !== 'all') subcatCounts[s.value] = ads.filter(a => a.auctionSubCat === s.value).length;
  });

  const handleAddAuction = () => {
    if (!user) { navigate('/login'); return; }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-950 via-yellow-950/30 to-gray-950 pt-16 pb-10 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 text-yellow-400 text-sm font-bold mb-4">
            <Gavel className="w-4 h-4" />
            {t('مزادات العالم العربي', 'Arab World Auctions')}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-3">
            {t('المزادات', 'Auctions')}
            <span className="text-yellow-400"> work1m</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            {t('سيارات، أرقام، حيوانات، ساعات وأكثر — ضع مزادك أو اشترك في مزادات الآخرين', 'Cars, plates, animals, watches & more — post or join auctions')}
          </p>

          {/* Search bar */}
          <div className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('ابحث في المزادات...', 'Search auctions...')}
                className="w-full pr-10 pl-4 py-3.5 bg-gray-900 border border-gray-700 rounded-2xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-500 text-sm"
              />
            </div>
            <button
              onClick={handleAddAuction}
              className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black rounded-2xl shadow-lg shadow-yellow-500/20 transition-all text-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              {t('أضف مزاد', 'Add Auction')}
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-yellow-400 font-bold">{ads.length}</span> {t('مزاد نشط', 'active auctions')}
            </span>
            <span>•</span>
            <span>{t('موافقة الإدارة مطلوبة', 'Admin approval required')}</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-16">

        {/* Sub-category cards */}
        <div className="py-6">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {SUBCATS.map(sub => {
              const count = subcatCounts[sub.value] || 0;
              const active = activeSubCat === sub.value;
              return (
                <button
                  key={sub.value}
                  onClick={() => setActiveSubCat(sub.value)}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl border-2 transition-all ${
                    active
                      ? 'bg-yellow-500/15 border-yellow-500 shadow-lg shadow-yellow-500/10'
                      : 'bg-gray-900 border-gray-800 hover:border-yellow-600/40'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">{sub.icon}</span>
                  <span className={`text-[10px] sm:text-xs font-bold leading-tight text-center ${active ? 'text-yellow-300' : 'text-gray-400'}`}>
                    {t(sub.label, sub.labelEn)}
                  </span>
                  {count > 0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-200 font-bold text-base">
            {filtered.length > 0 ? (
              <>{filtered.length} {t('مزاد', 'auction')}</>
            ) : (
              t('لا توجد مزادات', 'No auctions found')
            )}
          </h2>
          {activeSubCat !== 'all' && (
            <button onClick={() => setActiveSubCat('all')} className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
              {t('عرض الكل', 'Show all')} <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(ad => <AuctionCard key={ad.id} ad={ad} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🔨</div>
            <h3 className="text-xl font-black text-gray-400 mb-2">
              {t('لا توجد مزادات حالياً', 'No auctions yet')}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {t('كن أول من ينشر مزاداً في هذه الفئة!', 'Be the first to post an auction in this category!')}
            </p>
            <button
              onClick={handleAddAuction}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-2xl hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              {t('أضف أول مزاد', 'Add First Auction')}
            </button>
          </div>
        )}

        {/* Info section */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🔨', title: t('كيف يعمل المزاد؟', 'How do auctions work?'), desc: t('انشر إعلان مزادك بسهولة. بعد موافقة الإدارة يظهر للجميع ويمكنهم التواصل معك مباشرة.', 'Post your auction easily. After admin approval it becomes visible and buyers contact you directly.') },
            { icon: '✅', title: t('موافقة الإدارة', 'Admin Approval'), desc: t('كل مزاد يمر بمراجعة من فريق work1m لضمان الجودة والمصداقية.', 'Every auction is reviewed by the work1m team to ensure quality and credibility.') },
            { icon: '💬', title: t('تواصل مباشر', 'Direct Contact'), desc: t('المشترون يتواصلون مباشرة مع البائع عبر واتساب أو الهاتف بدون وسيط.', 'Buyers contact sellers directly via WhatsApp or phone with no intermediary.') },
          ].map((item, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-black text-gray-200 mb-1.5 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <PostAuctionModal
          onClose={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
