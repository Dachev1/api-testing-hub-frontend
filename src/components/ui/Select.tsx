import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string; color?: string }>;
  label?: string;
  showColorIndicator?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, id, showColorIndicator = false, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const [isOpen, setIsOpen] = React.useState(false);
    
    // Handle focus and blur to track dropdown state for animation
    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsOpen(true);
      if (props.onFocus) props.onFocus(e);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsOpen(false);
      if (props.onBlur) props.onBlur(e);
    };
    
    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={selectId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {showColorIndicator && props.value && (
            <div 
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-10 transition-all duration-300",
                props.value === 'GET' && "bg-emerald-500 shadow-sm shadow-emerald-500/50",
                props.value === 'POST' && "bg-blue-500 shadow-sm shadow-blue-500/50",
                props.value === 'PUT' && "bg-amber-500 shadow-sm shadow-amber-500/50",
                props.value === 'DELETE' && "bg-rose-500 shadow-sm shadow-rose-500/50",
                props.value === 'PATCH' && "bg-violet-500 shadow-sm shadow-violet-500/50",
                props.value === 'HEAD' && "bg-slate-500 shadow-sm shadow-slate-500/50",
                props.value === 'OPTIONS' && "bg-pink-500 shadow-sm shadow-pink-500/50"
              )}
            />
          )}
          <select
            id={selectId}
            className={cn(
              'flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm shadow-sm transition-all duration-300 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring',
              'hover:border-ring/50 hover:shadow-md',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'group-hover:shadow-sm',
              showColorIndicator && 'pl-8',
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                className={cn(
                  option.color
                )}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className={cn(
            "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none transition-transform duration-300 ease-in-out",
            "group-hover:text-foreground",
            isOpen && "rotate-180 text-foreground"
          )} />
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select }; 