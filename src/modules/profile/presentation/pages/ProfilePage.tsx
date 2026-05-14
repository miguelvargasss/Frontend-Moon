import { useState, useEffect } from 'react';
import { Tabs, Tab, Input, Button, Card, CardBody, Avatar, Chip } from '@nextui-org/react';
import { useAuthStore } from '../../../auth/application/auth.store';
import { useShippingStore } from '../../../shipping/application/shipping.store';
import AddressForm from '../../../shipping/presentation/components/AddressForm';
import type { ShippingAddress } from '../../../shipping/domain/shipping-address.model';
import apiClient from '../../../../core/http/api-client';

export default function ProfilePage() {
  const { user, restoreSession } = useAuthStore();
  const { addresses, isLoading: shippingLoading, fetchAddresses, createAddress, deleteAddress } = useShippingStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Handle Profile Update
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await apiClient.patch('/users/profile', formData);
      await restoreSession(); // Refresh user data globally
      setIsEditingProfile(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Address Management
  const handleCreateAddress = async (data: Omit<ShippingAddress, 'id' | 'userId'>) => {
    await createAddress(data);
    setShowAddressForm(false);
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddress(id);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8 animate-appearance-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
        
        {/* Banner Superior */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-950 via-[#103426] to-[#0A2218] rounded-[2rem] p-8 sm:p-12 text-center shadow-lg border border-white/5">
          {/* Estrellas decorativas bg */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(45, 212, 168, 0.4) 1px, transparent 1px), radial-gradient(circle at 80% 40%, rgba(45, 212, 168, 0.3) 1px, transparent 1px), radial-gradient(circle at 40% 80%, rgba(45, 212, 168, 0.2) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
          
          <div className="relative z-10 flex flex-col items-center gap-4">
            <Avatar 
              name={user.name?.charAt(0).toUpperCase() + (user.lastName?.charAt(0).toUpperCase() || '')}
              className="w-24 h-24 text-3xl font-bold bg-primary text-background shadow-[0_0_30px_rgba(45,212,168,0.3)]"
            />
            
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-display font-medium text-white tracking-tight">{user.name} {user.lastName}</h1>
              <p className="text-green-200/60 font-mono text-sm">{user.email}</p>
            </div>

            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
                <span className="text-xl">⭐</span>
                <span className="text-xl font-bold text-primary tabular-nums">{user.points || 0}</span>
                <span className="text-sm font-medium text-green-100">MoonPoints</span>
              </div>
              <p className="text-xs text-green-200/50 font-medium tracking-wide">Acumula puntos con cada compra 🌙</p>
            </div>
          </div>
        </div>

        {/* Pestañas (Tabs) */}
        <div className="flex flex-col gap-4">
          <Tabs 
            aria-label="Opciones de perfil" 
            color="primary" 
            variant="solid"
            classNames={{
              tabList: "bg-default-100 p-1 rounded-2xl",
              cursor: "rounded-xl shadow-sm",
              tab: "px-6 py-3 h-auto text-sm font-medium",
            }}
          >
            {/* Pestaña: Mi Perfil */}
            <Tab 
              key="profile" 
              title={
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Mi perfil
                </div>
              }
            >
              <Card className="mt-4 bg-content1 border border-default-200/50 shadow-sm" shadow="none">
                <CardBody className="p-6 sm:p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center border-b border-default-200/50 pb-4">
                    <h2 className="text-xl font-bold text-foreground">Información personal</h2>
                    <Button 
                      variant={isEditingProfile ? "solid" : "flat"} 
                      color={isEditingProfile ? "primary" : "default"}
                      size="sm"
                      startContent={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
                      onPress={() => {
                        if (isEditingProfile) {
                          handleSaveProfile();
                        } else {
                          setIsEditingProfile(true);
                        }
                      }}
                      isLoading={isSaving}
                    >
                      {isEditingProfile ? 'Guardar' : 'Editar'}
                    </Button>
                  </div>

                  {error && <p className="text-danger text-sm">{error}</p>}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Nombre"
                      value={formData.name}
                      isReadOnly={!isEditingProfile}
                      variant={isEditingProfile ? "bordered" : "flat"}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      classNames={{ input: isEditingProfile ? "text-foreground" : "text-default-600" }}
                    />
                    <Input
                      label="Apellido"
                      value={formData.lastName}
                      isReadOnly={!isEditingProfile}
                      variant={isEditingProfile ? "bordered" : "flat"}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      classNames={{ input: isEditingProfile ? "text-foreground" : "text-default-600" }}
                    />
                    <Input
                      label="Email"
                      value={user.email}
                      isReadOnly
                      variant="flat"
                      description="El correo no se puede modificar"
                      classNames={{ input: "text-default-500" }}
                    />
                  </div>
                </CardBody>
              </Card>
            </Tab>

            {/* Pestaña: Direcciones */}
            <Tab 
              key="addresses" 
              title={
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  Direcciones
                </div>
              }
            >
              <Card className="mt-4 bg-content1 border border-default-200/50 shadow-sm" shadow="none">
                <CardBody className="p-6 sm:p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center border-b border-default-200/50 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Mis Direcciones</h2>
                      <p className="text-sm text-default-500">Gestiona tus direcciones de envío para tus compras.</p>
                    </div>
                    {!showAddressForm && (
                      <Button color="primary" variant="flat" onPress={() => setShowAddressForm(true)}>
                        + Agregar
                      </Button>
                    )}
                  </div>

                  {showAddressForm ? (
                    <div className="bg-default-50 p-6 rounded-2xl border border-default-200/50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-foreground">Nueva Dirección</h3>
                        <Button size="sm" isIconOnly variant="light" onPress={() => setShowAddressForm(false)}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </Button>
                      </div>
                      <AddressForm onSubmit={handleCreateAddress} onCancel={() => setShowAddressForm(false)} />
                    </div>
                  ) : shippingLoading ? (
                    <p className="text-default-500">Cargando direcciones...</p>
                  ) : addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 bg-default-50 rounded-2xl border border-default-200 border-dashed">
                      <p className="text-default-500 font-medium mb-3">No tienes direcciones guardadas</p>
                      <Button color="primary" variant="flat" onPress={() => setShowAddressForm(true)}>
                        Agregar mi primera dirección
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.map((addr: ShippingAddress) => (
                        <div key={addr.id} className="p-5 border border-default-200/50 rounded-2xl flex flex-col gap-2 hover:border-primary/50 transition-colors bg-default-50/50 group relative">
                          <Button 
                            isIconOnly 
                            size="sm" 
                            color="danger" 
                            variant="light" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onPress={() => handleDeleteAddress(addr.id)}
                            aria-label="Eliminar dirección"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          </Button>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground text-base">{addr.firstName} {addr.lastName}</span>
                            {addr.dni && <Chip size="sm" variant="flat" className="h-5 text-[10px] bg-default-200/50">DNI: {addr.dni}</Chip>}
                          </div>
                          <p className="text-sm text-default-600 line-clamp-2 leading-relaxed h-10">{addr.address} {addr.reference ? `(${addr.reference})` : ''}</p>
                          <div className="mt-2 flex items-center justify-between text-xs text-default-500">
                            <span className="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg> {addr.phone}</span>
                            <span>{addr.city}, {addr.region}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </Tab>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
