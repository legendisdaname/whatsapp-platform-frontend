import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, X, Sun, Moon, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

const Header = ({ onMenuClick, isSidebarCollapsed, onToggleSidebar }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchOpen && searchInputRef.current && !searchInputRef.current.closest('.search-container').contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden rounded-md p-2 hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar toggle button */}
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex rounded-md p-2 hover:bg-accent transition-colors"
          title={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      )}

      {/* Logo/Title */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary p-1.5 aspect-square hidden md:flex">
          <img 
            src="/logo-platform.svg" 
            alt="Streamfinitytv WhatsApp Logo" 
            className="h-full w-full object-contain"
          />
        </div>
        <h2 className="text-lg font-semibold hidden md:block">Streamfinitytv WhatsApp</h2>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className={cn(
            "rounded-lg p-2 hover:bg-accent",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "transition-all"
          )}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>

        {/* Search - Expandable */}
        <div className="search-container relative">
          {!searchOpen ? (
            // Search Icon Button
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                "rounded-lg p-2 hover:bg-accent",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            >
              <Search className="h-5 w-5" />
            </button>
          ) : (
            // Expanded Search Bar
            <div className="flex items-center gap-2 animate-in slide-in-from-right duration-200">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search..."
                  className={cn(
                    "w-64 sm:w-80 rounded-lg border border-input bg-background pl-9 pr-9 py-2",
                    "text-sm placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchOpen(false);
                    }
                  }}
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-accent"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          className={cn(
            "relative rounded-lg p-2 hover:bg-accent",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;

