import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Chip } from '@nextui-org/react';
import { useAdminOrdersStore } from '../../../orders/application/admin-orders.store';
import { useUsersStore } from '../../../users/application/users.store';
import { useProductsStore } from '../../../products/application/products.store';
import { useCouponsStore } from '../../../coupons/application/coupons.store';
import type { AdminOrder, AdminOrderItem } from '../../../orders/domain/admin-order.model';
import type { CouponModel } from '../../../coupons/domain/coupon.model';

function getCouponStatus(coupon: CouponModel): 'active' | 'expired' | 'exhausted' {
  if (new Date(coupon.expirationDate) < new Date()) return 'expired';
  if (coupon.couponQuantity <= 0) return 'exhausted';
  return 'active';
}

function orderTotal(order: AdminOrder): number {
  return order.items?.reduce((s: number, i: AdminOrderItem) => s + i.priceAtSale * i.quantity, 0) ?? 0;
}

function fmtCurrency(n: number): string {
  return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; chipColor: 'warning' | 'success' | 'primary' | 'danger' | 'default' }> = {
  'EN PROCESO': { label: 'En Proceso', color: '#f5a623', chipColor: 'warning' },
  'CONFIRMADO':  { label: 'Confirmado',  color: '#17c964', chipColor: 'success' },
  'ENVIADO':     { label: 'Enviado',     color: '#006fee', chipColor: 'primary' },
  'FINALIZADO':  { label: 'Finalizado',  color: '#17c964', chipColor: 'success' },
  'CANCELADO':   { label: 'Cancelado',   color: '#f31260', chipColor: 'danger'  },
};

