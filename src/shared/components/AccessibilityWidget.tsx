import { useState, useEffect, useCallback } from 'react';
import { useLanguage, type Language } from '../../core/i18n/i18n';

// ── Tipos ──────────────────────────────────────────────────────────────
type ColorMode = 'normal' | 'modo-claro' | 'alto-contraste' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'escala-grises';
type FontSize   = 'normal' | 'grande' | 'muy-grande';

interface A11yPreferences {
  colorMode: ColorMode;
  fontSize: FontSize;
}

const STORAGE_KEY = 'moonphases-a11y-prefs';

const DEFAULT_PREFS: A11yPreferences = {
  colorMode: 'normal',
  fontSize: 'normal',
};

// ── Configuración de modos de color ────────────────────────────────────
const COLOR_MODES: { id: ColorMode; labelKey: string; descKey: string; swatch: string }[] = [
  { id: 'normal',         labelKey: 'color.normal',        descKey: 'color.normalDesc',        swatch: 'linear-gradient(135deg,#99f6e4,#0A0F1E)' },
  { id: 'modo-claro',     labelKey: 'color.lightMode',     descKey: 'color.lightModeDesc',     swatch: 'linear-gradient(135deg,#ffffff,#e2e8f0)' },
  { id: 'alto-contraste', labelKey: 'color.highContrast',  descKey: 'color.highContrastDesc',  swatch: 'linear-gradient(135deg,#fff700,#000)' },
  { id: 'escala-grises',  labelKey: 'color.grayscale',     descKey: 'color.grayscaleDesc',     swatch: 'linear-gradient(135deg,#fff,#555)' },
  { id: 'deuteranopia',   labelKey: 'color.deuteranopia',  descKey: 'color.deuteranopiaDesc',  swatch: 'linear-gradient(135deg,#5b92ff,#a67c00)' },
  { id: 'protanopia',     labelKey: 'color.protanopia',    descKey: 'color.protanopiaDesc',    swatch: 'linear-gradient(135deg,#7fb3ff,#856400)' },
  { id: 'tritanopia',     labelKey: 'color.tritanopia',    descKey: 'color.tritanopiaDesc',    swatch: 'linear-gradient(135deg,#ff6e6e,#00c6c6)' },
];

const FONT_SIZES: { id: FontSize; labelKey: string; multiplier: string }[] = [
  { id: 'normal',     labelKey: 'size.normal',    multiplier: '100%' },
  { id: 'grande',     labelKey: 'size.large',     multiplier: '118%' },
  { id: 'muy-grande', labelKey: 'size.veryLarge',  multiplier: '136%' },
];

// ── Configuración de idiomas ───────────────────────────────────────────
const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'es', label: 'Español',  flag: '🇪🇸' },
  { id: 'en', label: 'English',  flag: '🇬🇧' },
  { id: 'qu', label: 'Runasimi', flag: '🏔️' },
];

// ── SVG filter matrices para daltonismo (matrices científicas) ─────────
const SVG_FILTERS = `
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">
  <defs>
    <!-- Deuteranopía (deficiencia de conos verdes) -->
    <filter id="filter-deuteranopia">
      <feColorMatrix type="matrix" values="
        0.625 0.375 0     0 0
        0.7   0.3   0     0 0
        0     0.3   0.7   0 0
        0     0     0     1 0"/>
    </filter>
    <!-- Protanopía (deficiencia de conos rojos) -->
    <filter id="filter-protanopia">
      <feColorMatrix type="matrix" values="
        0.567 0.433 0     0 0
        0.558 0.442 0     0 0
        0     0.242 0.758 0 0
        0     0     0     1 0"/>
    </filter>
    <!-- Tritanopía (deficiencia de conos azules) -->
    <filter id="filter-tritanopia">
      <feColorMatrix type="matrix" values="
        0.95  0.05  0     0 0
        0     0.433 0.567 0 0
        0     0.475 0.525 0 0
        0     0     0     1 0"/>
    </filter>
  </defs>
</svg>`;

