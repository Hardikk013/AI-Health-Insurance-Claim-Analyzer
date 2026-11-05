import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, FileCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  title?: string;
  subtitle?: string;
  acceptedTypes?: string[];
  className?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  title = 'Drop your rejection letter here',
  subtitle = 'PDF, photo or screenshot. Policy and discharge summary can be added next.',
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateAndPass = (file: File) => {
    setErrorMessage(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = acceptedTypes.includes(ext);
    const isAllowedMime = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type);

    if (!isAllowedExt && !isAllowedMime) {
      setErrorMessage(`Please select a valid document: PDF, JPG or PNG (received ${file.name})`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 15MB.`);
      return;
    }

    onFileSelect(file);
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
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        animate={{
          scale: isDragOver ? 1.01 : 1,
          backgroundColor: isDragOver ? 'rgba(217, 239, 234, 0.45)' : 'var(--surface)',
          borderColor: isDragOver ? 'var(--teal)' : 'var(--teal)',
        }}
        transition={{ duration: 0.2 }}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 cursor-pointer transition-all ${
          isDragOver ? 'border-solid shadow-soft-lg' : 'border-dashed border-teal/60 hover:border-teal bg-surface shadow-soft hover:shadow-soft-lg'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validateAndPass(e.target.files[0]);
            }
          }}
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validateAndPass(e.target.files[0]);
            }
          }}
        />

        {/* Gentle Floating Cloud Icon */}
        <motion.div
          animate={
            isDragOver
              ? { scale: 1.15, y: -4 }
              : { y: [0, -5, 0], scale: 1 }
          }
          transition={
            isDragOver
              ? { duration: 0.2 }
              : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
          }
          className="flex size-14 items-center justify-center rounded-full bg-mint text-teal mb-4"
        >
          <UploadCloud className="size-7" />
        </motion.div>

        {/* Text */}
        <h3 className="text-lg sm:text-xl font-medium tracking-tight text-ink text-center">
          {title}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground text-center max-w-md leading-relaxed">
          {subtitle}
        </p>

        {/* Action Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cream text-xs font-medium text-ink border border-line">
            <FileCheck className="size-3.5 text-teal" />
            <span>Click or drag file</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cameraInputRef.current?.click();
            }}
            className="sm:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cream text-xs font-medium text-ink border border-line hover:bg-mint"
          >
            <Camera className="size-3.5 text-teal" />
            <span>Take photo</span>
          </button>
        </div>

        {/* Privacy Note */}
        <p className="mt-4 text-[11px] font-mono text-muted text-center tracking-wider uppercase">
          DELETED AUTOMATICALLY AFTER 24 HOURS · NO SIGN-UP NEEDED
        </p>
      </motion.div>

      {/* Error notification */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2.5 p-3 rounded-xl border border-red-200 bg-[#FCEBEB] text-xs text-[#791F1F] flex items-center gap-2"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}
    </div>
  );
};
