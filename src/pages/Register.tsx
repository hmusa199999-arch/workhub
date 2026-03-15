import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Flame, Loader2, CheckCircle, LockKeyhole, User as UserIcon, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t, isAr } = useLang();

  const [role, setRole] = useState<'seeker' | 'company'>(
    (params.get('role') as 'seeker' | 'company') || 'seeker'
  );
  const [name, setName]             = useState('');
  const [username, setUsername]     = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [phone, setPhone]           = useState('');
  const [gender, setGender]         = useState<'male' | 'female' | ''>('');
  const [targetCountry, setCountry] = useState('');
  const [targetCity, setCity]       = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !username.trim() || !password || !email.trim()) {
      setError(t('الاسم والبريد الإلكتروني واسم المستخدم وكلمة المرور مطلوبة', 'Name, email, username and password are required'));
      return;
    }
    setSubmitting(true);
    try {
      const ok = await register({ name, username, email: email?.trim() || undefined, password, phone: phone || undefined, role, targetCountry, targetCity, cvFileName, gender: gender || undefined });
      setSubmitting(false);
      if (!ok) {
        setError(t('اسم المستخدم مستخدم بالفعل أو خطأ في الحفظ، جرّب اسماً آخر', 'Username taken or save failed, try another username'));
        return;
      }
      navigate(role === 'seeker' ? '/dashboard/seeker' : '/dashboard/company');
    } catch (err) {
      setSubmitting(false);
      setError(t('حدث خطأ في الحفظ. تأكد من اتصال الإنترنت وجرّب مرة أخرى.', 'Save error. Check connection and try again.'));
    }
  };

  const benefitsAr = {
    seeker: ['تصفح آلاف الوظائف', 'ملف شخصي احترافي', 'نشر إعلان باحث عن عمل', 'تقديم سريع'],
    company: ['نشر إعلانات مجاناً', 'إدارة المتقدمين', 'لوحة تحكم متكاملة', 'موافقة فورية'],
  };
  const benefitsEn = {
    seeker: ['Browse 1000s of jobs', 'Professional profile', 'Post job-seeker ads', 'Quick apply'],
    company: ['Post ads for free', 'Manage applicants', 'Full dashboard', 'Instant approval'],
  };
  const benefits = isAr ? benefitsAr[role] : benefitsEn[role];

  const arabCountries = isAr
    ? ['الإمارات', 'السعودية', 'قطر', 'الكويت', 'البحرين', 'عُمان', 'مصر', 'الأردن', 'المغرب', 'تونس', 'الجزائر', 'لبنان', 'العراق', 'سوريا', 'ليبيا', 'اليمن', 'السودان']
    : ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Egypt', 'Jordan', 'Morocco', 'Tunisia', 'Algeria', 'Lebanon', 'Iraq', 'Syria', 'Libya', 'Yemen', 'Sudan'];

  return (
    <div
      className="min-h-[calc(100vh-64px)] bg-gray-950 flex items-center justify-center px-3 py-8 relative overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* BG effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(220,38,38,0.07)_0%,_transparent_60%)]" />
        <div className="absolute -left-32 top-1/4 w-64 h-64 bg-red-600/8 blur-3xl rounded-full" />
        <div className="absolute -right-32 bottom-1/3 w-72 h-72 bg-red-900/15 blur-3xl rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Card */}
        <div className="bg-gray-900 border border-red-900/30 rounded-3xl shadow-2xl shadow-red-900/20 overflow-hidden">

          {/* Header strip */}
          <div className="bg-gradient-to-r from-red-900/60 via-red-800/40 to-red-900/60 px-6 py-5 border-b border-red-900/30">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black text-white">work<span className="text-red-300">1m</span></span>
              </Link>
              <div className={isAr ? 'text-right' : 'text-left'}>
                <p className="text-white font-black text-sm">{t('إنشاء حساب', 'Create Account')}</p>
                <p className="text-red-300/60 text-xs">{t('مجاني تماماً', '100% Free')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7">

            {/* Role toggle */}
            <div className="flex gap-1 p-1 bg-gray-800 border border-gray-700/50 rounded-2xl mb-5">
              {(['seeker', 'company'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-black rounded-xl transition-all ${
                    role === r
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <span>{r === 'seeker' ? '👤' : '🏢'}</span>
                  <span className="text-xs sm:text-sm">
                    {r === 'seeker'
                      ? t('مقيم / باحث عمل', 'Resident / Seeker')
                      : t('شركة / صاحب عمل', 'Company / Employer')
                    }
                  </span>
                </button>
              ))}
            </div>

            {/* Benefits */}
            <div className="mb-5 p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
              <div className="grid grid-cols-2 gap-2">
                {benefits.map(b => (
                  <div key={b} className="flex items-center gap-1.5 text-xs text-red-300/80">
                    <CheckCircle className="w-3.5 h-3.5 text-red-400 shrink-0" /> {b}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {role === 'seeker' ? t('الاسم الكامل', 'Full Name') : t('اسم الشركة', 'Company Name')} *
                </label>
                <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-2xl focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20 transition-all">
                  <UserIcon className="w-4 h-4 text-gray-500 shrink-0" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    placeholder={role === 'seeker' ? t('محمد أحمد', 'Mohammed Ahmed') : t('شركة الأمل', 'Al Amal Company')}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Email - إجباري */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {t('البريد الإلكتروني', 'Email')} *
                </label>
                <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-2xl focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20 transition-all">
                  <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {t('اسم المستخدم', 'Username')} *
                </label>
                <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-2xl focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20 transition-all">
                  <span className="text-gray-500 text-sm font-bold shrink-0">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    placeholder={t('اختر اسم مستخدم فريد', 'Choose a unique username')}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                    autoComplete="new-username"
                    dir="ltr"
                    style={{ textAlign: isAr ? 'right' : 'left' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {t('كلمة المرور', 'Password')} *
                </label>
                <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-2xl focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20 transition-all">
                  <LockKeyhole className="w-4 h-4 text-gray-500 shrink-0" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                    autoComplete="new-password"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-500 hover:text-gray-300 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-500">
                  {t('استخدم أحرف وأرقام ورموز لكلمة مرور قوية', 'Use letters, numbers & symbols for a strong password')}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {t('رقم الهاتف (اختياري)', 'Phone (optional)')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={t('ضع رمز الدولة ثم الرقم', 'Enter country code then number')}
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-white placeholder-gray-600 text-sm transition-all"
                  dir="ltr"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {t('الجنس', 'Gender')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'male',   arLabel: '👨 ذكر',   enLabel: '👨 Male'   },
                    { value: 'female', arLabel: '👩 أنثى',  enLabel: '👩 Female' },
                  ].map(g => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGender(g.value as 'male' | 'female')}
                      className={`py-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                        gender === g.value
                          ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/25'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-gray-200'
                      }`}
                    >
                      {isAr ? g.arLabel : g.enLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">
                    {t('الدولة المفضلة', 'Preferred Country')}
                  </label>
                  <select
                    value={targetCountry}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-red-500 text-sm text-white transition-all"
                  >
                    <option value="">{t('اختر', 'Select')}</option>
                    {arabCountries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">
                    {t('المدينة', 'City')}
                  </label>
                  <input
                    type="text"
                    value={targetCity}
                    onChange={e => setCity(e.target.value)}
                    placeholder={t('دبي، الرياض...', 'Dubai, Riyadh...')}
                    className="w-full px-3 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-red-500 text-white placeholder-gray-600 text-sm transition-all"
                  />
                </div>
              </div>

              {/* CV */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {t('السيرة الذاتية (اختياري)', 'CV / Resume (optional)')}
                </label>
                <label className="flex items-center gap-3 w-full px-4 py-3.5 border-2 border-dashed border-gray-700 rounded-2xl hover:border-red-500/50 hover:bg-red-500/5 cursor-pointer transition-all">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-500">
                      {cvFileName || t('اضغط لرفع ملف PDF أو Word', 'Click to upload PDF or Word')}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      setCvFileName(file ? file.name : '');
                    }}
                  />
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20 flex items-center gap-2">
                  <span className="text-base">⚠️</span> {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-black rounded-2xl hover:from-red-500 hover:to-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-500/25 text-base mt-1"
              >
                {submitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('جاري الإنشاء...', 'Creating...')}</>
                  : t('إنشاء الحساب مجاناً', 'Create Free Account')
                }
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600 font-semibold">{t('لديك حساب؟', 'Have an account?')}</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            <Link
              to={`/login?role=${role}`}
              className="flex items-center justify-center w-full py-3.5 border-2 border-gray-700 hover:border-red-500/50 text-gray-300 hover:text-white font-black rounded-2xl transition-all text-sm hover:bg-gray-800/50"
            >
              {t('تسجيل الدخول', 'Sign In')} →
            </Link>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-600">
              <span className="flex items-center gap-1">🔒 {t('آمن', 'Secure')}</span>
              <span className="flex items-center gap-1">🆓 {t('مجاني', 'Free')}</span>
              <span className="flex items-center gap-1">⚡ {t('فوري', 'Instant')}</span>
            </div>
          </div>
        </div>

        <p className="text-center mt-5 text-xs text-gray-600">
          <Link to="/" className="hover:text-red-400 transition-colors">
            ← {t('العودة للرئيسية', 'Back to Home')}
          </Link>
        </p>
      </div>
    </div>
  );
}
