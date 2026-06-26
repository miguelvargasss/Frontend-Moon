import { useState, useEffect } from 'react';

// ── Tipos ──────────────────────────────────────────────────────────────
type ColorMode = 'normal' | 'alto-contraste' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'escala-grises';
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
const COLOR_MODES: { id: ColorMode; label: string; desc: string; swatch: string }[] = [
  { id: 'normal',         label: 'Normal',          desc: 'Colores originales',                    swatch: 'linear-gradient(135deg,#99f6e4,#0A0F1E)' },
  { id: 'alto-contraste', label: 'Alto contraste',  desc: 'Para baja visión',                      swatch: 'linear-gradient(135deg,#fff700,#000)' },
  { id: 'escala-grises',  label: 'Escala de grises',desc: 'Sin colores',                           swatch: 'linear-gradient(135deg,#fff,#555)' },
  { id: 'deuteranopia',   label: 'Deuteranopía',    desc: 'Daltonismo rojo-verde (más común)',     swatch: 'linear-gradient(135deg,#5b92ff,#a67c00)' },
  { id: 'protanopia',     label: 'Protanopía',      desc: 'Daltonismo, sin percepción del rojo',   swatch: 'linear-gradient(135deg,#7fb3ff,#856400)' },
  { id: 'tritanopia',     label: 'Tritanopía',      desc: 'Daltonismo azul-amarillo (raro)',       swatch: 'linear-gradient(135deg,#ff6e6e,#00c6c6)' },
];

const FONT_SIZES: { id: FontSize; label: string; multiplier: string }[] = [
  { id: 'normal',     label: 'Normal',    multiplier: '100%' },
  { id: 'grande',     label: 'Grande',    multiplier: '118%' },
  { id: 'muy-grande', label: 'Muy grande',multiplier: '136%' },
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
  root.classList.remove('a11y-alto-contraste');

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
    'alto-contraste': 'none',
    'escala-grises':  'grayscale(100%)',
    'deuteranopia':   'url(#filter-deuteranopia)',
    'protanopia':     'url(#filter-protanopia)',
    'tritanopia':     'url(#filter-tritanopia)',
  };
  document.body.style.filter = filterMap[prefs.colorMode];

  // Alto contraste: clase especial en el <html>
  if (prefs.colorMode === 'alto-contraste') {
    root.classList.add('a11y-alto-contraste');
  }
}

// ── Componente principal ───────────────────────────────────────────────
export default function AccessibilityWidget() {
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

  const resetAll = () => setPrefs(DEFAULT_PREFS);

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
            aria-label="Opciones de accesibilidad visual"
            aria-modal="false"
            style={{
              width: '300px',
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
                  Accesibilidad Visual
                </span>
              </div>
              <button
                onClick={resetAll}
                aria-label="Restablecer todas las opciones de accesibilidad"
                title="Restablecer todo"
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
                Restablecer
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
                Modo de color
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {COLOR_MODES.map((mode) => {
                  const active = prefs.colorMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setColorMode(mode.id)}
                      aria-pressed={active}
                      aria-label={`${mode.label}: ${mode.desc}`}
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
                        {mode.label}
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
                Tamaño de texto
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {FONT_SIZES.map((size) => {
                  const active = prefs.fontSize === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => setFontSize(size.id)}
                      aria-pressed={active}
                      aria-label={`Tamaño de texto ${size.label}`}
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
                        {size.label}
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
              Tus preferencias se guardan automáticamente.
            </p>
          </div>
        )}

        {/* Botón principal flotante */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Cerrar opciones de accesibilidad' : 'Abrir opciones de accesibilidad visual'}
          aria-expanded={open}
          aria-controls="a11y-widget-panel"
          title={open ? 'Cerrar accesibilidad' : 'Opciones de accesibilidad'}
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
