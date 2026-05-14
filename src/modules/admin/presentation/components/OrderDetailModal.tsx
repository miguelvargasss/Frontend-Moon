import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem, Chip } from '@nextui-org/react';
import { useState } from 'react';
import type { AdminOrder } from '../../../orders/domain/admin-order.model';
import { useAdminOrdersStore } from '../../../orders/application/admin-orders.store';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder;
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  const { statuses, updateOrderStatus } = useAdminOrdersStore();
  const [selectedStatus, setSelectedStatus] = useState<string>(order.statusName);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.statusName) return;
    setIsUpdating(true);
    setError(null);
    try {
      await updateOrderStatus(order.id, selectedStatus);
      onClose(); // Close on success, or maybe show a toast
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (name: string) => {
    switch (name) {
      case 'FINALIZADO':
      case 'ENTREGADO':
        return 'success';
      case 'CANCELADO':
        return 'danger';
      case 'ENVIADO':
        return 'primary';
      case 'EN PROCESO':
      default:
        return 'warning';
    }
  };

  const total = order.items?.reduce((s, i) => s + i.priceAtSale * i.quantity, 0) || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" classNames={{
      base: "bg-content1 border border-default-200/50",
      header: "border-b border-default-200/50",
      footer: "border-t border-default-200/50",
    }}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold tracking-tight">Detalle del Pedido</span>
                <Chip size="sm" color={getStatusColor(order.statusName)} variant="flat">
                  {order.statusName}
                </Chip>
              </div>
              <span className="text-sm font-normal text-default-500 font-mono">
                Código: {order.orderCode}
              </span>
            </ModalHeader>
            <ModalBody className="py-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna Izquierda: Información del Cliente */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">Datos del Cliente</h3>
                  
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
                        <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                          Dirección de Envío
                        </p>
                        <p className="text-sm text-default-500">{order.customer.address}</p>
                        <p className="text-xs text-default-400 mt-0.5">{order.customer.city}, {order.customer.region}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-default-50 rounded-xl p-4 text-sm text-default-400 border border-default-200/50">
                      Datos del cliente no disponibles.
                    </div>
                  )}

                  {/* Selector de Estado */}
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Gestionar Estado</h3>
                    <Select
                      label="Estado del Pedido"
                      size="sm"
                      selectedKeys={[selectedStatus]}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      variant="bordered"
                      classNames={{ trigger: "bg-default-50" }}
                      isDisabled={order.statusName === 'FINALIZADO' || order.statusName === 'CANCELADO'}
                    >
                      {statuses.map((status) => (
                        <SelectItem key={status.name} value={status.name}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </Select>
                    {(order.statusName === 'FINALIZADO' || order.statusName === 'CANCELADO') && (
                      <p className="text-xs text-default-400 mt-2">
                        No se puede cambiar el estado de un pedido {order.statusName.toLowerCase()}.
                      </p>
                    )}
                    {error && <p className="text-xs text-danger mt-2">{error}</p>}
                  </div>
                </div>

                {/* Columna Derecha: Productos */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">Productos ({order.items?.length || 0})</h3>
                  
                  <div className="flex flex-col gap-3">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-3 bg-default-50 rounded-xl border border-default-200/50">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-default-500 mt-0.5">Cant: {item.quantity} x S/ {item.priceAtSale.toFixed(2)}</p>
                        </div>
                        <span className="text-sm font-semibold text-foreground tabular-nums ml-4">
                          S/ {(item.quantity * item.priceAtSale).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-default-200/50 flex justify-between items-center">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="text-lg font-bold text-primary tabular-nums">S/ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cerrar
              </Button>
              <Button 
                color="primary" 
                onPress={handleUpdateStatus} 
                isLoading={isUpdating}
                isDisabled={selectedStatus === order.statusName || order.statusName === 'FINALIZADO' || order.statusName === 'CANCELADO'}
                className="font-medium shadow-md shadow-primary/20"
              >
                Guardar Cambios
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
