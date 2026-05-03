import { useState, useRef } from 'react';
import { useProductsStore } from '../../../products/application/products.store';
import { getCategoryIcon } from '../../../categories/presentation/components/CategoryIcons';
import type { ProductModel, ProductVariantModel } from '../../../products/domain/product.model';
import type { CategoryModel } from '../../../categories/domain/category.model';

/** Tipos de variante de talla disponibles */
const SIZE_TYPES = [
  { key: 'tallas', label: 'Tallas (ropa)', defaults: ['S', 'M', 'L', 'XL'] },
  { key: 'capacidad_ml', label: 'Capacidad (ml)', defaults: ['250ml', '350ml', '450ml'] },
  { key: 'capacidad_oz', label: 'Capacidad (oz)', defaults: ['8oz', '12oz', '16oz'] },
  { key: 'piezas', label: 'Piezas / Tamaño', defaults: ['Pequeño', 'Mediano', 'Grande'] },
  { key: 'talla_unica', label: 'Talla única', defaults: ['Única'] },
  { key: 'personalizado', label: 'Personalizado', defaults: [] },
];

interface ProductModalProps {
  product: ProductModel | null; // null = create
  categories: CategoryModel[];
  onClose: () => void;
}

type VariantRow = {
  size: string;
  color: string;
  stock: number;
};

