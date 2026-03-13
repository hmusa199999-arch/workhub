import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronLeft, Plus, BedDouble, Bath, Square, Phone } from 'lucide-react';
import PostAdModal from '../components/PostAdModal';
import { getAdsByCategory, type StoredAd } from '../utils/adsStore';
import { subscribeToAdsByCategory } from '../utils/firestoreAds';
import { useAuth } from '../context/AuthContext';

// لا توجد عقارات افتراضية – تعتمد الصفحة على إعلانات المستخدمين فقط
const mockProperties: any[] = [];

const propTypes = ['الكل', 'شقة', 'فيلا', 'استوديو', 'مكتب', 'أرض', 'بنتهاوس'];
const UAE_EMIRATES = ['كل الإمارات', 'دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'أم القيوين', 'رأس الخيمة', 'الفجيرة'];
const purposeOptions = ['الكل', 'للإيجار', 'للبيع'];

function UserPropCard({ ad }: { ad: StoredAd }) {
  const img = ad.images?.[0];
  return (
    <div className="bg-gray-900 rounded-2xl border-2 border-red-900/40 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="bg-gradient-to-l from-red-700 to-red-600 text-white text-xs font-bold px-3 py-1.5">🆕 إعلان جديد</div>
      <div className="h-44 bg-gradient-to-br from-red-950/30 to-gray-900 overflow-hidden">
        {img ? <img src={img} alt={ad.reTitle} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl">🏠</div>}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {ad.rePurpose && <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${ad.rePurpose === 'للإيجار' ? 'bg-red-900/30 text-red-400' : 'bg-rose-900/30 text-rose-400'}`}>{ad.rePurpose}</span>}
          {ad.reType && <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full">{ad.reType}</span>}
        </div>
        <h3 className="font-bold text-gray-200 text-sm mb-1">{ad.reTitle || 'عقار للبيع/الإيجار'}</h3>
        <div className="text-xl font-black text-red-400 mb-3">{ad.price ? `${ad.price.toLocaleString()} AED` : 'السعر عند الاتصال'}</div>
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
          {ad.reBeds && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {ad.reBeds} غرف</span>}
          {ad.reBaths && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {ad.reBaths}</span>}
          {ad.reArea && <span className="flex items-center gap-1"><Square className="w-3.5 h-3.5" /> {ad.reArea} قدم</span>}
        </div>
        {ad.location && <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3"><MapPin className="w-3.5 h-3.5" /> {ad.location}</div>}
        {ad.desc && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{ad.desc}</p>}
        <div className="flex gap-2">
          {ad.phone && <>
            <a href={`https://wa.me/${ad.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl text-center hover:bg-green-600">واتساب</a>
            <a href={`tel:${ad.phone}`} className="flex items-center gap-1 px-4 py-2.5 border-2 border-gray-700 text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-800"><Phone className="w-3.5 h-3.5" /> اتصال</a>
          </>}
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">{ad.name} • {new Date(ad.createdAt).toLocaleDateString('ar-AE')}</div>
      </div>
    </div>
  );
}

export default function RealEstate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [userAds, setUserAds] = useState<StoredAd[]>([]);
  const [search, setSearch] = useState('');
  const [emirate, setEmirate] = useState('كل الإمارات');
  const [propType, setPropType] = useState('الكل');
  const [purpose, setPurpose] = useState('الكل');

  useEffect(() => {
    setUserAds(getAdsByCategory('realestate'));
    const unsubscribe = subscribeToAdsByCategory('realestate', (cloudAds) => {
      setUserAds(cloudAds as StoredAd[]);
    });
    return unsubscribe;
  }, []);

  const filteredMock = mockProperties.filter(p => {
    const matchEmirate = emirate === 'كل الإمارات' || p.location === emirate;
    const matchType = propType === 'الكل' || p.type === propType;
    const matchPurpose = purpose === 'الكل' || (purpose === 'للإيجار' ? p.forRent : !p.forRent);
    const matchSearch = !search || p.title.includes(search) || p.location.includes(search);
    return matchEmirate && matchType && matchPurpose && matchSearch;
  });

  const filteredUser = userAds.filter(p => {
    const matchEmirate = emirate === 'كل الإمارات' || p.location === emirate;
    const matchType = propType === 'الكل' || p.reType === propType;
    const matchPurpose = purpose === 'الكل' || p.rePurpose === purpose;
    const matchSearch = !search || (p.reTitle || '').includes(search) || (p.location || '').includes(search);
    return matchEmirate && matchType && matchPurpose && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-950 via-red-950/60 to-gray-950 text-white py-10 px-4 border-b border-red-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Link to="/" className="text-red-300 hover:text-white">الرئيسية</Link>
            <ChevronLeft className="w-4 h-4 text-gray-500" />
            <span>العقارات</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🏡</span>
                <h1 className="text-3xl font-black">العقارات</h1>
              </div>
              <p className="text-red-300/70 text-sm">عقارات للبيع والإيجار في جميع إمارات الدولة</p>
              <div className="flex gap-3 mt-3">
                <span className="px-3 py-1 bg-gray-900/10 rounded-full text-xs">{mockProperties.length + userAds.length} عقار</span>
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 rounded-full text-xs font-semibold">نشر مجاني</span>
              </div>
            </div>
            <button onClick={() => user ? setShowModal(true) : navigate('/login')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-red-700 to-red-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-red-500 transition-all shrink-0 shadow-lg shadow-red-900/40">
              <Plus className="w-5 h-5" /> {user ? 'أضف عقارك — مجاناً' : 'سجّل دخول لإضافة إعلان'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border-b border-red-900/20 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن عقار..."
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
          <select
            value={propType}
            onChange={e => setPropType(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {propTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="flex gap-1 p-1 bg-gray-800 rounded-xl border border-gray-700">
            {purposeOptions.map(p => (
              <button
                key={p}
                onClick={() => setPurpose(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${purpose === p ? 'bg-red-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                {p}
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
              <h3 className="font-black text-gray-100">عقارات معروضة للبيع / الإيجار ({filteredUser.filter(a => a.intent !== 'request').length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUser.filter(a => a.intent !== 'request').map(ad => <UserPropCard key={ad.id} ad={ad} />)}
            </div>
          </div>
        )}

        {/* Requests */}
        {filteredUser.filter(a => a.intent === 'request').length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-black text-amber-300">طلبات الأشخاص على العقارات ({filteredUser.filter(a => a.intent === 'request').length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUser.filter(a => a.intent === 'request').map(ad => <UserPropCard key={ad.id} ad={ad} />)}
            </div>
          </div>
        )}

        {filteredMock.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMock.map(prop => (
              <div key={prop.id} className={`bg-gray-900 rounded-2xl border-2 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${prop.featured ? 'border-red-500/40' : 'border-gray-800 hover:border-red-600/30'}`}>
                {prop.featured && (
                  <div className="bg-gradient-to-l from-red-700 to-red-600 text-white text-xs font-bold px-3 py-1.5">
                    ⭐ إعلان مميز
                  </div>
                )}
                <div className="h-44 bg-gradient-to-br from-red-950/30 to-gray-900 overflow-hidden relative">
                  {prop.imgUrl ? (
                    <img src={prop.imgUrl} alt={prop.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">{prop.img}</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${prop.forRent ? 'bg-red-900/30 text-red-400' : 'bg-rose-900/30 text-rose-400'}`}>
                      {prop.forRent ? 'للإيجار' : 'للبيع'}
                    </span>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full">{prop.type}</span>
                  </div>
                  <h3 className="font-bold text-gray-200 text-sm mt-2 mb-1">{prop.title}</h3>
                  <div className="text-xl font-black text-red-400 mb-3">
                    {prop.price.toLocaleString()} AED <span className="text-sm font-normal text-gray-400">{prop.period}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                    {prop.beds > 0 && (
                      <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {prop.beds} غرف</span>
                    )}
                    {prop.baths > 0 && (
                      <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {prop.baths} حمام</span>
                    )}
                    <span className="flex items-center gap-1"><Square className="w-3.5 h-3.5" /> {prop.area.toLocaleString()} قدم</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <MapPin className="w-3.5 h-3.5" /> {prop.location}
                  </div>
                  <div className="flex gap-2">
                    <a href={`https://wa.me/${prop.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl text-center hover:bg-green-600 transition-colors">
                      واتساب
                    </a>
                    <a href={`tel:${prop.phone}`}
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
            <div className="text-5xl mb-3">🏡</div>
            <p className="font-semibold">لا توجد نتائج للبحث الحالي</p>
            <p className="text-sm mt-1">جرب تغيير الفلاتر أو البحث بكلمة مختلفة</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-l from-red-900/60 to-red-950/80 border border-red-800/30 rounded-3xl p-8 text-center text-white">
          <div className="text-4xl mb-3">🏡</div>
          <h3 className="text-2xl font-black mb-2">لديك عقار للبيع أو الإيجار؟</h3>
          <p className="text-red-300/60 mb-5 text-sm">أضف إعلانك مجاناً وتواصل مع آلاف المهتمين</p>
          <button onClick={() => user ? setShowModal(true) : navigate('/login')}
            className="px-8 py-3.5 bg-gradient-to-l from-red-700 to-red-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-red-500 transition-all shadow-lg shadow-red-900/40">
            {user ? 'أضف إعلانك الآن — مجاناً' : 'سجّل دخول لإضافة إعلان'}
          </button>
        </div>
      </div>

      {showModal && (
        <PostAdModal
          category="realestate"
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); }}
        />
      )}
    </div>
  );
}
