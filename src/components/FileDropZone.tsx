import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Upload, File, FileType, Info } from 'lucide-react';
import { SUPPORTED_FILE_FORMATS } from '@/utils/cryptoUtils';

interface FileDropZoneProps {
  onFilesDrop: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  mode?: 'encrypt' | 'decrypt';
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFilesDrop,
  accept = '*',
  maxSize,
  multiple = true,
  className,
  children,
  disabled = false,
  mode = 'encrypt',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragging(true);
    },
    [disabled]
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      if (!files.length) return [];

      const validFiles: File[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((file) => {
        // Validate file type if accept is specified
        if (accept !== '*') {
          const acceptTypes = accept.split(',').map((type) => type.trim());
          const isValidType = acceptTypes.some((type) => {
            if (type.startsWith('.')) {
              // Check file extension
              return file.name.toLowerCase().endsWith(type.toLowerCase());
            } else if (type.includes('*')) {
              // Check mime type pattern (e.g., 'image/*')
              const [category] = type.split('/');
              return file.type.startsWith(`${category}/`);
            } else {
              // Check exact mime type
              return file.type === type;
            }
          });

          if (!isValidType) {
            errors.push(`File type not supported: ${file.name}`);
            return;
          }
        }

        // Validate file size if maxSize is specified
        if (maxSize && file.size > maxSize) {
          const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
          errors.push(`File too large: ${file.name} (max ${maxSizeMB} MB)`);
          return;
        }

        validFiles.push(file);
      });

      if (errors.length) {
        setError(errors.join('. '));
        setTimeout(() => setError(null), 5000);
      }

      return validFiles;
    },
    [accept, maxSize]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(droppedFiles);

      if (validFiles.length) {
        onFilesDrop(multiple ? validFiles : [validFiles[0]]);
      }
    },
    [onFilesDrop, multiple, validateFiles, disabled]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || !e.target.files?.length) return;

      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);

      if (validFiles.length) {
        onFilesDrop(multiple ? validFiles : [validFiles[0]]);
      }

      // Reset the input value so the same file can be selected again
      e.target.value = '';
    },
    [onFilesDrop, multiple, validateFiles, disabled]
  );

  const fileAcceptAttribute = mode === 'encrypt' ? accept : '.enc';

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-sm min-h-[250px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          isDragging 
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg' 
            : 'border-border/40 bg-card/20 hover:bg-card/30 hover:border-primary/50',
          disabled && 'opacity-60 cursor-not-allowed',
          error && 'border-destructive/50',
          className
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          onChange={onInputChange}
          accept={fileAcceptAttribute}
          multiple={multiple}
          disabled={disabled}
        />

        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-6"
        >
          <div className="flex flex-col items-center justify-center gap-3 text-center animate-fade-in">
            <div 
              className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                isDragging 
                  ? 'bg-primary/30 scale-110' 
                  : 'bg-primary/10'
              )}
            >
              {mode === 'encrypt' ? (
                <Upload className={cn(
                  "h-7 w-7 text-primary transition-transform duration-300",
                  isDragging && "animate-bounce"
                )} />
              ) : (
                <File className={cn(
                  "h-7 w-7 text-primary transition-transform duration-300",
                  isDragging && "animate-pulse"
                )} />
              )}
            </div>
            <div className="space-y-2 text-center max-w-sm">
              <p className={cn(
                "font-medium transition-all duration-300",
                isDragging ? "text-lg text-primary" : "text-md"
              )}>
                {isDragging
                  ? 'Drop files here'
                  : mode === 'encrypt'
                  ? 'Drag files here or click to upload'
                  : 'Drag encrypted files or click to select'}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {mode === 'encrypt'
                  ? 'Your files will be securely encrypted in your browser'
                  : 'Select .enc files to decrypt them'}
              </p>
              {mode === 'encrypt' && (
                <div className="relative group mt-5 space-y-2 border-t border-border/20 pt-4">
                  <div className="flex items-center gap-1 justify-center mb-2">
                    <FileType className="h-4 w-4 text-primary" />
                    <p className="text-xs font-medium text-primary">Supported File Formats</p>
                    <Info className="h-3.5 w-3.5 text-primary-foreground/50 ml-1 cursor-help" />
                  </div>
                  
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 w-80 rounded-md bg-card/95 backdrop-blur-md border border-border/50 shadow-lg 
                              opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 text-xs">
                    <span className="font-medium block mb-2 text-sm">Supported File Formats</span>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-primary-foreground/80 block mb-1">Documents:</span> 
                        <p className="text-muted-foreground leading-relaxed">{SUPPORTED_FILE_FORMATS.documents.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-primary-foreground/80 block mb-1">Images:</span> 
                        <p className="text-muted-foreground leading-relaxed">{SUPPORTED_FILE_FORMATS.images.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-primary-foreground/80 block mb-1">Archives:</span> 
                        <p className="text-muted-foreground leading-relaxed">{SUPPORTED_FILE_FORMATS.archives.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-primary-foreground/80 block mb-1">Audio:</span> 
                        <p className="text-muted-foreground leading-relaxed">{SUPPORTED_FILE_FORMATS.audio.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-primary-foreground/80 block mb-1">Video:</span> 
                        <p className="text-muted-foreground leading-relaxed">{SUPPORTED_FILE_FORMATS.video.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-primary-foreground/80 block mb-1">Others:</span> 
                        <p className="text-muted-foreground leading-relaxed">{SUPPORTED_FILE_FORMATS.others.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {children}
        </label>

        {isDragging && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-5 border-2 border-primary/30 rounded-lg animate-pulse"></div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive animate-fade-in p-2 bg-destructive/10 rounded border border-destructive/30">
          <span className="font-medium">Error:</span> {error}
        </p>
      )}
    </div>
  );
};

export default FileDropZone;
