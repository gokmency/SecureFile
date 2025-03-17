
import React from 'react';
import { Shield, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <Shield className={cn('text-primary', sizes[size])} />
        <ShieldCheck className={cn('text-primary absolute top-0 left-0 opacity-50', sizes[size])} />
      </div>
      <span className={cn('font-medium tracking-tight', sizes[size])}>SecureFile</span>
    </div>
  );
};

export default Logo;
