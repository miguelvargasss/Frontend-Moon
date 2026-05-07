import { useState, useRef } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Button, Select, SelectItem, Textarea,
} from '@nextui-org/react';
import { useProductsStore } from '../../../products/application/products.store';
import type { ProductModel } from '../../../products/domain/product.model';
import type { CategoryModel } from '../../../categories/domain/category.model';

const SIZE_TYPES = [
  { key: 'tallas', label: 'Tallas (ropa)', defaults: ['S', 'M', 'L', 'XL'] },
  { key: 'capacidad_ml', label: 'Capacidad (ml)', defaults: ['250ml', '350ml', '450ml'] },
  { key: 'capacidad_oz', label: 'Capacidad (oz)', defaults: ['8oz', '12oz', '16oz'] },
  { key: 'piezas', label: 'Piezas / Tamaño', defaults: ['Pequeño', 'Mediano', 'Grande'] },
  { key: 'talla_unica', label: 'Talla única', defaults: ['Única'] },
  { key: 'personalizado', label: 'Personalizado', defaults: [] },
];

interface ProductModalProps {
  product: ProductModel | null;
  categories: CategoryModel[];
  onClose: () => void;
}

type VariantRow = { size: string; color: string; stock: number };

export default function ProductModal({ product, categories, onClose }: ProductModalProps) {
  const isEdit = !!product;
  const { createProduct, updateProduct, uploadImage, deleteImage, isLoading } = useProductsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [price, setPrice] = useState(product?.price ?? 0);
  const [description, setDescription] = useState(product?.description ?? '');
  const [specification, setSpecification] = useState(product?.specification ?? '');
  const [sizeType, setSizeType] = useState(product?.sizeType ?? 'tallas');

  const initialVariants: VariantRow[] = product?.variants?.map((v) => ({
    size: v.size ?? '', color: v.color ?? '', stock: v.stock,
  })) ?? [{ size: '', color: '', stock: 0 }];
  const [variants, setVariants] = useState<VariantRow[]>(initialVariants);

  const [existingImages, setExistingImages] = useState(product?.images ?? []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const addVariant = () => setVariants([...variants, { size: '', color: '', stock: 0 }]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, field: keyof VariantRow, value: string | number) => {
    setVariants(variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (existingImages.length + pendingFiles.length + files.length > 5) {
      alert('Máximo 5 imágenes por producto'); return;
    }
    setPendingFiles([...pendingFiles, ...files]);
    e.target.value = '';
  };
  const removePendingFile = (idx: number) => setPendingFiles(pendingFiles.filter((_, i) => i !== idx));
  const handleRemoveExistingImage = async (imageId: string) => {
    if (product) { await deleteImage(product.id, imageId); setExistingImages(existingImages.filter((img) => img.id !== imageId)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const validVariants = variants.filter((v) => v.size || v.color || v.stock > 0);
    try {
      setUploading(true);
      const productData = {
        name: name.trim(), price: Number(price),
        description: description.trim() || undefined, specification: specification.trim() || undefined,
        sizeType, categoryId: categoryId || undefined,
        variants: validVariants.map((v) => ({ size: v.size || undefined, color: v.color || undefined, stock: Number(v.stock) })),
      };
      let productId: string;
      if (isEdit) { const updated = await updateProduct(product!.id, productData); productId = updated.id; }
      else { const created = await createProduct(productData); productId = created.id; }
      for (const file of pendingFiles) { await uploadImage(productId, file); }
      setUploading(false); onClose();
    } catch { setUploading(false); }
  };

  const restoreDefaults = () => {
    const cfg = SIZE_TYPES.find((s) => s.key === sizeType);
    if (cfg && cfg.defaults.length > 0) setVariants(cfg.defaults.map((s) => ({ size: s, color: '', stock: 0 })));
  };

  return (
    <Modal isOpen onClose={onClose} size="3xl" scrollBehavior="inside" classNames={{
      base: "bg-moon-bg-secondary border border-[--glass-border]",
      header: "border-b border-[--glass-border]",
      footer: "border-t border-[--glass-border]",
    }}>
      <ModalContent>
        <ModalHeader className="text-foreground">{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</ModalHeader>
        <ModalBody as="form" id="product-form" onSubmit={handleSubmit} className="gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nombre del producto" variant="bordered" placeholder="Ej: Polo Estampado Luna" value={name} onChange={(e) => setName(e.target.value)} autoFocus classNames={{ inputWrapper: "border-default-200" }} />
            <Select label="Categoría" variant="bordered" selectedKeys={categoryId ? [categoryId] : []} onSelectionChange={(keys) => setCategoryId(Array.from(keys)[0] as string ?? '')} classNames={{ trigger: "border-default-200" }}>
              {categories.map((cat) => <SelectItem key={cat.id}>{cat.name}</SelectItem>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Precio (S/)" type="number" min="0" step="0.01" variant="bordered" value={String(price)} onChange={(e) => setPrice(Number(e.target.value))} classNames={{ inputWrapper: "border-default-200" }} />
            <Input label="Estado" variant="bordered" value="Disponible" isDisabled classNames={{ inputWrapper: "border-default-200" }} />
          </div>

          <Textarea label="Descripción" variant="bordered" placeholder="Descripción del producto..." value={description} onChange={(e) => setDescription(e.target.value)} classNames={{ inputWrapper: "border-default-200" }} />
          <Textarea label="Especificaciones técnicas (separadas por ·)" variant="bordered" placeholder="Material · capacidad · lavado..." value={specification} onChange={(e) => setSpecification(e.target.value)} classNames={{ inputWrapper: "border-default-200" }} />

          {/* Variants */}
          <div className="flex flex-col gap-3 p-4 rounded-lg border border-default-200 bg-default-50/30">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><circle cx="12" cy="12" r="3" /></svg>
              Configuración de tallas / variantes
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Tipo de variante" variant="bordered" selectedKeys={[sizeType]} onSelectionChange={(keys) => setSizeType(Array.from(keys)[0] as string ?? 'tallas')} classNames={{ trigger: "border-default-200" }}>
                {SIZE_TYPES.map((st) => <SelectItem key={st.key}>{st.label}</SelectItem>)}
              </Select>
              <div className="flex items-end">
                <Button variant="flat" color="default" size="sm" onPress={restoreDefaults}>↺ Restaurar por defecto</Button>
              </div>
            </div>
            {variants.length > 0 && (
              <div className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 text-xs font-medium text-default-500">
                <span>Talla / Tamaño</span><span>Color</span><span>Stock</span><span />
              </div>
            )}
            {variants.map((v, idx) => (
              <div className="grid grid-cols-[1fr_1fr_80px_32px] gap-2" key={idx}>
                <Input size="sm" variant="bordered" placeholder="Ej: M" value={v.size} onChange={(e) => updateVariant(idx, 'size', e.target.value)} classNames={{ inputWrapper: "border-default-200" }} />
                <Input size="sm" variant="bordered" placeholder="Ej: Azul" value={v.color} onChange={(e) => updateVariant(idx, 'color', e.target.value)} classNames={{ inputWrapper: "border-default-200" }} />
                <Input size="sm" variant="bordered" type="number" min="0" value={String(v.stock)} onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))} classNames={{ inputWrapper: "border-default-200" }} />
                <Button size="sm" isIconOnly variant="light" color="danger" onPress={() => removeVariant(idx)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </Button>
              </div>
            ))}
            <Button size="sm" variant="flat" onPress={addVariant}>+ Agregar variante</Button>
          </div>

          {/* Images */}
          <div className="flex flex-col gap-3 p-4 rounded-lg border border-default-200 bg-default-50/30">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
              Imágenes del producto
              <span className="text-xs font-normal text-default-400">(máx. 5 · la primera es la imagen principal)</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-default-200" key={img.id}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button type="button" className="absolute top-1 right-1 w-5 h-5 rounded-full bg-danger flex items-center justify-center" onClick={() => handleRemoveExistingImage(img.id)}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
              {pendingFiles.map((file, idx) => (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-default-200" key={`pending-${idx}`}>
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button type="button" className="absolute top-1 right-1 w-5 h-5 rounded-full bg-danger flex items-center justify-center" onClick={() => removePendingFile(idx)}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
              {existingImages.length + pendingFiles.length < 5 && (
                <button type="button" className="w-20 h-20 rounded-lg border-2 border-dashed border-default-300 flex flex-col items-center justify-center gap-1 text-default-400 hover:border-primary/50 hover:text-primary transition-colors" onClick={() => fileInputRef.current?.click()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  <span className="text-[10px]">Subir</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>Cancelar</Button>
          <Button color="primary" type="submit" form="product-form" isLoading={isLoading || uploading} isDisabled={!name.trim()}>
            {uploading ? 'Subiendo imágenes...' : isLoading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
