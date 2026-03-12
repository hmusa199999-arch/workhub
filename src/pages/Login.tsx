import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Flame, Loader2, ShieldCheck, LockKeyhole, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [role, setRole] = useState<'seeker' | 'company'>(
    (params.get('role') as 'seeker' | 'company') || 'seeker'
  );

  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [phone, setPhone]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  const isAdminCreds = username === 'admin3616116Aa@@';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('أدخل اسم المستخدم وكلمة المرور');
      return;
    }
    setSubmitting(true);
    const ok = await login({ username, password });
    setSubmitting(false);
    if (!ok) {
      setError('بيانات الدخول غير صحيحة');
      return;
    }
    if (isAdminCreds) {
      navigate('/dashboard/admin');
    } else {
      navigate(role === 'seeker' ? '/dashboard/seeker' : '/dashboard/company');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Animated background intro */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.12),_transparent_65%)] animate-pulse-slow" />
        <div className="absolute -left-40 top-1/3 w-80 h-80 bg-red-600/10 blur-3xl rounded-full animate-float-slow" />
        <div className="absolute -right-40 bottom-0 w-96 h-96 bg-red-900/40 blur-3xl rounded-full animate-float-slow delay-150" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-px bg-gradient-to-l from-transparent via-red-500/60 to-transparent" />
      </div>

      <div className="w-full max-w-5xl relative z-10 flex flex-col lg:flex-row items-stretch gap-10">

        {/* Intro panel */}
        <div className="hidden lg:flex flex-1 flex-col justify-center text-right pr-4 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 self-start lg:self-end">
            <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/40">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white">
              وورك<span className="text-red-400">هب</span>
            </span>
          </Link>
          <h1 className="text-3xl xl:text-4xl font-black text-white mb-4 leading-snug">
            بوابتك الذكية<br />للإعلانات والوظائف في العالم العربي
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md self-start lg:self-end">
            ادخل لوحة التحكم الخاصة بك كـ باحث أو شركة وابدأ بنشر الوظائف والإعلانات خلال ثوانٍ،
            مع تجربة مبسّطة وسريعة بالكامل باللغة العربية.
          </p>
          <div className="flex flex-wrap justify-start lg:justify-end gap-3 text-xs">
            <div className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 font-semibold">
              تسجيل مجاني 100%
            </div>
            <div className="px-3 py-2 rounded-xl bg-gray-900/70 border border-red-900/40 text-gray-300">
              لوحة تحكم للباحثين والشركات
            </div>
            <div className="px-3 py-2 rounded-xl bg-gray-900/70 border border-red-900/40 text-gray-300">
              إعلانات سيارات، عقار، خدمات، أرقام
            </div>
          </div>
        </div>

        {/* Login card */}
        <div className="flex-1 max-w-lg mx-auto bg-gray-900/95 border border-red-900/40 rounded-3xl shadow-2xl shadow-red-900/40 p-7 lg:p-8 backdrop-blur-xl animate-fade-in-up delay-100">
          {/* Top glow line */}
          <div className="flex lg:hidden items-center justify-center mb-5">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">
                وورك<span className="text-red-400">هب</span>
              </span>
            </Link>
          </div>
          <div className="h-px bg-gradient-to-l from-transparent via-red-500/40 to-transparent mb-5" />
          {/* Role toggle */}
          {!isAdminCreds && (
            <div className="flex gap-1 p-1 bg-gray-800/80 rounded-xl mb-5 border border-gray-700/40">
              {(['seeker', 'company'] as const).map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    role === r
                      ? 'bg-gradient-to-l from-red-600 to-red-500 text-white shadow-md shadow-red-500/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}>
                  {r === 'seeker' ? '👤 مقيم / باحث' : '🏢 شركة'}
                </button>
              ))}
            </div>
          )}

          {/* Admin indicator */}
          {isAdminCreds && (
            <div className="flex items-center gap-3 mb-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-sm font-black text-amber-300">دخول المدير</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4" autoComplete="off">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">اسم المستخدم</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="اسم المستخدم"
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">كلمة المرور</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl">
                <LockKeyhole className="w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">رقم الهاتف (اختياري)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="للتواصل السريع"
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 text-white placeholder-gray-600 text-sm"
                dir="ltr"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-l from-red-600 to-red-500 text-white font-black rounded-xl hover:from-red-500 hover:to-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              دخول
            </button>
          </form>

          <div className="h-px bg-gradient-to-l from-transparent via-red-900/20 to-transparent mt-6 mb-4" />

          <p className="text-center text-sm text-gray-600">
            ليس لديك حساب؟{' '}
            <Link to={`/register?role=${role}`} className="text-red-400 font-black hover:text-red-300 transition-colors">
              إنشاء حساب مجاناً
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
