import { Chip } from '@nextui-org/react';
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
  const countByCategory = (catId: string) =>
    products.filter((p) => p.categoryId === catId).length;

  return (
    <div className="mb-8" id="category-tabs">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Chip
          variant={activeCategoryId === null ? 'solid' : 'bordered'}
          color={activeCategoryId === null ? 'primary' : 'default'}
          className="cursor-pointer"
          classNames={{
            base: activeCategoryId === null
              ? "bg-primary text-primary-foreground"
              : "border-default-200 hover:border-primary/40",
            content: "font-medium text-sm",
          }}
          onClick={() => onSelect(null)}
          id="category-tab-all"
          startContent={
            <svg className="opacity-60" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
          }
        >
          Todos ({products.length})
        </Chip>

        {categories.map((cat) => (
          <Chip
            key={cat.id}
            variant={activeCategoryId === cat.id ? 'solid' : 'bordered'}
            color={activeCategoryId === cat.id ? 'primary' : 'default'}
            className="cursor-pointer whitespace-nowrap"
            classNames={{
              base: activeCategoryId === cat.id
                ? "bg-primary text-primary-foreground"
                : "border-default-200 hover:border-primary/40",
              content: "font-medium text-sm",
            }}
            onClick={() => onSelect(cat.id)}
            id={`category-tab-${cat.id}`}
          >
            {cat.name} ({countByCategory(cat.id)})
          </Chip>
        ))}
      </div>
    </div>
  );
}