export default function DashboardPage() {
  const { orders, fetchOrders }     = useAdminOrdersStore();
  const { users, fetchUsers }       = useUsersStore();
  const { products, fetchProducts } = useProductsStore();
  const { coupons, fetchCoupons }   = useCouponsStore();

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchProducts();
    fetchCoupons();
  }, [fetchOrders, fetchUsers, fetchProducts, fetchCoupons]);

  /* ── KPI ── */
  const totalRevenue = useMemo(
    () => orders.filter(o => o.statusName === 'FINALIZADO').reduce((s, o) => s + orderTotal(o), 0),
    [orders],
  );
  const pendingOrders = useMemo(() => orders.filter(o => o.statusName === 'EN PROCESO').length, [orders]);
  const totalClients  = useMemo(() => users.filter(u => u.roleName === 'client').length, [users]);
  const totalPoints   = useMemo(() => users.reduce((s, u) => s + (u.points ?? 0), 0), [users]);

  /* ── Order status breakdown ── */
  const statusBreakdown = useMemo(() => {
    const keys = ['EN PROCESO', 'CONFIRMADO', 'ENVIADO', 'FINALIZADO', 'CANCELADO'];
    return keys.map(k => ({ key: k, count: orders.filter(o => o.statusName === k).length }));
  }, [orders]);

  /* ── Recent orders ── */
  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6),
    [orders],
  );

  /* ── Products ── */
  const inStock    = useMemo(() => products.filter(p => p.totalStock > 0).length, [products]);
  const outOfStock = useMemo(() => products.filter(p => p.totalStock === 0).length, [products]);

  /* ── Coupons ── */
  const activeCoupons   = useMemo(() => coupons.filter(c => getCouponStatus(c) === 'active').length, [coupons]);
  const expiredCoupons  = useMemo(() => coupons.filter(c => getCouponStatus(c) === 'expired').length, [coupons]);
  const exhaustedCoupons = useMemo(() => coupons.filter(c => getCouponStatus(c) === 'exhausted').length, [coupons]);

  /* ── Top 3 clients ── */
  const topClients = useMemo(
    () => [...users].filter(u => u.roleName === 'client').sort((a, b) => (b.points ?? 0) - (a.points ?? 0)).slice(0, 3),
    [users],
  );

  /* ── Products by category (top 4) ── */
  const productsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach(p => {
      const key = p.categoryId ?? 'Sin categoría';
      map[key] = (map[key] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [products]);

  const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div id="admin-dashboard" className="flex flex-col gap-6 animate-appearance-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            Dashboard
          </h1>
          <p className="text-sm text-default-400 mt-1 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-primary font-medium">Sistema activo</span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Ingresos totales"
          value={fmtCurrency(totalRevenue)}
          sub="Pedidos finalizados"
          accent="#17c964"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
        />
        <KpiCard
          label="Total pedidos"
          value={String(orders.length)}
          sub={`${pendingOrders} en proceso`}
          accent="#006fee"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><path d="M13 8h4M13 12h4M13 16h4"/>
            </svg>
          }
        />
        <KpiCard
          label="Clientes"
          value={String(totalClients)}
          sub={`${users.length} usuarios totales`}
          accent="#a855f7"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
        <KpiCard
          label="MoonPoints"
          value={String(totalPoints)}
          sub="Puntos distribuidos"
          accent="#f5a623"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          }
        />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* ── Left: Status + Recent orders ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Estado de pedidos */}
          <div className="bg-content1 border border-default-200/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
                Estado de pedidos
              </h2>
              <span className="text-xs text-default-400">{orders.length} total</span>
            </div>
            <div className="flex flex-col gap-3">
              {statusBreakdown.map(({ key, count }) => {
                const cfg = STATUS_CONFIG[key];
                const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-default-500 w-24 shrink-0">{cfg?.label ?? key}</span>
                    <div className="flex-1 h-2 rounded-full bg-default-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cfg?.color ?? '#888' }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-6 text-right">{count}</span>
                    <span className="text-xs text-default-400 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pedidos recientes */}
          <div className="bg-content1 border border-default-200/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-default-200/50">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Pedidos recientes
              </h2>
              <Link to="/admin/orders" className="text-xs text-primary hover:underline">Ver todos →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-default-400">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                <p className="text-sm">Sin pedidos aún</p>
              </div>
            ) : (
              <div className="divide-y divide-default-200/40">
                {recentOrders.map(order => {
                  const total = orderTotal(order);
                  const cfg = STATUS_CONFIG[order.statusName];
                  return (
                    <div key={order.id} className="flex items-center gap-3 px-5 py-3 hover:bg-default-50/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-foreground">{order.orderCode}</span>
                          <Chip size="sm" color={cfg?.chipColor ?? 'default'} variant="flat" className="text-[10px] h-4 border-none">
                            {cfg?.label ?? order.statusName}
                          </Chip>
                        </div>
                        <p className="text-xs text-default-400 mt-0.5 truncate">
                          {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Cliente desconocido'}
                          {' · '}{fmtDate(order.date)}
                        </p>
                      </div>
                      <span className="text-sm font-bold tabular-nums text-foreground shrink-0">
                        {fmtCurrency(total)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Quick stats ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Productos */}
          <div className="bg-content1 border border-default-200/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                Productos
              </h2>
              <Link to="/admin/products" className="text-xs text-primary hover:underline">Ver →</Link>
            </div>
            <div className="flex items-end justify-between mb-3">
              <span className="text-3xl font-bold text-foreground">{products.length}</span>
              <span className="text-xs text-default-400">registrados</span>
            </div>
            {/* Stock ring */}
            <div className="flex items-center gap-4">
              <StockRing inStock={inStock} total={products.length} />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success shrink-0" />
                  <span className="text-xs text-default-500">Disponibles</span>
                  <span className="text-xs font-bold text-foreground ml-auto">{inStock}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger shrink-0" />
                  <span className="text-xs text-default-500">Agotados</span>
                  <span className="text-xs font-bold text-foreground ml-auto">{outOfStock}</span>
                </div>
                {productsByCategory.slice(0, 2).map(([, count], i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary/40 shrink-0" />
                    <span className="text-xs text-default-500 truncate max-w-[90px]">Cat. {i + 1}</span>
                    <span className="text-xs font-bold text-foreground ml-auto">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cupones */}
          <div className="bg-content1 border border-default-200/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
                  <path d="M13 5v2M13 17v2M13 11v2"/>
                </svg>
                Cupones
              </h2>
              <Link to="/admin/coupons" className="text-xs text-primary hover:underline">Ver →</Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <CouponStat value={activeCoupons}   label="Activos"   color="text-success" />
              <CouponStat value={expiredCoupons}  label="Expirados" color="text-danger"  />
              <CouponStat value={exhaustedCoupons} label="Agotados" color="text-warning" />
            </div>
          </div>

          {/* Top 3 clientes */}
          <div className="bg-content1 border border-default-200/50 rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              Top clientes
            </h2>
            {topClients.length === 0 ? (
              <p className="text-sm text-default-400">Sin clientes aún</p>
            ) : (
              <div className="flex flex-col gap-3">
                {topClients.map((client, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  const gradients = [
                    'from-[#f5a623] to-yellow-300',
                    'from-slate-400 to-slate-300',
                    'from-amber-700 to-amber-500',
                  ];
                  return (
                    <div key={client.id} className="flex items-center gap-3">
                      <span className="text-base shrink-0 w-5 text-center">{medals[idx]}</span>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradients[idx]} flex items-center justify-center text-background text-xs font-bold shrink-0`}>
                        {client.name.charAt(0)}{client.lastName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{client.name} {client.lastName}</p>
                        <p className="text-[10px] text-default-400 truncate">{client.email}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-sm font-bold text-[#f5a623]">{client.points ?? 0}</span>
                        <span className="text-[10px] text-default-400">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Usuarios */}
          <div className="bg-content1 border border-default-200/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Usuarios
              </h2>
              <Link to="/admin/users" className="text-xs text-primary hover:underline">Ver →</Link>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 text-center p-3 rounded-xl bg-default-50 border border-default-200/50">
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-xs text-default-400 mt-0.5">Totales</p>
              </div>
              <div className="flex-1 text-center p-3 rounded-xl bg-default-50 border border-default-200/50">
                <p className="text-2xl font-bold text-foreground">{totalClients}</p>
                <p className="text-xs text-default-400 mt-0.5">Clientes</p>
              </div>
              <div className="flex-1 text-center p-3 rounded-xl bg-default-50 border border-default-200/50">
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.roleName === 'admin').length}</p>
                <p className="text-xs text-default-400 mt-0.5">Admins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="relative bg-content1 border border-default-200/50 rounded-2xl p-5 shadow-sm overflow-hidden">
      {/* Glow orb */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-xl pointer-events-none"
        style={{ backgroundColor: accent }} />
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${accent}18` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-default-300 mt-1">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
      </div>
      <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
      <p className="text-sm font-medium text-foreground mt-1">{label}</p>
      <p className="text-xs text-default-400 mt-0.5">{sub}</p>
    </div>
  );
}

function StockRing({ inStock, total }: { inStock: number; total: number }) {
  const pct = total > 0 ? inStock / total : 0;
  const r = 24;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  return (
    <div className="relative shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-default-100" />
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6"
          stroke="#17c964"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-foreground">{total > 0 ? Math.round(pct * 100) : 0}%</span>
      </div>
    </div>
  );
}

function CouponStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-default-50 border border-default-200/50 gap-1">
      <span className={`text-xl font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-default-400 text-center leading-tight">{label}</span>
    </div>
  );
}
