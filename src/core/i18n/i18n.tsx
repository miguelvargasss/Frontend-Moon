import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { es } from './es';
import { en } from './en';
import { qu } from './qu';

// ── Tipos ──────────────────────────────────────────────────────────────
export type Language = 'es' | 'en' | 'qu';

interface LanguageContextValue {
  /** Idioma activo */
  language: Language;
  /** Cambiar el idioma (persiste en localStorage y actualiza <html lang>) */
  setLanguage: (lang: Language) => void;
  /** Traducir una clave. Retorna la clave si no existe traducción. */
  t: (key: string) => string;
}

// ── Diccionarios ───────────────────────────────────────────────────────
const dictionaries: Record<Language, Record<string, string>> = { es, en, qu };

const STORAGE_KEY = 'moonphases-lang';

// ── Context ────────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Proveedor global de idioma para MoonPhases.
 * Envuelve toda la app y provee la función `t()` de traducción.
 *
 * - Persiste la preferencia en localStorage.
 * - Establece `lang` en `<html>` para cumplir WCAG 3.1.1 (Nivel A).
 * - Integrado con el AccessibilityWidget para cambio de idioma con transición visual.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && dictionaries[saved]) return saved;
    } catch { /* fallback */ }
    return 'es';
  });

  // Actualiza <html lang="..."> cada vez que cambia el idioma
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLangState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch { /* silently fail */ }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return dictionaries[language]?.[key] ?? dictionaries['es']?.[key] ?? key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de idioma.
 * Debe usarse dentro de un `<LanguageProvider>`.
 *
 * @returns `{ language, setLanguage, t }`
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage debe usarse dentro de un <LanguageProvider>');
  }
  return ctx;
}
