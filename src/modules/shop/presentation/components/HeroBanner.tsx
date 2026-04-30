/**
 * HeroBanner — Sección hero de la tienda con estrellas animadas.
 * Muestra el slogan principal de MoonPhases con fondo de cielo estrellado.
 */
export default function HeroBanner() {
  return (
    <section className="hero-banner" id="hero-banner">
      {/* Capas de estrellas animadas */}
      <div className="hero-stars hero-stars-1" />
      <div className="hero-stars hero-stars-2" />
      <div className="hero-stars hero-stars-3" />

      {/* Glow decorativo */}
      <div className="hero-glow" />

      <div className="hero-content">
        <p className="hero-tagline">
          Productos únicos, hechos para ti
        </p>

        <h1 className="hero-title">
          Cada producto cuenta
          <br />
          <em>tu historia</em>
        </h1>

        <p className="hero-description">
          Diseña y personaliza productos únicos que reflejen quién eres.
          Polos, tazas, vasos y más.
        </p>
      </div>
    </section>
  );
}