// ── Aplica estilos al <html> según preferencias ────────────────────────
function applyPreferences(prefs: A11yPreferences) {
  const root = document.documentElement;

  // Limpia clases previas
  root.classList.remove('a11y-alto-contraste', 'a11y-modo-claro');

  // Font size en el elemento raíz
  const fontMap: Record<FontSize, string> = {
    'normal':     '16px',
    'grande':     '18.88px',
    'muy-grande': '21.76px',
  };
  root.style.fontSize = fontMap[prefs.fontSize];

  // Filtros CSS de color
  const filterMap: Record<ColorMode, string> = {
    'normal':         'none',
    'modo-claro':     'none',
    'alto-contraste': 'none',
    'escala-grises':  'grayscale(100%)',
    'deuteranopia':   'url(#filter-deuteranopia)',
    'protanopia':     'url(#filter-protanopia)',
    'tritanopia':     'url(#filter-tritanopia)',
  };
  document.body.style.filter = filterMap[prefs.colorMode];

  // Alto contraste y Modo Claro: clase especial en el <html>
  if (prefs.colorMode === 'alto-contraste') {
    root.classList.add('a11y-alto-contraste');
  } else if (prefs.colorMode === 'modo-claro') {
    root.classList.add('a11y-modo-claro');
  }
}

// ── Flash blanco al cambiar idioma ─────────────────────────────────────
function triggerLangFlash() {
  const overlay = document.createElement('div');
  overlay.className = 'a11y-lang-flash';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  overlay.addEventListener('animationend', () => {
    overlay.remove();
  });
}

