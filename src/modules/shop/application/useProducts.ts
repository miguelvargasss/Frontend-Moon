import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../domain/product.model';
import { productsApiRepository } from '../infrastructure/products-api.repository';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  /** Filtra los productos por texto (nombre) — filtro local */
  searchProducts: (term: string) => Product[];
}

/**
 * Hook para gestionar la carga de productos.
 * Realiza UN solo fetch al montar el componente.
 * El filtrado por categoría se hace vía API (param categoryId).
 * El filtrado por texto (búsqueda) se hace localmente.
 */
export function useProducts(categoryId?: string): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await productsApiRepository.getAll(categoryId);
        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError('No se pudieron cargar los productos');
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const searchProducts = useCallback(
    (term: string): Product[] => {
      if (!term.trim()) return products;
      const lower = term.toLowerCase();
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.specification?.toLowerCase().includes(lower),
      );
    },
    [products],
  );

  return { products, loading, error, searchProducts };
}
