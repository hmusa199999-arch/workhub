import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Flame, Loader2, CheckCircle, LockKeyhole, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [role, setRole] = useState<'seeker' | 'company'>(
    (params.get('role') as 'seeker' | 'company') || 'seeker'
  );

  const [name, setName]             = useState('');
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [phone, setPhone]           = useState('');
  const [targetCountry, setCountry] = useState('');
  const [targetCity, setCity]       = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !username.trim() || !password) {
      setError('الاسم واسم المستخدم وكلمة المرور مطلوبة');
      return;
    }
    setSubmitting(true);
    const ok = await register({
      name,
      username,
      password,
      phone: phone || undefined,
      role,
      targetCountry,
      targetCity,
      cvFileName,
    });
    setSubmitting(false);
    if (!ok) {
      setError('اسم المستخدم مستخدم بالفعل، اختر اسماً آخر');
      return;
    }
    navigate(role === 'seeker' ? '/dashboard/seeker' : '/dashboard/company');
  };

  const benefits = {
    seeker:  ['تصفح آلاف الوظائف', 'ملف شخصي احترافي', 'تنبيهات فورية', 'تقديم سريع'],
    company: ['نشر إعلانات مجاناً', 'إدارة المتقدمين', 'لوحة تحكم متكاملة', 'موافقة فورية'],
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(220,38,38,0.06)_0%,_transparent_60%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-l from-transparent via-red-500/50 to-transparent" />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">work<span className="text-red-500">1m</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white">إنشاء حساب مجاني</h1>
          <p className="text-gray-500 mt-1 text-sm">بدون اشتراك — ابدأ بحساب وكلمة مرور</p>
        </div>

        <div className="bg-gray-900 border border-red-900/30 rounded-3xl shadow-2xl shadow-red-900/10 p-7 backdrop-blur">
          <div className="h-px bg-gradient-to-l from-transparent via-red-500/40 to-transparent mb-6" />

          {/* Role toggle */}
          <div className="flex gap-1 p-1 bg-gray-800/80 rounded-xl mb-5 border border-gray-700/40">
            {(['seeker', 'company'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  role === r
                    ? 'bg-gradient-to-l from-red-600 to-red-500 text-white shadow-md shadow-red-500/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}>
                {r === 'seeker' ? '👤 مقيم / باحث عمل' : '🏢 شركة / صاحب عمل'}
              </button>
            ))}
          </div>

          {/* Benefits */}
          <div className="mb-5 p-3.5 bg-red-500/5 rounded-xl border border-red-500/10">
            <div className="grid grid-cols-2 gap-1.5">
              {benefits[role].map(b => (
                <div key={b} className="flex items-center gap-1.5 text-xs text-red-300/80">
                  <CheckCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  {b}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                {role === 'seeker' ? 'الاسم الكامل' : 'اسم الشركة'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder={role === 'seeker' ? 'محمد أحمد' : 'شركة الأمل للتقنية'}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-white placeholder-gray-600 text-sm"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">اسم المستخدم *</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="اختر اسم مستخدم فريد"
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                  autoComplete="new-username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">كلمة المرور *</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl">
                <LockKeyhole className="w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                  autoComplete="new-password"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-500">يفضّل استخدام كلمة مرور قوية تحتوي على أحرف وأرقام ورموز.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">رقم الهاتف (اختياري)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+9715..., +2010..., +90..."
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-white placeholder-gray-600 text-sm"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">الدولة المفضلة للعمل</label>
                <select
                  value={targetCountry}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-sm text-white"
                >
                  <option value="">اختر دولة</option>
                  <option value="الإمارات">الإمارات</option>
                  <option value="السعودية">السعودية</option>
                  <option value="قطر">قطر</option>
                  <option value="الكويت">الكويت</option>
                  <option value="البحرين">البحرين</option>
                  <option value="عمان">عُمان</option>
                  <option value="مصر">مصر</option>
                  <option value="الأردن">الأردن</option>
                  <option value="المغرب">المغرب</option>
                  <option value="تونس">تونس</option>
                  <option value="الجزائر">الجزائر</option>
                  <option value="لبنان">لبنان</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">المدينة / الدولة بالتفصيل</label>
                <input
                  type="text"
                  value={targetCity}
                  onChange={e => setCity(e.target.value)}
                  placeholder="مثال: دبي، الرياض، القاهرة..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-white placeholder-gray-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">رفع السيرة الذاتية (اختياري)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => {
                  const file = e.target.files?.[0];
                  setCvFileName(file ? file.name : '');
                }}
                className="w-full text-sm text-gray-400 file:mr-3 file:px-4 file:py-2.5 file:rounded-xl file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
              />
              {cvFileName && (
                <p className="mt-1 text-xs text-gray-500">تم اختيار: {cvFileName}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-l from-red-600 to-red-500 text-white font-black rounded-xl hover:from-red-500 hover:to-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              إنشاء الحساب
            </button>
          </form>

          <div className="h-px bg-gradient-to-l from-transparent via-red-900/20 to-transparent mt-6 mb-4" />

          <p className="text-center text-sm text-gray-600">
            لديك حساب؟{' '}
            <Link to={`/login?role=${role}`} className="text-red-400 font-black hover:text-red-300 transition-colors">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
