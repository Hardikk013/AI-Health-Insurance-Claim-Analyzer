import React, { useRef, useState } from 'react';
import { UploadCloud, Camera, FileCheck, AlertCircle, X } from 'lucide-react';

interface DropZoneProps {
  label: string;
  description: string;
  documentType: 'rejection_letter' | 'policy_document' | 'discharge_summary';
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  required?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  label,
  description,
  documentType,
  selectedFile,
  onFileSelect,
  required = true
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    const MAX_SIZE_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 15 MB.`);
      return;
    }

    const validMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png'];
    const hasValidExt = validExts.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validMimes.includes(file.type) && !hasValidExt) {
      setErrorMessage('Invalid format. Please upload a PDF, JPG, or PNG document.');
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleContainerClick = () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-primary flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-danger">*</span>}
        </label>
        <span className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 15MB)</span>
      </div>

      <div
        onClick={handleContainerClick}
        onKeyDown={(e) => {
          if (!selectedFile && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleContainerClick();
          }
        }}
        tabIndex={selectedFile ? -1 : 0}
        role={selectedFile ? undefined : 'button'}
        aria-label={`Click to upload ${label}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all bg-card flex flex-col items-center justify-center min-h-[145px] select-none ${
          !selectedFile ? 'cursor-pointer hover:shadow-xs' : ''
        } ${
          isDragOver
            ? 'border-accent bg-secondary/30 scale-[1.005]'
            : selectedFile
            ? 'border-success bg-success-soft/30'
            : 'border-border hover:border-accent/60 hover:bg-muted/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={handleFileInput}
          className="hidden"
          id={`upload-${documentType}`}
        />

        {/* Mobile camera capture */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
          id={`camera-${documentType}`}
        />

        {selectedFile ? (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="w-full flex items-center justify-between bg-card border border-success/40 rounded-lg p-3 shadow-xs cursor-default"
          >
            <div className="flex items-center gap-3 truncate">
              <div className="size-9 rounded-lg bg-success-soft text-success flex items-center justify-center shrink-0">
                <FileCheck className="size-4.5" />
              </div>
              <div className="text-left truncate">
                <p className="text-sm font-medium text-foreground truncate max-w-xs md:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for OCR &amp; analysis
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
              className="p-1.5 text-muted-foreground hover:text-danger rounded-md transition-colors"
              title="Remove file"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-accent">
              <UploadCloud className="size-5" />
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-foreground">
                <span className="text-accent underline font-semibold">Click anywhere to browse</span> or drag &amp; drop document here
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>

            {/* Camera photo button for mobile */}
            <div className="pt-0.5 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-muted text-foreground hover:bg-muted/80 rounded-md border border-border transition-colors"
              >
                <Camera className="size-3 text-accent" />
                <span>Snap photo with camera</span>
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-destructive bg-danger-soft px-3 py-1.5 rounded-lg border border-destructive/20 w-full text-left">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
