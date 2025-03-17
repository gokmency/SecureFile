import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import StrengthMeter from './StrengthMeter';
import { calculateEntropy } from '@/utils/cryptoUtils';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  showStrengthMeter?: boolean;
  id?: string;
  className?: string;
  required?: boolean;
  showToggle?: boolean;
  disabled?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  label = 'Password',
  placeholder = 'Enter your password',
  showStrengthMeter = true,
  id = 'password',
  className,
  required = true,
  showToggle = true,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const entropy = calculateEntropy(value);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium flex items-center gap-1">
          <KeyRound className="h-3.5 w-3.5 text-muted-foreground" /> {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            id={id}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              "pr-10 transition-all duration-200",
              isFocused && "ring-2 ring-primary/30 border-primary"
            )}
            required={required}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {showToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:text-primary transition-colors duration-200"
              onClick={toggleShowPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
      {showStrengthMeter && value && (
        <StrengthMeter entropy={entropy} />
      )}
    </div>
  );
};

export default PasswordInput;
