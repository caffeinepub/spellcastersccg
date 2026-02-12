import { useState, useRef } from 'react';
import { ExternalBlob } from '../backend';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X } from 'lucide-react';

interface ImagePickerProps {
  currentUrl?: string;
  onImageSelect: (blob: ExternalBlob | undefined) => void;
  aspectRatio?: 'square' | 'wide';
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImagePicker({ currentUrl, onImageSelect, aspectRatio = 'square' }: ImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 5MB');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      setPreviewUrl(blob.getDirectURL());
      onImageSelect(blob);
      setUploadProgress(0);
    } catch (err) {
      setError('Failed to process image');
      console.error(err);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    onImageSelect(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-[3/1]';

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative">
          <div className={`${aspectClass} w-full rounded-lg overflow-hidden bg-muted`}>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`${aspectClass} w-full rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Progress value={uploadProgress} className="w-full" />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
