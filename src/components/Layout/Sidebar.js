import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Bot,
  Send,
  Settings,
  LogOut,
  ChevronLeft,
  BookOpen,
  ShoppingCart
} from 'lucide-react';
import { cn } from '../../lib/utils';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Accounts', href: '/sessions', icon: MessageSquare },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Bots', href: '/bots', icon: Bot },
    { name: 'Messages', href: '/messages', icon: Send },
    { name: 'WooCommerce', href: '/woocommerce', icon: ShoppingCart },
    { name: 'API Docs', href: '/api-docs', icon: BookOpen },
  ];

  const bottomNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 transition-transform duration-300 ease-in-out lg:translate-x-0",
          "border-r border-border bg-card",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              WhatsApp Platform
            </span>
          </Link>
          
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-1 hover:bg-accent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col h-[calc(100vh-4rem)] px-3 py-4">
          <div className="flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-border pt-4 space-y-1">
            {bottomNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            <button
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

