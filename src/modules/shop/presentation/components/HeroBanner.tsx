import { useLanguage } from '../../../../core/i18n/i18n';

/**
 * HeroBanner — Sección hero de la tienda con estrellas animadas.
 * Muestra el slogan principal de MoonPhases con fondo de cielo estrellado.
 */
export default function HeroBanner() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden border-b border-[--glass-border] bg-gradient-to-b from-moon-bg-secondary to-moon-bg px-6 py-12 min-h-[320px] flex items-center justify-center" id="hero-banner">
      {/* Capas de estrellas animadas */}
      <div className="hero-stars hero-stars-1" />
      <div className="hero-stars hero-stars-2" />
      <div className="hero-stars hero-stars-3" />

      {/* Glow decorativo */}
      <div className="absolute -top-[40%] -right-[10%] w-[400px] h-[400px] rounded-full bg-primary/[0.06] pointer-events-none animate-[glowPulse_6s_ease-in-out_infinite]" />

      <div className="relative z-[1] text-center max-w-[640px]">
        <p className="text-sm font-medium text-primary tracking-wider opacity-80 mb-4">
          {t('hero.subtitle')}
        </p>
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-semibold text-foreground leading-[1.15] mb-5">
          {t('hero.title1')}
          <br />
          <em className="font-medium text-primary italic">{t('hero.title2')}</em>
        </h1>
        <p className="text-base text-default-500 leading-relaxed max-w-[480px] mx-auto">
          {t('hero.description')}
        </p>
      </div>
    </section>
  );
}
