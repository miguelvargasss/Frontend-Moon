import { useEffect, useState, useMemo } from 'react';
import { useProductsStore } from '../../../products/application/products.store';
import { useCategoriesStore } from '../../../categories/application/categories.store';
import { getCategoryIcon } from '../../../categories/presentation/components/CategoryIcons';
import ProductModal from '../../../products/presentation/components/ProductModal';
import type { ProductModel } from '../../../products/domain/product.model';
import './ProductsAdminPage.css';

export default function ProductsAdminPage() {
  const { products, isLoading, fetchProducts, deleteProduct } = useProductsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductModel | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filtered = useMemo(() => {
    let list = products;
    if (filterCat) list = list.filter((p) => p.categoryId === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, filterCat, search]);

  const catName = (catId?: string) =>
    categories.find((c) => c.id === catId)?.name ?? '—';
  const catIcon = (catId?: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? getCategoryIcon(cat.icon) : null;
  };

  const handleDelete = async (p: ProductModel) => {
    if (confirm(`¿Eliminar el producto "${p.name}"?`)) {
      await deleteProduct(p.id);
    }
  };

  return (
    <div className="prod-admin" id="products-admin-page">
      <div className="prod-admin-top">
        <div className="admin-page-heading">
          <h1 className="admin-page-title">
            <span className="admin-page-title-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </span>
            Productos
          </h1>
          <p className="admin-page-subtitle">
            {products.length} producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="prod-admin-add-btn"
          onClick={() => { setEditingProduct(null); setModalOpen(true); }}
          id="btn-new-product"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      {/* Search & Filters */}
      <div className="prod-admin-filters">
        <div className="prod-search-wrapper">
          <svg className="prod-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="prod-search-input"
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="prod-filter-chips">
          <button
            className={`prod-chip ${!filterCat ? 'prod-chip-active' : ''}`}
            onClick={() => setFilterCat(null)}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`prod-chip ${filterCat === cat.id ? 'prod-chip-active' : ''}`}
              onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
            >
              <span className="prod-chip-icon">{getCategoryIcon(cat.icon)}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading && products.length === 0 ? (
        <div className="prod-admin-loading">
          <div className="loader-moon" />
          <p>Cargando productos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="prod-admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          </svg>
          <p>{search ? 'No se encontraron productos' : 'No hay productos aún'}</p>
        </div>
      ) : (
        <div className="prod-admin-grid">
          {filtered.map((prod) => (
            <div className="prod-card" key={prod.id}>
              {/* Image */}
              <div className="prod-card-img-wrapper">
                {prod.images[0] ? (
                  <img src={prod.images[0].url} alt={prod.name} className="prod-card-img" />
                ) : (
                  <div className="prod-card-img-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21,15 16,10 5,21" />
                    </svg>
                  </div>
                )}
                {/* Status badge */}
                <span className={`prod-card-status ${prod.totalStock > 0 ? 'available' : 'out'}`}>
                  {prod.totalStock > 0 ? 'Disponible' : 'Agotado'}
                </span>
                {/* Category */}
                {prod.categoryId && (
                  <span className="prod-card-category">
                    {catIcon(prod.categoryId)}
                    {catName(prod.categoryId)}
                  </span>
                )}
                {/* Image count */}
                {prod.images.length > 1 && (
                  <span className="prod-card-img-count">+{prod.images.length - 1} fotos</span>
                )}
              </div>

              {/* Info */}
              <div className="prod-card-body">
                <h3 className="prod-card-name">{prod.name}</h3>

                {/* Variants summary */}
                {prod.variants.length > 0 && (
                  <p className="prod-card-variants">
                    {prod.sizeType && <span className="prod-card-variant-type">{prod.sizeType}</span>}
                    {' · '}
                    {[...new Set(prod.variants.map((v) => v.size).filter(Boolean))].join(', ') || ''}
                  </p>
                )}

                <div className="prod-card-footer">
                  <span className="prod-card-price">S/ {prod.price}</span>
                  <span className="prod-card-stock">Stock: {prod.totalStock}</span>
                  {prod.variants.length > 0 && (
                    <span className="prod-card-colors">
                      {[...new Set(prod.variants.map((v) => v.color).filter(Boolean))].join(' / ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="prod-card-actions">
                <button
                  className="prod-card-btn prod-card-edit"
                  onClick={() => { setEditingProduct(prod); setModalOpen(true); }}
                  title="Editar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="prod-card-btn prod-card-delete"
                  onClick={() => handleDelete(prod)}
                  title="Eliminar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => { setModalOpen(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
}
