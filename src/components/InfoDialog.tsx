
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Info, Shield, Lock, Unlock, FileKey } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoDialogProps {
  triggerText: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  children: React.ReactNode;
  className?: string;
}

const InfoDialog: React.FC<InfoDialogProps> = ({
  triggerText,
  title,
  description,
  icon = <Info className="h-4 w-4" />,
  variant = 'outline',
  children,
  className,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} className={cn("flex items-center gap-2", className)}>
          {icon}
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg glass-morphism">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gradient">
            {icon} {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4 text-left">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;
