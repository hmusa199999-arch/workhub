const VISITS_KEY = 'workhub_visits';
const SESSION_KEY = 'workhub_session_id';
const USERS_DB_KEY = 'workhub_users_db';
const GLOBAL_RESET_FLAG = 'workhub_global_reset_2026_03_12_v2';

export interface Visit {
  page: string;
  pageLabel: string;
  timestamp: string;
  sessionId: string;
  device: 'mobile' | 'desktop' | 'tablet';
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'seeker' | 'company';
  registeredAt: string;
  lastLogin: string;
  status: 'active' | 'banned';
  loginMethod: 'email' | 'phone' | 'google';
}

const PAGE_LABELS: Record<string, string> = {
  '/': 'الصفحة الرئيسية',
  '/jobs': 'الوظائف',
  '/cars': 'السيارات',
  '/real-estate': 'العقارات',
  '/services': 'الخدمات',
  '/car-plates': 'أرقام السيارات',
  '/login': 'تسجيل الدخول',
  '/register': 'إنشاء حساب',
  '/pricing': 'الأسعار',
  '/sectors': 'القطاعات',
  '/dashboard/seeker': 'لوحة الباحث',
  '/dashboard/company': 'لوحة الشركة',
  '/dashboard/admin': 'لوحة الإدارة',
};

function getDevice(): Visit['device'] {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getOrCreateSession(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function trackPageView(path: string) {
  const visit: Visit = {
    page: path,
    pageLabel: PAGE_LABELS[path] || path,
    timestamp: new Date().toISOString(),
    sessionId: getOrCreateSession(),
    device: getDevice(),
  };
  const existing = getVisits();
  existing.push(visit);
  // Keep last 5000 visits
  const trimmed = existing.slice(-5000);
  localStorage.setItem(VISITS_KEY, JSON.stringify(trimmed));
}

export function getVisits(): Visit[] {
  try {
    const raw = localStorage.getItem(VISITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function clearAllStoredDataOnce() {
  try {
    if (localStorage.getItem(GLOBAL_RESET_FLAG)) return;
    localStorage.removeItem(VISITS_KEY);
    localStorage.removeItem('workhub_applications');
    localStorage.removeItem('workhub_ads');
    localStorage.removeItem(USERS_DB_KEY);
    localStorage.removeItem(SESSION_KEY);
    // نترك حسابات المستخدمين كما هي، فقط نحذف الإحصائيات والطلبات والإعلانات
    localStorage.setItem(GLOBAL_RESET_FLAG, '1');
  } catch {
    // ignore
  }
}

export function getAnalytics() {
  // أول استدعاء بعد النشر سيصفّي كل الإحصائيات والطلبات المخزنة
  clearAllStoredDataOnce();
  const visits = getVisits();
  const now = new Date();

  // Unique sessions
  const sessions = new Set(visits.map(v => v.sessionId));

  // Today
  const todayStr = now.toISOString().split('T')[0];
  const todayVisits = visits.filter(v => v.timestamp.startsWith(todayStr));
  const todaySessions = new Set(todayVisits.map(v => v.sessionId));

  // Last 7 days chart
  const last7: { date: string; label: string; visits: number; sessions: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayVisits = visits.filter(v => v.timestamp.startsWith(dateStr));
    const daySessions = new Set(dayVisits.map(v => v.sessionId));
    last7.push({
      date: dateStr,
      label: i === 0 ? 'اليوم' : i === 1 ? 'أمس' : d.toLocaleDateString('ar-AE', { weekday: 'short' }),
      visits: dayVisits.length,
      sessions: daySessions.size,
    });
  }

  // Top pages
  const pageCounts: Record<string, { label: string; count: number }> = {};
  visits.forEach(v => {
    if (!pageCounts[v.page]) pageCounts[v.page] = { label: v.pageLabel, count: 0 };
    pageCounts[v.page].count++;
  });
  const topPages = Object.entries(pageCounts)
    .map(([page, { label, count }]) => ({ page, label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Device breakdown
  const devices = { mobile: 0, desktop: 0, tablet: 0 };
  visits.forEach(v => { devices[v.device]++; });

  // Hourly today
  const hourly: number[] = Array(24).fill(0);
  todayVisits.forEach(v => {
    const h = new Date(v.timestamp).getHours();
    hourly[h]++;
  });

  return {
    totalVisits: visits.length,
    totalSessions: sessions.size,
    todayVisits: todayVisits.length,
    todaySessions: todaySessions.size,
    last7,
    topPages,
    devices,
    hourly,
  };
}

// ─── Users DB ────────────────────────────────────────────
export function getUsersDB(): UserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    const stored: UserRecord[] = raw ? JSON.parse(raw) : [];
    return stored;
  } catch { return []; }
}

export function saveUsersDB(users: UserRecord[]) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

export function registerUserInDB(user: {
  id: string; name: string; email: string; phone?: string;
  role: 'seeker' | 'company'; loginMethod: 'email' | 'phone' | 'google';
}) {
  const db = getUsersDB();
  const exists = db.find(u => u.email === user.email || (user.phone && u.phone === user.phone));
  if (exists) {
    // Update last login
    const updated = db.map(u =>
      u.id === exists.id ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    saveUsersDB(updated);
    return;
  }
  const newRecord: UserRecord = {
    ...user,
    registeredAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    status: 'active',
  };
  saveUsersDB([...db, newRecord]);
}

function getSeedUsers(): UserRecord[] {
  return [];
}

// Seed some visits if empty
export function seedVisitsIfEmpty() {
  // في النسخة الحقيقية لا نضيف زيارات وهمية
}
