import { useState } from 'react';
import {
  Modal, ModalContent, ModalHeader, ModalBody,
} from '@nextui-org/react';
import ProductTypeSelector from './ProductTypeSelector';
import SingleProductForm from './SingleProductForm';
import MultiProductForm from './MultiProductForm';
import type { ProductModel, ProductType } from '../../domain/product.model';
import type { CategoryModel } from '../../../categories/domain/category.model';

interface ProductModalProps {
  product: ProductModel | null;
  categories: CategoryModel[];
  onClose: () => void;
}

export default function ProductModal({ product, categories, onClose }: ProductModalProps) {
  const [productType, setProductType] = useState<ProductType | null>(
    product?.productType ?? null,
  );

  // Si es creación y aún no se eligió tipo, mostrar selector
  if (!productType) {
    return (
      <Modal
        isOpen
        onClose={onClose}
        size="xl"
        classNames={{
          base: "bg-moon-bg-secondary border border-[--glass-border]",
          header: "border-b border-[--glass-border]",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-foreground">Nuevo Producto</ModalHeader>
          <ModalBody className="pb-6">
            <ProductTypeSelector onSelect={setProductType} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-moon-bg-secondary border border-[--glass-border]",
        header: "border-b border-[--glass-border]",
        footer: "border-t border-[--glass-border]",
      }}
    >
      <ModalContent>
        {productType === 'single' ? (
          <SingleProductForm product={product} categories={categories} onClose={onClose} />
        ) : (
          <MultiProductForm product={product} categories={categories} onClose={onClose} />
        )}
      </ModalContent>
    </Modal>
  );
}
