import { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import ImageUploader from './ImageUploader';
import VariantRow from './VariantRow';
import type { ProductImageModel } from '../../domain/product.model';

type StyleVariantRow = {
  sizeLabel: string;
  price: number;
  stock: number;
  sku: string;
};

interface StyleCardProps {
  name: string;
  colorHex: string;
  existingImages: ProductImageModel[];
  pendingFiles: File[];
  variants: StyleVariantRow[];
  index: number;
  onNameChange: (v: string) => void;
  onColorHexChange: (v: string) => void;
  onAddFiles: (files: File[]) => void;
  onRemovePending: (idx: number) => void;
  onRemoveExisting?: (imageId: string) => void;
  onVariantsChange: (variants: StyleVariantRow[]) => void;
  onRemove: () => void;
}

export default function StyleCard({
  name, colorHex, existingImages, pendingFiles, variants, index,
  onNameChange, onColorHexChange,
  onAddFiles, onRemovePending, onRemoveExisting,
  onVariantsChange, onRemove,
}: StyleCardProps) {
  const [expanded, setExpanded] = useState(true);

  const addVariant = () => {
    onVariantsChange([...variants, { sizeLabel: '', price: 0, stock: 0, sku: '' }]);
  };

  const removeVariant = (idx: number) => {
    onVariantsChange(variants.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: keyof StyleVariantRow, value: string | number) => {
    onVariantsChange(variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-default-200 bg-default-50/50">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-1 text-default-400 hover:text-foreground transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
          >
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
        <div
          className="w-6 h-6 rounded-full border-2 border-default-200 flex-shrink-0"
          style={colorHex ? { backgroundColor: colorHex, borderColor: colorHex } : undefined}
        />
        <span className="text-sm font-semibold text-foreground flex-1">
          {name || `Estilo ${index + 1}`}
        </span>
        <span className="text-xs text-default-400">
          {variants.length} variante{variants.length !== 1 ? 's' : ''}
          {' · '}
          {existingImages.length + pendingFiles.length} img
        </span>
        <Button size="sm" isIconOnly variant="light" color="danger" onPress={onRemove}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </Button>
      </div>

      {expanded && (
        <>
          {/* Name + Color picker */}
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <Input
              size="sm"
              variant="bordered"
              label="Nombre del color"
              placeholder="Ej: Azul, Negro, Crema"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              classNames={{ inputWrapper: "border-default-200" }}
            />
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-default-500 px-1">Color (opcional)</label>
              <div className="flex items-center gap-2 h-10 px-2 rounded-medium border border-default-200">
                <input
                  type="color"
                  value={colorHex || '#000000'}
                  onChange={(e) => onColorHexChange(e.target.value)}
                  className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0"
                  aria-label="Seleccionar color"
                />
                {colorHex && (
                  <button
                    type="button"
                    onClick={() => onColorHexChange('')}
                    className="text-[10px] text-default-400 hover:text-danger transition-colors"
                    aria-label="Limpiar color"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-default-500">Imágenes del estilo <span className="text-default-400 font-normal">(máx. 10)</span></span>
            <ImageUploader
              existingImages={existingImages}
              pendingFiles={pendingFiles}
              maxImages={10}
              onAddFiles={onAddFiles}
              onRemovePending={onRemovePending}
              onRemoveExisting={onRemoveExisting}
              size="sm"
            />
          </div>

          {/* Variants */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-default-500">Variantes / Tallas</span>
            {variants.length > 0 && (
              <div className="grid grid-cols-[1fr_90px_80px_100px_32px] gap-2 text-[10px] font-medium text-default-400">
                <span>Talla</span><span>Precio (S/)</span><span>Stock</span><span>SKU</span><span />
              </div>
            )}
            {variants.map((v, idx) => (
              <VariantRow
                key={idx}
                sizeLabel={v.sizeLabel}
                price={v.price}
                stock={v.stock}
                sku={v.sku}
                onSizeLabelChange={(val) => updateVariant(idx, 'sizeLabel', val)}
                onPriceChange={(val) => updateVariant(idx, 'price', val)}
                onStockChange={(val) => updateVariant(idx, 'stock', val)}
                onSkuChange={(val) => updateVariant(idx, 'sku', val)}
                onRemove={() => removeVariant(idx)}
              />
            ))}
            <Button size="sm" variant="flat" className="self-start" onPress={addVariant}>
              + Variante
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
