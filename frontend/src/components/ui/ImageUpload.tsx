import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
  helperText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxImages = 4,
  label = 'Item Images',
  helperText = 'Upload clear photos showing any distinctive features or markings (Max 5MB each).',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (value.length + files.length > maxImages) {
      setUploadError(`You can upload a maximum of ${maxImages} images.`);
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 5MB limit.`);
        }
        const uploadRes = await api.uploadImage(file);
        newUrls.push(uploadRes.url);
      }
      onChange([...value, ...newUrls]);
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 text-xs font-mono font-medium uppercase tracking-wider text-campus-charcoal/80">
          {label} ({value.length}/{maxImages})
        </label>
      )}

      {/* Grid of previews + upload trigger */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {value.map((url, idx) => (
          <div
            key={idx}
            className="relative aspect-square border-2 border-campus-charcoal bg-campus-white group overflow-hidden"
          >
            <img
              src={url}
              alt={`Upload ${idx + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1.5 right-1.5 p-1 bg-campus-charcoal text-campus-ivory hover:bg-red-600 transition-colors shadow-sm"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-1.5 left-1.5 bg-campus-charcoal text-campus-lime font-mono text-[9px] uppercase px-1.5 py-0.5 tracking-wider font-bold">
                Cover Photo
              </span>
            )}
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-campus-charcoal/40 hover:border-campus-charcoal bg-campus-white/60 hover:bg-campus-white flex flex-col items-center justify-center p-3 text-center transition-colors group cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 text-campus-forest animate-spin mb-1.5" />
                <span className="text-[11px] font-mono text-campus-charcoal/70">Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-campus-charcoal/60 group-hover:text-campus-charcoal mb-1.5 transition-colors" />
                <span className="text-xs font-medium text-campus-charcoal group-hover:underline">
                  Add Image
                </span>
                <span className="text-[10px] font-mono text-campus-charcoal/50 mt-0.5">
                  JPG, PNG, WEBP
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadError && <p className="mt-1.5 text-xs text-red-600 font-mono">{uploadError}</p>}
      {helperText && !uploadError && (
        <p className="mt-1.5 text-xs text-campus-charcoal/60 font-mono">{helperText}</p>
      )}
    </div>
  );
};
