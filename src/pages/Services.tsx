import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, Plus, Star, Phone } from 'lucide-react';
import PostAdModal from '../components/PostAdModal';
import { getAdsByCategory, type StoredAd } from '../utils/adsStore';
import { subscribeToAdsByCategory } from '../utils/supabaseAds';
import { useAuth } from '../context/AuthContext';

// لا توجد خدمات افتراضية – تعتمد الصفحة على إعلانات المستخدمين فقط
const mockServices: any[] = [];

const cats = ['الكل', 'تنظيف', 'صيانة', 'نقل', 'تعليم', 'تصوير', 'طبخ', 'حراسة', 'مواصلات'];
const UAE_EMIRATES = ['كل الإمارات', 'دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'أم القيوين', 'رأس الخيمة', 'الفجيرة'];

function UserSvcCard({ ad }: { ad: StoredAd }) {
  const img = ad.images?.[0];
  return (
    <div className="bg-gray-900 rounded-2xl border-2 border-red-900/40 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5">🆕 خدمة جديدة</div>
      <div className="h-36 bg-gradient-to-br from-red-950/30 to-gray-900 overflow-hidden">
        {img ? <img src={img} alt={ad.svcTitle} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl">🛠️</div>}
      </div>
      <div className="p-5">
        {ad.svcCat && <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-semibold">{ad.svcCat}</span>}
        <h3 className="font-bold text-gray-200 text-sm mt-2 mb-1">{ad.svcTitle || 'خدمة للبيع'}</h3>
        <div className="text-lg font-black text-red-500 mb-2">
          {ad.price ? `${ad.price.toLocaleString()} AED` : 'السعر عند الاتصال'}
          {ad.svcPer && <span className="text-sm font-normal text-gray-400"> / {ad.svcPer}</span>}
        </div>
        {ad.location && <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2"><MapPin className="w-3.5 h-3.5" /> {ad.location}</div>}
        {ad.desc && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{ad.desc}</p>}
        <div className="flex gap-2">
          {ad.phone && <>
            <a href={`https://wa.me/${ad.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl text-center hover:bg-green-600">واتساب</a>
            <a href={`tel:${ad.phone}`} className="flex items-center gap-1 px-4 py-2.5 border-2 border-gray-700 text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-800"><Phone className="w-3.5 h-3.5" /> اتصال</a>
          </>}
        </div>
        <div className="mt-2 text-xs text-gray-400 text-center">{ad.name} • {new Date(ad.createdAt).toLocaleDateString('ar-AE')}</div>
      </div>
    </div>
  );
}

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [userAds, setUserAds] = useState<StoredAd[]>([]);
  const [search, setSearch] = useState('');
  const [emirate, setEmirate] = useState('كل الإمارات');
  const [activeCat, setActiveCat] = useState('الكل');

  useEffect(() => {
    setUserAds(getAdsByCategory('service'));
    const unsubscribe = subscribeToAdsByCategory('service', (cloudAds) => {
      setUserAds(cloudAds as StoredAd[]);
    });
    return unsubscribe;
  }, []);

  const filteredMock = mockServices.filter(s => {
    const matchEmirate = emirate === 'كل الإمارات' || s.location === emirate;
    const matchCat = activeCat === 'الكل' || s.category === activeCat;
    const matchSearch = !search || s.title.includes(search) || s.location.includes(search);
    return matchEmirate && matchCat && matchSearch;
  });

  const filteredUser = userAds.filter(s => {
    const matchEmirate = emirate === 'كل الإمارات' || s.location === emirate;
    const matchCat = activeCat === 'الكل' || s.svcCat === activeCat;
    const matchSearch = !search || (s.svcTitle || '').includes(search) || (s.location || '').includes(search);
    return matchEmirate && matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-950 via-red-950/60 to-gray-950 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Link to="/" className="text-red-300/70 hover:text-white">الرئيسية</Link>
            <ChevronLeft className="w-4 h-4 text-gray-500" />
            <span>الخدمات</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🛠️</span>
                <h1 className="text-3xl font-black">الخدمات</h1>
              </div>
              <p className="text-red-300/70 text-sm">خدمات منزلية ومهنية موثوقة في الإمارات</p>
              <div className="flex gap-3 mt-3">
                <span className="px-3 py-1 bg-gray-900/10 rounded-full text-xs">{mockServices.length + userAds.length} خدمة</span>
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold">نشر مجاني</span>
              </div>
            </div>
            <button onClick={() => user ? setShowModal(true) : navigate('/login')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-red-700 to-red-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-red-500 transition-all shrink-0 shadow-lg shadow-red-900/40">
              <Plus className="w-5 h-5" /> {user ? 'أضف خدمتك — مجاناً' : 'سجّل دخول لإضافة إعلان'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border-b border-red-900/20 px-4 py-4">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن خدمة..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-500 text-sm"
              />
            </div>
            <select
              value={emirate}
              onChange={e => setEmirate(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {UAE_EMIRATES.map(em => <option key={em}>{em}</option>)}
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cats.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeCat === cat ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 bg-gray-950 min-h-screen">
        {/* Offers */}
        {filteredUser.filter(a => a.intent !== 'request').length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h3 className="font-bold text-gray-800">الخدمات المتاحة ({filteredUser.filter(a => a.intent !== 'request').length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUser.filter(a => a.intent !== 'request').map(ad => <UserSvcCard key={ad.id} ad={ad} />)}
            </div>
          </div>
        )}

        {/* Requests */}
        {filteredUser.filter(a => a.intent === 'request').length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-bold text-amber-300">طلبات الأشخاص على الخدمات ({filteredUser.filter(a => a.intent === 'request').length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUser.filter(a => a.intent === 'request').map(ad => <UserSvcCard key={ad.id} ad={ad} />)}
            </div>
          </div>
        )}

        {filteredMock.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMock.map(svc => (
              <div key={svc.id} className={`bg-gray-900 rounded-2xl border-2 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${svc.featured ? 'border-red-500/40' : 'border-gray-800 hover:border-red-600/30'}`}>
                {svc.featured && (
                  <div className="bg-gradient-to-l from-red-700 to-red-600 text-white text-xs font-bold px-3 py-1.5">
                    ⭐ خدمة مميزة
                  </div>
                )}
                <div className="h-36 bg-gradient-to-br from-red-950/30 to-gray-900 overflow-hidden">
                  {svc.imgUrl ? (
                    <img src={svc.imgUrl} alt={svc.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">{svc.img}</div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-semibold">{svc.category}</span>
                  <h3 className="font-bold text-gray-200 text-sm mt-2 mb-1">{svc.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {svc.rating}
                    </div>
                    <span className="text-gray-400 text-xs">({svc.reviews} تقييم)</span>
                  </div>
                  <div className="text-xl font-black text-red-500 mb-1">
                    {svc.price} AED <span className="text-sm font-normal text-gray-400">/ {svc.per}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <MapPin className="w-3.5 h-3.5" /> {svc.location} • {svc.seller}
                  </div>
                  <div className="flex gap-2">
                    <a href={`https://wa.me/${svc.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl text-center hover:bg-green-600 transition-colors">
                      واتساب
                    </a>
                    <a href={`tel:${svc.phone}`}
                      className="px-4 py-2.5 border-2 border-gray-700 text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                      اتصال
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredUser.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🛠️</div>
            <p className="font-semibold">لا توجد نتائج للبحث الحالي</p>
            <p className="text-sm mt-1">جرب تغيير الفلاتر أو البحث بكلمة مختلفة</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-l from-red-800/60 to-red-950 rounded-3xl p-8 text-center text-white">
          <div className="text-4xl mb-3">🛠️</div>
          <h3 className="text-2xl font-black mb-2">لديك خدمة تقدمها؟</h3>
          <p className="text-red-200/60 mb-5 text-sm">أضف إعلانك مجاناً وتواصل مع آلاف العملاء</p>
          <button onClick={() => user ? setShowModal(true) : navigate('/login')}
            className="px-8 py-3.5 bg-gradient-to-l from-red-700 to-red-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-red-500 transition-all shadow-lg shadow-red-900/40">
            {user ? 'أضف خدمتك الآن — مجاناً' : 'سجّل دخول لإضافة إعلان'}
          </button>
        </div>
      </div>

      {showModal && (
        <PostAdModal
          category="service"
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); }}
        />
      )}
    </div>
  );
}
