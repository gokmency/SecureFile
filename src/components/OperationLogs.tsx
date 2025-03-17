import React from 'react';
import { cn } from '@/lib/utils';
import { OperationLog } from '@/utils/cryptoUtils';
import { Check, AlertCircle, Clock } from 'lucide-react';

interface OperationLogsProps {
  logs: OperationLog[];
  maxHeight?: string;
  className?: string;
}

const OperationLogs: React.FC<OperationLogsProps> = ({
  logs,
  maxHeight = '300px',
  className,
}) => {
  if (logs.length === 0) {
    return (
      <div className={cn(
        'text-center p-4 border rounded-md bg-card/50',
        className
      )}>
        <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No operation logs yet</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  return (
    <div
      className={cn(
        'border rounded-md overflow-hidden',
        className
      )}
    >
      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        <table className="w-full">
          <thead className="bg-muted/40 sticky top-0 backdrop-blur-sm">
            <tr>
              <th className="text-xs text-left p-2 font-medium text-muted-foreground w-1/6">Time</th>
              <th className="text-xs text-left p-2 font-medium text-muted-foreground w-1/5">Action</th>
              <th className="text-xs text-left p-2 font-medium text-muted-foreground w-2/5">File</th>
              <th className="text-xs text-left p-2 font-medium text-muted-foreground w-1/6">Size</th>
              <th className="text-xs text-center p-2 font-medium text-muted-foreground w-1/12">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {logs.map((log) => (
              <tr
                key={log.id}
                className={cn(
                  'bg-transparent/40 transition-colors duration-200 hover:bg-muted/30',
                  log.success ? 'hover:bg-success/5' : 'hover:bg-destructive/5'
                )}
              >
                <td className="text-xs p-2 text-muted-foreground whitespace-nowrap">
                  {formatDate(log.timestamp)}
                </td>
                <td className="text-xs p-2 font-medium whitespace-nowrap">
                  {log.action}
                </td>
                <td className="text-xs p-2 truncate max-w-xs" title={log.fileName}>
                  {log.fileName}
                </td>
                <td className="text-xs p-2 text-muted-foreground whitespace-nowrap">
                  {formatFileSize(log.fileSize)}
                </td>
                <td className="text-xs p-2 text-center">
                  {log.success ? (
                    <Check className="h-4 w-4 text-success mx-auto" />
                  ) : (
                    <div title={log.error || "Error"}>
                      <AlertCircle className="h-4 w-4 text-destructive mx-auto" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperationLogs;
