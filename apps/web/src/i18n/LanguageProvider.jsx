import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();
const STORAGE_KEY = 'samira-lang';

const getInitial = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'fr') return stored;
  } catch (e) {
    /* ignore */
  }
  return 'en';
};

/** Resolves a dot path (e.g. "home.heroTitle") into the active language tree. */
const resolve = (obj, path) => {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
};

/** Replaces {placeholder} tokens in a string with values from params. */
const interpolate = (str, params) => {
  if (!params || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? String(params[k]) : `{${k}}`));
};

export const useLang = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(getInitial);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'fr' : 'en');
  }, [lang, setLang]);

  const t = useCallback(
    (key, params) => {
      const value = resolve(translations[lang], key);
      if (value == null) return key;
      if (typeof value === 'string') return interpolate(value, params);
      return value;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
