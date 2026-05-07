import { useEffect, useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { useCategoriesStore } from '../../../categories/application/categories.store';
import { getCategoryIcon } from '../../../categories/presentation/components/CategoryIcons';
import CategoryModal from '../../../categories/presentation/components/CategoryModal';
import type { CategoryModel } from '../../../categories/domain/category.model';

export default function CategoriesAdminPage() {
  const { categories, isLoading, fetchCategories, deleteCategory } = useCategoriesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryModel | null>(null);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = () => { setEditingCategory(null); setModalOpen(true); };
  const handleEdit = (cat: CategoryModel) => { setEditingCategory(cat); setModalOpen(true); };
  const handleDelete = async (cat: CategoryModel) => {
    if (confirm(`¿Eliminar la categoría "${cat.name}"? Esta acción no se puede deshacer.`)) await deleteCategory(cat.id);
  };

  return (
    <div id="categories-admin-page">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" />
            </svg>
            Categorías
          </h1>
          <p className="text-sm text-default-400 mt-1">{categories.length} categoría{categories.length !== 1 ? 's' : ''} registrada{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <Button color="primary" id="btn-new-category" onPress={handleCreate}
          startContent={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
        >
          Nueva Categoría
        </Button>
      </div>

      {isLoading && categories.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-default-500 text-sm">
          <div className="loader-moon" /><p>Cargando categorías...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-default-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" /></svg>
          <p className="text-sm">No hay categorías aún</p>
          <Button color="primary" onPress={handleCreate}>Crear primera categoría</Button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} shadow="none" className="border border-default-200 hover:border-primary/30 transition-colors">
              <CardBody className="flex-row items-center gap-3">
                <div className="flex-shrink-0 text-2xl">{getCategoryIcon(cat.icon)}</div>
                <span className="flex-1 text-sm font-semibold text-foreground truncate">{cat.name}</span>
                <div className="flex gap-1">
                  <Button size="sm" isIconOnly variant="light" color="primary" onPress={() => handleEdit(cat)} aria-label={`Editar ${cat.name}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </Button>
                  <Button size="sm" isIconOnly variant="light" color="danger" onPress={() => handleDelete(cat)} aria-label={`Eliminar ${cat.name}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  </Button>
                </div>
              </CardBody>
            </Card>
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
