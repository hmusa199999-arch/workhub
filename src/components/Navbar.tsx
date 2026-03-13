import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard, Flame, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const mainLinks = [
  { to: '/jobs', label: 'وظائف', icon: '💼' },
  { to: '/cars', label: 'سيارات', icon: '🚗' },
  { to: '/real-estate', label: 'عقارات', icon: '🏡' },
  { to: '/services', label: 'خدمات', icon: '🛠️' },
  { to: '/car-plates', label: 'أرقام', icon: '🚘' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gray-950 border-b border-red-900/40 sticky top-0 z-50 backdrop-blur-xl">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-l from-transparent via-red-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-shadow">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              work<span className="text-red-500">1m</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <button className="relative p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                </button>
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 pl-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-red-900/40 transition-all">
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-gray-200 leading-tight">{user.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-red-400 font-semibold">{user.role === 'admin' ? '🛡️ مدير' : user.role === 'seeker' ? 'باحث عمل' : 'شركة'}</div>
                    </div>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-xl object-cover border-2 border-red-500/40" />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-500/20">
                        {user.name[0]}
                      </div>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute left-0 mt-2 w-52 bg-gray-900 border border-red-900/40 rounded-2xl shadow-2xl shadow-black/50 py-1.5 z-50 overflow-hidden">
                      <div className="h-px bg-gradient-to-l from-transparent via-red-500/30 to-transparent mb-1" />
                      <Link
                        to={user.role === 'admin' ? '/dashboard/admin' : user.role === 'seeker' ? '/dashboard/seeker' : '/dashboard/company'}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-red-600/10 transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-red-400" />
                        لوحة التحكم
                      </Link>
                      <Link
                        to={user.role === 'seeker' ? '/dashboard/seeker#profile' : user.role === 'company' ? '/dashboard/company#profile' : '/dashboard/admin'}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-red-600/10 transition-colors">
                        <User className="w-4 h-4 text-red-400" />
                        الملف الشخصي
                      </Link>
                      <div className="my-1 h-px bg-red-900/30" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-600/10 transition-colors">
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                  دخول
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-l from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40">
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Language Toggle */}
            <div className="flex items-center gap-0.5 p-1 bg-gray-900 border border-gray-700/60 rounded-xl">
              <button
                onClick={() => setLang('ar')}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-black rounded-lg transition-all ${lang === 'ar' ? 'bg-red-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                title="العربية"
              >
                <Globe className="w-3 h-3" /> AR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-black rounded-lg transition-all ${lang === 'en' ? 'bg-red-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-red-900/30 py-3 space-y-0.5">
            {mainLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  isActive(link.to) ? 'bg-red-600/20 text-red-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setMenuOpen(false)}>
                <span>{link.icon}</span> {link.label}
              </Link>
            ))}
            <div className="h-px bg-red-900/30 my-2" />
            {!user ? (
              <>
                <Link to="/login" className="block px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl" onClick={() => setMenuOpen(false)}>تسجيل الدخول</Link>
                <Link to="/register" className="block px-4 py-2.5 text-sm font-bold text-white bg-red-600/20 text-red-400 rounded-xl" onClick={() => setMenuOpen(false)}>إنشاء حساب</Link>
              </>
            ) : (
              <>
                <Link to={user.role === 'admin' ? '/dashboard/admin' : user.role === 'seeker' ? '/dashboard/seeker' : '/dashboard/company'}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                  onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> لوحة التحكم
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full text-right flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-600/10 rounded-xl">
                  <LogOut className="w-4 h-4" /> تسجيل الخروج
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
