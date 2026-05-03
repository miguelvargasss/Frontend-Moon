import { useState } from 'react';
import { useCategoriesStore } from '../../../categories/application/categories.store';
import { CATEGORY_ICONS, getCategoryIconKeys } from './CategoryIcons';
import type { CategoryModel } from '../../../categories/domain/category.model';

interface CategoryModalProps {
  category: CategoryModel | null; // null = create mode
  onClose: () => void;
}

/**
 * Modal para crear o editar una categoría.
 * Incluye input de nombre y selector de icono SVG profesional.
 */
export default function CategoryModal({ category, onClose }: CategoryModalProps) {
  const isEdit = !!category;
  const { createCategory, updateCategory, isLoading } = useCategoriesStore();
  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? 'package');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (isEdit) {
        await updateCategory(category!.id, { name: name.trim(), icon });
      } else {
        await createCategory({ name: name.trim(), icon });
      }
      onClose();
    } catch {
      // Error is handled by store
    }
  };

  return (
    <div className="cat-modal-overlay" onClick={onClose}>
      <div className="cat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cat-modal-header">
          <h2 className="cat-modal-title">
            {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button className="cat-modal-close" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="cat-modal-label" htmlFor="cat-name">
            Nombre de la categoría
          </label>
          <input
            id="cat-name"
            className="cat-modal-input"
            type="text"
            placeholder="Ej: Polos & Ropa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <div className="cat-modal-icons-section">
            <label className="cat-modal-label">Icono</label>
            <div className="cat-modal-icon-grid">
              {getCategoryIconKeys().map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`cat-modal-icon-btn ${icon === key ? 'selected' : ''}`}
                  onClick={() => setIcon(key)}
                  title={CATEGORY_ICONS[key].label}
                  aria-label={CATEGORY_ICONS[key].label}
                >
                  {CATEGORY_ICONS[key].icon}
                </button>
              ))}
            </div>
          </div>

          <div className="cat-modal-actions">
            <button type="button" className="cat-modal-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="cat-modal-submit"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
