import { useState, useEffect } from 'react';
import type { Category } from '../domain/category.model';
import { categoriesApiRepository } from '../infrastructure/categories-api.repository';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook para cargar categorías del backend.
 * Realiza UN solo fetch al montar el componente.
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const data = await categoriesApiRepository.getAll();
        if (!cancelled) {
          setCategories(data);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudieron cargar las categorías');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}
