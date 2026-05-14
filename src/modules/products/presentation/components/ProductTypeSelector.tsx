import type { ProductType } from '../../domain/product.model';

interface ProductTypeSelectorProps {
  onSelect: (type: ProductType) => void;
}

export default function ProductTypeSelector({ onSelect }: ProductTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-6 py-4">
      <p className="text-sm text-default-500 text-center">
        Selecciona el tipo de producto que deseas crear
      </p>
      <div className="grid grid-cols-2 gap-4">
        {/* Single Product */}
        <button
          type="button"
          className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-default-200 hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
          onClick={() => onSelect('single')}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-foreground mb-1">Producto Único</h3>
            <p className="text-xs text-default-400 leading-relaxed">
              Un solo artículo con precio base, stock global e imágenes generales.
              Puede tener variantes opcionales de talla y color.
            </p>
            <p className="text-xs text-default-300 mt-2 italic">
              Ej: Lámpara, Poster, Anillo
            </p>
          </div>
        </button>

        {/* Multiple Product */}
        <button
          type="button"
          className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-default-200 hover:border-secondary/60 hover:bg-secondary/5 transition-all duration-200 cursor-pointer"
          onClick={() => onSelect('multiple')}
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary">
              <rect x="2" y="7" width="7" height="7" rx="1" />
              <rect x="15" y="7" width="7" height="7" rx="1" />
              <rect x="8.5" y="2" width="7" height="7" rx="1" />
              <rect x="8.5" y="15" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-foreground mb-1">Producto Múltiple</h3>
            <p className="text-xs text-default-400 leading-relaxed">
              Varios estilos/colores, cada uno con sus propias imágenes.
              Cada estilo tiene variantes de talla con precio y stock independiente.
            </p>
            <p className="text-xs text-default-300 mt-2 italic">
              Ej: Polo, Zapatilla, Bolso
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
