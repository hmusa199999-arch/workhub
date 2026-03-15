import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Lang = 'ar' | 'en';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (ar: string, en: string) => string;
  isAr: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (_ar, en) => en,
  isAr: false,
});

function applyLang(l: Lang) {
  const dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir  = dir;
  document.documentElement.lang = l;
  // Also set on body for extra specificity
  document.body.dir = dir;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    // Force English - clear any old Arabic preference
    localStorage.setItem('work1m_lang', 'en');
    return 'en';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('work1m_lang', l);
    applyLang(l);
  };

  // Apply on mount and whenever lang changes
  useEffect(() => {
    applyLang(lang);
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
