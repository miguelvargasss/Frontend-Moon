/**
 * Estado vacío cuando no hay productos.
 * Muestra un icono de luna SVG con mensaje elegante (sin emojis).
 */
export default function EmptyProducts() {
  return (
    <div className="empty-products" id="empty-products">
      {/* Luna SVG */}
      <div className="empty-products-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="rgba(45,212,168,0.2)" strokeWidth="1" />
          <path
            d="M40 32c0-5.523-4.477-10-10-10-2.5 0-4.783.921-6.533 2.44C26.133 18.847 30.833 16 36 16c8.837 0 16 7.163 16 16s-7.163 16-16 16c-5.167 0-9.867-2.847-12.533-8.44A9.957 9.957 0 0 0 30 42c5.523 0 10-4.477 10-10z"
            fill="rgba(45,212,168,0.25)"
          />
          <circle cx="32" cy="32" r="20" stroke="rgba(45,212,168,0.1)" strokeWidth="0.5" />
        </svg>
      </div>

      <h3 className="empty-products-title">No encontramos productos</h3>
      <p className="empty-products-subtitle">
        Pronto tendremos productos increíbles para ti.
        <br />
        Vuelve a visitarnos.
      </p>
    </div>
  );
}
