import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Input Component - shadcn/ui style
 */
export const Input = React.forwardRef(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2",
            icon && "pl-10",
            "text-sm text-foreground ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all hover:border-primary/30",
            "dark:file:text-foreground",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

