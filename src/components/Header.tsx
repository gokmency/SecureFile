
import React from 'react';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn('w-full py-6 px-4 sm:px-6 neo-blur sticky top-0 z-50', className)}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />
        <div className="flex items-center space-x-2">
          <span className="text-xs px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            Client-side encryption
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
