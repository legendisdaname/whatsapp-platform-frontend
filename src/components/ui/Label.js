import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Label Component - shadcn/ui style
 * Based on: https://ui.shadcn.com/docs/components/label
 */
export const Label = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

