import * as React from 'react';
import { cn } from '@/lib/utils';
import type { TabsContextValue } from '@/types';

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
};

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;

    const handleValueChange = React.useCallback((newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }, [value, onValueChange]);

    return (
      <TabsContext.Provider value={{ value: currentValue, onChange: handleValueChange }}>
        <div ref={ref} className={cn('w-full', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl bg-muted/40 backdrop-blur-sm p-1 text-muted-foreground border border-border/10 shadow-sm',
        'transition-all duration-300 ease-in-out hover:shadow-md',
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue, onChange } = useTabsContext();
    const isSelected = selectedValue === value;
    
    // Create a ref for the button element
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    
    // Assign both refs to the button
    const assignRefs = (el: HTMLButtonElement) => {
      // Assign to our internal ref
      buttonRef.current = el;
      
      // Forward the ref if it's a function
      if (typeof ref === 'function') {
        ref(el);
      } 
      // Forward the ref if it's an object
      else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      }
    };
    
    return (
      <button
        ref={assignRefs}
        type="button"
        role="tab"
        aria-selected={isSelected}
        data-state={isSelected ? 'active' : 'inactive'}
        className={cn(
          'relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium',
          'transition-all duration-300 ease-out ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          isSelected
            ? 'bg-background text-foreground shadow-md translate-y-0'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50 hover:shadow-sm hover:translate-y-[-1px]',
          className
        )}
        onClick={() => onChange(value)}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {isSelected && (
          <span 
            className="absolute inset-0 rounded-lg bg-gradient-to-br from-background to-background/80 opacity-100 shadow-md transition-opacity duration-500 ease-out"
            style={{ zIndex: 0 }}
          />
        )}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount = false, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext();
    const isSelected = selectedValue === value;
    const wasSelected = React.useRef(isSelected);
    const [animating, setAnimating] = React.useState(false);
    
    React.useEffect(() => {
      if (isSelected) {
        wasSelected.current = true;
        setAnimating(true);
        const timer = setTimeout(() => setAnimating(false), 500); // Animation duration
        return () => clearTimeout(timer);
      }
    }, [isSelected]);

    if (!isSelected && !forceMount && !animating) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isSelected ? 'active' : 'inactive'}
        className={cn(
          'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'transition-all duration-500 ease-out',
          isSelected 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 absolute pointer-events-none transform translate-y-4',
          className
        )}
        {...props}
      >
        <div className={cn(
          'transform transition-all duration-500 ease-out',
          isSelected ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}>
          {children}
        </div>
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent'; 