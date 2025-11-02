import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Bot,
  Send,
  Settings,
  LogOut,
  User,
  HelpCircle,
  MessageCircle,
  ChevronLeft,
  Menu,
  ShoppingCart,
  BookOpen
} from 'lucide-react';
import { cn } from '../../lib/utils';

const AppSidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse, onLogout }) => {
  const location = useLocation();
  const { user } = useAuth();

  const mainNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sessions', href: '/sessions', icon: MessageSquare },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Bots', href: '/bots', icon: Bot },
    { name: 'Messages', href: '/messages', icon: Send },
    { name: 'WooCommerce', href: '/woocommerce', icon: ShoppingCart },
    { name: 'API Docs', href: '/api', icon: BookOpen },
  ];

  const bottomNavigation = [
    { name: 'Support', href: '/support', icon: HelpCircle },
    { name: 'Feedback', href: '/feedback', icon: MessageCircle },
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
          "fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out",
          "border-r border-border bg-card flex flex-col",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header with Logo */}
        <div className={cn(
          "flex h-16 items-center justify-between border-b border-border px-4"
        )}>
          {!isCollapsed ? (
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary p-1.5 aspect-square">
                <img 
                  src="/logo-platform.svg" 
                  alt="Streamfinitytv WhatsApp Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  Streamfinitytv WhatsApp
                </span>
                <span className="text-xs text-muted-foreground">Enterprise</span>
              </div>
            </Link>
          ) : (
            <Link to="/" className="flex items-center justify-center w-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary p-1.5 aspect-square">
                <img 
                  src="/logo-platform.svg" 
                  alt="Streamfinitytv WhatsApp Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>
          )}

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-1.5 hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              {mainNavigation.map((item) => {
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
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>

          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border">
          {/* Support/Feedback Links */}
          <div className={cn(
            "px-3 py-3 space-y-1",
            isCollapsed && "px-2"
          )}>
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
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* User Profile */}
          <div className={cn(
            "px-3 py-3",
            isCollapsed && "flex justify-center"
          )}>
            {isCollapsed ? (
              <button 
                className="flex h-10 w-10 items-center justify-center rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
                title={user?.name || user?.email || 'User'}
              >
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name || user.email} 
                    className="h-10 w-10 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm border-2 border-border">
                    {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent transition-colors cursor-pointer">
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name || user.email} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'No email'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                  className="rounded-md p-1 hover:bg-accent-foreground/10"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;

