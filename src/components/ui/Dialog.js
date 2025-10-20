import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Dialog/Modal Component - shadcn/ui style
 * Based on https://ui.shadcn.com/docs/components/dialog
 */

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {children}
      </div>
    </>
  );
};

export const DialogContent = React.forwardRef(
  ({ className, children, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-4 border border-border bg-background p-6 shadow-lg",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4",
          "rounded-lg",
          "max-h-[90vh] overflow-y-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    );
  }
);
DialogContent.displayName = "DialogContent";

export const DialogHeader = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
      />
    );
  }
);
DialogHeader.displayName = "DialogHeader";

export const DialogTitle = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
      />
    );
  }
);
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
);
DialogDescription.displayName = "DialogDescription";

export const DialogFooter = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
      />
    );
  }
);
DialogFooter.displayName = "DialogFooter";

