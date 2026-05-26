import { useEffect, useState } from 'react';
import { Button, Chip } from '@nextui-org/react';
import { useCouponsStore } from '../../../coupons/application/coupons.store';
import { useCategoriesStore } from '../../../categories/application/categories.store';
import { getCategoryIcon } from '../../../categories/presentation/components/CategoryIcons';
import CouponModal from '../../../coupons/presentation/CouponModal';
import type { CouponModel } from '../../../coupons/domain/coupon.model';

/** Determina el estado visual del cupón */
function getCouponStatus(coupon: CouponModel): { label: string; color: 'success' | 'warning' | 'danger' } {
  const now = new Date();
  const expDate = new Date(coupon.expirationDate);
  if (expDate < now) return { label: 'Expirado', color: 'danger' };
  if (coupon.couponQuantity <= 0) return { label: 'Agotado', color: 'warning' };
  return { label: 'Activo', color: 'success' };
}

export default function CouponsAdminPage() {
  const { coupons, isLoading, fetchCoupons, deleteCoupon } = useCouponsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponModel | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { fetchCoupons(); fetchCategories(); }, [fetchCoupons, fetchCategories]);

  const catName = (catId?: string) => categories.find((c) => c.id === catId)?.name;
  const catIcon = (catId?: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? getCategoryIcon(cat.icon) : null;
  };

  const handleCreate = () => { setEditingCoupon(null); setModalOpen(true); };
  const handleEdit = (c: CouponModel) => { setEditingCoupon(c); setModalOpen(true); };
  const handleDelete = async (c: CouponModel) => {
    if (confirm(`Eliminar el cupon "${c.code}"? Esta accion no se puede deshacer.`)) {
      await deleteCoupon(c.id);
    }
  };

  const copyCode = async (coupon: CouponModel) => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopiedId(coupon.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* clipboard not available */ }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div id="coupons-admin-page" className="flex flex-col gap-6 animate-appearance-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
              <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
            </svg>
            Cupones
          </h1>
          <p className="text-sm text-default-400 mt-1">
            {coupons.length} cupon{coupons.length !== 1 ? 'es' : ''} registrado{coupons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          color="primary"
          id="btn-new-coupon"
          onPress={handleCreate}
          startContent={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Nuevo Cupon
        </Button>
      </div>

      {/* Coupon Cards Grid */}
      {isLoading && coupons.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-default-500 text-sm">
          <div className="loader-moon" /><p>Cargando cupones...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-default-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
          </svg>
          <p className="text-sm">No hay cupones registrados</p>
          <Button color="primary" onPress={handleCreate}>Crear primer cupon</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {coupons.map((coupon) => {
            const status = getCouponStatus(coupon);
            // Usage percentage (since we don't have originalQuantity, just show remaining)
            const usagePercent = coupon.couponQuantity <= 0 ? 100 : Math.max(0, Math.min(100, 100 - coupon.couponQuantity));

            return (
              <div
                key={coupon.id}
                className="relative flex flex-col gap-4 p-5 rounded-xl border border-default-200/50 bg-content1 hover:border-primary/20 transition-colors"
              >
                {/* Top row: Code + Discount */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    {/* Code */}
                    <div className="flex items-center gap-2 max-w-full overflow-hidden">
                      <span className="text-xl font-bold font-mono tracking-widest text-foreground uppercase truncate">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => copyCode(coupon)}
                        className="p-1 rounded-md hover:bg-default-100 transition-colors text-default-400 hover:text-primary cursor-pointer"
                        title="Copiar codigo"
                      >
                        {copiedId === coupon.id ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-success">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {/* Status badge + Categoria */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Chip size="sm" variant="flat" color={status.color}>
                        {status.label}
                      </Chip>
                      {coupon.categoryId && catName(coupon.categoryId) ? (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="default"
                          startContent={
                            <span className="flex items-center scale-75 opacity-70">
                              {catIcon(coupon.categoryId)}
                            </span>
                          }
                        >
                          {catName(coupon.categoryId)}
                        </Chip>
                      ) : (
                        <span className="text-[10px] text-default-400">Todas las categorias</span>
                      )}
                    </div>
                  </div>

                  {/* Discount amount */}
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary tabular-nums">
                      S/ {coupon.discountAmount}
                    </span>
                    <p className="text-xs text-default-400">descuento</p>
                  </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-3 gap-3">
                  <InfoCell label="Vence" value={formatDate(coupon.expirationDate)} />
                  <InfoCell label="Minimo" value={`S/ ${coupon.minimumAmount}`} />
                  <InfoCell label="Disponibles" value={`${coupon.couponQuantity}`} />
                </div>


                {/* Usage bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-default-400">Uso del cupon</span>
                    <span className="text-xs text-default-500 font-medium tabular-nums">{coupon.couponQuantity} restantes</span>
                  </div>
                  <div className="w-full h-1.5 bg-default-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(usagePercent, 100)}%`,
                        background:
                          status.color === 'success'
                            ? 'linear-gradient(90deg, #2dd4a8, #34d399)'
                            : status.color === 'warning'
                            ? 'linear-gradient(90deg, #f5a623, #f59e0b)'
                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center pt-1">
                  <Button
                    size="sm"
                    variant="bordered"
                    color="primary"
                    onPress={() => handleEdit(coupon)}
                    startContent={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="bordered"
                    color="danger"
                    onPress={() => handleDelete(coupon)}
                    startContent={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    }
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => { setModalOpen(false); setEditingCoupon(null); }}
        />
      )}
    </div>
  );
}

/** Small info cell for coupon details */
function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-lg bg-default-50/50 border border-default-200/30">
      <span className="text-[10px] text-default-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
