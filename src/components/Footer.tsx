import React from 'react';
import { Shield, Github, HelpCircle, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-card-border bg-card-bg/50 backdrop-blur-sm mt-auto">
      <div className="container-responsive py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <Shield className="w-7 h-7 text-accent-1 group-hover:text-accent-1/80 transition-colors duration-300" />
                <div className="absolute inset-0 bg-accent-1 opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-bold text-text-primary group-hover:text-accent-1 transition-colors duration-300">MorphDetect</span>
            </div>
            <p className="text-text-muted text-sm lg:text-base leading-relaxed max-w-xs">
              Advanced single-image morphing attack detection powered by deep learning and explainable AI.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary text-lg mb-4">Product</h3>
            <ul className="space-y-3 text-sm lg:text-base text-text-muted">
              {[
                { label: 'Features', href: '#' },
                { label: 'Documentation', href: '#' },
                { label: 'API Reference', href: '#' },
                { label: 'Changelog', href: '#' }
              ].map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href} 
                    className="group flex items-center space-x-2 hover:text-accent-1 transition-all duration-300 hover:translate-x-1"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary text-lg mb-4">Resources</h3>
            <ul className="space-y-3 text-sm lg:text-base text-text-muted">
              {[
                { label: 'Research Papers', href: '#' },
                { label: 'Best Practices', href: '#' },
                { label: 'Case Studies', href: '#' },
                { label: 'Community', href: '#' }
              ].map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href} 
                    className="group flex items-center space-x-2 hover:text-accent-1 transition-all duration-300 hover:translate-x-1"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary text-lg mb-4">Support</h3>
            <div className="space-y-3">
              {[
                { icon: HelpCircle, label: 'Help Center', href: '#' },
                { icon: Github, label: 'GitHub', href: '#' }
              ].map((item, index) => (
                <a 
                  key={index}
                  href={item.href} 
                  className="group flex items-center space-x-3 text-sm lg:text-base text-text-muted hover:text-accent-1 transition-all duration-300 hover:translate-x-1"
                >
                  <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-card-border flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
          <p className="text-text-dim text-sm lg:text-base text-center lg:text-left">
            © 2025 MorphDetect. All rights reserved. Built for security professionals.
          </p>
          <div className="flex items-center space-x-6 text-sm lg:text-base">
            <a 
              href="#" 
              className="text-text-dim hover:text-accent-1 transition-all duration-300 hover:scale-105"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-text-dim hover:text-accent-1 transition-all duration-300 hover:scale-105"
            >
              Terms of Service
            </a>
            <span className="text-text-dim px-3 py-1 bg-white/5 rounded-lg border border-card-border">
              v2.1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};