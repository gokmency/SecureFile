
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  icon?: React.ReactNode;
  asChild?: boolean; // Add the asChild prop
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  className,
  loading = false,
  variant = 'default',
  size = 'default',
  icon,
  asChild = false, // Set default value
  ...props
}) => {
  return (
    <Button
      className={cn(
        'transition-all ease-in-out duration-300',
        loading && 'opacity-90',
        className
      )}
      variant={variant}
      size={size}
      disabled={loading || props.disabled}
      asChild={asChild}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
};

export default ActionButton;
