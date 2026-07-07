import { useLanguage } from '../../../../core/i18n/i18n';

/**
 * Estado vacío cuando no hay productos.
 * Muestra un icono de luna SVG con mensaje elegante (sin emojis).
 */
export default function EmptyProducts() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center" id="empty-products">
      <div className="opacity-60 animate-[floatMoon_4s_ease-in-out_infinite]">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="rgba(45,212,168,0.2)" strokeWidth="1" />
          <path
            d="M40 32c0-5.523-4.477-10-10-10-2.5 0-4.783.921-6.533 2.44C26.133 18.847 30.833 16 36 16c8.837 0 16 7.163 16 16s-7.163 16-16 16c-5.167 0-9.867-2.847-12.533-8.44A9.957 9.957 0 0 0 30 42c5.523 0 10-4.477 10-10z"
            fill="rgba(45,212,168,0.25)"
          />
          <circle cx="32" cy="32" r="20" stroke="rgba(45,212,168,0.1)" strokeWidth="0.5" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground">{t('empty.title')}</h3>
      <p className="text-sm text-default-500 leading-relaxed">
        {t('empty.line1')}
        <br />
        {t('empty.line2')}
      </p>
    </div>
  );
}
