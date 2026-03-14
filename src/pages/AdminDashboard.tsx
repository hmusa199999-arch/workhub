import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, ShieldCheck, CheckCircle,
  XCircle, Trash2, BarChart3, Bell, LogOut, Search,
  Building2, AlertCircle, Send, TrendingUp, Monitor, Smartphone,
  Tablet, Eye, RefreshCw, Ban, UserCheck, Phone, Mail, Globe,
  Download, ClipboardList, Image as ImageIcon, Megaphone, Plus,
  Pencil, ToggleLeft, ToggleRight, Video, Type,
} from 'lucide-react';
import {
  addBanner as addBannerAd,
  updateBannerInDB as updateBannerAd, deleteBannerFromDB as deleteBannerAd,
  subscribeToAllBanners,
  type BannerAd,
} from '../utils/supabaseBanners';
import { useAuth } from '../context/AuthContext';
import { useApplications } from '../context/ApplicationsContext';
import { mockJobs } from '../data/mockData';
import {
  getAnalytics, getUsersDB, saveUsersDB,
  type UserRecord,
} from '../utils/analytics';
import { subscribeToUsers, updateUserInDB, deleteUserFromDB } from '../utils/supabaseUsers';
import {
  getAllAdsAdmin, updateAdStatus, deleteAd, getAdLabel, getCategoryLabel,
  type StoredAd,
} from '../utils/adsStore';
import { subscribeToAds, updateAdStatus as updateAdStatusCloud, deleteAd as deleteAdCloud, saveAd as saveAdCloud, type FirestoreAd } from '../utils/supabaseAds';
import type { ApplicationStatus } from '../types';

// ─── Sidebar Tabs ───────────────────────────────────────────────────────
const tabs = [
  { id: 'overview',      label: 'نظرة عامة',        icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'analytics',     label: 'الزوار',            icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'approvals',     label: 'الطلبات',           icon: <Send className="w-4 h-4" /> },
  { id: 'ads',           label: 'المعاملات',         icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'banners',       label: 'إعلانات الصفحة',    icon: <Megaphone className="w-4 h-4" /> },
  { id: 'customers',     label: 'قاعدة العملاء',     icon: <Users className="w-4 h-4" /> },
  { id: 'jobs',          label: 'الوظائف',           icon: <Briefcase className="w-4 h-4" /> },
  { id: 'companies',     label: 'الشركات',           icon: <Building2 className="w-4 h-4" /> },
];

// لا توجد شركات افتراضية في لوحة الإدارة — تُملأ عند الاستخدام الحقيقي
const mockCompanies: any[] = [];

