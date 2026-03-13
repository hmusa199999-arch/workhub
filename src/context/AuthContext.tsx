import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, SeekerProfile, CompanyProfile } from '../types';
import { registerUserInDB } from '../utils/analytics';
import { saveUserToDB, getAllUsersFromDB, checkUsernameExists } from '../utils/firestoreUsers';

const STORAGE_USER_KEY = 'workhub_user';

const ADMIN_ACCOUNTS: { username: string; password: string; phone: string; name: string; id: string }[] = [
  { id: 'admin_001', username: 'SuperAdmin_HQ1', password: 'Hub@2026#Secure!', phone: '+971543393797', name: 'مدير النظام 1' },
  { id: 'admin_002', username: 'SuperAdmin_HQ2', password: 'Hub@2026#Elite!',  phone: '+971502222691', name: 'مدير النظام 2' },
];

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
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    if (saved) { try { setUser(JSON.parse(saved)); } catch { /* ignore */ } }
    setIsLoading(false);
  }, []);

  const persist = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(u));
  };

  const login = async ({ username, password }: { username: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const trimmed = username.trim();

    // Admin fixed accounts
    const adminMatch = ADMIN_ACCOUNTS.find(a => a.username === trimmed && a.password === password);
    if (adminMatch) {
      persist({ id: adminMatch.id, name: adminMatch.name, email: 'admin@work1m.com', role: 'admin', createdAt: new Date().toISOString().split('T')[0], phone: adminMatch.phone });
      setIsLoading(false);
      return true;
    }

    // Look up user from Firebase
    try {
      const allUsers = await getAllUsersFromDB();
      const found = allUsers.find(u => u.username.toLowerCase() === trimmed.toLowerCase());
      if (!found) { setIsLoading(false); return false; }

      // Simple password check (stored as-is for now)
      const storedPw = localStorage.getItem(`pw_${found.id}`);
      if (storedPw !== password) { setIsLoading(false); return false; }

      const loggedUser: User = {
        id: found.id, name: found.name, email: `${found.username}@work1m`,
        role: found.role as 'seeker' | 'company', createdAt: found.createdAt, phone: found.phone,
      };
      persist(loggedUser);

      // Update last login
      saveUserToDB({ ...found, lastLogin: new Date().toISOString() }).catch(console.error);

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (data: { name: string; username: string; password: string; phone?: string; role: 'seeker' | 'company'; targetCountry?: string; targetCity?: string; cvFileName?: string }): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const username = data.username.trim();

    try {
      // Check username uniqueness in Firebase
      const exists = await checkUsernameExists(username);
      if (exists) { setIsLoading(false); return false; }

      const id = `${data.role}_${Date.now()}`;

      // Save to Firebase
      await saveUserToDB({
        id, username, name: data.name || username,
        phone: data.phone || '', role: data.role,
        targetCountry: data.targetCountry, targetCity: data.targetCity,
        createdAt: new Date().toISOString(),
      });

      // Store password locally (only on this device)
      localStorage.setItem(`pw_${id}`, data.password);

      const newUser: User = {
        id, name: data.name || username,
        email: `${username}@work1m`, role: data.role,
        createdAt: new Date().toISOString().split('T')[0], phone: data.phone,
      };
      persist(newUser);

      // Also register in analytics
      registerUserInDB({ id, name: newUser.name, email: newUser.email, phone: data.phone, role: data.role, loginMethod: 'phone' });

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  const updateProfile = (data: Partial<User> | Partial<SeekerProfile> | Partial<CompanyProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    persist(updated);
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
