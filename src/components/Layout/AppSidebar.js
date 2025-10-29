import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Bot,
  Send,
  Settings,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  History,
  Star,
  FileText,
  HelpCircle,
  MessageCircle,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Logo from '../Logo';

const AppSidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse, onLogout }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState({
    platform: true,
    projects: false
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const mainNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sessions', href: '/sessions', icon: MessageSquare },
    { name: 'Contacts', href: '/contacts', icon: Users },
    { name: 'Bots', href: '/bots', icon: Bot },
    { name: 'Messages', href: '/messages', icon: Send },
  ];

  const platformGroup = [
    { name: 'History', href: '/history', icon: History },
    { name: 'Starred', href: '/starred', icon: Star },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const projectsGroup = [
    { name: 'Documentation', href: '/docs', icon: FileText },
    { name: 'API Reference', href: '/api', icon: FileText },
  ];

  const bottomNavigation = [
    { name: 'Support', href: '/support', icon: HelpCircle },
    { name: 'Feedback', href: '/feedback', icon: MessageCircle },
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
        {/* Header with Logo and Collapse Button */}
        <div className={cn(
          "flex h-16 items-center border-b border-border px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link to="/" className="flex items-center">
              <Logo size="default" showText={true} variant="sidebar" />
            </Link>
          )}
          
          {isCollapsed && (
            <Logo size="default" showText={false} variant="icon-only" />
          )}

          {/* Collapse button - desktop only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex rounded-md p-1.5 hover:bg-accent"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

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

            {/* Platform Group */}
            {!isCollapsed && (
              <div className="space-y-1">
                <button
                  onClick={() => toggleGroup('platform')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Platform</span>
                  {expandedGroups.platform ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {expandedGroups.platform && (
                  <div className="ml-4 space-y-1 border-l border-border pl-2">
                    {platformGroup.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => window.innerWidth < 1024 && onClose()}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Projects Group */}
            {!isCollapsed && (
              <div className="space-y-1">
                <button
                  onClick={() => toggleGroup('projects')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Projects</span>
                  {expandedGroups.projects ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {expandedGroups.projects && (
                  <div className="ml-4 space-y-1 border-l border-border pl-2">
                    {projectsGroup.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => window.innerWidth < 1024 && onClose()}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border">
          {/* Support/Feedback Links */}
          {!isCollapsed && (
            <div className="px-3 py-3 space-y-1">
              {bottomNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Profile */}
          <div className={cn(
            "px-3 py-3",
            isCollapsed && "flex justify-center"
          )}>
            {isCollapsed ? (
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <User className="h-4 w-4" />
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

