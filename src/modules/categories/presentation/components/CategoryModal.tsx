import { useState } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Button,
} from '@nextui-org/react';
import { useCategoriesStore } from '../../../categories/application/categories.store';
import { CATEGORY_ICONS, getCategoryIconKeys } from './CategoryIcons';
import type { CategoryModel } from '../../../categories/domain/category.model';

interface CategoryModalProps {
  category: CategoryModel | null;
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
      if (isEdit) await updateCategory(category!.id, { name: name.trim(), icon });
      else await createCategory({ name: name.trim(), icon });
      onClose();
    } catch { /* Error handled by store */ }
  };

  return (
    <Modal isOpen onClose={onClose} size="lg" classNames={{
      base: "bg-moon-bg-secondary border border-[--glass-border]",
      header: "border-b border-[--glass-border]",
      footer: "border-t border-[--glass-border]",
    }}>
      <ModalContent>
        <ModalHeader className="text-foreground">{isEdit ? 'Editar Categoría' : 'Nueva Categoría'}</ModalHeader>
        <ModalBody as="form" id="category-form" onSubmit={handleSubmit} className="gap-4">
          <Input
            label="Nombre de la categoría"
            variant="bordered"
            placeholder="Ej: Polos & Ropa"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            maxLength={20}
            autoFocus
            classNames={{ inputWrapper: "border-default-200" }}
            description={`${name.length}/20 caracteres`}
            color={name.length === 20 ? 'warning' : 'default'}
            id="cat-name"
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-default-600">Icono</label>
            <div className="grid grid-cols-6 gap-2">
              {getCategoryIconKeys().map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all text-xl ${
                    icon === key
                      ? 'border-primary bg-primary/10 scale-105'
                      : 'border-default-200 hover:border-primary/40 hover:bg-default-100/50'
                  }`}
                  onClick={() => setIcon(key)}
                  title={CATEGORY_ICONS[key].label}
                  aria-label={CATEGORY_ICONS[key].label}
                >
                  {CATEGORY_ICONS[key].icon}
                </button>
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>Cancelar</Button>
          <Button color="primary" type="submit" form="category-form" isLoading={isLoading} isDisabled={!name.trim()}>
            {isLoading ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
