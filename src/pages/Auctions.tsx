import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, Gavel, Clock, ChevronLeft, Plus, MapPin, Tag, TrendingUp } from 'lucide-react';
import PostAuctionModal from '../components/PostAuctionModal';
import AuctionBidModal from '../components/AuctionBidModal';
import { subscribeToAdsByCategory, type FirestoreAd } from '../utils/firestoreAds';
import { subscribeToBids } from '../utils/firestoreBids';
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

function pad(n: number) { return String(n).padStart(2, '0'); }

// ── Live countdown hook ──────────────────────────────────────────────────────
function useCountdown(endDateStr?: string) {
  const calc = () => {
    if (!endDateStr) return null;
    const diff = new Date(endDateStr).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
      ended: false,
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDateStr]);
  return time;
}

// ── Auction card ──────────────────────────────────────────────────────────────
function AuctionCard({ ad, onBid }: { ad: FirestoreAd; onBid: () => void }) {
  const img = ad.images?.[0];
  const subLabel = SUBCAT_LABELS[ad.auctionSubCat || ''] || '📦 سلع أخرى';
  const countdown = useCountdown(ad.auctionEndDate);
  const [highestBid, setHighestBid] = useState<number>(ad.auctionStartPrice || 0);
  const [bidCount, setBidCount] = useState(0);

  // Subscribe to highest bid for this auction
  useEffect(() => {
    const unsub = subscribeToBids(ad.id, (bids) => {
      setBidCount(bids.length);
      if (bids.length > 0) {
        setHighestBid(Math.max(...bids.map(b => b.amount)));
      } else {
        setHighestBid(ad.auctionStartPrice || 0);
      }
    });
    return unsub;
  }, [ad.id, ad.auctionStartPrice]);

  const isEnded = countdown?.ended ?? false;

  return (
    <div className="bg-gray-900 rounded-2xl border-2 border-yellow-900/40 shadow hover:shadow-xl hover:border-yellow-600/50 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-yellow-950/30 to-gray-900 overflow-hidden">
        {img ? (
          <img src={img} alt={ad.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">🏷️</div>
        )}
        {/* Top badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <span className="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full shadow">
            🔨 مزاد
          </span>
          <span className="bg-gray-900/90 text-yellow-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-yellow-900/50">
            {subLabel}
          </span>
        </div>
        {/* Bid count badge */}
        {bidCount > 0 && (
          <div className="absolute top-2 left-2 bg-yellow-500/90 text-black text-[9px] font-black px-2 py-0.5 rounded-full">
            {bidCount} سومة
          </div>
        )}
      </div>

      {/* Countdown bar */}
      {ad.auctionEndDate && (
        <div className={`px-3 py-2 flex items-center justify-center gap-2 border-b ${
          isEnded
            ? 'bg-red-900/30 border-red-900/30'
            : countdown && countdown.days === 0 && countdown.hours < 6
            ? 'bg-red-900/20 border-red-900/20 animate-pulse'
            : 'bg-yellow-900/20 border-yellow-900/20'
        }`}>
          <Clock className={`w-3 h-3 shrink-0 ${isEnded ? 'text-red-400' : 'text-yellow-400'}`} />
          {isEnded ? (
            <span className="text-red-400 text-xs font-black">انتهى المزاد</span>
          ) : countdown ? (
            <div className="flex items-center gap-1 text-xs font-black">
              {[
                { v: countdown.days,    l: 'يوم' },
                { v: countdown.hours,   l: 'سا' },
                { v: countdown.minutes, l: 'دق' },
                { v: countdown.seconds, l: 'ث' },
              ].map((u, i) => (
                <span key={i} className="flex items-baseline gap-0.5">
                  <span className="text-yellow-300">{pad(u.v)}</span>
                  <span className="text-[9px] text-gray-500">{u.l}</span>
                  {i < 3 && <span className="text-gray-600 mx-0.5">:</span>}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3 className="font-black text-gray-100 text-sm leading-tight line-clamp-2">{ad.title || 'عنصر للمزاد'}</h3>

        {ad.auctionCondition && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-lg w-fit">
            <Tag className="w-2.5 h-2.5" /> {ad.auctionCondition}
          </span>
        )}

        {/* Price section */}
        <div className="mt-auto pt-2 border-t border-gray-800">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[9px] text-gray-600 mb-0.5 flex items-center gap-1">
                <TrendingUp className="w-2.5 h-2.5" />
                {bidCount > 0 ? 'أعلى سومة' : 'سعر البداية'}
              </div>
              <div className={`text-base font-black ${bidCount > 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
                {highestBid.toLocaleString()}
                <span className="text-[10px] text-gray-500 font-normal mr-1">AED</span>
              </div>
            </div>
            {ad.location && (
              <div className="flex items-center gap-1 text-[9px] text-gray-600 max-w-[45%]">
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{ad.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bid button */}
        <button
          onClick={onBid}
          disabled={isEnded}
          className={`w-full py-2.5 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
            isEnded
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black shadow-lg shadow-yellow-500/20'
          }`}
        >
          <Gavel className="w-4 h-4" />
          {isEnded ? 'انتهى المزاد' : 'زايد الآن'}
        </button>

        {/* Contact fallback */}
        {ad.phone && (
          <div className="flex gap-1.5">
            <a href={`https://wa.me/${ad.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-[10px] font-bold rounded-xl text-center transition border border-green-600/20">
              واتساب
            </a>
            <a href={`tel:${ad.phone}`}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-700 hover:bg-gray-800 text-[10px] font-semibold rounded-xl transition text-gray-400">
              <Phone className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="text-[9px] text-gray-700 text-center">
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
  const [selectedAuction, setSelectedAuction] = useState<FirestoreAd | null>(null);
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
            {filtered.map(ad => (
              <AuctionCard
                key={ad.id}
                ad={ad}
                onBid={() => {
                  if (!user) { navigate('/login'); return; }
                  setSelectedAuction(ad);
                }}
              />
            ))}
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

      {selectedAuction && (
        <AuctionBidModal
          auction={selectedAuction}
          onClose={() => setSelectedAuction(null)}
        />
      )}
    </div>
  );
}
