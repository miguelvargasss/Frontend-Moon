import { useEffect, useRef } from 'react';
import { useLanguage } from '../../core/i18n/i18n';

interface CartToastProps {
  visible: boolean;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  onClose: () => void;
  onGoToCart: () => void;
}

/**
 * Mini-card de notificación "Producto agregado al carrito".
 * Aparece en la esquina superior derecha con animación slide-in.
 * Se cierra automáticamente a los 3.5 s o al hacer clic en la X.
 */
export default function CartToast({
  visible,
  productName,
  productImage,
  price,
  quantity,
  onClose,
  onGoToCart,
}: CartToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(onClose, 3500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onClose]);

  return (
    <>
      <style>{`
        @keyframes cart-toast-in {
          from { opacity: 0; transform: translateX(110%) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)   scale(1); }
        }
        @keyframes cart-toast-out {
          from { opacity: 1; transform: translateX(0)   scale(1); }
          to   { opacity: 0; transform: translateX(110%) scale(0.95); }
        }
        .cart-toast-enter { animation: cart-toast-in  0.38s cubic-bezier(.22,1,.36,1) forwards; }
        .cart-toast-exit  { animation: cart-toast-out 0.28s cubic-bezier(.55,0,.45,1) forwards; }

        @keyframes progress-bar {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .toast-progress { animation: progress-bar 3.5s linear forwards; }

        .toast-btn-cart {
          background: linear-gradient(135deg, #00b96b 0%, #00d97e 100%);
          color: #fff;
          font-weight: 600;
          font-size: 0.78rem;
          padding: 6px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .toast-btn-cart:hover { opacity: 0.88; }
      `}</style>

      {/* Region aria-live siempre presente en el DOM – se anuncia cuando cambia el contenido */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={t('toast.cartNotification')}
        className={`cart-toast-enter`}
        style={{
          position: 'fixed',
          top: '76px',
          right: '20px',
          zIndex: 9999,
          width: '320px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
          background: 'rgba(22, 27, 34, 0.95)',
          backdropFilter: 'blur(20px)',
          display: visible ? 'flex' : 'none',
          flexDirection: 'column',
        }}
      >
        {/* Barra de progreso */}
        <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', position: 'relative' }}>
          <div
            className={visible ? 'toast-progress' : ''}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              background: 'linear-gradient(90deg, #00b96b, #00d97e)',
              borderRadius: '3px',
            }}
          />
        </div>

        {/* Contenido principal */}
        <div style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          {/* Icono check animado */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(0,185,107,0.15)',
            border: '1.5px solid rgba(0,185,107,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d97e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Texto + imagen */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#00d97e', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t('toast.productAdded')}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center' }}>
              {productImage && (
                <img
                  src={productImage}
                  alt={productName}
                  style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}
                />
              )}
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#fff', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productName}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                  {quantity} × S/ {price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            aria-label={t('toast.closeNotification')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)',
              padding: '0',
              lineHeight: 1,
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Footer con botón */}
        <div style={{ padding: '0 16px 14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="toast-btn-cart" onClick={onGoToCart} aria-label={t('toast.viewCart')}>
            {t('toast.viewCart')}
          </button>
        </div>
      </div>
    </>
  );
}
