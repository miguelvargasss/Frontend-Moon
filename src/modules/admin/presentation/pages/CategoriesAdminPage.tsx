import { useEffect, useState } from 'react';
import { useCategoriesStore } from '../../../categories/application/categories.store';
import { getCategoryIcon } from '../../../categories/presentation/components/CategoryIcons';
import CategoryModal from '../../../categories/presentation/components/CategoryModal';
import type { CategoryModel } from '../../../categories/domain/category.model';
import './CategoriesAdminPage.css';

/**
 * Página de administración de categorías.
 * Muestra grid de categorías con opciones de crear, editar y eliminar.
 */
export default function CategoriesAdminPage() {
  const { categories, isLoading, fetchCategories, deleteCategory } = useCategoriesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryModel | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (cat: CategoryModel) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  const handleDelete = async (cat: CategoryModel) => {
    if (confirm(`¿Eliminar la categoría "${cat.name}"? Esta acción no se puede deshacer.`)) {
      await deleteCategory(cat.id);
    }
  };

  return (
    <div className="cat-admin" id="categories-admin-page">
      <div className="cat-admin-top">
        <div className="admin-page-heading">
          <h1 className="admin-page-title">
            <span className="admin-page-title-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" />
              </svg>
            </span>
            Categorías
          </h1>
          <p className="admin-page-subtitle">
            {categories.length} categoría{categories.length !== 1 ? 's' : ''} registrada{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="cat-admin-add-btn" onClick={handleCreate} id="btn-new-category">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      {isLoading && categories.length === 0 ? (
        <div className="cat-admin-loading">
          <div className="loader-moon" />
          <p>Cargando categorías...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="cat-admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" />
          </svg>
          <p>No hay categorías aún</p>
          <button className="cat-admin-add-btn" onClick={handleCreate}>Crear primera categoría</button>
        </div>
      ) : (
        <div className="cat-admin-grid">
          {categories.map((cat) => (
            <div className="cat-card" key={cat.id}>
              <div className="cat-card-icon">{getCategoryIcon(cat.icon)}</div>
              <div className="cat-card-info">
                <span className="cat-card-name">{cat.name}</span>
              </div>
              <div className="cat-card-actions">
                <button
                  className="cat-card-btn cat-card-edit"
                  onClick={() => handleEdit(cat)}
                  title="Editar"
                  aria-label={`Editar ${cat.name}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="cat-card-btn cat-card-delete"
                  onClick={() => handleDelete(cat)}
                  title="Eliminar"
                  aria-label={`Eliminar ${cat.name}`}
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
        <CategoryModal
          category={editingCategory}
          onClose={() => { setModalOpen(false); setEditingCategory(null); }}
        />
      )}
    </div>
  );
}
