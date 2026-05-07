import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardFooter, Button, Chip } from '@nextui-org/react';
import type { Product } from '../../domain/product.model';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
}

/**
 * Card de producto compacta con carrusel de imágenes y overlay "Ver Detalles".
 */
export default function ProductCard({ product, categoryName }: ProductCardProps) {
  const images = product.images ?? [];
  const hasImages = images.length > 0;
  const [currentImg, setCurrentImg] = useState(0);

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1) % images.length);
  };
  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
  };

  const colors = [...new Set((product.variants ?? []).map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set((product.variants ?? []).map((v) => v.size).filter(Boolean))];

  return (
    <Card
      className="group border border-default-200 bg-default-50/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
      id={`product-card-${product.id}`}
      shadow="none"
    >
      {/* Imagen con carrusel y overlay */}
      <div className="relative w-full aspect-square overflow-hidden bg-default-100">
        {hasImages ? (
          <>
            <img
              src={images[currentImg].url}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {images.length > 1 && (
              <>
                <button className="absolute top-1/2 left-2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/30 z-[3]" onClick={goPrev} aria-label="Anterior">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6" /></svg>
                </button>
                <button className="absolute top-1/2 right-2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/30 z-[3]" onClick={goNext} aria-label="Siguiente">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6" /></svg>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-[3] opacity-0 group-hover:opacity-100 transition-opacity">
                  {images.map((_, idx) => (
                    <span key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImg ? 'bg-primary scale-125' : 'bg-white/40'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-radial from-primary/5 to-transparent">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
        )}

        {categoryName && (
          <Chip size="sm" variant="flat" className="absolute top-3 left-3 z-[2] bg-black/70 backdrop-blur-sm text-foreground text-xs font-semibold">
            {categoryName}
          </Chip>
        )}

        <Link to={`/producto/${product.id}`} className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-[2] no-underline">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground bg-primary/15 border border-primary/30 rounded-lg backdrop-blur-sm hover:bg-primary/25 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Ver Detalles
          </span>
        </Link>
      </div>

      <CardBody className="p-4 gap-2">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{product.name}</h3>
        {(colors.length > 0 || sizes.length > 0) && (
          <p className="text-xs text-default-400 line-clamp-1">
            {sizes.length > 0 && sizes.join(' / ')}
            {sizes.length > 0 && colors.length > 0 && ' · '}
            {colors.length > 0 && colors.join(' / ')}
          </p>
        )}
      </CardBody>

      <CardFooter className="px-4 pb-4 pt-0 justify-between items-end">
        <span className="text-lg font-bold text-foreground">S/ {product.price.toFixed(0)}</span>
        <Button
          size="sm"
          color="primary"
          id={`add-to-cart-${product.id}`}
          aria-label={`Agregar ${product.name} al carrito`}
          isIconOnly
          className="rounded-lg"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
}
