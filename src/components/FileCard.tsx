import React from 'react';
import { cn } from '@/lib/utils';
import { File, Lock, Unlock, Check, AlertCircle, X, Download, FileText, FileImage, FileArchive, FileAudio, FileVideo } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import ActionButton from './ActionButton';
import { FileWithProgress } from '@/utils/cryptoUtils';

interface FileCardProps {
  file: FileWithProgress;
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
  className?: string;
}

const FileCard: React.FC<FileCardProps> = ({
  file,
  onRemove,
  onDownload,
  className,
}) => {
  const { id, file: fileObj, progress, status, error } = file;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getFileIcon = () => {
    const type = fileObj.type;
    if (type.startsWith('image/')) return <FileImage className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <FileAudio className="h-5 w-5" />;
    if (type.startsWith('video/')) return <FileVideo className="h-5 w-5" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('gz'))
      return <FileArchive className="h-5 w-5" />;
    if (type.includes('text') || type.includes('document') || type.includes('pdf'))
      return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Lock className="h-5 w-5 text-primary animate-pulse" />;
      case 'encrypted':
        return <Lock className="h-5 w-5 text-success" />;
      case 'decrypted':
        return <Unlock className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return getFileIcon();
    }
  };

  const isComplete = status === 'encrypted' || status === 'decrypted';
  const isError = status === 'error';
  const isProcessing = status === 'processing';

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg transition-all duration-300 animate-scale-in border bg-card/50 backdrop-blur-sm hover:bg-card/80 shadow-sm',
        isComplete && 'bg-accent/10 border-accent hover:bg-accent/20',
        isError && 'bg-destructive/10 border-destructive/30 hover:bg-destructive/15',
        isProcessing && 'bg-primary/5 border-primary/30 hover:bg-primary/10',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'rounded-md p-2 transition-colors duration-300',
          isComplete && 'bg-accent/20 text-accent-foreground',
          isError && 'bg-destructive/20 text-destructive',
          isProcessing && 'bg-primary/20 text-primary-foreground',
          !isComplete && !isError && !isProcessing && 'bg-card'
        )}>
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <h3 className="font-medium text-sm truncate">{fileObj.name}</h3>
            <button
              onClick={() => onRemove(id)}
              className="text-muted-foreground hover:text-destructive transition-colors rounded-full h-5 w-5 flex items-center justify-center"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{formatFileSize(fileObj.size)}</p>
          
          {error && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
              <AlertCircle className="h-3 w-3 inline-block mr-1" />
              {error}
            </div>
          )}
        </div>
      </div>
      
      {isProcessing && (
        <div className="mt-3">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">Processing...</p>
            <p className="text-xs font-medium">{Math.round(progress)}%</p>
          </div>
        </div>
      )}
      
      {isComplete && (
        <div className="mt-3">
          <ActionButton
            variant="outline"
            size="sm"
            className="w-full text-xs group hover:bg-accent/20 hover:text-accent-foreground hover:border-accent"
            onClick={() => onDownload(id)}
            icon={<Download className="h-3 w-3 group-hover:animate-bounce" />}
          >
            Download
          </ActionButton>
        </div>
      )}
    </div>
  );
};

export default FileCard;
