import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Textarea Component - shadcn/ui style with dark mode support
 */
export const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2",
          "text-sm text-foreground ring-offset-background",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all hover:border-primary/30",
          "resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

