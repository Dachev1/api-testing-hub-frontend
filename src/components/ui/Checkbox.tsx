import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };
    
    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            id={checkboxId}
            type="checkbox"
            className="sr-only"
            ref={ref}
            checked={checked}
            onChange={handleChange}
            {...props}
          />
          <div
            className={cn(
              'peer h-4 w-4 shrink-0 rounded-sm border transition-all duration-200 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'hover:border-primary/70 hover:shadow-sm',
              checked 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-input bg-background',
              className
            )}
            onClick={() => {
              const input = document.getElementById(checkboxId) as HTMLInputElement;
              if (input && !props.disabled) {
                input.click();
              }
            }}
          >
            <Check 
              className={cn(
                'h-3 w-3 text-primary-foreground opacity-0 transition-opacity duration-200',
                checked && 'opacity-100'
              )}
            />
          </div>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox }; 