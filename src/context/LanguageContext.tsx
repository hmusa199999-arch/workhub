import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Lang = 'ar' | 'en';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (ar: string, en: string) => string;
  isAr: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ar',
  setLang: () => {},
  t: (ar) => ar,
  isAr: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('work1m_lang') as Lang) || 'ar';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('work1m_lang', l);
    // Update document direction
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;
  const isAr = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isAr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