// ─── Mini Bar Chart ─────────────────────────────────────────────────────
function BarChart({ data, maxVal, color = 'bg-red-500' }: {
  data: { label: string; value: number }[];
  maxVal: number;
  color?: string;
}) {
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
            <div
              className={`w-full ${color} rounded-t-md transition-all duration-500`}
              style={{ height: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%`, minHeight: d.value > 0 ? 4 : 0 }}
            />
          </div>
          <span className="text-[9px] text-gray-400 text-center leading-tight">{d.label}</span>
          <span className="text-[10px] font-bold text-gray-600">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Ad status badge config ─────────────────────────────────────────────
const adStatusConfig: Record<StoredAd['status'], { label: string; color: string }> = {
  pending:  { label: 'بانتظار الموافقة', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'معتمد',            color: 'bg-green-100 text-green-700' },
  rejected: { label: 'مرفوض',            color: 'bg-red-100 text-red-600' },
};

// ─── Status badge ───────────────────────────────────────────────────────
const appStatusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  pending_approval: { label: 'انتظار موافقة', color: 'bg-amber-100 text-amber-700' },
  approved:         { label: 'معتمد',          color: 'bg-red-100 text-red-700' },
  pending:          { label: 'قيد المراجعة',   color: 'bg-gray-100 text-gray-600' },
  reviewed:         { label: 'تمت المراجعة',   color: 'bg-indigo-100 text-indigo-700' },
  interview:        { label: 'مقابلة',          color: 'bg-purple-100 text-purple-700' },
  accepted:         { label: 'مقبول',           color: 'bg-green-100 text-green-700' },
  rejected:         { label: 'مرفوض',           color: 'bg-red-100 text-red-600' },
};

// ─── Component ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { applications, updateStatus, getPendingApproval } = useApplications();

  const [activeTab, setActiveTab] = useState('overview');
  const [jobList, setJobList] = useState(mockJobs);
  const [usersDB, setUsersDB] = useState<UserRecord[]>([]);
  const [analytics, setAnalytics] = useState(getAnalytics());
  const [appFilter, setAppFilter] = useState<'all' | ApplicationStatus>('all');
  const [appSearch, setAppSearch] = useState('');
  const [custSearch, setCustSearch] = useState('');
  const [custRoleFilter, setCustRoleFilter] = useState<'all' | 'seeker' | 'company'>('all');
  const [custStatusFilter, setCustStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [jobSearch, setJobSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [adsData, setAdsData] = useState<StoredAd[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [adsFilter, setAdsFilter] = useState<'all' | StoredAd['status']>('all');
  const [adsCatFilter, setAdsCatFilter] = useState<'all' | StoredAd['category']>('all');
  const [adsSearch, setAdsSearch] = useState('');

  // ── Banners ──
  const [bannerAds, setBannerAds] = useState<BannerAd[]>([]);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerAd | null>(null);
  const [bannerForm, setBannerForm] = useState({
    type: 'youtube' as BannerAd['type'],
    title: '',
    subtitle: '',
    link: '',
    bgColor: '#7f1d1d',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    duration: 5,
    order: 1,
    active: true,
    mediaData: '',
    mediaUrl: '',
  });
  const bannerFileRef = useRef<HTMLInputElement>(null);

  const pendingApprovals = getPendingApproval();
  const pendingAds = adsData.filter(a => a.status === 'pending');

  useEffect(() => {
    setUsersDB(getUsersDB());
    setAnalytics(getAnalytics());
    setAdsData(getAllAdsAdmin());
  }, [refreshKey]);

  // Real-time banners from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAllBanners(setBannerAds);
    return unsubscribe;
  }, []);

  // Real-time ads from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAds((cloudAds: FirestoreAd[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAdsData(cloudAds as any as StoredAd[]);
      setLastSync(new Date());
      setIsConnected(true);
    });
    return unsubscribe;
  }, []);

  // Real-time users from Firebase
  useEffect(() => {
    const unsubscribe = subscribeToUsers((cloudUsers) => {
      const converted: UserRecord[] = cloudUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email || `${u.username}@work1m`,
        phone: u.phone,
        role: (u.role === 'admin' ? 'seeker' : u.role) as 'seeker' | 'company',
        loginMethod: 'phone' as const,
        status: (u.status || 'active') as 'active' | 'banned',
        registeredAt: u.createdAt || new Date().toISOString(),
        lastLogin: (u.lastLogin as string) || u.createdAt || new Date().toISOString(),
        createdAt: u.createdAt || new Date().toISOString(),
        lastSeen: (u.lastLogin as string) || u.createdAt || new Date().toISOString(),
        pageViews: 0,
        sessionsCount: 0,
      }));
      setUsersDB(converted);
      setLastSync(new Date());
    });
    return unsubscribe;
  }, []);

  const openBannerForm = (b?: BannerAd) => {
    if (b) {
      setEditingBanner(b);
      setBannerForm({
        type: b.type,
        title: b.title,
        subtitle: b.subtitle || '',
        link: b.link || '',
        bgColor: b.bgColor || '#7f1d1d',
        startDate: b.startDate,
        endDate: b.endDate,
        duration: b.duration,
        order: b.order,
        active: b.active,
        mediaData: b.mediaData || '',
        mediaUrl: b.mediaUrl || '',
      });
    } else {
      setEditingBanner(null);
      setBannerForm({
        type: 'image',
        title: '',
        subtitle: '',
        link: '',
        bgColor: '#7f1d1d',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        duration: 5,
        order: bannerAds.length + 1,
        active: true,
        mediaData: '',
        mediaUrl: '',
      });
    }
    setShowBannerForm(true);
  };

  const handleBannerMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBannerForm(f => ({ ...f, mediaData: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const saveBanner = async () => {
    if (!bannerForm.title.trim() || !bannerForm.endDate) return;

    try {
      if (editingBanner) {
        await updateBannerAd(editingBanner.id, { ...bannerForm });
      } else {
        await addBannerAd({ ...bannerForm, createdAt: new Date().toISOString() });
      }
      setShowBannerForm(false);
      // bannerAds state updates automatically via subscribeToAllBanners
    } catch (error) {
      console.error('Failed to save banner:', error);
      alert('حدث خطأ، تحقق من الاتصال بالإنترنت');
    }
  };

  const toggleBannerActive = (id: string, active: boolean) => {
    updateBannerAd(id, { active }).catch(console.error);
  };

  const handleDeleteBanner = (id: string) => {
    deleteBannerAd(id).catch(console.error);
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  // ── helpers ──────────────────────────────────────────────────────────
  const toggleJobStatus = (id: string) =>
    setJobList(prev => prev.map(j => j.id === id ? { ...j, isActive: !j.isActive } : j));

  const deleteJob = (id: string) =>
    setJobList(prev => prev.filter(j => j.id !== id));

  const toggleUserStatus = (id: string) => {
    const target = usersDB.find(u => u.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'banned' as const : 'active' as const;
    // Update locally for instant UI feedback
    const updated = usersDB.map(u => u.id === id ? { ...u, status: newStatus } : u);
    saveUsersDB(updated);
    setUsersDB(updated);
    // Persist in Firebase
    updateUserInDB(id, { status: newStatus }).catch(console.error);
  };

  const deleteUser = (id: string) => {
    const updated = usersDB.filter(u => u.id !== id);
    saveUsersDB(updated);
    setUsersDB(updated);
    // Delete from Firebase
    deleteUserFromDB(id).catch(console.error);
  };

  const handleAdStatus = async (id: string, status: StoredAd['status']) => {
    // Optimistic UI update
    setAdsData(prev => prev.map(a => a.id === id ? { ...a, status } : a));

    try {
      await updateAdStatusCloud(id, status as 'approved' | 'rejected');
    } catch {
      // Ad not in Firebase yet — save the full ad first, then it will appear via real-time listener
      const localAd = adsData.find(a => a.id === id) || getAllAdsAdmin().find(a => a.id === id);
      if (localAd) {
        try {
          await saveAdCloud({ ...localAd, status });
        } catch (err) {
          console.error('Failed to save ad to Firebase:', err);
        }
      }
    }
    // Also update localStorage for legacy
    updateAdStatus(id, status);
  };

  const handleDeleteAd = async (id: string) => {
    // Optimistic UI update
    setAdsData(prev => prev.filter(a => a.id !== id));
    deleteAd(id); // localStorage
    try {
      await deleteAdCloud(id);
    } catch (err) {
      console.error('Delete from Firebase failed:', err);
    }
  };

  const exportCustomersCSV = () => {
    const headers = ['الاسم', 'الجنس', 'رقم الهاتف', 'البريد الإلكتروني', 'الدولة', 'المدينة', 'الدور', 'الحالة', 'تاريخ التسجيل'];
    const rows = filteredCustomers.map(u => {
      const cu = u as typeof u & { gender?: string; targetCountry?: string; targetCity?: string };
      return [
        u.name,
        cu.gender === 'male' ? 'ذكر' : cu.gender === 'female' ? 'أنثى' : '',
        u.phone || '',
        u.email || '',
        cu.targetCountry || '',
        cu.targetCity || '',
        u.role === 'company' ? 'شركة' : 'باحث عمل',
        u.status === 'active' ? 'نشط' : 'محظور',
        new Date(u.registeredAt).toLocaleDateString('ar-AE'),
      ];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work1m_customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── filtered lists ────────────────────────────────────────────────────
  const filteredApps = applications.filter(a => {
    const matchFilter = appFilter === 'all' || a.status === appFilter;
    const matchSearch = !appSearch ||
      a.seekerName.includes(appSearch) ||
      a.jobTitle.includes(appSearch) ||
      a.companyName.includes(appSearch) ||
      a.seekerPhone?.includes(appSearch);
    return matchFilter && matchSearch;
  });

  const filteredCustomers = usersDB.filter(u => {
    const matchRole = custRoleFilter === 'all' || u.role === custRoleFilter;
    const matchStatus = custStatusFilter === 'all' || u.status === custStatusFilter;
    const matchSearch = !custSearch ||
      u.name.includes(custSearch) ||
      u.email.includes(custSearch) ||
      (u.phone || '').includes(custSearch);
    return matchRole && matchStatus && matchSearch;
  });

  const filteredJobs = jobList.filter(j =>
    !jobSearch || j.title.includes(jobSearch) || j.companyName.includes(jobSearch)
  );

  const filteredAds = adsData.filter(a => {
    const matchStatus = adsFilter === 'all' || a.status === adsFilter;
    const matchCat = adsCatFilter === 'all' || a.category === adsCatFilter;
    const label = getAdLabel(a).toLowerCase();
    const matchSearch = !adsSearch || label.includes(adsSearch) || a.name.includes(adsSearch) || a.phone.includes(adsSearch);
    return matchStatus && matchCat && matchSearch;
  });

  // ── analytics derived ────────────────────────────────────────────────
  const { last7, topPages, devices, todayVisits, todaySessions, totalVisits, totalSessions } = analytics;
  const maxVisits = Math.max(...last7.map(d => d.visits), 1);
  const totalDevices = devices.mobile + devices.desktop + devices.tablet || 1;

  const loginMethodCounts = { email: 0, phone: 0, google: 0 };
  usersDB.forEach(u => { loginMethodCounts[u.loginMethod]++; });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col hidden lg:flex">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-red-900/40">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">لوحة الإدارة</div>
              <div className="text-xs text-gray-500">work1m</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-right ${activeTab === tab.id ? 'bg-gradient-to-l from-red-700 to-red-600 text-white shadow-lg shadow-red-900/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              {tab.icon}
              {tab.label}
              {tab.id === 'approvals' && pendingApprovals.length > 0 && (
                <span className="mr-auto w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                  {pendingApprovals.length}
                </span>
              )}
              {tab.id === 'ads' && pendingAds.length > 0 && (
                <span className="mr-auto w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {pendingAds.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Admin info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-sm shrink-0">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-xs text-amber-400">مدير النظام</div>
            </div>
          </div>
          {user.phone && (
            <a
              href={`tel:${user.phone}`}
              className="flex items-center gap-2 px-3 py-1.5 mb-2 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span dir="ltr" className="tracking-wide">{user.phone}</span>
            </a>
          )}
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-400" />
            <span className="font-bold text-sm">لوحة الإدارة</span>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="p-2 text-gray-400 hover:text-red-400">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden flex gap-1 px-3 py-2 bg-gray-900 border-b border-gray-800 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
              {tab.icon}{tab.label}
              {tab.id === 'approvals' && pendingApprovals.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingApprovals.length}
                </span>
              )}
              {tab.id === 'ads' && pendingAds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingAds.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-gray-500 text-xs">
                {new Date().toLocaleDateString('ar-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {/* Real-time indicator */}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                {isConnected ? 'مباشر' : 'غير متصل'}
              </div>
              {lastSync && (
                <p className="text-gray-600 text-[10px]">
                  آخر تحديث: {lastSync.toLocaleTimeString('ar-AE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setRefreshKey(k => k + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> تحديث
            </button>
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {pendingApprovals.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ══════ OVERVIEW ══════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Pending banner */}
              {pendingApprovals.length > 0 && (
                <button onClick={() => setActiveTab('approvals')}
                  className="w-full text-right flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl hover:bg-amber-500/20 transition-colors">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-amber-400">{pendingApprovals.length} طلب توظيف بانتظار موافقتك</p>
                    <p className="text-xs text-amber-500/80 mt-0.5">اضغط لمراجعتها</p>
                  </div>
                  <span className="text-amber-400 text-sm font-semibold">مراجعة الآن ←</span>
                </button>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'زيارات اليوم',      value: todayVisits,      sub: `${todaySessions} جلسة`, icon: <Globe className="w-5 h-5" />,    color: 'text-red-400',    bg: 'bg-red-500/10' },
                  { label: 'إجمالي المستخدمين', value: usersDB.length,   sub: `${usersDB.filter(u=>u.role==='seeker').length} باحث`, icon: <Users className="w-5 h-5" />,    color: 'text-rose-400',   bg: 'bg-rose-500/10' },
                  { label: 'وظائف نشطة',        value: jobList.filter(j=>j.isActive).length, sub: `${jobList.length} إجمالي`, icon: <Briefcase className="w-5 h-5" />, color: 'text-green-400',  bg: 'bg-green-500/10' },
                  { label: 'معاملات معلقة',     value: pendingApprovals.length + pendingAds.length, sub: `${pendingAds.length} إعلان / ${pendingApprovals.length} طلب`, icon: <Send className="w-5 h-5" />, color: (pendingApprovals.length + pendingAds.length) > 0 ? 'text-amber-400' : 'text-gray-400', bg: (pendingApprovals.length + pendingAds.length) > 0 ? 'bg-amber-500/10' : 'bg-gray-700' },
                ].map(card => (
                  <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                      {card.icon}
                    </div>
                    <div className="text-2xl font-bold text-white">{card.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{card.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{card.sub}</div>
                  </div>
                ))}
              </div>

              {/* Visits chart + top pages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm">الزيارات — آخر 7 أيام</h3>
                    <span className="text-xs text-gray-500">{totalVisits} إجمالي</span>
                  </div>
                  <BarChart
                    data={last7.map(d => ({ label: d.label, value: d.visits }))}
                    maxVal={maxVisits}
                    color="bg-red-500"
                  />
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold text-sm mb-4">أكثر الصفحات زيارة</h3>
                  <div className="space-y-2.5">
                    {topPages.slice(0, 5).map((p, i) => (
                      <div key={p.page} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-300 truncate">{p.label}</div>
                          <div className="h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${(p.count / (topPages[0]?.count || 1)) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{p.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent registrations */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">آخر المسجلين</h3>
                  <button onClick={() => setActiveTab('customers')} className="text-xs text-red-400 hover:underline">عرض الكل</button>
                </div>
                <div className="space-y-2">
                  {[...usersDB].reverse().slice(0, 5).map(u => (
                    <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'company' ? 'bg-rose-500/20 text-rose-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.role === 'company' ? 'شركة' : 'باحث'}
                      </span>
                      <span className="text-xs text-gray-600">{new Date(u.registeredAt).toLocaleDateString('ar-AE')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════ ANALYTICS ══════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Top KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'إجمالي الزيارات',   value: totalVisits,   icon: <Eye className="w-5 h-5" />,        color: 'text-red-400',    bg: 'bg-red-500/10' },
                  { label: 'إجمالي الجلسات',    value: totalSessions, icon: <Globe className="w-5 h-5" />,      color: 'text-green-400',  bg: 'bg-green-500/10' },
                  { label: 'زيارات اليوم',       value: todayVisits,   icon: <TrendingUp className="w-5 h-5" />, color: 'text-rose-400',   bg: 'bg-rose-500/10' },
                  { label: 'جلسات اليوم',        value: todaySessions, icon: <Users className="w-5 h-5" />,      color: 'text-amber-400',  bg: 'bg-amber-500/10' },
                ].map(c => (
                  <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3 ${c.color}`}>{c.icon}</div>
                    <div className="text-3xl font-black text-white">{c.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Visits chart */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold">الزيارات اليومية — آخر 7 أيام</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />زيارات</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />جلسات</span>
                  </div>
                </div>
                <div className="flex items-end gap-2 h-40">
                  {last7.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end gap-0.5" style={{ height: '120px' }}>
                        <div className="flex-1 bg-red-500 rounded-t transition-all"
                          style={{ height: `${maxVisits > 0 ? (d.visits / maxVisits) * 100 : 0}%`, minHeight: d.visits > 0 ? 3 : 0 }} />
                        <div className="flex-1 bg-rose-400 rounded-t transition-all"
                          style={{ height: `${maxVisits > 0 ? (d.sessions / maxVisits) * 100 : 0}%`, minHeight: d.sessions > 0 ? 3 : 0 }} />
                      </div>
                      <span className="text-[9px] text-gray-400">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Top pages */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold mb-4">أكثر الصفحات زيارة</h3>
                  <div className="space-y-3">
                    {topPages.map((p, i) => (
                      <div key={p.page} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-gray-800 text-gray-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-300">{p.label}</span>
                            <span className="text-xs text-gray-500 font-mono">{p.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-l from-red-500 to-rose-400 rounded-full"
                              style={{ width: `${(p.count / (topPages[0]?.count || 1)) * 100}%` }} />
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">
                          {topPages[0]?.count > 0 ? Math.round((p.count / topPages[0].count) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Devices */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold mb-4">الأجهزة</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'جهاز مكتبي', icon: <Monitor className="w-4 h-4" />, val: devices.desktop, color: 'bg-red-500' },
                      { label: 'جوال',        icon: <Smartphone className="w-4 h-4" />, val: devices.mobile,  color: 'bg-green-500' },
                      { label: 'تابلت',       icon: <Tablet className="w-4 h-4" />, val: devices.tablet,  color: 'bg-rose-400' },
                    ].map(d => (
                      <div key={d.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            {d.icon} {d.label}
                          </div>
                          <span className="text-xs text-gray-500">{Math.round((d.val / totalDevices) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${d.color} rounded-full`} style={{ width: `${(d.val / totalDevices) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-800">
                    <h4 className="text-xs font-semibold text-gray-400 mb-3">طريقة التسجيل</h4>
                    {[
                      { label: 'بريد إلكتروني', val: loginMethodCounts.email,  color: 'bg-gray-500' },
                      { label: 'رقم الهاتف',    val: loginMethodCounts.phone,  color: 'bg-green-500' },
                      { label: 'Google',         val: loginMethodCounts.google, color: 'bg-red-500' },
                    ].map(m => (
                      <div key={m.label} className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${m.color} shrink-0`} />
                        <span className="text-xs text-gray-400 flex-1">{m.label}</span>
                        <span className="text-xs font-bold text-gray-300">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════ APPROVALS ══════ */}
          {activeTab === 'approvals' && (
            <div className="space-y-5">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={appSearch} onChange={e => setAppSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو الوظيفة..."
                    className="w-full pr-9 pl-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div className="flex gap-1 p-1 bg-gray-900 border border-gray-700 rounded-xl flex-wrap">
                  {[
                    { val: 'all', label: `الكل (${applications.length})` },
                    { val: 'pending_approval', label: `معلق (${pendingApprovals.length})` },
                    { val: 'approved', label: 'معتمد' },
                    { val: 'rejected', label: 'مرفوض' },
                  ].map(f => (
                    <button key={f.val} onClick={() => setAppFilter(f.val as typeof appFilter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${appFilter === f.val ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'بانتظار الموافقة', val: pendingApprovals.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                  { label: 'معتمدة', val: applications.filter(a=>a.status==='approved').length, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                  { label: 'مرفوضة', val: applications.filter(a=>a.status==='rejected').length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                ].map(s => (
                  <div key={s.label} className={`border rounded-xl p-3 text-center ${s.bg}`}>
                    <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {filteredApps.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
                  <Send className="w-14 h-14 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-400">لا توجد طلبات</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredApps.map(app => (
                    <div key={app.id}
                      className={`bg-gray-900 border rounded-2xl p-5 transition-colors ${app.status === 'pending_approval' ? 'border-amber-500/40' : 'border-gray-800'}`}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-bold shrink-0">
                            {app.seekerName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white">{app.seekerName}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                              <Mail className="w-3 h-3" /> {app.seekerEmail}
                              {app.seekerPhone && <><Phone className="w-3 h-3 mr-1" /> <span dir="ltr">{app.seekerPhone}</span></>}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold shrink-0 ${appStatusConfig[app.status].color}`}>
                          {appStatusConfig[app.status].label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm bg-gray-800/50 rounded-xl p-3">
                        <div><span className="text-gray-500 text-xs">الوظيفة:</span><p className="text-white font-medium">{app.jobTitle}</p></div>
                        <div><span className="text-gray-500 text-xs">الشركة:</span><p className="text-white font-medium">{app.companyName}</p></div>
                        <div><span className="text-gray-500 text-xs">تاريخ التقديم:</span><p className="text-gray-300">{new Date(app.appliedAt).toLocaleDateString('ar-AE')}</p></div>
                      </div>

                      {app.coverLetter && (
                        <div className="bg-gray-800/40 rounded-xl p-3 mb-3">
                          <p className="text-xs text-gray-500 mb-1">الرسالة التعريفية</p>
                          <p className="text-sm text-gray-300">{app.coverLetter}</p>
                        </div>
                      )}

                      {app.status === 'pending_approval' ? (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(app.id, 'approved')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-500 transition-colors text-sm">
                            <CheckCircle className="w-4 h-4" /> موافقة — إرسال للشركة
                          </button>
                          <button onClick={() => updateStatus(app.id, 'rejected')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-xl hover:bg-red-500/30 transition-colors text-sm">
                            <XCircle className="w-4 h-4" /> رفض
                          </button>
                        </div>
                      ) : app.status !== 'rejected' && app.status !== 'accepted' ? (
                        <div className="flex gap-2">
                          <select value={app.status}
                            onChange={e => updateStatus(app.id, e.target.value as ApplicationStatus)}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="approved">معتمد</option>
                            <option value="pending">قيد المراجعة</option>
                            <option value="reviewed">تمت المراجعة</option>
                            <option value="interview">مقابلة</option>
                            <option value="accepted">مقبول</option>
                            <option value="rejected">مرفوض</option>
                          </select>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════ ADS (CLASSIFIEDS APPROVAL) ══════ */}
          {activeTab === 'ads' && (
            <div className="space-y-5">
              {/* Pending banner */}
              {pendingAds.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-red-400">{pendingAds.length} إعلان بانتظار موافقتك</p>
                    <p className="text-xs text-red-400/70 mt-0.5">راجع الإعلانات واعتمدها أو ارفضها قبل نشرها للعموم</p>
                  </div>
                </div>
              )}

              {/* Sync old local ads to Firebase */}
              {getAllAdsAdmin().length > 0 && (
                <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-blue-300 font-bold">⬆️ إعلانات محلية غير محمّلة لـ Firebase</p>
                    <p className="text-xs text-gray-500 mt-0.5">انشرها للجميع بضغطة واحدة</p>
                  </div>
                  <button
                    onClick={async () => {
                      const localAds = getAllAdsAdmin();
                      let count = 0;
                      for (const ad of localAds) {
                        try { await saveAdCloud({ ...ad }); count++; } catch { /* skip */ }
                      }
                      alert(`✅ تم رفع ${count} إعلان إلى Firebase`);
                    }}
                    className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all">
                    رفع الكل
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'بانتظار الموافقة', val: adsData.filter(a=>a.status==='pending').length,   color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                  { label: 'معتمدة',            val: adsData.filter(a=>a.status==='approved').length,  color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                  { label: 'مرفوضة',            val: adsData.filter(a=>a.status==='rejected').length,  color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20' },
                ].map(s => (
                  <div key={s.label} className={`border rounded-xl p-3 text-center ${s.bg}`}>
                    <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={adsSearch} onChange={e => setAdsSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو الهاتف أو العنوان..."
                    className="w-full pr-9 pl-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <select value={adsFilter} onChange={e => setAdsFilter(e.target.value as typeof adsFilter)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none">
                  <option value="all">كل الحالات</option>
                  <option value="pending">بانتظار الموافقة</option>
                  <option value="approved">معتمد</option>
                  <option value="rejected">مرفوض</option>
                </select>
                <select value={adsCatFilter} onChange={e => setAdsCatFilter(e.target.value as typeof adsCatFilter)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none">
                  <option value="all">كل الفئات</option>
                  <option value="car">🚗 سيارات</option>
                  <option value="realestate">🏡 عقارات</option>
                  <option value="service">🛠️ خدمات</option>
                  <option value="plate">🚘 أرقام سيارات</option>
                  <option value="job_seeker">👤 باحثو العمل</option>
                </select>
              </div>

              {/* Ads list */}
              {filteredAds.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
                  <ClipboardList className="w-14 h-14 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-400">لا توجد معاملات</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAds.map(ad => (
                    <div key={ad.id}
                      className={`bg-gray-900 border rounded-2xl p-5 transition-colors ${ad.status === 'pending' ? 'border-amber-500/40' : ad.status === 'approved' ? 'border-green-500/20' : 'border-red-500/20'}`}>
                      <div className="flex items-start gap-4">
                        {/* Images or icon */}
                        {ad.images && ad.images.length > 0 ? (
                          <img src={ad.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-700" />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <div className="font-bold text-white">{getAdLabel(ad)}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-medium">
                                  {getCategoryLabel(ad.category)}
                                </span>
                                {ad.location && (
                                  <span className="text-xs text-gray-500">📍 {ad.location}</span>
                                )}
                              </div>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold shrink-0 ${adStatusConfig[ad.status].color}`}>
                              {adStatusConfig[ad.status].label}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 text-xs bg-gray-800/50 rounded-xl p-3">
                            <div><span className="text-gray-500">المرسِل:</span><p className="text-white font-medium">{ad.name}</p></div>
                            <div><span className="text-gray-500">الهاتف:</span>
                              <a href={`tel:${ad.phone}`} className="text-green-400 font-medium block" dir="ltr">{ad.phone}</a>
                            </div>
                            {ad.price > 0 && (
                              <div><span className="text-gray-500">السعر:</span><p className="text-amber-400 font-bold">{ad.price.toLocaleString()} AED</p></div>
                            )}
                            <div><span className="text-gray-500">التاريخ:</span><p className="text-gray-300">{new Date(ad.createdAt).toLocaleDateString('ar-AE')}</p></div>
                          </div>

                          {ad.desc && (
                            <div className="bg-gray-800/40 rounded-xl p-3 mb-3">
                              <p className="text-xs text-gray-500 mb-1">الوصف</p>
                              <p className="text-sm text-gray-300 line-clamp-2">{ad.desc}</p>
                            </div>
                          )}

                          {ad.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleAdStatus(ad.id, 'approved')}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-500 transition-colors text-sm">
                                <CheckCircle className="w-4 h-4" /> اعتماد — نشر للعموم
                              </button>
                              <button onClick={() => handleAdStatus(ad.id, 'rejected')}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-xl hover:bg-red-500/30 transition-colors text-sm">
                                <XCircle className="w-4 h-4" /> رفض
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              {ad.status === 'rejected' && (
                                <button onClick={() => handleAdStatus(ad.id, 'approved')}
                                  className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-500/30 text-xs font-semibold rounded-xl hover:bg-green-600/30 transition-colors">
                                  اعتماد
                                </button>
                              )}
                              {ad.status === 'approved' && (
                                <button onClick={() => handleAdStatus(ad.id, 'rejected')}
                                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-xl hover:bg-red-500/30 transition-colors">
                                  سحب الاعتماد
                                </button>
                              )}
                              <button onClick={() => handleDeleteAd(ad.id)}
                                className="px-4 py-2 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-gray-700">
                                <Trash2 className="w-3.5 h-3.5 inline ml-1" />حذف
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════ CUSTOMERS ══════ */}
          {activeTab === 'customers' && (
            <div className="space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'إجمالي العملاء', val: usersDB.length,                                   color: 'text-red-400',    bg: 'bg-red-500/10' },
                  { label: 'باحثو عمل',      val: usersDB.filter(u=>u.role==='seeker').length,      color: 'text-rose-400',   bg: 'bg-rose-500/10' },
                  { label: 'شركات',           val: usersDB.filter(u=>u.role==='company').length,     color: 'text-green-400',  bg: 'bg-green-500/10' },
                  { label: 'محظورون',         val: usersDB.filter(u=>u.status==='banned').length,    color: 'text-red-400',    bg: 'bg-red-500/10' },
                ].map(c => (
                  <div key={c.label} className={`${c.bg} border border-gray-800 rounded-2xl p-4 text-center`}>
                    <div className={`text-3xl font-black ${c.color}`}>{c.val}</div>
                    <div className="text-xs text-gray-400 mt-1">{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={custSearch} onChange={e => setCustSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو البريد أو الهاتف..."
                    className="w-full pr-9 pl-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <select value={custRoleFilter} onChange={e => setCustRoleFilter(e.target.value as typeof custRoleFilter)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none">
                  <option value="all">كل الأدوار</option>
                  <option value="seeker">باحث عمل</option>
                  <option value="company">شركة</option>
                </select>
                <select value={custStatusFilter} onChange={e => setCustStatusFilter(e.target.value as typeof custStatusFilter)}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none">
                  <option value="all">كل الحالات</option>
                  <option value="active">نشط</option>
                  <option value="banned">محظور</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm">قائمة العملاء ({filteredCustomers.length})</h3>
                  <button
                    onClick={exportCustomersCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-red-700 to-red-600 text-white text-xs font-semibold rounded-xl hover:from-red-600 hover:to-red-500 transition-all shadow-lg shadow-red-900/30">
                    <Download className="w-3.5 h-3.5" />
                    تصدير الأسماء (CSV)
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs">
                        <th className="text-right px-5 py-3 font-medium">العميل</th>
                        <th className="text-right px-5 py-3 font-medium hidden md:table-cell">التواصل</th>
                        <th className="text-right px-5 py-3 font-medium">الدور</th>
                        <th className="text-right px-5 py-3 font-medium hidden lg:table-cell">الجنس</th>
                        <th className="text-right px-5 py-3 font-medium hidden lg:table-cell">الدولة</th>
                        <th className="text-right px-5 py-3 font-medium hidden lg:table-cell">تاريخ الانضمام</th>
                        <th className="text-right px-5 py-3 font-medium">الحالة</th>
                        <th className="text-right px-5 py-3 font-medium">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map(u => (
                        <tr key={u.id} className={`border-b border-gray-800/50 transition-colors hover:bg-gray-800/30 ${u.status === 'banned' ? 'opacity-60' : ''}`}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center font-bold shrink-0">
                                {u.name[0]}
                              </div>
                              <div>
                                <div className="font-medium text-white">{u.name}</div>
                                <div className="text-xs text-gray-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            {u.phone ? (
                              <a href={`tel:${u.phone}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-400 transition-colors" dir="ltr">
                                <Phone className="w-3.5 h-3.5" /> {u.phone}
                              </a>
                            ) : <span className="text-gray-600 text-xs">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'company' ? 'bg-rose-500/20 text-rose-400' : 'bg-red-500/20 text-red-400'}`}>
                              {u.role === 'company' ? '🏢 شركة' : '👤 باحث'}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-400">
                            {(u as typeof u & { gender?: string }).gender === 'male' ? '👨 ذكر' : (u as typeof u & { gender?: string }).gender === 'female' ? '👩 أنثى' : '—'}
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-400">
                            {(u as typeof u & { targetCountry?: string }).targetCountry || '—'}
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-400">
                            {new Date(u.registeredAt).toLocaleDateString('ar-AE')}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`flex items-center gap-1 text-xs font-semibold ${u.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                              {u.status === 'active' ? 'نشط' : 'محظور'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => toggleUserStatus(u.id)}
                                title={u.status === 'active' ? 'حظر' : 'إلغاء الحظر'}
                                className={`p-1.5 rounded-lg transition-colors ${u.status === 'active' ? 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10' : 'text-green-400 hover:bg-green-500/10'}`}>
                                {u.status === 'active' ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                              <button onClick={() => deleteUser(u.id)}
                                title="حذف"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCustomers.length === 0 && (
                    <div className="text-center py-12 text-gray-500">لا توجد نتائج</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════ BANNERS ══════ */}
          {activeTab === 'banners' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">إعلانات الصفحة الرئيسية</h2>
                  <p className="text-xs text-gray-500 mt-0.5">تظهر كشريط متحرك أعلى الصفحة الرئيسية</p>
                  <div className="mt-2 p-2 bg-green-900/20 border border-green-700/30 rounded-lg">
                    <p className="text-xs text-green-300">
                      ⚡ <strong>مباشر:</strong> أي إعلان تضيفه هنا يظهر للجميع فوراً على جميع الأجهزة!
                    </p>
                  </div>
                </div>
                <button onClick={() => openBannerForm()}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all">
                  <Plus className="w-4 h-4" /> إضافة إعلان
                </button>
              </div>

              {/* Form */}
              {showBannerForm && (
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-white text-base">
                    {editingBanner ? 'تعديل الإعلان' : 'إعلان جديد'}
                  </h3>

                  {/* Type selector */}
                  <div className="flex flex-wrap gap-2">
                    {([
                      { id: 'youtube', label: '▶ يوتيوب', icon: <Video className="w-3.5 h-3.5" /> },
                      { id: 'image',   label: 'صورة',     icon: <ImageIcon className="w-3.5 h-3.5" /> },
                      { id: 'video',   label: 'فيديو',    icon: <Video className="w-3.5 h-3.5" /> },
                      { id: 'text',    label: 'نص/لون',   icon: <Type className="w-3.5 h-3.5" /> },
                    ] as { id: BannerAd['type']; label: string; icon: React.ReactNode }[]).map(t => (
                      <button key={t.id}
                        onClick={() => setBannerForm(f => ({ ...f, type: t.id }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${bannerForm.type === t.id ? 'bg-red-600 border-red-500 text-white' : 'border-gray-600 text-gray-400 hover:border-red-500'}`}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Title */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">العنوان *</label>
                      <input value={bannerForm.title}
                        onChange={e => setBannerForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="عنوان الإعلان"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">وصف قصير</label>
                      <input value={bannerForm.subtitle}
                        onChange={e => setBannerForm(f => ({ ...f, subtitle: e.target.value }))}
                        placeholder="نص توضيحي اختياري"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* Link */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">الرابط (اختياري)</label>
                      <input value={bannerForm.link}
                        onChange={e => setBannerForm(f => ({ ...f, link: e.target.value }))}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">مدة العرض (ثوانٍ)</label>
                      <input type="number" min={2} max={60} value={bannerForm.duration}
                        onChange={e => setBannerForm(f => ({ ...f, duration: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">تاريخ البدء *</label>
                      <input type="date" value={bannerForm.startDate}
                        onChange={e => setBannerForm(f => ({ ...f, startDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">تاريخ الانتهاء *</label>
                      <input type="date" value={bannerForm.endDate}
                        onChange={e => setBannerForm(f => ({ ...f, endDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* Order */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">الترتيب</label>
                      <input type="number" min={1} value={bannerForm.order}
                        onChange={e => setBannerForm(f => ({ ...f, order: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>

                    {/* BG Color (text banners) */}
                    {bannerForm.type === 'text' && (
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">لون الخلفية</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={bannerForm.bgColor}
                            onChange={e => setBannerForm(f => ({ ...f, bgColor: e.target.value }))}
                            className="w-10 h-10 rounded-lg border border-gray-600 cursor-pointer" />
                          <span className="text-xs text-gray-500">{bannerForm.bgColor}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* YouTube URL */}
                  {bannerForm.type === 'youtube' && (
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">🔗 رابط يوتيوب</label>
                      <input
                        value={bannerForm.mediaUrl || ''}
                        onChange={e => setBannerForm(f => ({ ...f, mediaUrl: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=... أو https://youtu.be/..."
                        dir="ltr"
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">الفيديو سيعمل تلقائياً وبدون صوت</p>
                    </div>
                  )}

                  {/* Image URL or upload */}
                  {bannerForm.type === 'image' && (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 block">🖼️ رابط الصورة أو ارفعها من جهازك</label>
                      <input
                        value={bannerForm.mediaUrl || ''}
                        onChange={e => setBannerForm(f => ({ ...f, mediaUrl: e.target.value, mediaData: '' }))}
                        placeholder="https://example.com/image.jpg"
                        dir="ltr"
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex-1 h-px bg-gray-700" /> أو <span className="flex-1 h-px bg-gray-700" />
                      </div>
                      <input ref={bannerFileRef} type="file" accept="image/*" onChange={handleBannerMediaUpload} className="hidden" />
                      <button onClick={() => bannerFileRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-600 rounded-xl text-sm text-gray-400 hover:border-red-500 hover:text-red-400 transition-all w-full justify-center">
                        <ImageIcon className="w-4 h-4" />
                        {bannerForm.mediaData ? '✓ تم رفع الصورة (اضغط لتغيير)' : 'ارفع صورة من جهازك'}
                      </button>
                      {(bannerForm.mediaData || bannerForm.mediaUrl) && (
                        <img src={bannerForm.mediaData || bannerForm.mediaUrl} alt="" className="mt-2 h-24 rounded-lg object-cover w-full" onError={() => {}} />
                      )}
                    </div>
                  )}

                  {/* Video URL or upload */}
                  {bannerForm.type === 'video' && (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 block">🎬 رابط الفيديو أو ارفعه من جهازك</label>
                      <input
                        value={bannerForm.mediaUrl || ''}
                        onChange={e => setBannerForm(f => ({ ...f, mediaUrl: e.target.value, mediaData: '' }))}
                        placeholder="https://example.com/video.mp4"
                        dir="ltr"
                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex-1 h-px bg-gray-700" /> أو <span className="flex-1 h-px bg-gray-700" />
                      </div>
                      <input ref={bannerFileRef} type="file" accept="video/*" onChange={handleBannerMediaUpload} className="hidden" />
                      <button onClick={() => bannerFileRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-600 rounded-xl text-sm text-gray-400 hover:border-red-500 hover:text-red-400 transition-all w-full justify-center">
                        <Video className="w-4 h-4" />
                        {bannerForm.mediaData ? '✓ تم رفع الفيديو (اضغط لتغيير)' : 'ارفع فيديو من جهازك'}
                      </button>
                    </div>
                  )}

                  {/* Active toggle */}
                  <div className="flex items-center gap-3">
                    <button onClick={() => setBannerForm(f => ({ ...f, active: !f.active }))}
                      className="flex items-center gap-2 text-sm">
                      {bannerForm.active
                        ? <ToggleRight className="w-7 h-7 text-green-400" />
                        : <ToggleLeft className="w-7 h-7 text-gray-500" />}
                      <span className={bannerForm.active ? 'text-green-400' : 'text-gray-500'}>
                        {bannerForm.active ? 'مفعّل' : 'معطّل'}
                      </span>
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={saveBanner}
                      disabled={!bannerForm.title.trim() || !bannerForm.endDate}
                      className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all">
                      {editingBanner ? 'حفظ التعديلات' : 'إضافة الإعلان'}
                    </button>
                    <button onClick={() => setShowBannerForm(false)}
                      className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-all">
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Banners List */}
              {bannerAds.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>لا توجد إعلانات بعد</p>
                  <p className="text-xs mt-1">اضغط "إضافة إعلان" لإنشاء أول إعلان</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bannerAds.sort((a, b) => a.order - b.order).map(b => {
                    const today = new Date().toISOString().split('T')[0];
                    const isLive = b.active && b.startDate <= today && b.endDate >= today;
                    return (
                      <div key={b.id}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
                        {/* Preview thumb */}
                        <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-700">
                          {b.type === 'image' && b.mediaData
                            ? <img src={b.mediaData} alt="" className="w-full h-full object-cover" />
                            : b.type === 'video' && b.mediaData
                            ? <video src={b.mediaData} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"
                                style={{ background: b.bgColor || '#7f1d1d' }}>
                                <Type className="w-5 h-5 text-white/50" />
                              </div>
                          }
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm truncate">{b.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isLive ? 'bg-green-500/20 text-green-400' : b.active ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-500'}`}>
                              {isLive ? '● يعمل الآن' : b.active ? 'مجدول' : 'معطّل'}
                            </span>
                            <span className="text-xs text-gray-500 border border-gray-700 px-1.5 py-0.5 rounded-lg">
                              {b.type === 'image' ? 'صورة' : b.type === 'video' ? 'فيديو' : 'نص'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                            <span>من {b.startDate} → {b.endDate}</span>
                            <span>⏱ {b.duration}ث</span>
                            <span>ترتيب: {b.order}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => toggleBannerActive(b.id, !b.active)}
                            title={b.active ? 'تعطيل' : 'تفعيل'}
                            className={`p-1.5 rounded-lg transition-colors ${b.active ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-gray-700'}`}>
                            {b.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                          <button onClick={() => openBannerForm(b)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteBanner(b.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════ JOBS ══════ */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                    placeholder="ابحث عن وظيفة..."
                    className="w-full pr-9 pl-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="text-green-400 font-bold">{filteredJobs.filter(j => j.isActive).length}</span> نشط
                  <span className="mx-1">/</span>
                  <span className="font-bold">{filteredJobs.length}</span> إجمالي
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-xs">
                      <th className="text-right px-5 py-3 font-medium">الوظيفة</th>
                      <th className="text-right px-5 py-3 font-medium hidden md:table-cell">الشركة</th>
                      <th className="text-right px-5 py-3 font-medium hidden lg:table-cell">المتقدمون</th>
                      <th className="text-right px-5 py-3 font-medium">الحالة</th>
                      <th className="text-right px-5 py-3 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map(job => (
                      <tr key={job.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-medium text-white">{job.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{job.location}</div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell text-gray-300">{job.companyName}</td>
                        <td className="px-5 py-4 hidden lg:table-cell text-gray-400">{job.applicants}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${job.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                            {job.isActive ? 'نشط' : 'متوقف'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => toggleJobStatus(job.id)}
                              className="px-2.5 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                              {job.isActive ? 'إيقاف' : 'تفعيل'}
                            </button>
                            <button onClick={() => deleteJob(job.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════ COMPANIES ══════ */}
          {activeTab === 'companies' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'إجمالي الشركات',  val: mockCompanies.length,                          color: 'text-red-400',    bg: 'bg-red-500/10' },
                  { label: 'شركات موثقة',      val: mockCompanies.filter(c=>c.verified).length,    color: 'text-green-400',  bg: 'bg-green-500/10' },
                  { label: 'بانتظار التوثيق',  val: mockCompanies.filter(c=>!c.verified).length,   color: 'text-amber-400',  bg: 'bg-amber-500/10' },
                ].map(c => (
                  <div key={c.label} className={`${c.bg} border border-gray-800 rounded-2xl p-4 text-center`}>
                    <div className={`text-3xl font-black ${c.color}`}>{c.val}</div>
                    <div className="text-xs text-gray-400 mt-1">{c.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-xs">
                      <th className="text-right px-5 py-3 font-medium">الشركة</th>
                      <th className="text-right px-5 py-3 font-medium hidden md:table-cell">القطاع</th>
                      <th className="text-right px-5 py-3 font-medium hidden lg:table-cell">وظائف</th>
                      <th className="text-right px-5 py-3 font-medium">التوثيق</th>
                      <th className="text-right px-5 py-3 font-medium">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCompanies.map(c => (
                      <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-medium text-white">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.location}</div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell text-gray-400">{c.industry}</td>
                        <td className="px-5 py-4 hidden lg:table-cell text-gray-400">{c.jobs}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.verified ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {c.verified ? '✓ موثق' : 'انتظار'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {!c.verified && (
                            <button className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">
                              توثيق
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
