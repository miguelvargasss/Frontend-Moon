import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useCouponsStore } from '../application/coupons.store';
import { useCategoriesStore } from '../../categories/application/categories.store';
import { getCategoryIcon } from '../../categories/presentation/components/CategoryIcons';
import type { CouponModel } from '../domain/coupon.model';

interface Props {
  coupon: CouponModel | null;
  onClose: () => void;
}

export default function CouponModal({ coupon, onClose }: Props) {
  const { createCoupon, updateCoupon } = useCouponsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const isEditing = !!coupon;

  const [code, setCode] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [couponQuantity, setCouponQuantity] = useState('');
  const [minimumAmount, setMinimumAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [categoryId, setCategoryId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías si aún no están
  useEffect(() => {
    if (categories.length === 0) fetchCategories();
  }, [categories.length, fetchCategories]);

  // Rellenar formulario al editar
  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setExpirationDate(coupon.expirationDate ? coupon.expirationDate.split('T')[0] : '');
      setCouponQuantity(String(coupon.couponQuantity));
      setMinimumAmount(String(coupon.minimumAmount));
      setDiscountAmount(String(coupon.discountAmount));
      setDiscountType(coupon.discountType ?? 'fixed');
      setCategoryId(coupon.categoryId ?? '');
    } else {
      setCode('');
      setExpirationDate('');
      setCouponQuantity('');
      setMinimumAmount('');
      setDiscountAmount('');
      setDiscountType('fixed');
      setCategoryId('');
    }
  }, [coupon]);

  const handleSubmit = async () => {
    if (!code.trim() || !expirationDate || !couponQuantity || !discountAmount) {
      setError('Completa todos los campos obligatorios');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const data = {
        code: code.trim().toUpperCase(),
        expirationDate,
        couponQuantity: parseInt(couponQuantity, 10),
        minimumAmount: parseFloat(minimumAmount || '0'),
        discountAmount: parseFloat(discountAmount),
        discountType,
        ...(categoryId ? { categoryId } : {}),
      };

      if (isEditing) {
        await updateCoupon(coupon!.id, data);
      } else {
        await createCoupon(data);
      }
      onClose();
    } catch (err: unknown) {
      setError((isAxiosError(err) ? err.response?.data?.message : undefined) || 'Error al guardar el cupón');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      placement="center"
      classNames={{
        base: 'bg-moon-bg-secondary border border-[--glass-border]',
        header: 'border-b border-[--glass-border]',
        footer: 'border-t border-[--glass-border]',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
            <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
          </svg>
          {isEditing ? 'Editar Cupon' : 'Nuevo Cupon'}
        </ModalHeader>

        <ModalBody className="gap-4 py-5">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
              {error}
            </div>
          )}

          <Input
            label="Codigo del cupon"
            placeholder="Ej: LUNA10"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            variant="bordered"
            classNames={{ inputWrapper: 'border-default-200' }}
            isRequired
          />

          <Input
            label="Fecha de expiracion"
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            variant="bordered"
            classNames={{ inputWrapper: 'border-default-200' }}
            isRequired
          />

          {/* Tipo de descuento */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDiscountType('fixed')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                discountType === 'fixed'
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'border-default-200 text-default-500 hover:border-default-400'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              Fijo (S/)
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('percentage')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                discountType === 'percentage'
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'border-default-200 text-default-500 hover:border-default-400'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
              Porcentual (%)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cantidad"
              type="number"
              placeholder="100"
              value={couponQuantity}
              onChange={(e) => setCouponQuantity(e.target.value)}
              variant="bordered"
              classNames={{ inputWrapper: 'border-default-200' }}
              isRequired
              min={1}
            />
            <Input
              label={discountType === 'percentage' ? 'Descuento (%)' : 'Descuento (S/)'}
              type="number"
              placeholder={discountType === 'percentage' ? '10' : '10.00'}
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              variant="bordered"
              classNames={{ inputWrapper: 'border-default-200' }}
              isRequired
              min={0}
              max={discountType === 'percentage' ? 100 : undefined}
              step={0.01}
            />
          </div>

          <Input
            label="Monto minimo (S/)"
            type="number"
            placeholder="50"
            value={minimumAmount}
            onChange={(e) => setMinimumAmount(e.target.value)}
            variant="bordered"
            classNames={{ inputWrapper: 'border-default-200' }}
            min={0}
            step={0.01}
          />

          {/* Selector de categoría */}
          <Select
            label="Categoria (opcional)"
            placeholder="Aplica a todas las categorias"
            selectedKeys={categoryId ? new Set([categoryId]) : new Set<string>()}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string | undefined;
              setCategoryId(val ?? '');
            }}
            variant="bordered"
            classNames={{ trigger: 'border-default-200' }}
          >
            {categories.map((cat) => (
              <SelectItem
                key={cat.id}
                startContent={
                  <span className="flex items-center text-foreground/70">
                    {getCategoryIcon(cat.icon)}
                  </span>
                }
              >
                {cat.name}
              </SelectItem>
            ))}
          </Select>

          {categoryId && (
            <p className="text-xs text-default-400 -mt-2 px-1">
              El cupon solo aplicara a productos de la categoria seleccionada.
            </p>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={onClose}>Cancelar</Button>
          <Button color="primary" onPress={handleSubmit} isLoading={saving}>
            {isEditing ? 'Guardar Cambios' : 'Crear Cupon'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
