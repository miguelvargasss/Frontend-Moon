import { Input, Button } from '@nextui-org/react';

interface VariantRowProps {
  sizeLabel: string;
  color?: string;
  price: number;
  stock: number;
  sku: string;
  showColor?: boolean;
  onSizeLabelChange: (v: string) => void;
  onColorChange?: (v: string) => void;
  onPriceChange: (v: number) => void;
  onStockChange: (v: number) => void;
  onSkuChange: (v: string) => void;
  onRemove: () => void;
}

export default function VariantRow({
  sizeLabel, color, price, stock, sku,
  showColor = false,
  onSizeLabelChange, onColorChange, onPriceChange, onStockChange, onSkuChange,
  onRemove,
}: VariantRowProps) {
  const cols = showColor
    ? 'grid-cols-[1fr_1fr_90px_80px_100px_32px]'
    : 'grid-cols-[1fr_90px_80px_100px_32px]';

  return (
    <div className={`grid ${cols} gap-2 items-center`}>
      <Input
        size="sm"
        variant="bordered"
        placeholder="Ej: M"
        value={sizeLabel}
        onChange={(e) => onSizeLabelChange(e.target.value)}
        classNames={{ inputWrapper: "border-default-200" }}
      />
      {showColor && (
        <Input
          size="sm"
          variant="bordered"
          placeholder="Ej: Rosa"
          value={color ?? ''}
          onChange={(e) => onColorChange?.(e.target.value)}
          classNames={{ inputWrapper: "border-default-200" }}
        />
      )}
      <Input
        size="sm"
        variant="bordered"
        type="number"
        min="0"
        step="0.01"
        placeholder="Precio"
        value={String(price || '')}
        onChange={(e) => onPriceChange(Number(e.target.value))}
        classNames={{ inputWrapper: "border-default-200" }}
      />
      <Input
        size="sm"
        variant="bordered"
        type="number"
        min="0"
        placeholder="Stock"
        value={String(stock)}
        onChange={(e) => onStockChange(Number(e.target.value))}
        classNames={{ inputWrapper: "border-default-200" }}
      />
      <Input
        size="sm"
        variant="bordered"
        placeholder="SKU"
        value={sku}
        onChange={(e) => onSkuChange(e.target.value)}
        classNames={{ inputWrapper: "border-default-200" }}
      />
      <Button size="sm" isIconOnly variant="light" color="danger" onPress={onRemove}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </Button>
    </div>
  );
}
