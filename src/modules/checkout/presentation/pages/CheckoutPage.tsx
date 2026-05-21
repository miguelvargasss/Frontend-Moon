import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Chip, Divider } from '@nextui-org/react';
import { useCartStore } from '../../../cart/application/cart.store';
import { useShippingStore } from '../../../shipping/application/shipping.store';
import AddressForm from '../../../shipping/presentation/components/AddressForm';
import type { ShippingAddress } from '../../../shipping/domain/shipping-address.model';
import { ordersApiRepository } from '../../../orders/infrastructure/orders-api.repository';
import OrderSuccessScreen from '../components/OrderSuccessScreen';

/**
 * Página de Checkout — Seleccionar/crear dirección de envío y confirmar pedido.
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, discount, couponCode, clearCart } = useCartStore();
  const { addresses, isLoading, fetchAddresses, createAddress, deleteAddress, error } = useShippingStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [addressesLoaded, setAddressesLoaded] = useState(false);
  const [step, setStep] = useState<'address' | 'confirm' | 'success'>('address');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [createdOrderCode, setCreatedOrderCode] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number>(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAddresses().then(() => setAddressesLoaded(true)); }, []);

  // Auto-seleccionar si solo hay una dirección; mostrar formulario si no hay ninguna.
  // Solo actúa DESPUÉS de que fetchAddresses() haya resuelto para evitar que
  // el estado inicial vacío del store dispare el formulario prematuramente.
  useEffect(() => {
    if (!addressesLoaded) return;
    if (addresses.length === 1 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
    if (addresses.length === 0) {
      setShowForm(true);
    }
  }, [addresses, selectedAddressId, addressesLoaded]);

  const subtotal = items.reduce((s, i) => s + i.productPrice * i.quantity, 0);
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handleCreateAddress = async (data: Omit<ShippingAddress, 'id' | 'userId'>) => {
    const created = await createAddress(data);
    setSelectedAddressId(created.id);
    setShowForm(false);
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddress(id);
    if (selectedAddressId === id) setSelectedAddressId(null);
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddressId) return;
    setIsCreatingOrder(true);
    setOrderError(null);
    try {
      const result = await ordersApiRepository.createOrder(selectedAddressId, couponCode ?? undefined);
      setCreatedOrderCode(result.order.orderCode);
      setWhatsappUrl(result.whatsappUrl);
      // Los puntos se acreditan al confirmar (no al crear). Mostramos el estimado.
      setPointsEarned(Math.round((total / 2) * 10) / 10);
      await clearCart();
      setStep('success');
    } catch (error: unknown) {
      setOrderError((isAxiosError(error) ? error.response?.data?.message : undefined) || 'Hubo un error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (step === 'success' && createdOrderCode && whatsappUrl) {
    return (
      <div className="min-h-screen bg-background py-10">
        <OrderSuccessScreen
          orderCode={createdOrderCode}
          whatsappUrl={whatsappUrl}
          pointsEarned={pointsEarned}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-foreground text-lg font-semibold">Tu carrito está vacío</p>
        <Button color="primary" variant="flat" onPress={() => navigate('/')}>Volver a la tienda</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 md:py-10">
      <div className="max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button isIconOnly variant="light" size="sm" onPress={() => navigate('/carrito')} className="text-default-400 hover:text-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Checkout</h1>
            <p className="text-sm text-default-400 mt-0.5">
              {step === 'address' ? 'Selecciona tu dirección de envío' : 'Confirma tu pedido'}
            </p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === 'address' ? 'bg-primary/15 text-primary' : 'bg-default-100 text-default-500'}`}>
            <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">1</span>
            Dirección
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-default-300"><path d="m9 18 6-6-6-6" /></svg>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${step === 'confirm' ? 'bg-primary/15 text-primary' : 'bg-default-100 text-default-500'}`}>
            <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">2</span>
            Confirmar
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">

          {/* ── Columna Principal ── */}
          <div>
            {step === 'address' && (
              <div className="flex flex-col gap-4">
                {/* Loading */}
                {isLoading && addresses.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="loader-moon" />
                  </div>
                )}

                {/* Lista de direcciones existentes */}
                {!showForm && addresses.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-sm font-semibold text-foreground">Mis direcciones</h2>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => setShowForm(true)}
                        startContent={
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        }
                      >
                        Nueva dirección
                      </Button>
                    </div>

                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`
                          group relative rounded-2xl border p-5 cursor-pointer transition-all duration-200
                          ${selectedAddressId === addr.id
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-default-200/60 bg-content1/50 hover:border-default-300'}
                        `}
                      >
                        {/* Radio indicator */}
                        <div className="flex items-start gap-4">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${selectedAddressId === addr.id ? 'border-primary' : 'border-default-300'}`}>
                            {selectedAddressId === addr.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-foreground">{addr.firstName} {addr.lastName}</p>
                              {addr.dni && <Chip size="sm" variant="flat" className="h-5 text-[10px] bg-default-100">DNI: {addr.dni}</Chip>}
                            </div>
                            <p className="text-sm text-default-500 leading-relaxed">{addr.address}</p>
                            {addr.reference && (
                              <p className="text-xs text-default-400 mt-1">Ref: {addr.reference}</p>
                            )}
                            <p className="text-xs text-default-400 mt-1">
                              {addr.city}, {addr.region} {addr.codeZip ? `· CP ${addr.codeZip}` : ''}
                            </p>
                            <p className="text-xs text-default-400 flex items-center gap-1 mt-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                              {addr.phone}
                            </p>
                          </div>

                          {/* Delete button */}
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-default-400 hover:text-danger"
                            onPress={() => handleDeleteAddress(addr.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Formulario de nueva dirección */}
                {showForm && (
                  <div className="rounded-2xl border border-default-200/60 bg-content1/50 backdrop-blur-sm p-6">
                    <AddressForm
                      onSubmit={handleCreateAddress}
                      onCancel={addresses.length > 0 ? () => setShowForm(false) : undefined}
                      isLoading={isLoading}
                    />
                  </div>
                )}

                {error && <p className="text-xs text-danger">{error}</p>}

                {/* Continuar */}
                {!showForm && selectedAddressId && (
                  <Button
                    color="primary"
                    size="lg"
                    className="w-full font-semibold mt-2 shadow-lg shadow-primary/20"
                    onPress={() => setStep('confirm')}
                    endContent={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                    }
                  >
                    Continuar con este envío
                  </Button>
                )}
              </div>
            )}

            {step === 'confirm' && selectedAddress && (
              <div className="flex flex-col gap-5">
                {/* Dirección seleccionada */}
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      Dirección de envío
                    </h3>
                    <Button size="sm" variant="light" color="primary" onPress={() => setStep('address')}>
                      Cambiar
                    </Button>
                  </div>
                  <p className="text-sm text-foreground font-medium">{selectedAddress.firstName} {selectedAddress.lastName}</p>
                  <p className="text-sm text-default-500">{selectedAddress.address}</p>
                  <p className="text-xs text-default-400">{selectedAddress.city}, {selectedAddress.region}</p>
                  <p className="text-xs text-default-400">{selectedAddress.phone}</p>
                </div>

                {/* Productos del pedido */}
                <div className="rounded-2xl border border-default-200/60 bg-content1/50 p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Productos ({totalUnits})
                  </h3>
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-default-100 flex-shrink-0">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-default-300">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-default-400">
                            {item.variantColor && `${item.variantColor} `}
                            {item.variantLabel && `· ${item.variantLabel} `}
                            · x{item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-foreground tabular-nums">
                          S/ {(item.productPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirmar */}
                <div className="flex flex-col gap-2">
                  <Button
                    color="primary"
                    size="lg"
                    isLoading={isCreatingOrder}
                    onPress={handleConfirmOrder}
                    className="w-full font-semibold shadow-lg shadow-primary/20"
                    startContent={!isCreatingOrder ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12" /></svg>
                    ) : undefined}
                  >
                    Confirmar pedido · S/ {total.toFixed(2)}
                  </Button>
                  {orderError && (
                    <p className="text-sm text-danger text-center mt-2">{orderError}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar Resumen ── */}
          <div className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-default-200/60 bg-content1/50 backdrop-blur-sm p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Resumen del pedido</h3>

              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-default-400">Subtotal ({totalUnits} unidad{totalUnits !== 1 ? 'es' : ''})</span>
                  <span className="text-foreground tabular-nums">S/ {subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-success flex items-center gap-1">
                      Descuento
                      {couponCode && <Chip size="sm" color="success" variant="flat" className="h-4 text-[10px]">{couponCode}</Chip>}
                    </span>
                    <span className="text-success font-medium tabular-nums">- S/ {discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-default-400">Envío</span>
                  <Chip size="sm" color="success" variant="flat" className="h-5 text-[11px]">Gratis</Chip>
                </div>
              </div>

              <Divider className="my-4" />

              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground tabular-nums">S/ {total.toFixed(2)}</span>
              </div>

              {/* MoonPoints preview */}
              {total > 0 && (
                <div className="mt-4 flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f5d020" stroke="#f5d020" strokeWidth="1" className="shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <div>
                    <p className="text-xs font-semibold text-primary leading-tight">
                      Ganarás ~{Math.round((total / 2) * 10) / 10} MoonPoints
                    </p>
                    <p className="text-[11px] text-default-400 mt-0.5">Al confirmar tu pedido</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 mt-5">
                <span className="flex items-center gap-1 text-[11px] text-default-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  Pago seguro
                </span>
                <span className="text-default-300">·</span>
                <span className="flex items-center gap-1 text-[11px] text-default-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16,8 20,8 23,11 23,16 16,16 16,8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                  Envío gratis
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
