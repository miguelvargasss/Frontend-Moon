import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Input, Chip, Divider } from '@nextui-org/react';
import { useCartStore } from '../../application/cart.store';
import { useProducts } from '../../../shop/application/useProducts';

/**
 * Página del carrito de compras.
 */
export default function CartPage() {
  const navigate = useNavigate();
  const {
    items, loading, fetchCart,
    updateItem, removeItem,
    couponCode, discount, couponError,
    applyCoupon, clearCoupon,
  } = useCartStore();

  const { products } = useProducts();
  const [couponInput, setCouponInput] = useState('');

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const enrichedItems = useMemo(() => {
    return items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        ...item,
        productName: product?.name ?? 'Producto',
        productPrice: product?.price ?? 0,
        productImage: product?.images?.[0]?.url ?? null,
      };
    });
  }, [items, products]);

  const subtotal = enrichedItems.reduce((s, i) => s + i.productPrice * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    if (couponInput.trim()) applyCoupon(couponInput.trim().toUpperCase());
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] text-default-500 text-sm">
        <div className="loader-moon" />
        <p>Cargando carrito...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button isIconOnly variant="light" size="sm" onPress={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Mi Carrito</h1>
            <p className="text-sm text-default-400">{items.length} producto{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-default-300">
              <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <p className="text-lg font-medium text-foreground">Tu carrito está vacío</p>
            <p className="text-sm text-default-400">Agrega productos para comenzar</p>
            <Button as={Link} to="/" color="primary" variant="flat" startContent={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            }>
              Ir a la tienda
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {enrichedItems.map((item) => (
                <Card key={item.id} shadow="none" className="border border-default-200" id={`cart-item-${item.id}`}>
                  <CardBody className="flex-row gap-4 p-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-default-100 flex-shrink-0">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 justify-between min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground truncate">{item.productName}</h3>
                          <span className="text-xs text-default-400">S/ {item.productPrice.toFixed(0)}</span>
                        </div>
                        <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => removeItem(item.id)} aria-label={`Eliminar ${item.productName}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-default-200 rounded-lg overflow-hidden">
                          <Button size="sm" variant="light" isIconOnly isDisabled={item.quantity <= 1} onPress={() => updateItem(item.id, Math.max(1, item.quantity - 1))} className="rounded-none h-7 min-w-[28px]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </Button>
                          <span className="px-3 text-sm font-semibold text-foreground">{item.quantity}</span>
                          <Button size="sm" variant="light" isIconOnly onPress={() => updateItem(item.id, item.quantity + 1)} className="rounded-none h-7 min-w-[28px]">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </Button>
                        </div>
                        <span className="text-sm font-bold text-foreground">S/ {(item.productPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Coupon */}
              <Card shadow="none" className="border border-default-200">
                <CardBody className="gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
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
                      classNames={{ inputWrapper: "border-default-200" }}
                    />
                    <Button size="sm" color="primary" variant="flat" onPress={handleApplyCoupon}>Aplicar</Button>
                  </div>
                  {couponError && <p className="text-xs text-danger">{couponError}</p>}
                  {couponCode && (
                    <div className="flex items-center justify-between">
                      <Chip size="sm" color="success" variant="flat" startContent={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12" /></svg>
                      }>
                        {couponCode} aplicado
                      </Chip>
                      <Button size="sm" isIconOnly variant="light" color="danger" onPress={clearCoupon}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Summary */}
              <Card shadow="none" className="border border-default-200">
                <CardBody className="gap-3">
                  <h3 className="text-sm font-semibold text-foreground">Resumen del pedido</h3>
                  <div className="flex justify-between text-sm text-default-500">
                    <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Descuento</span>
                      <span>- S/ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-default-500">
                    <span>Envío</span>
                    <Chip size="sm" color="success" variant="flat">Gratis</Chip>
                  </div>
                  <Divider />
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>
                  <Button color="primary" size="lg" className="font-semibold mt-2" startContent={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  }>
                    Realizar pedido
                  </Button>
                  <p className="flex items-center justify-center gap-2 text-xs text-default-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    Pago seguro
                    <span>&middot;</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16,8 20,8 23,11 23,16 16,16 16,8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                    Envío gratis
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
