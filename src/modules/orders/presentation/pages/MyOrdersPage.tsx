import { useEffect, useMemo } from 'react';
import { Accordion, AccordionItem, Chip, Spinner, Avatar, Tooltip } from '@nextui-org/react';
import { useMyOrdersStore } from '../../application/my-orders.store';
import type { AdminOrder, AdminOrderItem } from '../../domain/admin-order.model';

/**
 * Mis Pedidos — temática cósmica de MoonPhases.
 * Cada hito del pedido se representa como una fase lunar:
 *  Luna Nueva → Pendiente
 *  Cuarto Creciente → Procesando
 *  Gibosa → Enviado
 *  Luna Llena → Entregado
 */

// ─────────────────────────────────────────────────────────
//  Fases lunares (SVG inline para evitar dependencias)
// ─────────────────────────────────────────────────────────
function MoonPhase({ phase, active, size = 28 }: { phase: 0 | 1 | 2 | 3; active: boolean; size?: number }) {
  // phase 0: nueva, 1: creciente, 2: gibosa, 3: llena
  const dim = size;
  const r = dim / 2;
  const cx = r;
  const cy = r;
  const fill = active ? '#E8E4D0' : '#3A3A45';
  const dark = '#0D0D14';
  const glow = active ? 'drop-shadow(0 0 8px rgba(232,228,208,0.55))' : 'none';

  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ filter: glow }}>
      <defs>
        <radialGradient id={`moon-grad-${phase}-${active ? 'a' : 'i'}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={active ? '#FFFDF5' : '#52525D'} />
          <stop offset="100%" stopColor={fill} />
        </radialGradient>
      </defs>
      {/* base disc */}
      <circle cx={cx} cy={cy} r={r - 1} fill={`url(#moon-grad-${phase}-${active ? 'a' : 'i'})`} />
      {/* shadow overlay per phase */}
      {phase === 0 && <circle cx={cx} cy={cy} r={r - 1} fill={dark} opacity="0.92" />}
      {phase === 1 && <ellipse cx={cx + r * 0.45} cy={cy} rx={r * 0.85} ry={r - 1} fill={dark} opacity="0.92" />}
      {phase === 2 && <ellipse cx={cx + r * 0.85} cy={cy} rx={r * 0.45} ry={r - 1} fill={dark} opacity="0.92" />}
      {/* phase 3 → llena (sin sombra) */}
      {/* sutiles cráteres en activa */}
      {active && phase >= 2 && (
        <>
          <circle cx={cx - r * 0.35} cy={cy - r * 0.2} r={r * 0.08} fill="#0D0D14" opacity="0.15" />
          <circle cx={cx + r * 0.1} cy={cy + r * 0.3} r={r * 0.05} fill="#0D0D14" opacity="0.12" />
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
//  Campo estelar de fondo (decorativo)
// ─────────────────────────────────────────────────────────
function Starfield() {
  // Posiciones pseudoaleatorias estables
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        top: (i * 37) % 100,
        left: (i * 73) % 100,
        size: ((i * 11) % 3) + 1,
        delay: ((i * 13) % 50) / 10,
        duration: 2 + ((i * 7) % 30) / 10,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* nebulosa suave */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(45,212,168,0.06),_transparent_60%),radial-gradient(ellipse_at_bottom_left,_rgba(132,90,223,0.05),_transparent_55%)]" />
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: 0.4,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Helpers de estado
// ─────────────────────────────────────────────────────────
const getStatusColor = (name: string): 'success' | 'danger' | 'primary' | 'warning' => {
  switch (name.toUpperCase()) {
    case 'FINALIZADO':
      return 'success';
    case 'CANCELADO':
      return 'danger';
    case 'ENVIADO':
      return 'primary';
    case 'CONFIRMADO':
    case 'EN PROCESO':
    default:
      return 'warning';
  }
};

const getStepIndex = (status: string) => {
  const s = status.toUpperCase();
  if (s === 'EN PROCESO' || s === 'PENDIENTE') return 0;
  if (s === 'CONFIRMADO') return 1;
  if (s === 'ENVIADO') return 2;
  if (s === 'FINALIZADO' || s === 'ENTREGADO') return 3;
  return -1;
};

const STEPS = [
  { label: 'En Proceso', sub: 'Luna Nueva', phase: 0 as const },
  { label: 'Confirmado', sub: 'Cuarto Creciente', phase: 1 as const },
  { label: 'Enviado', sub: 'Gibosa', phase: 2 as const },
  { label: 'Finalizado', sub: 'Luna Llena', phase: 3 as const },
];

// ─────────────────────────────────────────────────────────
//  Stepper cósmico (línea = órbita)
// ─────────────────────────────────────────────────────────
function CosmicStepper({ status }: { status: string }) {
  const currentStep = getStepIndex(status);
  const isCancelled = status.toUpperCase() === 'CANCELADO';

  if (isCancelled) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-danger/10 border border-danger/30">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-danger">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span className="text-danger font-semibold tracking-wide">Pedido Cancelado</span>
        </div>
      </div>
    );
  }

  const progressPct = currentStep >= 0 ? (currentStep / (STEPS.length - 1)) * 100 : 0;

  return (
    <div className="relative w-full max-w-3xl mx-auto py-8 px-4 sm:px-8">
      {/* Órbita (línea de fondo) */}
      <div className="absolute top-[58%] left-[8%] right-[8%] h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-default-200/50 to-transparent" />
      {/* Órbita progreso */}
      <div
        className="absolute top-[58%] left-[8%] h-[2px] -translate-y-1/2 bg-gradient-to-r from-primary/60 via-primary to-primary/60 transition-all duration-700 ease-out"
        style={{
          width: `calc((100% - 16%) * ${progressPct / 100})`,
          boxShadow: '0 0 12px rgba(45,212,168,0.6)',
        }}
      />

      {/* Hitos */}
      <div className="relative flex items-start justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep >= idx;
          const isCurrent = currentStep === idx;
          return (
            <Tooltip key={step.label} content={step.sub} placement="bottom" delay={300}>
              <div className="flex flex-col items-center gap-2 flex-1 group cursor-default">
                <div
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted
                      ? 'bg-[#0D0D14] ring-2 ring-primary/40'
                      : 'bg-[#0D0D14]/60 ring-1 ring-default-200/30'
                  } ${isCurrent ? 'scale-110' : ''}`}
                  style={
                    isCompleted
                      ? { boxShadow: '0 0 24px rgba(45,212,168,0.35), inset 0 0 12px rgba(45,212,168,0.15)' }
                      : undefined
                  }
                >
                  {/* halo pulsante en el actual */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
                  )}
                  <MoonPhase phase={step.phase} active={isCompleted} size={32} />
                </div>
                <div className="text-center mt-1">
                  <p className={`text-xs font-semibold tracking-wide ${isCompleted ? 'text-foreground' : 'text-default-400'}`}>
                    {step.label}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${isCompleted ? 'text-primary/80' : 'text-default-400/60'} italic`}>
                    {step.sub}
                  </p>
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Página principal
// ─────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  const { orders, isLoading, fetchMyOrders } = useMyOrdersStore();

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  return (
    <div className="relative min-h-screen overflow-hidden animate-appearance-in">
      {/* Fondo cósmico */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#08080F_0%,#0D0D18_50%,#0A0A12_100%)]" />
      <Starfield />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">
        {/* Header con luna decorativa */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold uppercase tracking-widest text-primary">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>
                Bitácora estelar
              </span>
            </div>
            <h1 className="text-4xl font-display font-medium text-foreground tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary/90 bg-clip-text">
              Mis Pedidos
            </h1>
            <p className="text-default-500 mt-1.5 text-sm">
              Sigue el viaje de tus paquetes a través de las fases lunares
            </p>
          </div>
          {/* Luna decorativa con glow */}
          <div className="hidden sm:block">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-150" />
              <MoonPhase phase={3} active size={64} />
            </div>
          </div>
        </div>

        {/* Estado: cargando / vacío / lista */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <Spinner size="lg" color="primary" />
            </div>
            <p className="text-sm text-default-500 italic">Consultando el cosmos…</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <Accordion variant="splitted" selectionMode="multiple" className="px-0 gap-4 flex flex-col">
            {orders.map((order: AdminOrder) => {
              const totalItems = order.items?.reduce((acc: number, item: AdminOrderItem) => acc + item.quantity, 0) || 0;
              const totalAmount = order.items?.reduce((acc: number, item: AdminOrderItem) => acc + item.priceAtSale * item.quantity, 0) || 0;
              const statusColor = getStatusColor(order.statusName);
              const stepIdx = getStepIndex(order.statusName);
              const headerPhase = stepIdx >= 0 ? (STEPS[stepIdx]?.phase ?? 0) : 0;

              return (
                <AccordionItem
                  key={order.id}
                  aria-label={`Pedido ${order.orderCode}`}
                  classNames={{
                    base: 'group !rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-primary/30 hover:shadow-[0_8px_40px_rgba(45,212,168,0.08)] transition-all overflow-hidden',
                    title: 'w-full',
                    trigger: 'px-6 py-5 data-[hover=true]:bg-white/[0.02]',
                    content: 'px-6 pb-6 pt-0',
                  }}
                  title={
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                      <div className="flex items-center gap-4">
                        {/* Avatar lunar */}
                        <div className="relative w-12 h-12 rounded-xl bg-[#0D0D14] border border-white/10 flex items-center justify-center overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(45,212,168,0.15),transparent_60%)]" />
                          <MoonPhase phase={headerPhase} active size={28} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground font-mono tracking-tight">
                            #{order.orderCode}
                          </h3>
                          <p className="text-xs text-default-400 mt-0.5 flex items-center gap-2">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {new Date(order.date).toLocaleDateString()}
                            <span className="text-default-500">·</span>
                            {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5 sm:justify-end">
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground tabular-nums">
                            S/ {totalAmount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-default-400 mt-0.5 uppercase tracking-widest">Total</p>
                        </div>
                        <Chip
                          size="md"
                          color={statusColor}
                          variant="flat"
                          className="font-semibold border border-current/20 hidden sm:flex"
                        >
                          {order.statusName}
                        </Chip>
                      </div>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-6 pt-4 border-t border-white/5">
                    {/* Stepper cósmico */}
                    <CosmicStepper status={order.statusName} />

                    {/* Productos */}
                    <div>
                      <h4 className="flex items-center gap-2 text-[11px] font-semibold text-default-400 uppercase tracking-widest mb-3">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="m7.5 4.27 9 5.15" />
                          <path d="M21 8 12 2 3 8l9 6 9-6Z" />
                          <path d="m3 16 9 6 9-6" />
                          <path d="m3 12 9 6 9-6" />
                        </svg>
                        Cargamento
                      </h4>
                      <div className="flex flex-col gap-2">
                        {order.items?.map((item: AdminOrderItem) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-3 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar
                                radius="md"
                                size="md"
                                name={item.productName.charAt(0).toUpperCase()}
                                classNames={{
                                  base: 'bg-gradient-to-br from-primary/30 to-primary/10 text-primary font-bold border border-primary/20',
                                }}
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground text-sm truncate">{item.productName}</p>
                                <p className="text-xs text-default-400 mt-0.5">
                                  x{item.quantity} <span className="text-default-500">·</span> S/{' '}
                                  {item.priceAtSale.toFixed(2)} c/u
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-foreground tabular-nums text-sm shrink-0 ml-3">
                              S/ {(item.quantity * item.priceAtSale).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Destino */}
                    {order.customer && (
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/[0.08] to-transparent border border-primary/15 p-5">
                        <div className="absolute -top-8 -right-8 opacity-10">
                          <MoonPhase phase={3} active size={80} />
                        </div>
                        <div className="relative flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1">
                              Destino del envío
                            </h4>
                            <p className="font-medium text-foreground text-sm">
                              {order.customer.address}
                            </p>
                            <p className="text-xs text-default-400 mt-1">
                              {order.customer.city}, {order.customer.region}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* Animaciones inline (twinkle) */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.4); }
        }
        .animate-twinkle { animation: twinkle ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
//  Estado vacío con luna grande
// ─────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-12 flex flex-col items-center text-center gap-5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,168,0.06),transparent_70%)]" />
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-150" />
        <MoonPhase phase={0} active size={80} />
      </div>
      <div className="relative">
        <h2 className="text-xl font-bold text-foreground">El universo está en silencio</h2>
        <p className="text-default-500 max-w-md mt-2 text-sm">
          Aún no tienes pedidos en tu bitácora. Explora la tienda y comienza tu viaje a través del cosmos lunar.
        </p>
      </div>
    </div>
  );
}
