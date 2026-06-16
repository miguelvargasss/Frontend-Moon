import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@nextui-org/react';
import { useState, type ReactNode } from 'react';
import type { AdminOrder } from '../../../orders/domain/admin-order.model';
import { useAdminOrdersStore } from '../../../orders/application/admin-orders.store';

interface OrderDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly order: AdminOrder;
}

/** Flujo lógico de estados (excluye CANCELADO, que es una acción separada) */
const STATUS_FLOW = ['EN PROCESO', 'CONFIRMADO', 'ENVIADO', 'FINALIZADO'] as const;

interface StatusMeta {
  label: string;
  icon: ReactNode;
  chipColor: 'warning' | 'success' | 'primary' | 'danger' | 'default';
  activeClass: string;
  description: string;
}

const STATUS_META: Record<string, StatusMeta> = {
  'EN PROCESO': {
    label: 'En Proceso',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    chipColor: 'warning', activeClass: 'border-warning/50 bg-warning/8',
    description: 'Pedido recibido, pendiente de revisión',
  },
  'CONFIRMADO': {
    label: 'Confirmado',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    chipColor: 'success', activeClass: 'border-success/50 bg-success/8',
    description: 'Pedido aprobado — el cliente gana sus MoonPoints',
  },
  'ENVIADO': {
    label: 'Enviado',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    chipColor: 'primary', activeClass: 'border-primary/50 bg-primary/8',
    description: 'El paquete está en camino al cliente',
  },
  'FINALIZADO': {
    label: 'Finalizado',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    chipColor: 'success', activeClass: 'border-success/60 bg-success/10',
    description: 'Pedido entregado y completado',
  },
  'CANCELADO': {
    label: 'Cancelado',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    chipColor: 'danger', activeClass: 'border-danger/50 bg-danger/8',
    description: 'Pedido cancelado — sin puntos para el cliente',
  },
};

