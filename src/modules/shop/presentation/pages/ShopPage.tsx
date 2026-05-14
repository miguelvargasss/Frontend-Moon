import { useState, useMemo } from 'react';
import { Input } from '@nextui-org/react';
import { useProducts } from '../../application/useProducts';
import { useCategories } from '../../application/useCategories';
import HeroBanner from '../components/HeroBanner';
import CategoryTabs from '../components/CategoryTabs';
import ProductCard from '../components/ProductCard';
import EmptyProducts from '../components/EmptyProducts';

/**
 * Página principal de la tienda MoonPhases.
 */
export default function ShopPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { products, loading, error } = useProducts();
  const { categories } = useCategories();

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
  }, [products, activeCategoryId, searchTerm]);

  const getCategoryName = (categoryId?: string) =>
    categories.find((c) => c.id === categoryId)?.name;

  return (
    <div className="min-h-screen bg-background">
      <HeroBanner />

      <div className="max-w-7xl mx-auto px-6">
        {/* Búsqueda */}
        <div className="flex justify-center -mt-8 mb-8 relative z-[2]">
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="shop-search-input"
            className="max-w-[560px]"
            variant="bordered"
            radius="full"
            classNames={{
              inputWrapper: "bg-[--glass-bg] backdrop-blur-xl border-[--glass-border] hover:border-[--glass-border-hover] shadow-lg",
            }}
            startContent={
              <svg className="text-default-400 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
        </div>

        {/* Categorías */}
        <CategoryTabs
          categories={categories}
          products={products}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />

        {/* Resultados */}
        <div className="pb-12">
          <p className="text-sm text-default-400 mb-6">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-12 text-default-500 text-sm">
              <div className="loader-moon" />
              <p>Cargando catálogo...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-danger text-sm">
              <p>{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyProducts />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5">
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
