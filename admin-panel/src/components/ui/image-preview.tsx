import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ImagePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  maxFiles?: number;
}

export function ImagePreview({ files, onRemove, maxFiles = 10 }: ImagePreviewProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    // Generate preview URLs for all files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Cleanup: revoke URLs when component unmounts or files change
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[rgb(var(--text))]">
          Выбрано изображений: {files.length} {maxFiles && `/ ${maxFiles}`}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden border-2 border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
              <img
                src={previews[index]}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-1.5 bg-[rgb(var(--danger))] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110"
              title="Удалить изображение"
            >
              <X className="w-4 h-4" />
            </button>

            {/* File info */}
            <div className="mt-1 px-1">
              <p className="text-xs text-[rgb(var(--text-muted))] truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-[rgb(var(--text-subtle))]">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SingleImagePreviewProps {
  file: File | null;
  currentImageUrl?: string;
  onRemove: () => void;
}

export function SingleImagePreview({ file, currentImageUrl, onRemove }: SingleImagePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreview(null);
    }
  }, [file]);

  const displayUrl = preview || currentImageUrl;

  if (!displayUrl) {
    return null;
  }

  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-[rgb(var(--text))] mb-2">
        {file ? 'Новое изображение:' : 'Текущее изображение:'}
      </p>

      <div className="relative inline-block">
        <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-[rgb(var(--border))] bg-[rgb(var(--bg-card))]">
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-[rgb(var(--danger))] text-white rounded-full hover:scale-110 transition-transform"
          title="Удалить изображение"
        >
          <X className="w-4 h-4" />
        </button>

        {/* File info */}
        {file && (
          <div className="mt-2">
            <p className="text-xs text-[rgb(var(--text-muted))] truncate max-w-[192px]" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-[rgb(var(--text-subtle))]">
              {(file.size / 1024).toFixed(0)} KB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
