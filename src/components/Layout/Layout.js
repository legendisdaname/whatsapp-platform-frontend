import React, { useState } from 'react';
import AppSidebar from './AppSidebar';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={onLogout}
      />

      {/* Main content area */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          isSidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Page content with padding for fixed footer */}
        <main className="pb-16">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>

        {/* Fixed Footer */}
        <Footer isCollapsed={sidebarCollapsed} />
      </div>
    </div>
  );
};

export default Layout;

