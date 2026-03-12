import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Application, ApplicationStatus } from '../types';

const STORAGE_KEY = 'workhub_applications';

interface ApplicationsContextType {
  applications: Application[];
  submitApplication: (app: Omit<Application, 'id' | 'appliedAt' | 'status'>) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  getBySeeker: (seekerId: string) => Application[];
  getPendingApproval: () => Application[];
}

const ApplicationsContext = createContext<ApplicationsContextType | null>(null);

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setApplications(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const persist = (apps: Application[]) => {
    setApplications(apps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  };

  const submitApplication = (app: Omit<Application, 'id' | 'appliedAt' | 'status'>) => {
    const newApp: Application = {
      ...app,
      id: `app_${Date.now()}`,
      appliedAt: new Date().toISOString().split('T')[0],
      status: 'pending_approval',
    };
    persist([...applications, newApp]);
  };

  const updateStatus = (id: string, status: ApplicationStatus) => {
    persist(applications.map(a => a.id === id ? { ...a, status } : a));
  };

  const getBySeeker = (seekerId: string) =>
    applications.filter(a => a.seekerId === seekerId);

  const getPendingApproval = () =>
    applications.filter(a => a.status === 'pending_approval');

  return (
    <ApplicationsContext.Provider value={{ applications, submitApplication, updateStatus, getBySeeker, getPendingApproval }}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error('useApplications must be used within ApplicationsProvider');
  return ctx;
}
