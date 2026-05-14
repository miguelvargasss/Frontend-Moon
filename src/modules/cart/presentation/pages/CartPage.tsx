import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Chip, Divider } from '@nextui-org/react';
import { useCartStore } from '../../application/cart.store';

/**
 * Página del carrito de compras — rediseño premium.
 * Ya no depende de useProducts(): los datos del producto
 * vienen enriquecidos desde GET /cart (JOIN en backend).
 */
export default function CartPage() {
  const navigate = useNavigate();
  const {
    items, loading, fetchCart, error: cartError,
    updateItem, removeItem, clearError,
    couponCode, discount, couponError,
    applyCoupon, clearCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    fetchCart();
  }, [fetchCart, clearError]);

  const subtotal = items.reduce((s, i) => s + i.productPrice * i.quantity, 0);
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    if (couponInput.trim()) applyCoupon(couponInput.trim().toUpperCase());
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    await removeItem(id);
    setRemovingId(null);
  };

  /* ── Loading ── */
  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] text-default-500">
        <div className="loader-moon" />
        <p className="text-sm animate-pulse">Cargando tu carrito...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6 md:mb-10">
          <Button isIconOnly variant="light" size="sm" onPress={() => navigate(-1)} className="text-default-400 hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Mi Carrito</h1>
            <p className="text-sm text-default-400 mt-0.5">
              {items.length === 0
                ? 'No tienes productos'
                : `${items.length} producto${items.length !== 1 ? 's' : ''} · ${totalUnits} unidad${totalUnits !== 1 ? 'es' : ''}`}
            </p>
          </div>
        </div>

        {/* ── Carrito Vacío ── */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-20 text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-default-100 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-default-300">
                  <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-default-50 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-default-300">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Tu carrito está vacío</p>
              <p className="text-sm text-default-400 mt-1">Explora nuestra tienda y encuentra algo especial</p>
            </div>
            <Button
              as={Link}
              to="/"
              color="primary"
              variant="shadow"
              size="lg"
              className="font-semibold mt-2"
              startContent={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>
              }
            >
              Explorar tienda
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">

            {/* ── Lista de Productos ── */}
            <div className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  id={`cart-item-${item.id}`}
                  className={`
                    group relative rounded-2xl border border-default-200/60 bg-content1/50 backdrop-blur-sm
                    p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5
                    ${removingId === item.id ? 'opacity-40 scale-95' : ''}
                  `}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex gap-4">
                    {/* Imagen */}
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-default-100 flex-shrink-0 ring-1 ring-default-200/50">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-default-300">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 justify-between min-w-0 py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-semibold text-foreground line-clamp-1 leading-tight">{item.productName}</h3>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-default-400 hover:text-danger -mt-1 -mr-1"
                            onPress={() => handleRemove(item.id)}
                            aria-label={`Eliminar ${item.productName}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </Button>
                        </div>

                        {/* Variant info */}
                        {(item.variantColor || item.variantLabel) && (
                          <div className="flex items-center gap-1.5 mt-1">
                            {item.variantColor && (
                              <Chip size="sm" variant="flat" className="bg-default-100 text-default-500 h-5 text-[11px]">
                                {item.variantColor}
                              </Chip>
                            )}
                            {item.variantLabel && (
                              <Chip size="sm" variant="flat" className="bg-default-100 text-default-500 h-5 text-[11px]">
                                {item.variantLabel}
                              </Chip>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-default-400 mt-1.5">S/ {item.productPrice.toFixed(2)} c/u</p>
                      </div>

                      {/* Bottom: quantity + price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-0 border border-default-200 rounded-xl overflow-hidden bg-default-50/50">
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            isDisabled={item.quantity <= 1}
                            onPress={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                            className="rounded-none h-8 min-w-[32px] text-default-500"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </Button>
                          <span className="px-4 text-sm font-bold text-foreground tabular-nums select-none">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => updateItem(item.id, item.quantity + 1)}
                            className="rounded-none h-8 min-w-[32px] text-default-500"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </Button>
                        </div>
                        <span className="text-lg font-bold text-foreground tabular-nums">
                          S/ {(item.productPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Sidebar (Sticky) ── */}
            <div className="lg:sticky lg:top-6 flex flex-col gap-4">

              {/* Cupón */}
              <div className="rounded-2xl border border-default-200/60 bg-content1/50 backdrop-blur-sm p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                    <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
                  </svg>
                  Cupón de descuento
                </h3>
                <div className="flex gap-2">
                  <Input
                    size="sm"
                    variant="bordered"
                    placeholder="Ej: LUNA10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    classNames={{
                      inputWrapper: 'border-default-200 bg-default-50/50 hover:border-default-300',
                      input: 'text-sm uppercase',
                    }}
                  />
                  <Button size="sm" color="primary" variant="flat" onPress={handleApplyCoupon} className="font-medium">
                    Aplicar
                  </Button>
                </div>
                {cartError && <p className="text-xs text-danger mt-2">{cartError}</p>}
                {couponError && <p className="text-xs text-danger mt-2">{couponError}</p>}
                {couponCode && (
                  <div className="flex items-center justify-between mt-3 p-2 rounded-lg bg-success/10">
                    <Chip size="sm" color="success" variant="flat" startContent={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12" /></svg>
                    }>
                      {couponCode} aplicado
                    </Chip>
                    <Button size="sm" isIconOnly variant="light" color="danger" onPress={clearCoupon} className="min-w-6 w-6 h-6">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </Button>
                  </div>
                )}
              </div>

              {/* Resumen */}
              <div className="rounded-2xl border border-default-200/60 bg-content1/50 backdrop-blur-sm p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Resumen del pedido</h3>

                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-default-400">Subtotal ({totalUnits} unidad{totalUnits !== 1 ? 'es' : ''})</span>
                    <span className="text-foreground tabular-nums">S/ {subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-success">Descuento</span>
                      <span className="text-success font-medium tabular-nums">- S/ {discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-default-400">Envío</span>
                    <Chip size="sm" color="success" variant="flat" className="h-5 text-[11px]">Gratis</Chip>
                  </div>
                </div>

                <Divider className="my-4" />

                <div className="flex justify-between items-baseline mb-5">
                  <span className="text-base font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-foreground tabular-nums">S/ {total.toFixed(2)}</span>
                </div>

                <Button
                  color="primary"
                  size="lg"
                  className="w-full font-semibold text-base shadow-lg shadow-primary/20"
                  onPress={() => navigate('/checkout')}
                  startContent={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  }
                >
                  Realizar pedido
                </Button>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className="flex items-center gap-1 text-[11px] text-default-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    Pago seguro
                  </span>
                  <span className="text-default-300">·</span>
                  <span className="flex items-center gap-1 text-[11px] text-default-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16,8 20,8 23,11 23,16 16,16 16,8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                    Envío gratis
                  </span>
                  <span className="text-default-300">·</span>
                  <span className="flex items-center gap-1 text-[11px] text-default-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                    Garantía
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