export default function ProductModal({ product, categories, onClose }: ProductModalProps) {
  const isEdit = !!product;
  const { createProduct, updateProduct, uploadImage, deleteImage, isLoading } = useProductsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState(product?.name ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [price, setPrice] = useState(product?.price ?? 0);
  const [description, setDescription] = useState(product?.description ?? '');
  const [specification, setSpecification] = useState(product?.specification ?? '');
  const [sizeType, setSizeType] = useState(product?.sizeType ?? 'tallas');

  // Variants
  const initialVariants: VariantRow[] = product?.variants?.map((v) => ({
    size: v.size ?? '',
    color: v.color ?? '',
    stock: v.stock,
  })) ?? [{ size: '', color: '', stock: 0 }];
  const [variants, setVariants] = useState<VariantRow[]>(initialVariants);

  // Images
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
    const totalImages = existingImages.length + pendingFiles.length + files.length;
    if (totalImages > 5) {
      alert('Máximo 5 imágenes por producto');
      return;
    }
    setPendingFiles([...pendingFiles, ...files]);
    e.target.value = '';
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    if (product) {
      await deleteImage(product.id, imageId);
      setExistingImages(existingImages.filter((img) => img.id !== imageId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Filter empty variants
    const validVariants = variants.filter((v) => v.size || v.color || v.stock > 0);

    try {
      setUploading(true);

      const productData = {
        name: name.trim(),
        price: Number(price),
        description: description.trim() || undefined,
        specification: specification.trim() || undefined,
        sizeType,
        categoryId: categoryId || undefined,
        variants: validVariants.map((v) => ({
          size: v.size || undefined,
          color: v.color || undefined,
          stock: Number(v.stock),
        })),
      };

      let productId: string;

      if (isEdit) {
        const updated = await updateProduct(product!.id, productData);
        productId = updated.id;
      } else {
        const created = await createProduct(productData);
        productId = created.id;
      }

      // Upload pending images
      for (const file of pendingFiles) {
        await uploadImage(productId, file);
      }

      setUploading(false);
      onClose();
    } catch {
      setUploading(false);
    }
  };

  const restoreDefaults = () => {
    const sizeConfig = SIZE_TYPES.find((s) => s.key === sizeType);
    if (sizeConfig && sizeConfig.defaults.length > 0) {
      setVariants(sizeConfig.defaults.map((s) => ({ size: s, color: '', stock: 0 })));
    }
  };

  return (
    <div className="prod-modal-overlay" onClick={onClose}>
      <div className="prod-modal" onClick={(e) => e.stopPropagation()}>
        <div className="prod-modal-header">
          <h2 className="prod-modal-title">{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button className="prod-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1: Name + Category */}
          <div className="prod-modal-row">
            <div>
              <label className="prod-modal-label">Nombre del producto</label>
              <input
                className="prod-modal-input"
                type="text"
                placeholder="Ej: Polo Estampado Luna"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="prod-modal-label">Categoría</label>
              <select
                className="prod-modal-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price + placeholder */}
          <div className="prod-modal-row">
            <div>
              <label className="prod-modal-label">Precio (S/)</label>
              <input
                className="prod-modal-input"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="prod-modal-label">Estado</label>
              <input className="prod-modal-input" value="Disponible" disabled />
            </div>
          </div>

          {/* Description */}
          <div className="prod-modal-field">
            <label className="prod-modal-label">Descripción</label>
            <textarea
              className="prod-modal-textarea"
              placeholder="Descripción del producto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Specification */}
          <div className="prod-modal-field">
            <label className="prod-modal-label">Especificaciones técnicas (separadas por ·)</label>
            <textarea
              className="prod-modal-textarea"
              placeholder="Material · capacidad · lavado..."
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
            />
          </div>

          {/* ── Variants Section ──────────────────────────── */}
          <div className="prod-modal-section">
            <div className="prod-modal-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Configuración de tallas / variantes
            </div>

            <div className="prod-modal-row" style={{ marginBottom: 'var(--space-4)' }}>
              <div>
                <label className="prod-modal-label">Tipo de variante</label>
                <select
                  className="prod-modal-select"
                  value={sizeType}
                  onChange={(e) => setSizeType(e.target.value)}
                >
                  {SIZE_TYPES.map((st) => (
                    <option key={st.key} value={st.key}>{st.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="button" className="variant-add-btn" onClick={restoreDefaults} style={{ height: 38 }}>
                  ↺ Restaurar por defecto
                </button>
              </div>
            </div>

            {/* Variant rows */}
            {variants.length > 0 && (
              <div className="variant-row-header">
                <span>Talla / Tamaño</span>
                <span>Color</span>
                <span>Stock</span>
                <span />
              </div>
            )}
            {variants.map((v, idx) => (
              <div className="variant-row" key={idx}>
                <input
                  className="prod-modal-input"
                  placeholder="Ej: M"
                  value={v.size}
                  onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                />
                <input
                  className="prod-modal-input"
                  placeholder="Ej: Azul"
                  value={v.color}
                  onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                />
                <input
                  className="prod-modal-input"
                  type="number"
                  min="0"
                  value={v.stock}
                  onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                />
                <button
                  type="button"
                  className="variant-remove-btn"
                  onClick={() => removeVariant(idx)}
                  title="Eliminar variante"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <button type="button" className="variant-add-btn" onClick={addVariant}>
              + Agregar variante
            </button>
          </div>

          {/* ── Images Section ──────────────────────────── */}
          <div className="prod-modal-section">
            <div className="prod-modal-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
              Imágenes del producto
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                (máx. 5 · la primera es la imagen principal)
              </span>
            </div>

            <div className="prod-images-grid">
              {/* Existing images */}
              {existingImages.map((img) => (
                <div className="prod-image-thumb" key={img.id}>
                  <img src={img.url} alt="" />
                  <button
                    type="button"
                    className="prod-image-remove"
                    onClick={() => handleRemoveExistingImage(img.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Pending files preview */}
              {pendingFiles.map((file, idx) => (
                <div className="prod-image-thumb" key={`pending-${idx}`}>
                  <img src={URL.createObjectURL(file)} alt="" />
                  <button
                    type="button"
                    className="prod-image-remove"
                    onClick={() => removePendingFile(idx)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Upload button */}
              {existingImages.length + pendingFiles.length < 5 && (
                <button
                  type="button"
                  className="prod-image-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17,8 12,3 7,8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Subir
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="prod-modal-actions">
            <button type="button" className="prod-modal-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="prod-modal-submit"
              disabled={isLoading || uploading || !name.trim()}
            >
              {uploading ? 'Subiendo imágenes...' : isLoading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
