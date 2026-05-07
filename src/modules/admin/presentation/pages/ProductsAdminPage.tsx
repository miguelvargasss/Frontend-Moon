import { useEffect, useState, useMemo } from 'react';
import { Input, Button, Chip, Card, CardBody } from '@nextui-org/react';
import { useProductsStore } from '../../../products/application/products.store';
import { useCategoriesStore } from '../../../categories/application/categories.store';
import { getCategoryIcon } from '../../../categories/presentation/components/CategoryIcons';
import ProductModal from '../../../products/presentation/components/ProductModal';
import type { ProductModel } from '../../../products/domain/product.model';

export default function ProductsAdminPage() {
  const { products, isLoading, fetchProducts, deleteProduct } = useProductsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductModel | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string | null>(null);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

  const filtered = useMemo(() => {
    let list = products;
    if (filterCat) list = list.filter((p) => p.categoryId === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, filterCat, search]);

  const catName = (catId?: string) => categories.find((c) => c.id === catId)?.name ?? '—';
  const catIcon = (catId?: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? getCategoryIcon(cat.icon) : null;
  };

  const handleDelete = async (p: ProductModel) => {
    if (confirm(`¿Eliminar el producto "${p.name}"?`)) await deleteProduct(p.id);
  };

  return (
    <div id="products-admin-page">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Productos
          </h1>
          <p className="text-sm text-default-400 mt-1">{products.length} producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <Button color="primary" id="btn-new-product" onPress={() => { setEditingProduct(null); setModalOpen(true); }}
          startContent={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>}
        >
          Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <Input
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="bordered"
          classNames={{ inputWrapper: "border-default-200" }}
          startContent={<svg className="text-default-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>}
          className="max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          <Chip variant={!filterCat ? 'solid' : 'bordered'} color={!filterCat ? 'primary' : 'default'} className="cursor-pointer" onClick={() => setFilterCat(null)}>Todos</Chip>
          {categories.map((cat) => (
            <Chip key={cat.id} variant={filterCat === cat.id ? 'solid' : 'bordered'} color={filterCat === cat.id ? 'primary' : 'default'} className="cursor-pointer"
              onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
              startContent={<span className="text-xs">{getCategoryIcon(cat.icon)}</span>}
            >
              {cat.name}
            </Chip>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading && products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-default-500 text-sm">
          <div className="loader-moon" /><p>Cargando productos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-default-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /></svg>
          <p className="text-sm">{search ? 'No se encontraron productos' : 'No hay productos aún'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {filtered.map((prod) => (
            <Card key={prod.id} shadow="none" className="border border-default-200 hover:border-primary/30 transition-colors">
              <div className="relative aspect-[4/3] overflow-hidden bg-default-100">
                {prod.images[0] ? (
                  <img src={prod.images[0].url} alt={prod.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
                  </div>
                )}
                <Chip size="sm" className="absolute top-2 left-2" color={prod.totalStock > 0 ? 'success' : 'danger'} variant="flat">{prod.totalStock > 0 ? 'Disponible' : 'Agotado'}</Chip>
                {prod.categoryId && (
                  <Chip size="sm" className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-foreground" variant="flat">
                    {catIcon(prod.categoryId)} {catName(prod.categoryId)}
                  </Chip>
                )}
                {prod.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 text-xs bg-black/60 backdrop-blur-sm text-foreground px-2 py-0.5 rounded-md">+{prod.images.length - 1} fotos</span>
                )}
              </div>
              <CardBody className="gap-2">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{prod.name}</h3>
                {prod.variants.length > 0 && (
                  <p className="text-xs text-default-400 line-clamp-1">
                    {prod.sizeType && <span className="font-medium text-default-500">{prod.sizeType}</span>}
                    {' · '}{[...new Set(prod.variants.map((v) => v.size).filter(Boolean))].join(', ') || ''}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-foreground">S/ {prod.price}</span>
                  <span className="text-xs text-default-400">Stock: {prod.totalStock}</span>
                </div>
                {prod.variants.length > 0 && (
                  <p className="text-xs text-default-400">{[...new Set(prod.variants.map((v) => v.color).filter(Boolean))].join(' / ')}</p>
                )}
              </CardBody>
              <div className="flex gap-2 px-4 pb-4">
                <Button size="sm" variant="flat" color="primary" className="flex-1"
                  onPress={() => { setEditingProduct(prod); setModalOpen(true); }}
                  startContent={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
                >Editar</Button>
                <Button size="sm" variant="flat" color="danger"
                  onPress={() => handleDelete(prod)}
                  isIconOnly
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => { setModalOpen(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
}
