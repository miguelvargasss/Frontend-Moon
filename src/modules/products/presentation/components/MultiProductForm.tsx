import { useState, useEffect } from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem } from '@nextui-org/react';
import { useProductsStore } from '../../application/products.store';
import ProductBaseFields from './ProductBaseFields';
import StyleCard from './StyleCard';
import type { ProductModel, ProductImageModel } from '../../domain/product.model';
import type { CategoryModel } from '../../../categories/domain/category.model';

type StyleRow = {
  name: string;
  colorHex: string;
  existingImages: ProductImageModel[];
  pendingFiles: File[];
  variants: { sizeLabel: string; price: number; stock: number; sku: string }[];
};

interface MultiProductFormProps {
  product: ProductModel | null;
  categories: CategoryModel[];
  onClose: () => void;
}

export default function MultiProductForm({ product, categories, onClose }: MultiProductFormProps) {
  const isEdit = !!product;
  const { createProduct, updateProduct, uploadImage, deleteImage, isLoading, statuses, fetchStatuses, sizeSystems, fetchSizeSystems } = useProductsStore();

  useEffect(() => { if (statuses.length === 0) fetchStatuses(); }, [statuses.length, fetchStatuses]);
  useEffect(() => { if (sizeSystems.length === 0) fetchSizeSystems(); }, [sizeSystems.length, fetchSizeSystems]);

  const [name, setName] = useState(product?.name ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [specification, setSpecification] = useState(product?.specification ?? '');
  const [sizeSystemId, setSizeSystemId] = useState(product?.sizeSystemId ?? '');
  const [statusId, setStatusId] = useState(product?.statusId ?? '');

  useEffect(() => {
    if (!statusId && !product && statuses.length > 0) {
      const disponible = statuses.find(s => s.name.toLowerCase() === 'disponible');
      if (disponible) setStatusId(disponible.id);
    }
  }, [statuses, statusId, product]);

  // Estilos
  const initialStyles: StyleRow[] = product?.styles?.map(s => ({
    name: s.name,
    colorHex: s.colorHex ?? '',
    existingImages: s.images ?? [],
    pendingFiles: [],
    variants: s.variants.map(v => ({
      sizeLabel: v.sizeLabel ?? '', price: v.price, stock: v.stock, sku: v.sku ?? '',
    })),
  })) ?? [{ name: '', colorHex: '', existingImages: [], pendingFiles: [], variants: [{ sizeLabel: '', price: 0, stock: 0, sku: '' }] }];

  const [styles, setStyles] = useState<StyleRow[]>(initialStyles);
  const [uploading, setUploading] = useState(false);

  const selectedSystem = sizeSystems.find(s => s.id === sizeSystemId);

  const addStyle = () => {
    const defaultVariants = selectedSystem
      ? selectedSystem.options.map(o => ({ sizeLabel: o.label, price: 0, stock: 0, sku: '' }))
      : [{ sizeLabel: '', price: 0, stock: 0, sku: '' }];
    setStyles([...styles, { name: '', colorHex: '', existingImages: [], pendingFiles: [], variants: defaultVariants }]);
  };

  const updateStyle = (idx: number, update: Partial<StyleRow>) => {
    setStyles(styles.map((s, i) => i === idx ? { ...s, ...update } : s));
  };

  const removeStyle = (idx: number) => setStyles(styles.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || styles.length === 0) return;

    try {
      setUploading(true);
      const data = {
        name: name.trim(),
        productType: 'multiple' as const,
        description: description.trim() || undefined,
        specification: specification.trim() || undefined,
        sizeSystemId: sizeSystemId || undefined,
        categoryId: categoryId || undefined,
        statusId: statusId || undefined,
        styles: styles.map(s => ({
          name: s.name,
          colorHex: s.colorHex || undefined,
          variants: s.variants.filter(v => v.sizeLabel || v.stock > 0).map(v => ({
            sizeLabel: v.sizeLabel || undefined,
            price: Number(v.price),
            stock: Number(v.stock),
            sku: v.sku || undefined,
          })),
        })),
      };

      let productId: string;
      if (isEdit) {
        const updated = await updateProduct(product!.id, data);
        productId = updated.id;
      } else {
        const created = await createProduct(data);
        productId = created.id;
      }

      // Subir imágenes por estilo
      const { productsApi } = await import('../../infrastructure/products-api.repository');
      const freshProduct = await productsApi.getById(productId);

      for (let i = 0; i < styles.length; i++) {
        const styleRow = styles[i];
        if (styleRow.pendingFiles.length === 0) continue;
        const freshStyle = freshProduct.styles[i];
        if (!freshStyle?.id) continue;

        for (const file of styleRow.pendingFiles) {
          await uploadImage(productId, file, freshStyle.id);
        }
      }

      setUploading(false);
      onClose();
    } catch {
      setUploading(false);
    }
  };

  return (
    <>
      <ModalHeader className="text-foreground border-b border-[--glass-border]">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary">
            <rect x="2" y="7" width="7" height="7" rx="1" />
            <rect x="15" y="7" width="7" height="7" rx="1" />
            <rect x="8.5" y="2" width="7" height="7" rx="1" />
          </svg>
          {isEdit ? 'Editar Producto Múltiple' : 'Nuevo Producto Múltiple'}
        </div>
      </ModalHeader>
      <ModalBody as="form" id="multi-product-form" onSubmit={handleSubmit} className="gap-4">
        <ProductBaseFields
          name={name} categoryId={categoryId} statusId={statusId}
          description={description} specification={specification}
          statuses={statuses} categories={categories}
          onNameChange={setName} onCategoryChange={setCategoryId}
          onStatusChange={setStatusId} onDescriptionChange={setDescription}
          onSpecificationChange={setSpecification}
        />

        {/* Sistema de tallas */}
        <Select
          label="Sistema de tallas"
          variant="bordered"
          selectedKeys={sizeSystemId ? [sizeSystemId] : []}
          onSelectionChange={(keys) => setSizeSystemId(Array.from(keys)[0] as string ?? '')}
          classNames={{ trigger: "border-default-200" }}
        >
          {sizeSystems.map((ss) => <SelectItem key={ss.id}>{ss.name}</SelectItem>)}
        </Select>

        {/* Estilos */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary">
                <circle cx="13.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="15.5" r="2.5" /><circle cx="8.5" cy="15.5" r="2.5" />
              </svg>
              Estilos / Colores
            </span>
            <span className="text-xs text-default-400">{styles.length} estilo{styles.length !== 1 ? 's' : ''}</span>
          </div>

          {styles.map((style, idx) => (
            <StyleCard
              key={idx}
              index={idx}
              name={style.name}
              colorHex={style.colorHex}
              existingImages={style.existingImages}
              pendingFiles={style.pendingFiles}
              variants={style.variants}
              onNameChange={(v) => updateStyle(idx, { name: v })}
              onColorHexChange={(v) => updateStyle(idx, { colorHex: v })}
              onAddFiles={(files) => updateStyle(idx, { pendingFiles: [...style.pendingFiles, ...files] })}
              onRemovePending={(fIdx) => updateStyle(idx, { pendingFiles: style.pendingFiles.filter((_, i) => i !== fIdx) })}
              onRemoveExisting={product ? async (imageId) => {
                await deleteImage(product.id, imageId);
                updateStyle(idx, { existingImages: style.existingImages.filter(img => img.id !== imageId) });
              } : undefined}
              onVariantsChange={(v) => updateStyle(idx, { variants: v })}
              onRemove={() => removeStyle(idx)}
            />
          ))}

          <Button size="sm" variant="flat" color="secondary" onPress={addStyle}>
            + Agregar estilo
          </Button>
        </div>
      </ModalBody>
      <ModalFooter className="border-t border-[--glass-border]">
        <Button variant="flat" onPress={onClose}>Cancelar</Button>
        <Button color="primary" type="submit" form="multi-product-form" isLoading={isLoading || uploading} isDisabled={!name.trim() || styles.length === 0}>
          {uploading ? 'Subiendo imágenes...' : isLoading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </ModalFooter>
    </>
  );
}
