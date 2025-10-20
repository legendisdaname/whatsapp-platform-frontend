import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Custom Select Component - shadcn/ui style
 * Based on https://ui.shadcn.com/docs/components/select
 */

// Main Select Context
const SelectContext = React.createContext(null);

// Select Root Component
export const Select = ({ children, value, onValueChange, defaultValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  const selectRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (itemValue) => {
    setSelectedValue(itemValue);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(itemValue);
    }
  };

  return (
    <SelectContext.Provider value={{ selectedValue, isOpen, setIsOpen, handleSelect, selectRef }}>
      <div ref={selectRef} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

// Select Trigger (the button that opens the dropdown)
export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2",
        "text-sm ring-offset-background placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "hover:bg-accent transition-colors",
        isOpen && "ring-2 ring-ring ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className={cn(
        "h-4 w-4 opacity-50 transition-transform",
        isOpen && "rotate-180"
      )} />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

// Select Value (displays the selected value or placeholder)
export const SelectValue = ({ placeholder }) => {
  const { selectedValue } = React.useContext(SelectContext);
  const selectContentRef = useRef(null);

  // Find the label for the selected value
  const getSelectedLabel = () => {
    if (!selectedValue) return placeholder;
    
    // This will be set by SelectItem components
    const selectedItem = document.querySelector(`[data-select-value="${selectedValue}"]`);
    return selectedItem ? selectedItem.textContent : placeholder;
  };

  return (
    <span className={cn(!selectedValue && "text-muted-foreground")}>
      {getSelectedLabel()}
    </span>
  );
};

// Select Content (the dropdown menu)
export const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  const { isOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        position === "popper" && "top-full",
        className
      )}
      {...props}
    >
      <div className="max-h-[300px] overflow-y-auto p-1">
        {children}
      </div>
    </div>
  );
});
SelectContent.displayName = "SelectContent";

// Select Group (for grouping items)
export const SelectGroup = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("py-1", className)} {...props}>
      {children}
    </div>
  );
});
SelectGroup.displayName = "SelectGroup";

// Select Label (for group labels)
export const SelectLabel = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    />
  );
});
SelectLabel.displayName = "SelectLabel";

// Select Item (individual option)
export const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { selectedValue, handleSelect } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      data-select-value={value}
      onClick={() => handleSelect(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent",
        "transition-colors",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

// Select Separator
export const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
});
SelectSeparator.displayName = "SelectSeparator";
