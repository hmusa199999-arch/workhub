import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, SeekerProfile, CompanyProfile } from '../types';
import { registerUserInDB } from '../utils/analytics';

const STORAGE_USER_KEY   = 'workhub_user';
const STORAGE_ACCOUNTS   = 'workhub_auth_accounts';

// حسابات المديرين الثابتة (بدون OTP)
const ADMIN_ACCOUNTS: { username: string; password: string; phone: string; name: string; id: string }[] = [
  {
    id: 'admin_001',
    username: 'SuperAdmin_HQ1',
    password: 'Hub@2026#Secure!',
    phone: '+971543393797',
    name: 'مدير النظام 1',
  },
  {
    id: 'admin_002',
    username: 'SuperAdmin_HQ2',
    password: 'Hub@2026#Elite!',
    phone: '+971502222691',
    name: 'مدير النظام 2',
  },
];

type StoredAccount = {
  id: string;
  username: string;
  password: string;
  role: 'seeker' | 'company' | 'admin';
  name: string;
  phone?: string;
  targetCountry?: string;
  targetCity?: string;
  cvFileName?: string;
};

interface AuthContextType {
  user: User | null;
  login: (data: { username: string; password: string }) => Promise<boolean>;
  register: (data: { name: string; username: string; password: string; phone?: string; role: 'seeker' | 'company'; targetCountry?: string; targetCity?: string; cvFileName?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User> | Partial<SeekerProfile> | Partial<CompanyProfile>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const persist = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(u));
  };

  const getAccounts = (): StoredAccount[] => {
    try {
      const raw = localStorage.getItem(STORAGE_ACCOUNTS);
      return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
    } catch {
      return [];
    }
  };

  const saveAccounts = (accounts: StoredAccount[]) => {
    localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(accounts));
  };

  const login = async ({ username, password }: { username: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const trimmedUser = username.trim();

    // Admin fixed accounts (two admins) — لا تُسجَّل في قاعدة العملاء
    const adminMatch = ADMIN_ACCOUNTS.find(
      a => a.username === trimmedUser && a.password === password,
    );
    if (adminMatch) {
      const adminUser: User = {
        id: adminMatch.id,
        name: adminMatch.name,
        email: 'admin@workhub.ae',
        role: 'admin',
        createdAt: new Date().toISOString().split('T')[0],
        phone: adminMatch.phone,
      };
      persist(adminUser);
      setIsLoading(false);
      return true;
    }

    const accounts = getAccounts();
    const acc = accounts.find(a => a.username.toLowerCase() === trimmedUser.toLowerCase() && a.password === password);
    if (!acc) {
      setIsLoading(false);
      return false;
    }

    const loggedUser: User = {
      id: acc.id,
      name: acc.name,
      email: `${acc.username}@local`,
      role: acc.role,
      createdAt: new Date().toISOString().split('T')[0],
      phone: acc.phone,
    };
    persist(loggedUser);

    // سجّل / حدّث هذا المستخدم في قاعدة بيانات العملاء لعرضه في لوحة تحكم الأدمن
    if (acc.role === 'seeker' || acc.role === 'company') {
      registerUserInDB({
        id: acc.id,
        name: acc.name,
        email: `${acc.username}@local`,
        phone: acc.phone,
        role: acc.role,
        loginMethod: 'phone',
      });
    }

    setIsLoading(false);
    return true;
  };

  const register = async (data: { name: string; username: string; password: string; phone?: string; role: 'seeker' | 'company'; targetCountry?: string; targetCity?: string; cvFileName?: string }): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const username = data.username.trim();
    const accounts = getAccounts();

    if (accounts.some(a => a.username.toLowerCase() === username.toLowerCase())) {
      setIsLoading(false);
      return false;
    }

    const id = `${data.role}_${Date.now()}`;
    const newAccount: StoredAccount = {
      id,
      username,
      password: data.password,
      role: data.role,
      name: data.name || username,
      phone: data.phone,
      targetCountry: data.targetCountry,
      targetCity: data.targetCity,
      cvFileName: data.cvFileName,
    };
    saveAccounts([...accounts, newAccount]);

    const newUser: User = {
      id,
      name: newAccount.name,
      email: `${username}@local`,
      role: data.role,
      createdAt: new Date().toISOString().split('T')[0],
      phone: data.phone,
    };
    persist(newUser);

    // أضف الحساب الجديد إلى قاعدة بيانات العملاء ليظهر للأدمن
    registerUserInDB({
      id,
      name: newAccount.name,
      email: `${username}@local`,
      phone: data.phone,
      role: data.role,
      loginMethod: 'phone',
    });
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  const updateProfile = (data: Partial<User> | Partial<SeekerProfile> | Partial<CompanyProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    persist(updated);
    // Also update in users DB
    const usersDB: User[] = JSON.parse(localStorage.getItem('workhub_users_db') || '[]');
    const idx = usersDB.findIndex((u: User) => u.id === user.id);
    if (idx >= 0) { usersDB[idx] = updated; localStorage.setItem('workhub_users_db', JSON.stringify(usersDB)); }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
