import React, { useRef, useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Upload, 
  Camera,
  FileCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FileSlotProps {
  label: string;
  sublabel?: string;
  required?: boolean;
  file?: File | { name: string; size: number } | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  progress?: number;
}

export const FileSlot: React.FC<FileSlotProps> = ({
  label,
  sublabel,
  required = false,
  file,
  onSelect,
  onRemove,
  progress = 100,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-2xl border-2 p-4 sm:p-5 transition-all ${
        isDragOver
          ? 'border-teal bg-mint/30 shadow-soft'
          : file
          ? 'border-teal/50 bg-mint/10 shadow-soft'
          : 'border-line bg-surface hover:border-teal/40'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        aria-label={`Select ${label} document ${required ? '(required)' : ''}`}
        accept=".pdf,.jpg,.jpeg,.png"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onSelect(e.target.files[0]);
          }
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        aria-label={`Capture photo of ${label}`}
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onSelect(e.target.files[0]);
          }
        }}
      />

      <span className="sr-only" role="status" aria-live="polite">
        {file ? `${label} file attached: ${file.name}` : ''}
      </span>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint text-teal mt-0.5" aria-hidden="true">
            {file ? <FileText className="size-5" /> : <Upload className="size-4" />}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-ink">{label}</span>
              {required && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FCEBEB] text-[#791F1F]">
                  Required
                </span>
              )}
            </div>
            {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}

            {/* Attached file detail */}
            {file && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-mint px-2 py-0.5 rounded-full text-teal font-semibold">
                  <FileCheck className="size-3" aria-hidden="true" />
                  <span>Verified Document</span>
                </span>
                <span className="text-xs font-mono font-medium text-ink truncate max-w-[180px] sm:max-w-xs">
                  {file.name}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  ({formatSize(file.size)})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        {file ? (
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <CheckCircle2 className="size-5 text-teal" aria-hidden="true" />
            </motion.div>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${label} file: ${file.name}`}
              className="p-1.5 rounded-lg text-muted hover:text-[#791F1F] hover:bg-muted/15 focus-visible:ring-2 focus-visible:ring-[#791F1F] focus-visible:outline-none transition-colors cursor-pointer"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="sm:hidden p-2 rounded-lg border border-line bg-cream text-muted-foreground hover:text-ink focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none cursor-pointer"
              aria-label={`Take photo of ${label}`}
            >
              <Camera className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label={`Select ${label} document ${required ? '(required)' : ''}`}
              className="px-3.5 py-1.5 rounded-full border border-line bg-cream text-xs font-medium text-ink hover:bg-mint focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none transition-colors cursor-pointer"
            >
              Select
            </button>
          </div>
        )}
      </div>

      {/* Upload Progress Bar */}
      {file && progress < 100 && (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Upload progress for ${label}`}
          className="mt-3 w-full bg-line rounded-full h-1.5 overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-teal h-full"
          />
        </div>
      )}
    </div>
  );
};
