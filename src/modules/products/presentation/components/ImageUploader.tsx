import { useRef } from 'react';
import type { ProductImageModel } from '../../domain/product.model';

interface ImageUploaderProps {
  existingImages: ProductImageModel[];
  pendingFiles: File[];
  maxImages?: number;
  onAddFiles: (files: File[]) => void;
  onRemovePending: (index: number) => void;
  onRemoveExisting?: (imageId: string) => void;
  size?: 'sm' | 'md';
}

export default function ImageUploader({
  existingImages,
  pendingFiles,
  maxImages = 5,
  onAddFiles,
  onRemovePending,
  onRemoveExisting,
  size = 'md',
}: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const totalCount = existingImages.length + pendingFiles.length;
  const imgSize = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
  const btnSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const iconSize = size === 'sm' ? '6' : '8';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (totalCount + files.length > maxImages) {
      alert(`Máximo ${maxImages} imágenes`);
      return;
    }
    onAddFiles(files);
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {existingImages.map((img) => (
        <div className={`relative ${imgSize} rounded-lg overflow-hidden border border-default-200`} key={img.id}>
          <img src={img.url} alt="" className="w-full h-full object-cover" />
          {onRemoveExisting && (
            <button
              type="button"
              className={`absolute top-0.5 right-0.5 ${btnSize} rounded-full bg-danger flex items-center justify-center`}
              onClick={() => onRemoveExisting(img.id)}
            >
              <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      ))}
      {pendingFiles.map((file, idx) => (
        <div className={`relative ${imgSize} rounded-lg overflow-hidden border border-default-200`} key={`pend-${idx}`}>
          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            className={`absolute top-0.5 right-0.5 ${btnSize} rounded-full bg-danger flex items-center justify-center`}
            onClick={() => onRemovePending(idx)}
          >
            <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
      {totalCount < maxImages && (
        <button
          type="button"
          className={`${imgSize} rounded-lg border-2 border-dashed border-default-300 flex flex-col items-center justify-center gap-0.5 text-default-400 hover:border-primary/50 hover:text-primary transition-colors`}
          onClick={() => fileRef.current?.click()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-[9px]">Subir</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
    </div>
  );
}
