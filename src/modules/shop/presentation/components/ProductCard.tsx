import type { Product } from '../../domain/product.model';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

/**
 * Card de producto con imagen, info, precio y botón agregar.
 * Funciona sin cuenta (agregar al carrito es público).
 */
export default function ProductCard({ product, categoryName }: ProductCardProps) {
  const hasImage = product.images && product.images.length > 0;

  /** Info de variantes (size, color) */
  const variantInfo = [product.size, product.color].filter(Boolean).join(' · ');

  return (
    <article className="product-card" id={`product-card-${product.id}`}>
      {/* Imagen */}
      <div className="product-card-image">
        {hasImage ? (
          <img
            src={product.images![0].url}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="product-card-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
        )}

        {/* Badge de categoría */}
        {categoryName && (
          <span className="product-card-badge">{categoryName}</span>
        )}
      </div>

      {/* Info */}
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>

        {product.specification && (
          <p className="product-card-spec">{product.specification}</p>
        )}

        {/* Precio + Variantes */}
        <div className="product-card-footer">
          <div className="product-card-pricing">
            <span className="product-card-price">
              S/ {product.price.toFixed(0)}
            </span>
            {variantInfo && (
              <span className="product-card-variants">{variantInfo}</span>
            )}
          </div>

          <button
            className="product-card-add"
            id={`add-to-cart-${product.id}`}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
