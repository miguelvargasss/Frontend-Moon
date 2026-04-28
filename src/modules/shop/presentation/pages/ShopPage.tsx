import { useState, useMemo } from 'react';
import { useProducts } from '../../application/useProducts';
import { useCategories } from '../../application/useCategories';
import HeroBanner from '../components/HeroBanner';
import CategoryTabs from '../components/CategoryTabs';
import ProductCard from '../components/ProductCard';
import EmptyProducts from '../components/EmptyProducts';
import '../styles/shop-page.css';

/**
 * Página principal de la tienda MoonPhases.
 *
 * Estructura:
 * 1. HeroBanner (estrellas animadas)
 * 2. Barra de búsqueda
 * 3. Tabs de categorías (dinámicas desde el backend)
 * 4. Grid de productos o estado vacío
 *
 * Accesible sin cuenta — navegación pública.
 */
export default function ShopPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { products, loading, error, searchProducts } = useProducts();
  const { categories } = useCategories();

  /** Productos filtrados por categoría + búsqueda */
  const filteredProducts = useMemo(() => {
    let result = activeCategoryId
      ? products.filter((p) => p.categoryId === activeCategoryId)
      : products;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.specification?.toLowerCase().includes(term),
      );
    }

    return result;
  }, [products, activeCategoryId, searchTerm, searchProducts]);

  /** Resuelve el nombre de categoría para un producto */
  const getCategoryName = (categoryId?: string) =>
    categories.find((c) => c.id === categoryId)?.name;

  return (
    <div className="shop-page">
      {/* Hero */}
      <HeroBanner />

      {/* Búsqueda */}
      <div className="shop-content">
        <div className="shop-search-wrapper">
          <div className="shop-search">
            <svg className="shop-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="shop-search-input"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="shop-search-input"
            />
          </div>
        </div>

        {/* Categorías */}
        <CategoryTabs
          categories={categories}
          products={products}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />

        {/* Resultados */}
        <div className="shop-results">
          <p className="shop-results-count">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>

          {loading ? (
            <div className="shop-loading">
              <div className="loader-moon" />
              <p>Cargando catálogo...</p>
            </div>
          ) : error ? (
            <div className="shop-error">
              <p>{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyProducts />
          ) : (
            <div className="shop-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={getCategoryName(product.categoryId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
