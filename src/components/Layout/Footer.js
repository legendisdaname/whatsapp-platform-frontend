import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, BookOpen, Mail, Shield } from 'lucide-react';
import api from '../../api/api';
import { FRONTEND_VERSION } from '../../config/version';

const Footer = ({ isCollapsed = false }) => {
  const currentYear = new Date().getFullYear();
  const [backendVersion, setBackendVersion] = useState('loading...');

  useEffect(() => {
    // Fetch backend version
    api.get('/api/version')
      .then(response => {
        if (response.data.success) {
          setBackendVersion(response.data.version);
        }
      })
      .catch(() => {
        setBackendVersion('unknown');
      });
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className={`container mx-auto px-4 sm:px-6 py-3 transition-all duration-300 ${isCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left side - Copyright */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">© {currentYear} WhatsApp Platform</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden md:flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-current animate-pulse" /> for automation
            </span>
            <span className="hidden lg:inline">•</span>
            <span className="hidden lg:inline text-xs">
              v{FRONTEND_VERSION}
            </span>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground hidden md:inline">
              API v{backendVersion}
            </span>
            <Link
              to="/api-docs"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <BookOpen className="h-3 w-3" />
              <span className="hidden sm:inline">API</span>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-3 w-3" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Link
              to="/settings"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-3 w-3" />
              <span className="hidden sm:inline">Support</span>
            </Link>
            <a
              href="https://github.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">Privacy</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

