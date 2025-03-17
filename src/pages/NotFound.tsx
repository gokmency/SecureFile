
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { buttonVariants } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const NotFound = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-6xl font-bold mb-4 text-gradient">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className={cn(
            buttonVariants({ variant: 'default' }),
            'flex items-center gap-2'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Return Home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
