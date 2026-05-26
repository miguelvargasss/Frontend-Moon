import { useState, useEffect } from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem } from '@nextui-org/react';
import { useProductsStore } from '../../application/products.store';
import ProductBaseFields from './ProductBaseFields';
import ImageUploader from './ImageUploader';
import VariantRow from './VariantRow';
import type { ProductModel, ProductImageModel } from '../../domain/product.model';
import type { CategoryModel } from '../../../categories/domain/category.model';

type VariantRow_ = { sizeLabel: string; color: string; price: number; stock: number; sku: string };

interface SingleProductFormProps {
  product: ProductModel | null;
  categories: CategoryModel[];
  onClose: () => void;
}

export default function SingleProductForm({ product, categories, onClose }: SingleProductFormProps) {
  const isEdit = !!product;
  const { createProduct, updateProduct, uploadImage, deleteImage, isLoading, statuses, fetchStatuses, sizeSystems, fetchSizeSystems } = useProductsStore();

  useEffect(() => { if (statuses.length === 0) fetchStatuses(); }, [statuses.length, fetchStatuses]);
  useEffect(() => { if (sizeSystems.length === 0) fetchSizeSystems(); }, [sizeSystems.length, fetchSizeSystems]);

  const [name, setName] = useState(product?.name ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [specification, setSpecification] = useState(product?.specification ?? '');
  const [price, setPrice] = useState(product?.price ?? 0);
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [sku, setSku] = useState(product?.sku ?? '');
  const [sizeSystemId, setSizeSystemId] = useState(product?.sizeSystemId ?? '');
  const [statusId, setStatusId] = useState(product?.statusId ?? '');
  const effectiveStatusId = statusId ||
    (!product && statuses.length > 0
      ? (statuses.find(s => s.name.toLowerCase() === 'disponible')?.id ?? '')
      : '');

  // Imágenes globales
  const [globalExisting, setGlobalExisting] = useState<ProductImageModel[]>(product?.images ?? []);
  const [globalPending, setGlobalPending] = useState<File[]>([]);

  // Variantes
  const initialVariants: VariantRow_[] = product?.variants?.map(v => ({
    sizeLabel: v.sizeLabel ?? '', color: v.color ?? '', price: v.price, stock: v.stock, sku: v.sku ?? '',
  })) ?? [];
  const [variants, setVariants] = useState<VariantRow_[]>(initialVariants);
  const [uploading, setUploading] = useState(false);

  const hasVariants = variants.length > 0;
  const selectedSystem = sizeSystems.find(s => s.id === sizeSystemId);

  const addVariant = () => setVariants([...variants, { sizeLabel: '', color: '', price: price, stock: 0, sku: '' }]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));

  const restoreDefaults = () => {
    if (selectedSystem) {
      setVariants(selectedSystem.options.map(o => ({
        sizeLabel: o.label, color: '', price: price, stock: 0, sku: '',
      })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validVariants = variants.filter(v => v.sizeLabel || v.color || v.stock > 0);
    try {
      setUploading(true);
      const data = {
        name: name.trim(),
        productType: 'single' as const,
        price: Number(price),
        stock: !hasVariants ? Number(stock) : undefined,
        sku: !hasVariants ? (sku || undefined) : undefined,
        description: description.trim() || undefined,
        specification: specification.trim() || undefined,
        sizeSystemId: sizeSystemId || undefined,
        categoryId: categoryId || undefined,
        statusId: effectiveStatusId || undefined,
        variants: validVariants.length > 0 ? validVariants.map(v => ({
          sizeLabel: v.sizeLabel || undefined,
          color: v.color || undefined,
          price: Number(v.price),
          stock: Number(v.stock),
          sku: v.sku || undefined,
        })) : undefined,
      };

      let productId: string;
      if (isEdit) {
        const updated = await updateProduct(product!.id, data);
        productId = updated.id;
      } else {
        const created = await createProduct(data);
        productId = created.id;
      }

      // Subir imágenes globales
      for (const file of globalPending) {
        await uploadImage(productId, file);
      }

      setUploading(false);
      onClose();
    } catch {
      setUploading(false);
    }
  };

  const handleRemoveExisting = async (imageId: string) => {
    if (product) {
      await deleteImage(product.id, imageId);
      setGlobalExisting(globalExisting.filter(img => img.id !== imageId));
    }
  };

  return (
    <>
      <ModalHeader className="text-foreground border-b border-[--glass-border]">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          {isEdit ? 'Editar Producto Único' : 'Nuevo Producto Único'}
        </div>
      </ModalHeader>
      <ModalBody as="form" id="single-product-form" onSubmit={handleSubmit} className="gap-4">
        <ProductBaseFields
          name={name} categoryId={categoryId} statusId={effectiveStatusId}
          description={description} specification={specification}
          statuses={statuses} categories={categories}
          onNameChange={setName} onCategoryChange={setCategoryId}
          onStatusChange={setStatusId} onDescriptionChange={setDescription}
          onSpecificationChange={setSpecification}
        />

        {/* Precio + Stock + SKU */}
        <div className="grid grid-cols-3 gap-3">
          <Input label="Precio base (S/)" type="number" min="0" step="0.01" variant="bordered" value={String(price)} onChange={(e) => setPrice(Number(e.target.value))} classNames={{ inputWrapper: "border-default-200" }} />
          {!hasVariants && (
            <>
              <Input label="Stock" type="number" min="0" variant="bordered" value={String(stock)} onChange={(e) => setStock(Number(e.target.value))} classNames={{ inputWrapper: "border-default-200" }} />
              <Input label="SKU" variant="bordered" placeholder="Opcional" value={sku} onChange={(e) => setSku(e.target.value)} classNames={{ inputWrapper: "border-default-200" }} />
            </>
          )}
        </div>

        {/* Imágenes generales */}
        <div className="flex flex-col gap-3 p-4 rounded-lg border border-default-200 bg-default-50/30">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
            </svg>
            Imágenes del producto
            <span className="text-xs font-normal text-default-400">(máx. 10)</span>
          </div>
          <ImageUploader
            existingImages={globalExisting}
            pendingFiles={globalPending}
            maxImages={10}
            onAddFiles={(files) => setGlobalPending([...globalPending, ...files])}
            onRemovePending={(idx) => setGlobalPending(globalPending.filter((_, i) => i !== idx))}
            onRemoveExisting={handleRemoveExisting}
          />
        </div>

        {/* Variantes opcionales */}
        <div className="flex flex-col gap-3 p-4 rounded-lg border border-default-200 bg-default-50/30">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <circle cx="12" cy="12" r="3" />
            </svg>
            Variantes (opcional)
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Sistema de tallas"
              variant="bordered"
              selectedKeys={sizeSystemId ? [sizeSystemId] : []}
              onSelectionChange={(keys) => setSizeSystemId(Array.from(keys)[0] as string ?? '')}
              classNames={{ trigger: "border-default-200" }}
            >
              {sizeSystems.map((ss) => <SelectItem key={ss.id}>{ss.name}</SelectItem>)}
            </Select>
            <div className="flex items-end gap-2">
              <Button variant="flat" color="default" size="sm" onPress={restoreDefaults} isDisabled={!sizeSystemId}>
                ↺ Restaurar por defecto
              </Button>
            </div>
          </div>

          {variants.length > 0 && (
            <div className="grid grid-cols-[1fr_1fr_90px_80px_100px_32px] gap-2 text-xs font-medium text-default-500">
              <span>Talla / Tamaño</span><span>Color</span><span>Precio (S/)</span><span>Stock</span><span>SKU</span><span />
            </div>
          )}

          {variants.map((v, idx) => (
            <VariantRow
              key={idx}
              sizeLabel={v.sizeLabel}
              color={v.color}
              showColor
              price={v.price}
              stock={v.stock}
              sku={v.sku}
              onSizeLabelChange={(val) => setVariants(variants.map((vr, i) => i === idx ? { ...vr, sizeLabel: val } : vr))}
              onColorChange={(val) => setVariants(variants.map((vr, i) => i === idx ? { ...vr, color: val } : vr))}
              onPriceChange={(val) => setVariants(variants.map((vr, i) => i === idx ? { ...vr, price: val } : vr))}
              onStockChange={(val) => setVariants(variants.map((vr, i) => i === idx ? { ...vr, stock: val } : vr))}
              onSkuChange={(val) => setVariants(variants.map((vr, i) => i === idx ? { ...vr, sku: val } : vr))}
              onRemove={() => removeVariant(idx)}
            />
          ))}
          <Button size="sm" variant="flat" onPress={addVariant}>+ Agregar variante</Button>
        </div>
      </ModalBody>
      <ModalFooter className="border-t border-[--glass-border]">
        <Button variant="flat" onPress={onClose}>Cancelar</Button>
        <Button color="primary" type="submit" form="single-product-form" isLoading={isLoading || uploading} isDisabled={!name.trim()}>
          {uploading ? 'Subiendo imágenes...' : isLoading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </ModalFooter>
    </>
  );
}
