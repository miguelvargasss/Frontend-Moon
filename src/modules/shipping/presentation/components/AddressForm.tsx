import { useState } from 'react';
import { Input, Button, Textarea } from '@nextui-org/react';

interface AddressFormProps {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    region: string;
    phone: string;
    reference?: string;
    codeZip?: string;
    dni?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function AddressForm({ onSubmit, onCancel, isLoading }: AddressFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState('');
  const [codeZip, setCodeZip] = useState('');
  const [dni, setDni] = useState('');

  const isValid = firstName.trim() && lastName.trim() && address.trim() && city.trim() && region.trim() && phone.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address: address.trim(),
      city: city.trim(),
      region: region.trim(),
      phone: phone.trim(),
      reference: reference.trim() || undefined,
      codeZip: codeZip.trim() || undefined,
      dni: dni.trim() || undefined,
    });
  };

  const inputClasses = {
    inputWrapper: 'border-default-200 bg-default-50/50 hover:border-default-300',
    label: 'text-default-500 text-xs',
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        <h3 className="text-lg font-semibold text-foreground">Nueva dirección de envío</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nombre"
          placeholder="Juan"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          variant="bordered"
          size="sm"
          isRequired
          classNames={inputClasses}
        />
        <Input
          label="Apellido"
          placeholder="Pérez"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          variant="bordered"
          size="sm"
          isRequired
          classNames={inputClasses}
        />
      </div>

      <Input
        label="DNI / Documento de identidad"
        placeholder="12345678"
        value={dni}
        onChange={(e) => setDni(e.target.value)}
        variant="bordered"
        size="sm"
        classNames={inputClasses}
      />

      <Textarea
        label="Dirección completa"
        placeholder="Av. Principal 123, Dpto 4B"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        variant="bordered"
        size="sm"
        isRequired
        minRows={2}
        classNames={inputClasses}
      />

      <Input
        label="Referencia (opcional)"
        placeholder="Frente al parque, casa blanca"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        variant="bordered"
        size="sm"
        classNames={inputClasses}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Ciudad"
          placeholder="Lima"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          variant="bordered"
          size="sm"
          isRequired
          classNames={inputClasses}
        />
        <Input
          label="Región / Departamento"
          placeholder="Lima"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          variant="bordered"
          size="sm"
          isRequired
          classNames={inputClasses}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Teléfono"
          placeholder="+51 999 999 999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          variant="bordered"
          size="sm"
          isRequired
          classNames={inputClasses}
        />
        <Input
          label="Código postal (opcional)"
          placeholder="15001"
          value={codeZip}
          onChange={(e) => setCodeZip(e.target.value)}
          variant="bordered"
          size="sm"
          classNames={inputClasses}
        />
      </div>

      <div className="flex gap-2 mt-2">
        {onCancel && (
          <Button variant="flat" onPress={onCancel} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          color="primary"
          isLoading={isLoading}
          isDisabled={!isValid}
          className="flex-1 font-semibold"
          startContent={!isLoading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17,21 17,13 7,13 7,21" /><polyline points="7,3 7,8 15,8" /></svg>
          ) : undefined}
        >
          Guardar dirección
        </Button>
      </div>
    </form>
  );
}
