import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Flame, Loader2, ShieldCheck, LockKeyhole, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t, isAr } = useLang();

  const [role, setRole] = useState<'seeker' | 'company'>(
    (params.get('role') as 'seeker' | 'company') || 'seeker'
  );
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const isAdminCreds = username === 'admin3616116Aa@@';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError(t('أدخل اسم المستخدم أو البريد وكلمة المرور', 'Please enter username/email and password'));
      return;
    }
    setSubmitting(true);
    const ok = await login({ username, password });
    setSubmitting(false);
    if (!ok) {
      setError(t('بيانات الدخول غير صحيحة', 'Invalid username or password'));
      return;
    }
    if (isAdminCreds) navigate('/dashboard/admin');
    else navigate(role === 'seeker' ? '/dashboard/seeker' : '/dashboard/company');
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] bg-gray-950 flex items-center justify-center px-3 py-8 relative overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* BG effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.10),_transparent_60%)]" />
        <div className="absolute -left-32 top-1/3 w-72 h-72 bg-red-600/8 blur-3xl rounded-full" />
        <div className="absolute -right-32 bottom-1/4 w-80 h-80 bg-red-900/20 blur-3xl rounded-full" />
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
                <span className="text-xl font-black text-white">
                  work<span className="text-red-300">1m</span>
                </span>
              </Link>
              <div className="text-right">
                <p className="text-white font-black text-sm">{t('مرحباً بعودتك', 'Welcome back')}</p>
                <p className="text-red-300/60 text-xs">{t('سجّل دخولك للمتابعة', 'Sign in to continue')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">

            {/* Role toggle */}
            {!isAdminCreds && (
              <div className="flex gap-1 p-1 bg-gray-800 border border-gray-700/50 rounded-2xl mb-6">
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
                    <span>{r === 'seeker'
                      ? t('مقيم / باحث', 'Resident / Seeker')
                      : t('شركة', 'Company')
                    }</span>
                  </button>
                ))}
              </div>
            )}

            {/* Admin indicator */}
            {isAdminCreds && (
              <div className="flex items-center gap-3 mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-sm font-black text-amber-300">{t('دخول المدير', 'Admin Login')}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

              {/* Username or Email */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {t('اسم المستخدم أو البريد الإلكتروني', 'Username or Email')}
                </label>
                <div className={`flex items-center gap-3 px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-2xl focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20 transition-all`}>
                  <UserIcon className="w-4 h-4 text-gray-500 shrink-0" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    placeholder={t('اسم المستخدم أو example@gmail.com', 'Username or example@gmail.com')}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                    autoFocus
                    autoComplete="username"
                    dir="ltr"
                    style={{ textAlign: isAr ? 'right' : 'left' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {t('كلمة المرور', 'Password')}
                </label>
                <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-800 border border-gray-700 rounded-2xl focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20 transition-all">
                  <LockKeyhole className="w-4 h-4 text-gray-500 shrink-0" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                    autoComplete="current-password"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-gray-500 hover:text-gray-300 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-black rounded-2xl hover:from-red-500 hover:to-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-500/25 hover:shadow-red-500/35 text-base mt-2"
              >
                {submitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> {t('جاري الدخول...', 'Signing in...')}</>
                  : t('تسجيل الدخول', 'Sign In')
                }
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600 font-semibold">{t('أو', 'OR')}</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Register link */}
            <Link
              to={`/register?role=${role}`}
              className="flex items-center justify-center w-full py-3.5 border-2 border-gray-700 hover:border-red-500/50 text-gray-300 hover:text-white font-black rounded-2xl transition-all text-sm hover:bg-gray-800/50"
            >
              {t('إنشاء حساب جديد مجاناً', 'Create a free account')} →
            </Link>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-600">
              <span className="flex items-center gap-1">🔒 {t('آمن ومشفر', 'Secure')}</span>
              <span className="flex items-center gap-1">🆓 {t('مجاني', 'Free')}</span>
              <span className="flex items-center gap-1">⚡ {t('فوري', 'Instant')}</span>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <p className="text-center mt-5 text-xs text-gray-600">
          <Link to="/" className="hover:text-red-400 transition-colors">
            ← {t('العودة للرئيسية', 'Back to Home')}
          </Link>
        </p>
      </div>
    </div>
  );
}
