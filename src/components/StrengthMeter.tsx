import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface StrengthMeterProps {
  entropy: number;
  className?: string;
}

const StrengthMeter: React.FC<StrengthMeterProps> = ({ entropy, className }) => {
  const { level, color, message, icon } = useMemo(() => {
    if (entropy <= 25) {
      return {
        level: 1,
        color: 'bg-destructive/80',
        message: 'Very Weak',
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      };
    } else if (entropy <= 50) {
      return {
        level: 2,
        color: 'bg-warning/80',
        message: 'Weak',
        icon: <AlertCircle className="h-4 w-4 text-warning" />,
      };
    } else if (entropy <= 75) {
      return {
        level: 3,
        color: 'bg-amber-500/80',
        message: 'Medium',
        icon: <Shield className="h-4 w-4 text-amber-500" />,
      };
    } else if (entropy <= 100) {
      return {
        level: 4,
        color: 'bg-green-500/80',
        message: 'Strong',
        icon: <Shield className="h-4 w-4 text-green-500" />,
      };
    } else {
      return {
        level: 5,
        color: 'bg-accent/80',
        message: 'Very Strong',
        icon: <CheckCircle className="h-4 w-4 text-accent" />,
      };
    }
  }, [entropy]);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center text-xs gap-1">
          {icon} <span className="font-medium">{message}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {level === 1 && "Use a longer password"}
          {level === 2 && "Add numbers and symbols"}
          {level === 3 && "Good, add uppercase letters"}
          {level === 4 && "Very good"}
          {level === 5 && "Excellent!"}
        </span>
      </div>
      <div className="flex w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("transition-all duration-500 ease-out rounded-full", color)} style={{ width: `${Math.min(100, entropy)}%` }} />
      </div>
    </div>
  );
};

export default StrengthMeter;