const getStatusMeta = (name: string): StatusMeta =>
  STATUS_META[name] ?? {
    label: name,
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/></svg>,
    chipColor: 'default', activeClass: 'border-primary/50 bg-primary/8', description: '',
  };

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  const { updateOrderStatus } = useAdminOrdersStore();
  const [selectedStatus, setSelectedStatus] = useState<string>(order.statusName);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTerminal = order.statusName === 'FINALIZADO' || order.statusName === 'CANCELADO';
  const currentFlowIndex = STATUS_FLOW.indexOf(order.statusName as typeof STATUS_FLOW[number]);

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.statusName) return;
    setIsUpdating(true);
    setError(null);
    try {
      await updateOrderStatus(order.id, selectedStatus);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar el estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentMeta = getStatusMeta(order.statusName);
  const total = order.items?.reduce((s, i) => s + i.priceAtSale * i.quantity, 0) || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" classNames={{
      base: "bg-content1 border border-default-200/50",
      header: "border-b border-default-200/50",
      footer: "border-t border-default-200/50",
    }}>
      <ModalContent>
        {() => (
          <>
            {/* ── Header ── */}
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold tracking-tight">Detalle del Pedido</span>
                <Chip size="sm" color={currentMeta.chipColor} variant="flat" className="font-medium gap-1">
                  <span className="inline-flex">{currentMeta.icon}</span> {order.statusName}
                </Chip>
              </div>
              <span className="text-sm font-normal text-default-500 font-mono">
                Código: {order.orderCode}
              </span>
            </ModalHeader>

            {/* ── Body ── */}
            <ModalBody className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* ─ Columna Izquierda ─ */}
                <div className="flex flex-col gap-5">

                  {/* Datos del cliente */}
                  <div>
                    <h3 className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-2">Datos del Cliente</h3>
                    {order.customer ? (
                      <div className="bg-default-50 rounded-xl p-4 border border-default-200/50 flex flex-col gap-2">
                        <p className="font-medium text-foreground">{order.customer.firstName} {order.customer.lastName}</p>
                        {order.customer.dni && (
                          <p className="text-sm text-default-500">DNI: <span className="text-foreground">{order.customer.dni}</span></p>
                        )}
                        <p className="text-sm text-default-500 flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          {order.customer.phone}
                        </p>
                        <div className="mt-2 pt-2 border-t border-default-200">
                          <p className="text-xs font-medium text-default-400 mb-1 uppercase tracking-wide">Dirección de Envío</p>
                          <p className="text-sm text-default-500">{order.customer.address}</p>
                          <p className="text-xs text-default-400 mt-0.5">{order.customer.city}, {order.customer.region}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-default-50 rounded-xl p-4 text-sm text-default-400 border border-default-200/50">
                        Datos del cliente no disponibles.
                      </div>
                    )}
                  </div>

                  {/* ── Gestor de Estado Visual ── */}
                  <div>
                    <h3 className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-3">Gestionar Estado</h3>

                    {isTerminal ? (
                      /* Estado terminal — bloqueado */
                      <div className={`flex items-center gap-3 p-3 rounded-xl border-2 ${currentMeta.activeClass}`}>
                        <span className="inline-flex text-current">{currentMeta.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{order.statusName}</p>
                          <p className="text-xs text-default-400 mt-0.5">Estado final — no se puede modificar</p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-default-400 shrink-0"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {/* Flujo principal: EN PROCESO → CONFIRMADO → ENVIADO → FINALIZADO */}
                        {STATUS_FLOW.map((status, idx) => {
                          const meta = getStatusMeta(status);
                          const isCurrentOrder = status === order.statusName;
                          const isSelected = status === selectedStatus;
                          const isPast = currentFlowIndex > idx;

                          return (
                            <button
                              key={status}
                              type="button"
                              disabled={isPast}
                              onClick={() => !isPast && setSelectedStatus(status)}
                              className={[
                                'flex items-center gap-3 p-3 rounded-xl border-2 text-left w-full transition-all duration-150',
                                isPast
                                  ? 'opacity-35 cursor-not-allowed border-transparent bg-default-50'
                                  : isSelected
                                    ? `${meta.activeClass} shadow-sm cursor-pointer`
                                    : 'border-transparent bg-default-50/60 hover:bg-default-100/60 cursor-pointer',
                              ].join(' ')}
                            >
                              <span className="inline-flex w-5 shrink-0 text-current">{meta.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{meta.label}</p>
                                {isSelected && (
                                  <p className="text-[11px] text-default-400 mt-0.5 leading-tight">{meta.description}</p>
                                )}
                              </div>
                              {isCurrentOrder && (
                                <Chip size="sm" color={meta.chipColor} variant="dot" className="text-[10px] shrink-0">Actual</Chip>
                              )}
                              {isSelected && !isCurrentOrder && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                              )}
                            </button>
                          );
                        })}

                        {/* Acción de cancelación — separada y marcada como peligrosa */}
                        <div className="mt-1 pt-2 border-t border-default-100">
                          <button
                            type="button"
                            onClick={() => setSelectedStatus('CANCELADO')}
                            className={[
                              'flex items-center gap-3 p-3 rounded-xl border-2 text-left w-full transition-all duration-150',
                              selectedStatus === 'CANCELADO'
                                ? 'border-danger/50 bg-danger/8 shadow-sm'
                                : 'border-transparent bg-default-50/60 hover:bg-danger/5 hover:border-danger/20',
                            ].join(' ')}
                          >
                            <span className="inline-flex w-5 shrink-0 text-danger">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-danger">Cancelar pedido</p>
                              {selectedStatus === 'CANCELADO' && (
                                <p className="text-[11px] text-danger/60 mt-0.5">El cliente no ganará MoonPoints</p>
                              )}
                            </div>
                            {selectedStatus === 'CANCELADO' && (
                              <div className="w-5 h-5 rounded-full bg-danger flex items-center justify-center shrink-0">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>
                              </div>
                            )}
                          </button>
                        </div>

                        {error && (
                          <p className="text-xs text-danger mt-1 px-1">{error}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─ Columna Derecha: Productos ─ */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-1">
                    Productos ({order.items?.length || 0})
                  </h3>

                  <div className="flex flex-col gap-2.5">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-3 bg-default-50 rounded-xl border border-default-200/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-default-500 mt-0.5">x{item.quantity} · S/ {item.priceAtSale.toFixed(2)} c/u</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground tabular-nums ml-4 shrink-0">
                          S/ {(item.quantity * item.priceAtSale).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-default-200/50 flex justify-between items-center">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary tabular-nums">S/ {total.toFixed(2)}</span>
                  </div>

                  {/* MoonPoints estimados para este pedido */}
                  {total > 0 && order.statusName !== 'CANCELADO' && (
                    <div className="flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-xl px-3 py-2.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5d020" stroke="#f5d020" strokeWidth="1" className="shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <p className="text-xs text-default-500">
                        Vale <span className="font-semibold text-primary">{Math.round(total / 2 * 10) / 10} MoonPoints</span> al confirmar
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </ModalBody>

            {/* ── Footer ── */}
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cerrar
              </Button>
              {!isTerminal && (
                <Button
                  color={selectedStatus === 'CANCELADO' ? 'danger' : 'primary'}
                  onPress={handleUpdateStatus}
                  isLoading={isUpdating}
                  isDisabled={selectedStatus === order.statusName}
                  className="font-medium shadow-md shadow-primary/20"
                >
                  {selectedStatus === 'CANCELADO' ? 'Cancelar pedido' : 'Guardar Cambios'}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
