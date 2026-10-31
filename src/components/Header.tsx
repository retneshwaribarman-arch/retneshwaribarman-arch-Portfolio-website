import React, { useState } from 'react';
import { Lock, Unlock, Moon, Sun, Share2, Check, BookOpen } from 'lucide-react';

interface HeaderProps {
  artistName: string;
  artistTitle: string;
  isAdminLoggedIn: boolean;
  onOpenAdmin: () => void;
  onOpenDeployGuide: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  photoCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  artistName,
  artistTitle,
  isAdminLoggedIn,
  onOpenAdmin,
  onOpenDeployGuide,
  theme,
  onToggleTheme,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-neutral-950/85 border-neutral-800/80 text-neutral-100' 
        : 'bg-white/85 border-neutral-200/80 text-neutral-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <a href="#gallery" className="group flex flex-col items-start cursor-pointer">
          <span className="font-serif text-2xl tracking-[0.2em] font-medium uppercase group-hover:opacity-80 transition-opacity">
            {artistName || 'LUMINA'}
          </span>
          <span className={`text-[10px] tracking-[0.3em] uppercase font-light -mt-0.5 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
          }`}>
            {artistTitle || 'Fine Art & Editorial'}
          </span>
        </a>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-medium tracking-[0.2em] uppercase">
          <a 
            href="#gallery" 
            className={`transition-colors hover:text-amber-500 ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}
          >
            Works
          </a>
          <a 
            href="#about" 
            className={`transition-colors hover:text-amber-500 ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}
          >
            About
          </a>
          <a 
            href="#contact" 
            className={`transition-colors hover:text-amber-500 ${theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'}`}
          >
            Contact
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Share button */}
          <button
            onClick={handleShare}
            title="Copy shareable portfolio link"
            className={`p-2.5 rounded-full border transition-all flex items-center justify-center ${
              theme === 'dark'
                ? 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/50 text-neutral-300 hover:text-white'
                : 'border-neutral-200 hover:border-neutral-400 bg-neutral-100 text-neutral-700 hover:text-black'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Setup & Deployment Guide Button */}
          <button
            onClick={onOpenDeployGuide}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              theme === 'dark'
                ? 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/60 text-neutral-300 hover:text-white'
                : 'border-neutral-200 hover:border-neutral-400 bg-neutral-100 text-neutral-700 hover:text-black'
            }`}
            title="Setup & Free Hosting Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="tracking-wider">Deploy Free</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light gallery' : 'Switch to darkroom view'}
            className={`p-2.5 rounded-full border transition-all ${
              theme === 'dark'
                ? 'border-neutral-800 hover:border-neutral-600 bg-neutral-900/50 text-neutral-300 hover:text-white'
                : 'border-neutral-200 hover:border-neutral-400 bg-neutral-100 text-neutral-700 hover:text-black'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>

          {/* Admin Studio Button */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-medium tracking-wider uppercase transition-all shadow-sm ${
              isAdminLoggedIn
                ? 'border-emerald-600/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : theme === 'dark'
                  ? 'border-neutral-700 hover:border-neutral-500 bg-neutral-800/80 text-neutral-200 hover:text-white'
                  : 'border-neutral-300 hover:border-neutral-400 bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            {isAdminLoggedIn ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Studio Admin</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Login</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
