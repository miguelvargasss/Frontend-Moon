import { useState } from 'react';
import { Button, Card, CardBody, Chip, Input } from '@nextui-org/react';
import { useCategoriesStore } from '../../../categories/application/categories.store';
import type { SizeSystemModel } from '../../../products/domain/product.model';

export default function SizeSystemsSection() {
  const { sizeSystems, createSizeSystem, updateSizeSystem, deleteSizeSystem, addSizeOption, deleteSizeOption } = useCategoriesStore();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [addingOptionId, setAddingOptionId] = useState<string | null>(null);
  const [newOptionLabel, setNewOptionLabel] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createSizeSystem(newName.trim());
    setNewName('');
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await updateSizeSystem(id, editName.trim());
    setEditingId(null);
  };

  const handleDelete = async (ss: SizeSystemModel) => {
    if (confirm(`¿Eliminar el sistema "${ss.name}"? Se eliminarán todas sus opciones.`)) {
      await deleteSizeSystem(ss.id);
    }
  };

  const handleAddOption = async (systemId: string) => {
    if (!newOptionLabel.trim()) return;
    const maxOrder = sizeSystems.find(s => s.id === systemId)?.options.reduce((max, o) => Math.max(max, o.sortOrder), 0) ?? 0;
    await addSizeOption(systemId, newOptionLabel.trim(), maxOrder + 1);
    setNewOptionLabel('');
    setAddingOptionId(null);
  };

  const handleDeleteOption = async (systemId: string, optionId: string) => {
    await deleteSizeOption(systemId, optionId);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Crear nuevo sistema */}
      <div className="flex gap-2">
        <Input
          size="sm"
          variant="bordered"
          placeholder="Nombre del nuevo sistema (ej: Tallas EU)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          classNames={{ inputWrapper: "border-default-200" }}
          className="flex-1"
        />
        <Button size="sm" color="primary" onPress={handleCreate} isDisabled={!newName.trim()}>
          Crear
        </Button>
      </div>

      {/* Lista de sistemas */}
      {sizeSystems.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-default-400">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
          </svg>
          <p className="text-sm">No hay sistemas de tallas configurados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sizeSystems.map((ss) => (
            <Card key={ss.id} shadow="none" className="border border-default-200">
              <CardBody className="gap-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  {editingId === ss.id ? (
                    <div className="flex gap-2 flex-1 mr-2">
                      <Input
                        size="sm"
                        variant="bordered"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(ss.id)}
                        classNames={{ inputWrapper: "border-default-200" }}
                        autoFocus
                      />
                      <Button size="sm" color="primary" onPress={() => handleUpdate(ss.id)}>Guardar</Button>
                      <Button size="sm" variant="flat" onPress={() => setEditingId(null)}>Cancelar</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                          <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
                        </svg>
                        <span className="text-sm font-semibold text-foreground">{ss.name}</span>
                        <span className="text-xs text-default-400">({ss.options.length} opciones)</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" isIconOnly variant="light" color="primary" onPress={() => { setEditingId(ss.id); setEditName(ss.name); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Button>
                        <Button size="sm" isIconOnly variant="light" color="danger" onPress={() => handleDelete(ss)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Options */}
                <div className="flex flex-wrap gap-2">
                  {ss.options
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((opt) => (
                      <Chip
                        key={opt.id}
                        variant="flat"
                        color="default"
                        onClose={() => handleDeleteOption(ss.id, opt.id)}
                      >
                        {opt.label}
                      </Chip>
                    ))}
                  {addingOptionId === ss.id ? (
                    <div className="flex gap-1 items-center">
                      <Input
                        size="sm"
                        variant="bordered"
                        placeholder="Ej: XXL"
                        value={newOptionLabel}
                        onChange={(e) => setNewOptionLabel(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOption(ss.id)}
                        classNames={{ inputWrapper: "border-default-200 min-w-[80px]" }}
                        className="w-24"
                        autoFocus
                      />
                      <Button size="sm" isIconOnly color="primary" variant="flat" onPress={() => handleAddOption(ss.id)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </Button>
                      <Button size="sm" isIconOnly variant="flat" onPress={() => { setAddingOptionId(null); setNewOptionLabel(''); }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </Button>
                    </div>
                  ) : (
                    <Chip
                      variant="bordered"
                      color="primary"
                      className="cursor-pointer border-dashed"
                      onClick={() => { setAddingOptionId(ss.id); setNewOptionLabel(''); }}
                    >
                      + Agregar
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
