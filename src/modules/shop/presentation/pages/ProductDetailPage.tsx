/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Chip, Accordion, AccordionItem, Breadcrumbs, BreadcrumbItem } from '@nextui-org/react';
import { useProducts } from '../../application/useProducts';
import { useCategories } from '../../application/useCategories';
import { useCartStore } from '../../../cart/application/cart.store';
import { useAuthStore } from '../../../auth/application/auth.store';

/**
 * Página de detalle de un producto.
 */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const addItem = useCartStore((s) => s.addItem);
  const cartError = useCartStore((s) => s.error);
  const clearCartError = useCartStore((s) => s.clearError);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);

  useEffect(() => {
    setSelectedImg(0);
    setSelectedSize(null);
    setSelectedColor(null);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const category = useMemo(
    () => categories.find((c) => c.id === product?.categoryId),
    [categories, product?.categoryId],
  );

  const relatedProducts = useMemo(() => {
    if (!product?.categoryId) return [];
    return products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  const variants = useMemo(() => product?.variants ?? [], [product?.variants]);
  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];

  // Variante(s) que coinciden con la selección actual
  const matchingVariants = useMemo(() => {
    return variants.filter((v) => {
      if (selectedSize && v.size !== selectedSize) return false;
      if (selectedColor && v.color !== selectedColor) return false;
      return true;
    });
  }, [variants, selectedSize, selectedColor]);

  const selectedVariantStock = useMemo(() => {
    // Producto sin variantes (single sin tallas/colores): usar totalStock del producto
    if (variants.length === 0) return product?.totalStock ?? 0;
    if (!selectedSize && !selectedColor) return variants.reduce((sum, v) => sum + v.stock, 0);
    return matchingVariants.reduce((sum, v) => sum + v.stock, 0);
  }, [variants, matchingVariants, selectedSize, selectedColor, product?.totalStock]);

  // Precio dinámico: si la variante seleccionada tiene priceOverride, usarlo
  const displayPrice = useMemo(() => {
    if (matchingVariants.length === 1 && matchingVariants[0].priceOverride != null) {
      return matchingVariants[0].priceOverride;
    }
    // Si varias variantes coinciden y todas tienen el mismo priceOverride, usarlo
    if (matchingVariants.length > 0) {
      const overrides = matchingVariants.map((v) => v.priceOverride).filter((p) => p != null);
      if (overrides.length > 0 && overrides.every((p) => p === overrides[0])) {
        return overrides[0]!;
      }
    }
    return product?.price ?? 0;
  }, [product?.price, matchingVariants]);

  const totalStock = variants.length > 0
    ? variants.reduce((sum, v) => sum + v.stock, 0)
    : (product?.totalStock ?? 0);

  // Imágenes dinámicas: si la variante seleccionada tiene imágenes propias, mostrarlas
  // Si no, mostrar las imágenes generales del producto
  const displayImages = useMemo(() => {
    // Recopilar imágenes de las variantes que coinciden
    const variantImages = matchingVariants.flatMap((v) => v.images ?? []);
    if (variantImages.length > 0) return variantImages;
    // Fallback: imágenes generales del producto
    return product?.images ?? [];
  }, [product?.images, matchingVariants]);

  // ID de la variante seleccionada (para enviar al carrito)
  const selectedVariantId = useMemo(() => {
    if (variants.length === 0) return undefined;
    // Preferir match único; si hay varios, usar el primero (el usuario ya filtró por size/color)
    return matchingVariants[0]?.id;
  }, [variants.length, matchingVariants]);

  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
    if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
  }, [sizes.length, colors.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSelectedImg(0);
  }, [displayImages.length, selectedSize, selectedColor]);

  const specItems = product?.specification
    ? product.specification.split(/[·\n]/).map((s) => s.trim()).filter(Boolean)
    : [];

  const sizeLabel = product?.sizeType === 'tallas' ? 'Talla'
    : product?.sizeType === 'capacidad_ml' ? 'Capacidad'
    : product?.sizeType === 'capacidad_oz' ? 'Capacidad'
    : product?.sizeType === 'piezas' ? 'Presentación'
    : 'Opción';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] text-default-500 text-sm">
        <div className="loader-moon" />
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <h2 className="text-xl font-semibold text-foreground">Producto no encontrado</h2>
        <Link to="/" className="text-primary hover:underline text-sm">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <Breadcrumbs className="mb-6" classNames={{ list: "gap-1" }} separator={
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-default-400"><polyline points="9,18 15,12 9,6" /></svg>
        }>
          <BreadcrumbItem><Link to="/" className="text-default-500 hover:text-foreground text-sm">Tienda</Link></BreadcrumbItem>
          {category && <BreadcrumbItem><span className="text-default-500 text-sm">{category.name}</span></BreadcrumbItem>}
          <BreadcrumbItem><span className="text-foreground text-sm font-medium">{product.name}</span></BreadcrumbItem>
        </Breadcrumbs>

        {/* Main */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-default-100 border border-default-200">
              {displayImages.length > 0 ? (
                <img src={displayImages[selectedImg]?.url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                </div>
              )}
            </div>
            {displayImages.length > 1 && (
              <div className="flex gap-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={img.id}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${idx === selectedImg ? 'border-primary' : 'border-default-200 hover:border-default-400'}`}
                    onClick={() => setSelectedImg(idx)}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {category && <Chip size="sm" variant="flat" color="primary" className="self-start">{category.name}</Chip>}
            <h1 className="font-display text-3xl font-semibold text-foreground">{product.name}</h1>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground">S/ {displayPrice.toFixed(2)}</span>
              {displayPrice !== product.price && (
                <span className="text-sm text-default-400 line-through">S/ {product.price.toFixed(2)}</span>
              )}
              <Chip size="sm" variant="flat" color={totalStock > 0 ? 'success' : 'danger'}>
                {totalStock > 0 ? `${totalStock} en stock` : 'Agotado'}
              </Chip>
            </div>

            <p className="text-xs text-default-400">Precio incluye IGV &middot; Envío calculado en checkout</p>

            <div className="h-px bg-default-200 my-2" />

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-default-600">{sizeLabel}</span>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const hasStock = variants.some((v) => v.size === s && v.stock > 0);
                    return (
                      <Button
                        key={s}
                        size="sm"
                        variant={selectedSize === s ? 'solid' : 'bordered'}
                        color={selectedSize === s ? 'primary' : 'default'}
                        isDisabled={!hasStock}
                        onPress={() => hasStock && setSelectedSize(s)}
                        className={!hasStock ? 'opacity-40 line-through' : ''}
                      >
                        {s}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-default-600">Color</span>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const hasStock = variants.some((v) => v.color === c && v.stock > 0);
                    return (
                      <Button
                        key={c}
                        size="sm"
                        variant={selectedColor === c ? 'solid' : 'bordered'}
                        color={selectedColor === c ? 'primary' : 'default'}
                        isDisabled={!hasStock}
                        onPress={() => hasStock && setSelectedColor(c)}
                        className={!hasStock ? 'opacity-40 line-through' : ''}
                      >
                        {c}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-default-600">Cantidad</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-default-200 rounded-lg overflow-hidden">
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    isDisabled={quantity <= 1}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-none"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </Button>
                  <span className="px-4 text-sm font-semibold text-foreground min-w-[40px] text-center">{quantity}</span>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    isDisabled={quantity >= selectedVariantStock}
                    onPress={() => setQuantity(Math.min(selectedVariantStock, quantity + 1))}
                    className="rounded-none"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </Button>
                </div>
                <span className="text-xs text-default-400">{selectedVariantStock} en stock</span>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              color="primary"
              size="lg"
              className="mt-4 font-semibold"
              isDisabled={selectedVariantStock === 0 || adding}
              isLoading={adding}
              onPress={async () => {
                if (!isAuthenticated) {
                  navigate('/login');
                  return;
                }
                clearCartError();
                setAdding(true);
                await addItem(product.id, quantity, selectedVariantId);
                setAdding(false);
              }}
              startContent={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              }
            >
              {selectedVariantStock > 0 ? `Agregar al carrito · S/ ${(displayPrice * quantity).toFixed(2)}` : 'Sin stock'}
            </Button>
            {cartError && (
              <p className="text-xs text-danger mt-1">{cartError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Accordions */}
      {(product.description || specItems.length > 0) && (
        <div className="border-t border-default-200 bg-default-50/30">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <Accordion variant="bordered" defaultExpandedKeys={["desc", "specs"]} className="border-default-200">
              {product.description ? (
                <AccordionItem
                  key="desc"
                  aria-label="Descripción"
                  title={<span className="text-sm font-medium">Descripción</span>}
                  startContent={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  }
                >
                  <p className="text-sm text-default-600 leading-relaxed pb-2">{product.description}</p>
                </AccordionItem>
              ) : null!}
              {specItems.length > 0 ? (
                <AccordionItem
                  key="specs"
                  aria-label="Especificaciones"
                  title={<span className="text-sm font-medium">Especificaciones técnicas</span>}
                  startContent={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  }
                >
                  <ul className="flex flex-col gap-2 pb-2">
                    {specItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-default-600">
                        <svg className="mt-1.5 flex-shrink-0 text-primary" width="6" height="6" viewBox="0 0 6 6" fill="currentColor"><circle cx="3" cy="3" r="3" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionItem>
              ) : null!}
            </Accordion>
          </div>
        </div>
      )}

      {/* Related Products */}
      <div className="border-t border-default-200 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            También te puede gustar
          </h2>
          {category && relatedProducts.length > 0 && (
            <p className="text-sm text-default-400 mb-6">Más productos de {category.name}</p>
          )}

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => (
                <Link to={`/producto/${rp.id}`} className="group rounded-xl border border-default-200 overflow-hidden hover:border-primary/30 transition-colors no-underline" key={rp.id}>
                  <div className="aspect-square overflow-hidden bg-default-100">
                    {rp.images && rp.images.length > 0 ? (
                      <img src={rp.images[0].url} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground line-clamp-1">{rp.name}</span>
                    <span className="text-sm font-bold text-primary">S/ {rp.price.toFixed(0)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-default-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              <p className="text-sm">Próximamente nuevos productos en esta categoría</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
