import type { Category } from '../../domain/category.model';
import type { Product } from '../../domain/product.model';

interface CategoryTabsProps {
  categories: Category[];
  products: Product[];
  activeCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

/**
 * Tabs horizontales de categorías con conteo de productos.
 * "Todos" siempre está primero.
 */
export default function CategoryTabs({
  categories,
  products,
  activeCategoryId,
  onSelect,
}: CategoryTabsProps) {
  /** Cuenta productos por categoría */
  const countByCategory = (catId: string) =>
    products.filter((p) => p.categoryId === catId).length;

  return (
    <div className="category-tabs" id="category-tabs">
      <div className="category-tabs-scroll">
        {/* Tab "Todos" */}
        <button
          className={`category-tab ${activeCategoryId === null ? 'category-tab-active' : ''}`}
          onClick={() => onSelect(null)}
          id="category-tab-all"
        >
          <svg className="category-tab-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
          Todos ({products.length})
        </button>

        {/* Tabs dinámicas del backend */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategoryId === cat.id ? 'category-tab-active' : ''}`}
            onClick={() => onSelect(cat.id)}
            id={`category-tab-${cat.id}`}
          >
            {cat.name} ({countByCategory(cat.id)})
          </button>
        ))}
      </div>
    </div>
  );
}
