
import React from 'react';
import { FileWithProgress } from '@/utils/cryptoUtils';
import FileCard from './FileCard';
import { cn } from '@/lib/utils';

interface FileListProps {
  files: FileWithProgress[];
  onRemoveFile: (id: string) => void;
  onDownloadFile: (id: string) => void;
  className?: string;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  onDownloadFile,
  className,
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 md:grid-cols-3', className)}>
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onRemove={onRemoveFile}
          onDownload={onDownloadFile}
        />
      ))}
    </div>
  );
};

export default FileList;
