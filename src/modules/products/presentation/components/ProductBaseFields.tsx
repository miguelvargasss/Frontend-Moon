import { Input, Select, SelectItem, Textarea } from '@nextui-org/react';
import type { CategoryModel } from '../../../categories/domain/category.model';

interface ProductBaseFieldsProps {
  name: string;
  categoryId: string;
  statusId: string;
  description: string;
  specification: string;
  statuses: { id: string; name: string }[];
  categories: CategoryModel[];
  onNameChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSpecificationChange: (v: string) => void;
}

export default function ProductBaseFields({
  name, categoryId, statusId, description, specification,
  statuses, categories,
  onNameChange, onCategoryChange, onStatusChange, onDescriptionChange, onSpecificationChange,
}: ProductBaseFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nombre del producto"
          variant="bordered"
          placeholder="Ej: Casaca Cuero"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          autoFocus
          classNames={{ inputWrapper: "border-default-200" }}
        />
        <Select
          label="Categoría"
          variant="bordered"
          selectedKeys={categoryId ? [categoryId] : []}
          onSelectionChange={(keys) => onCategoryChange(Array.from(keys)[0] as string ?? '')}
          classNames={{ trigger: "border-default-200" }}
        >
          {categories.map((cat) => <SelectItem key={cat.id}>{cat.name}</SelectItem>)}
        </Select>
      </div>

      <Select
        label="Estado"
        variant="bordered"
        selectedKeys={statusId ? [statusId] : []}
        onSelectionChange={(keys) => onStatusChange(Array.from(keys)[0] as string ?? '')}
        classNames={{ trigger: "border-default-200" }}
      >
        {statuses.map((s) => <SelectItem key={s.id} className="capitalize">{s.name}</SelectItem>)}
      </Select>

      <Textarea
        label="Descripción"
        variant="bordered"
        placeholder="Descripción del producto..."
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        classNames={{ inputWrapper: "border-default-200" }}
      />
      <Textarea
        label="Especificaciones técnicas (separadas por ·)"
        variant="bordered"
        placeholder="Material · capacidad · lavado..."
        value={specification}
        onChange={(e) => onSpecificationChange(e.target.value)}
        classNames={{ inputWrapper: "border-default-200" }}
      />
    </>
  );
}
