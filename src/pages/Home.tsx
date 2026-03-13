import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, TrendingUp, Shield, Clock, Star, ChevronLeft, Zap, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import JobCard from '../components/JobCard';
import DirectBannerCarousel from '../components/DirectBannerCarousel';
import { mockJobs } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { subscribeToAds, type FirestoreAd } from '../utils/firestoreAds';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [count, setCount] = useState(0);
  const [liveAds, setLiveAds] = useState<FirestoreAd[]>([]);

  // Real-time ads count from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAds((ads) => {
      setLiveAds(ads.filter(a => a.status === 'approved'));
    });
    return unsubscribe;
  }, []);

  // Live counts per category
  const liveCounts = {
    jobs:      liveAds.filter(a => a.category !== 'car' && a.category !== 'realestate' && a.category !== 'service' && a.category !== 'plate' && a.category !== 'job_seeker').length,
    cars:      liveAds.filter(a => a.category === 'car').length,
    realestate:liveAds.filter(a => a.category === 'realestate').length,
    services:  liveAds.filter(a => a.category === 'service').length,
    plates:    liveAds.filter(a => a.category === 'plate').length,
  };

  // Animated counter for hero
  useEffect(() => {
    const target = mockJobs.length + liveCounts.jobs;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      setCount(c => { if (c + step >= target) { clearInterval(timer); return target; } return c + step; });
    }, 20);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveAds.length]);

  const featuredJobs = mockJobs.filter(j => j.featured).slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchLocation) params.set('location', searchLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  const categories = [
    { to: '/jobs',        icon: '💼', label: 'وظائف',        liveCount: mockJobs.length + liveCounts.jobs,      glow: 'hover:shadow-red-500/20'  },
    { to: '/cars',        icon: '🚗', label: 'سيارات',       liveCount: liveCounts.cars,                        glow: 'hover:shadow-orange-500/20' },
    { to: '/real-estate', icon: '🏡', label: 'عقارات',       liveCount: liveCounts.realestate,                  glow: 'hover:shadow-emerald-500/20' },
    { to: '/services',    icon: '🛠️', label: 'خدمات',        liveCount: liveCounts.services,                    glow: 'hover:shadow-rose-500/20'  },
    { to: '/car-plates',  icon: '🚘', label: 'أرقام سيارات', liveCount: liveCounts.plates,                      glow: 'hover:shadow-amber-500/20' },
  ];

  const features = [
    { icon: <Search className="w-5 h-5 text-red-400" />, title: 'بحث متقدم وذكي', desc: 'فلاتر متعددة تساعدك في العثور على ما تبحث عنه بدقة عالية.' },
    { icon: <Shield className="w-5 h-5 text-red-400" />, title: 'إعلانات موثوقة', desc: 'نتحقق من كل معلن لضمان تجربة آمنة وموثوقة.' },
    { icon: <Zap className="w-5 h-5 text-red-400" />, title: 'نشر فوري مجاني', desc: 'أضف إعلانك خلال دقائق بدون رسوم أو اشتراكات.' },
    { icon: <TrendingUp className="w-5 h-5 text-red-400" />, title: 'تنبيهات فورية', desc: 'إشعار فوري لكل إعلان جديد يطابق اهتماماتك.' },
    { icon: <Users className="w-5 h-5 text-red-400" />, title: 'مجتمع كبير', desc: 'أكثر من 25,000 مستخدم نشط يومياً في الإمارات.' },
    { icon: <Clock className="w-5 h-5 text-red-400" />, title: 'دعم 24/7', desc: 'فريق الدعم متاح على مدار الساعة لمساعدتك.' },
  ];

  return (
    <div className="bg-gray-950 overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          HERO — EPIC INTRO
      ══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">

        {/* Multi-layer background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-gray-950" />

        {/* Radial red glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-800/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-rose-700/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Grid lines overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#dc2626 1px, transparent 1px), linear-gradient(90deg, #dc2626 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        {/* Top diagonal accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-red-500/60 to-transparent" />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-red-500/40 rounded-full animate-pulse"
            style={{ top: `${10 + i * 11}%`, left: `${5 + i * 13}%`, animationDelay: `${i * 0.4}s` }} />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 bg-red-600/10 border border-red-500/25 backdrop-blur-sm rounded-full px-5 py-2 text-sm mb-6 shadow-lg shadow-red-900/20">
            <span className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
            </span>
            <span className="text-red-200/80 font-semibold">المنصة الأولى للإعلانات والتوظيف في العالم العربي</span>
          </div>

          {/* ── Admin Banner Carousel (visible to all) ── */}
          <div className="w-full max-w-4xl mx-auto mb-8 rounded-2xl overflow-hidden border border-red-700/40 shadow-2xl shadow-red-500/20">
            <DirectBannerCarousel />
          </div>

          {/* Main Headline */}
          <div className="mb-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-3 text-white">
              اعثر على
            </h1>
            <div className="relative inline-block">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight"
                style={{ background: 'linear-gradient(135deg, #fca5a5 0%, #f87171 40%, #ef4444 70%, #fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ما تبحث عنه
              </h1>
              {/* Underline glow */}
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-l from-transparent via-red-500 to-transparent" />
            </div>
          </div>

          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            وظائف · سيارات · عقارات · خدمات · أرقام مركبات
            <br />
            <span className="text-gray-600 text-base">كل ما تحتاجه في مكان واحد — مجاناً تماماً</span>
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch}
            className="relative bg-gray-900/90 backdrop-blur-xl border border-red-900/40 rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto mb-6 shadow-2xl shadow-red-900/20">
            {/* Glow line on top */}
            <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-l from-transparent via-red-500/50 to-transparent" />

            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-800/60 rounded-xl border border-gray-700/50">
              <Search className="w-5 h-5 text-red-400 shrink-0" />
              <input
                type="text"
                placeholder="وظيفة، سيارة، عقار في أي دولة عربية..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm font-medium"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/60 rounded-xl border border-gray-700/50 sm:w-52">
              <MapPin className="w-5 h-5 text-red-400 shrink-0" />
              <input
                type="text"
                placeholder="الدولة أو المدينة..."
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm font-medium"
              />
            </div>
            <button type="submit"
              className="px-8 py-3 bg-gradient-to-l from-red-600 to-red-500 text-white font-black rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 whitespace-nowrap text-sm">
              ابحث الآن
            </button>
          </form>

          {/* Quick search */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-gray-600">الأكثر بحثاً:</span>
            {['مطور برمجيات', 'محاسب', 'مهندس', 'لاند كروزر', 'شقة دبي'].map(term => (
              <button key={term} onClick={() => setSearchQuery(term)}
                className="text-red-400/70 hover:text-red-300 transition-colors hover:underline underline-offset-2">
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-red-400" />
          <div className="w-1 h-1 bg-red-400 rounded-full" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════ */}
      <section className="relative border-y border-red-900/20 bg-gray-900/60 backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-red-950/20 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: `${count.toLocaleString()}+`, label: 'وظيفة متاحة', icon: '💼' },
              { value: '430+', label: 'شركة موثقة', icon: '🏢' },
              { value: '25,000+', label: 'باحث عمل', icon: '👤' },
              { value: '8,500+', label: 'توظيف ناجح', icon: '✅' },
            ].map(stat => (
              <div key={stat.label} className="text-center group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-black text-white mb-1 group-hover:text-red-400 transition-colors">{stat.value}</div>
                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-full px-4 py-1.5 text-xs text-red-400 font-black mb-4 tracking-wider uppercase">
              ✦ الأقسام
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
              اختر ما تبحث عنه
            </h2>
            <p className="text-gray-500">نشر مجاني بالكامل — بدون اشتراكات</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map(cat => (
              <Link key={cat.to} to={cat.to}
                className={`group relative bg-gray-900 border border-gray-800 hover:border-red-600/40 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-2xl ${cat.glow} hover:-translate-y-1.5 overflow-hidden`}>
                {/* Hover background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-red-900/0 group-hover:from-red-600/5 group-hover:to-red-900/10 transition-all duration-300" />
                <div className="relative">
                  <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                  <div className="font-black text-gray-300 text-sm group-hover:text-white transition-colors">{cat.label}</div>
                  <div className={`text-[11px] mt-1 transition-colors font-bold ${cat.liveCount > 0 ? 'text-red-400 group-hover:text-red-300' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    {cat.liveCount > 0 ? `${cat.liveCount} إعلان` : 'كن الأول'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURED JOBS
      ══════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gray-900/40 border-y border-red-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-start gap-3">
              <div className="w-1 h-10 bg-gradient-to-b from-red-500 to-red-900 rounded-full mt-0.5" />
              <div>
                <h2 className="text-3xl font-black text-white leading-tight">وظائف مميزة</h2>
                <p className="text-gray-500 text-sm">اختيارات من أبرز شركات الإمارات</p>
              </div>
            </div>
            <Link to="/jobs" className="group flex items-center gap-1.5 text-red-400 hover:text-red-300 font-black transition-all text-sm border border-red-800/40 hover:border-red-500/40 px-4 py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10">
              <span>عرض الكل</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-full px-4 py-1.5 text-xs text-red-400 font-black mb-4 tracking-wider uppercase">
              ✦ لماذا work1m؟
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3">منصة بمستوى مختلف</h2>
            <p className="text-gray-500">سرعة، موثوقية، وتجربة لا مثيل لها</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title}
                className="group relative bg-gray-900 border border-gray-800 hover:border-red-600/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-0.5 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-red-600/0 to-transparent group-hover:via-red-600/30 transition-all duration-300" />
                <div className="w-11 h-11 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-600/15 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-black text-gray-200 text-base mb-2 group-hover:text-white transition-colors">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gray-900/30 border-y border-red-900/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-full px-4 py-1.5 text-xs text-red-400 font-black mb-4 tracking-wider uppercase">
              ✦ كيف يعمل الموقع؟
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">ثلاث خطوات بسيطة</h2>
            <p className="text-gray-500">سجل — انشر — تواصل</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '👤', title: 'أنشئ حسابك', desc: 'سجّل بأي اسم مستخدم وكلمة مرور في أقل من دقيقة — مجاناً تماماً بدون رسوم.' },
              { step: '02', icon: '📝', title: 'أضف إعلانك', desc: 'انشر إعلانك في أي قسم (وظائف، سيارات، عقارات...) مع الصور والتفاصيل.' },
              { step: '03', icon: '📞', title: 'تواصل وأغلق الصفقة', desc: 'يتواصل معك المهتمون مباشرة عبر واتساب أو الهاتف — سريع وسهل.' },
            ].map(s => (
              <div key={s.step} className="relative bg-gray-900 border border-gray-800 hover:border-red-600/30 rounded-2xl p-7 text-center transition-all hover:-translate-y-1">
                <div className="absolute -top-3 right-6 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full">{s.step}</div>
                <div className="text-5xl mb-4">{s.icon}</div>
                <h3 className="font-black text-white text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-l from-red-600 to-red-500 text-white font-black rounded-2xl hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/30 text-base">
              ابدأ الآن — مجاناً <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          VISITOR CTAs (prominent for non-logged-in users)
      ══════════════════════════════════════════════════ */}
      {!user && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/jobs"
                className="group relative overflow-hidden bg-gradient-to-br from-red-950 to-gray-950 border-2 border-red-700/40 hover:border-red-500/70 rounded-3xl p-8 text-white transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/30 hover:-translate-y-1">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full group-hover:bg-red-600/15 transition-colors" />
                <div className="relative">
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-xl font-black mb-2">ابحث عن وظيفة</h3>
                  <p className="text-red-200/50 text-sm mb-4">أكثر من 1,300 فرصة عمل في الإمارات والعالم العربي</p>
                  <span className="inline-flex items-center gap-1.5 text-red-300 text-sm font-bold group-hover:gap-3 transition-all">
                    تصفح الوظائف <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </Link>
              <Link to="/register"
                className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-gray-700/50 hover:border-red-600/50 rounded-3xl p-8 text-white transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-1">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/2 rounded-full" />
                <div className="relative">
                  <div className="text-4xl mb-3">📢</div>
                  <h3 className="text-xl font-black mb-2">انشر إعلانك</h3>
                  <p className="text-gray-400 text-sm mb-4">سجّل وأضف إعلانك مجاناً في دقيقة واحدة</p>
                  <span className="inline-flex items-center gap-1.5 text-red-400 text-sm font-bold group-hover:gap-3 transition-all">
                    سجّل الآن <ArrowLeft className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          TRUST BAND
      ══════════════════════════════════════════════════ */}
      <section className="py-10 px-4 border-t border-red-900/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-sm text-gray-500">
            {[
              { icon: '🔒', text: 'بيانات آمنة ومشفرة' },
              { icon: '🆓', text: 'مجاني 100% — بدون رسوم خفية' },
              { icon: '⚡', text: 'نشر فوري وظهور فوري' },
              { icon: '🌍', text: 'يغطي 15+ دولة عربية' },
              { icon: '📱', text: 'يعمل على جميع الأجهزة' },
            ].map(t => (
              <div key={t.text} className="flex items-center gap-2">
                <span className="text-lg">{t.icon}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA (existing)
      ══════════════════════════════════════════════════ */}
      {!user && (
        <section className="py-20 px-4 border-t border-red-900/10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white mb-2">ابدأ اليوم — مجاناً</h2>
              <p className="text-gray-500">بدون اشتراك · بدون رسوم خفية · بدون تعقيد</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="relative group overflow-hidden bg-gradient-to-br from-red-950 to-gray-950 border border-red-800/40 hover:border-red-600/60 rounded-3xl p-8 text-white transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/30">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-red-600/10 rounded-full group-hover:bg-red-600/15 transition-colors" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-red-800/10 rounded-full" />
                <div className="relative">
                  <div className="text-5xl mb-4">👤</div>
                  <h3 className="text-2xl font-black mb-2">باحث عن عمل؟</h3>
                  <p className="text-red-200/50 mb-6 text-sm leading-relaxed">أنشئ ملفك الشخصي وابدأ رحلتك نحو وظيفة أحلامك بين آلاف الفرص المتاحة.</p>
                  <div className="space-y-2 mb-6">
                    {['تصفح آلاف الوظائف مجاناً', 'ملف شخصي احترافي', 'تقديم بنقرة واحدة'].map(b => (
                      <div key={b} className="flex items-center gap-2 text-xs text-red-300/70">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {b}
                      </div>
                    ))}
                  </div>
                  <Link to="/register?role=seeker"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-700 font-black rounded-xl hover:bg-red-50 transition-colors shadow-lg text-sm">
                    ابدأ الآن مجاناً ←
                  </Link>
                </div>
              </div>

              <div className="relative group overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-700/50 hover:border-red-600/40 rounded-3xl p-8 text-white transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/20">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/2 rounded-full" />
                <div className="relative">
                  <div className="text-5xl mb-4">🏢</div>
                  <h3 className="text-2xl font-black mb-2">صاحب عمل؟</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">انشر إعلاناتك واستقطب أفضل الكفاءات من خلال منصتنا المتكاملة.</p>
                  <div className="space-y-2 mb-6">
                    {['نشر إعلانات مجاناً', 'إدارة المتقدمين بسهولة', 'لوحة تحكم متكاملة'].map(b => (
                      <div key={b} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0 text-red-400" /> {b}
                      </div>
                    ))}
                  </div>
                  <Link to="/register?role=company"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-red-600 to-red-500 text-white font-black rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/20 text-sm">
                    سجّل شركتك ←
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bottom line */}
      <div className="h-px bg-gradient-to-l from-transparent via-red-900/40 to-transparent" />
    </div>
  );
}
