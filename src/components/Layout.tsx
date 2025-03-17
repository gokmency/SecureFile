import React from 'react';
import Header from './Header';
import { cn } from '@/lib/utils';
import { Shield, Github, Heart, Twitter } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background/95 to-background/90 relative">
      <div className="absolute inset-0 bg-[url('/bg-grid.svg')] bg-center opacity-[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <Header />
      
      <main className={cn('flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto relative z-10', className)}>
        {children}
      </main>
      
      <footer className="py-6 px-4 sm:px-6 text-center text-sm text-muted-foreground border-t border-border/20 relative z-10">
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <Shield className="h-4 w-4 text-primary" />
          <p className="font-medium text-gradient">End-to-End Encryption</p>
        </div>
        <p className="mb-3 max-w-lg mx-auto">All encryption happens in your browser. Your files never leave your device.</p>
        
        <div className="flex items-center justify-center gap-4 text-xs mt-4 text-muted-foreground/70">
          <a href="https://github.com/gokmency/SecureFile" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Github className="h-3.5 w-3.5" />
            <span>Source Code</span>
          </a>
          <a href="https://twitter.com/gokmeneth" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Twitter className="h-3.5 w-3.5" />
            <span>@gokmeneth</span>
          </a>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-rose-500" />
            <span>Made with privacy in mind</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
