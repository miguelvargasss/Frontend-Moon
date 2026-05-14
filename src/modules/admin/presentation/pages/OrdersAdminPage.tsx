import { useEffect, useState, useMemo } from 'react';
import { Button, Input, Chip, Spinner } from '@nextui-org/react';
import { useAdminOrdersStore } from '../../../orders/application/admin-orders.store';
import OrderDetailModal from '../components/OrderDetailModal';
import type { AdminOrder } from '../../../orders/domain/admin-order.model';

export default function OrdersAdminPage() {
  const { orders, isLoading, fetchOrders, fetchStatuses } = useAdminOrdersStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchStatuses();
  }, [fetchOrders, fetchStatuses]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const lowerQuery = searchQuery.toLowerCase();
    return orders.filter((order: AdminOrder) => {
      const codeMatch = order.orderCode.toLowerCase().includes(lowerQuery);
      const nameMatch = order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(lowerQuery)
        : false;
      return codeMatch || nameMatch;
    });
  }, [orders, searchQuery]);

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

  return (
    <div className="flex flex-col gap-6 w-full animate-appearance-in">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Pedidos</h1>
          <p className="text-sm text-default-500">Administra los pedidos de todos los clientes</p>
        </div>
        
        <div className="w-full sm:w-72">
          <Input
            isClearable
            placeholder="Buscar por código o cliente..."
            value={searchQuery}
            onClear={() => setSearchQuery('')}
            onValueChange={setSearchQuery}
            startContent={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-default-400">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
            classNames={{
              inputWrapper: "bg-content1 border border-default-200/50 hover:border-default-300",
            }}
          />
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-content1 border border-default-200/50 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" color="primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center text-default-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
            </div>
            <p className="text-default-500 font-medium">No se encontraron pedidos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-default-50 border-b border-default-200/50">
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Pedido</th>
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-default-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default-200/50">
                {filteredOrders.map((order: AdminOrder) => {
                  const total = order.items?.reduce((s: number, i: any) => s + i.priceAtSale * i.quantity, 0) || 0;
                  
                  return (
                    <tr key={order.id} className="hover:bg-default-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-foreground">{order.orderCode}</span>
                      </td>
                      <td className="px-6 py-4">
                        {order.customer ? (
                          <div>
                            <p className="text-sm font-medium text-foreground">{order.customer.firstName} {order.customer.lastName}</p>
                            <p className="text-xs text-default-400">{order.customer.phone}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-default-400">Sin datos</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground">{new Date(order.date).toLocaleDateString()}</p>
                        {order.time && <p className="text-xs text-default-400">{order.time.slice(0, 5)}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold tabular-nums">S/ {total.toFixed(2)}</span>
                        <p className="text-[10px] text-default-400 mt-0.5">{order.items?.length || 0} ítems</p>
                      </td>
                      <td className="px-6 py-4">
                        <Chip size="sm" color={getStatusColor(order.statusName)} variant="flat" className="capitalize border-none">
                          {order.statusName.toLowerCase()}
                        </Chip>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onPress={() => setSelectedOrder(order)}
                        >
                          Ver Detalles
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}
    </div>
  );
}