// ── Componente principal ───────────────────────────────────────────────
export default function AccessibilityWidget() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen]   = useState(false);
  const [prefs, setPrefs] = useState<A11yPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as A11yPreferences) : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  // Inyecta los SVG filters y aplica preferencias guardadas al montar
  useEffect(() => {
    if (!document.getElementById('a11y-svg-filters')) {
      const div = document.createElement('div');
      div.id  = 'a11y-svg-filters';
      div.innerHTML = SVG_FILTERS;
      document.body.prepend(div);
    }
    applyPreferences(prefs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persiste cambios en localStorage y DOM
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    applyPreferences(prefs);
  }, [prefs]);

  const setColorMode = (mode: ColorMode) =>
    setPrefs((p) => ({ ...p, colorMode: mode }));

  const setFontSize = (size: FontSize) =>
    setPrefs((p) => ({ ...p, fontSize: size }));

  const handleLanguageChange = useCallback((lang: Language) => {
    if (lang === language) return;
    triggerLangFlash();
    // Cambiar idioma después de un breve delay para que el flash sea visible
    setTimeout(() => {
      setLanguage(lang);
    }, 150);
  }, [language, setLanguage]);

  const resetAll = () => {
    setPrefs(DEFAULT_PREFS);
    if (language !== 'es') {
      triggerLangFlash();
      setTimeout(() => setLanguage('es'), 150);
    }
  };

  return (
    <>
      {/* ── Botón flotante de accesibilidad ─── */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99998,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px',
        }}
      >
        {/* Panel desplegable */}
        {open && (
          <div
            role="dialog"
            aria-label={t('a11y.title')}
            aria-modal="false"
            style={{
              width: '300px',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              borderRadius: '16px',
              background: 'rgba(13, 26, 20, 0.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(45, 212, 168, 0.2)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(45,212,168,0.06)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#99f6e4" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                </svg>
                <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#e2e8f0' }}>
                  {t('a11y.title')}
                </span>
              </div>
              <button
                onClick={resetAll}
                aria-label={t('a11y.resetAll')}
                title={t('a11y.reset')}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  fontFamily: 'Outfit,sans-serif',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#99f6e4'; e.currentTarget.style.borderColor = 'rgba(45,212,168,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                {t('a11y.reset')}
              </button>
            </div>

            {/* ── Sección: Modo de color ── */}
            <section aria-labelledby="color-mode-heading">
              <h2 id="color-mode-heading" style={{
                fontFamily: 'Outfit,sans-serif',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '10px',
              }}>
                {t('a11y.colorMode')}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {COLOR_MODES.map((mode) => {
                  const active = prefs.colorMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setColorMode(mode.id)}
                      aria-pressed={active}
                      aria-label={`${t(mode.labelKey)}: ${t(mode.descKey)}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '6px',
                        padding: '10px',
                        borderRadius: '10px',
                        border: `1.5px solid ${active ? '#99f6e4' : 'rgba(255,255,255,0.08)'}`,
                        background: active ? 'rgba(45,212,168,0.08)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                      }}
                    >
                      {/* Muestra del color */}
                      <div style={{
                        width: '100%',
                        height: '28px',
                        borderRadius: '6px',
                        background: mode.swatch,
                        border: '1px solid rgba(255,255,255,0.1)',
                      }} />
                      <span style={{
                        fontFamily: 'Outfit,sans-serif',
                        fontSize: '0.75rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? '#99f6e4' : '#e2e8f0',
                        lineHeight: 1.2,
                      }}>
                        {t(mode.labelKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Sección: Tamaño de texto ── */}
            <section aria-labelledby="font-size-heading">
              <h2 id="font-size-heading" style={{
                fontFamily: 'Outfit,sans-serif',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '10px',
              }}>
                {t('a11y.fontSize')}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {FONT_SIZES.map((size) => {
                  const active = prefs.fontSize === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => setFontSize(size.id)}
                      aria-pressed={active}
                      aria-label={`${t('a11y.textSize')} ${t(size.labelKey)}`}
                      style={{
                        flex: 1,
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: `1.5px solid ${active ? '#99f6e4' : 'rgba(255,255,255,0.08)'}`,
                        background: active ? 'rgba(45,212,168,0.08)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span style={{
                        fontSize: size.id === 'normal' ? '1rem' : size.id === 'grande' ? '1.25rem' : '1.5rem',
                        color: active ? '#99f6e4' : '#e2e8f0',
                        lineHeight: 1,
                        fontFamily: 'Outfit,sans-serif',
                      }}>
                        A
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        color: active ? '#99f6e4' : 'rgba(255,255,255,0.4)',
                        fontFamily: 'Outfit,sans-serif',
                        fontWeight: active ? 600 : 400,
                      }}>
                        {t(size.labelKey)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Sección: Idioma ── */}
            <section aria-labelledby="language-heading">
              <h2 id="language-heading" style={{
                fontFamily: 'Outfit,sans-serif',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '10px',
              }}>
                {t('a11y.language')}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {LANGUAGES.map((lang) => {
                  const active = language === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      aria-pressed={active}
                      aria-label={`${t('a11y.language')}: ${lang.label}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 6px',
                        borderRadius: '10px',
                        border: `1.5px solid ${active ? '#99f6e4' : 'rgba(255,255,255,0.08)'}`,
                        background: active ? 'rgba(45,212,168,0.08)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>
                        {lang.flag}
                      </span>
                      <span style={{
                        fontFamily: 'Outfit,sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? '#99f6e4' : '#e2e8f0',
                        lineHeight: 1.2,
                      }}>
                        {lang.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── Pie informativo ── */}
            <p style={{
              fontFamily: 'Outfit,sans-serif',
              fontSize: '0.67rem',
              color: 'rgba(255,255,255,0.25)',
              textAlign: 'center',
              lineHeight: 1.4,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: '12px',
              margin: 0,
            }}>
              {t('a11y.savedPrefs')}
            </p>
          </div>
        )}

        {/* Botón principal flotante */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? t('a11y.close') : t('a11y.open')}
          aria-expanded={open}
          aria-controls="a11y-widget-panel"
          title={open ? t('a11y.close') : t('a11y.open')}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: open
              ? 'linear-gradient(135deg,#99f6e4,#5eead4)'
              : 'rgba(13,26,20,0.95)',
            border: `2px solid ${open ? 'transparent' : 'rgba(45,212,168,0.4)'}`,
            boxShadow: open
              ? '0 4px 24px rgba(45,212,168,0.5)'
              : '0 4px 16px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={open ? '#0A0F1E' : '#99f6e4'}
            strokeWidth="1.8"
          >
            {open ? (
              /* Icono X al abrir */
              <>
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </>
            ) : (
              /* Icono ojo de accesibilidad */
              <>
                <circle cx="12" cy="12" r="3"/>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <line x1="12" y1="2" x2="12" y2="4"/>
                <line x1="12" y1="20" x2="12" y2="22"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              </>
            )}
          </svg>
        </button>
      </div>
    </>
  );
}
