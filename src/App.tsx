/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PortfolioData, Photo } from './types';
import { fetchPortfolio } from './api';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Gallery } from './components/Gallery';
import { Lightbox } from './components/Lightbox';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { AdminModal } from './components/AdminModal';
import { DeployGuideModal } from './components/DeployGuideModal';
import { Lock, ArrowUp, Instagram, Mail, MessageCircle, Heart } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme (default dark)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lumina_theme') as 'dark' | 'light') || 'dark';
  });

  // Admin authentication
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('lumina_admin_token') || null;
  });
  const [adminUser, setAdminUser] = useState<string | null>(() => {
    return localStorage.getItem('lumina_admin_user') || null;
  });

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string>('upload');
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);

  // Lightbox
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);

  // Load portfolio data
  const loadPortfolioData = useCallback(async () => {
    try {
      const res = await fetchPortfolio();
      setData(res);
      setError(null);

      // Check if URL has ?photo=id for direct deep-link
      const params = new URLSearchParams(window.location.search);
      const photoId = params.get('photo');
      if (photoId && res.photos) {
        const found = res.photos.find((p) => p.id === photoId);
        if (found) {
          setActivePhoto(found);
        }
      }
    } catch (err: any) {
      console.error('Error loading portfolio:', err);
      setError('Could not connect to the portfolio server. Retrying...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  // Persist theme
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('lumina_theme', next);
  };

  // Auth callbacks
  const handleLoginSuccess = (token: string, username: string) => {
    setAdminToken(token);
    setAdminUser(username);
    localStorage.setItem('lumina_admin_token', token);
    localStorage.setItem('lumina_admin_user', username);
  };

  const handleLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('lumina_admin_token');
    localStorage.removeItem('lumina_admin_user');
  };

  // Handlers to open admin to specific tabs
  const openAdminWithTab = (tab: string) => {
    setAdminInitialTab(tab);
    setIsAdminOpen(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${
        theme === 'dark' ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'
      }`}>
        <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mb-4" />
        <h2 className="font-serif text-xl tracking-[0.2em] uppercase font-light">LUMINA</h2>
        <p className="text-xs text-neutral-400 mt-2 font-mono">Curating visual archive...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-950 text-neutral-200">
        <h2 className="font-serif text-2xl mb-2 text-rose-400">Connection Error</h2>
        <p className="text-xs text-neutral-400 mb-6">{error || 'Failed to load portfolio archive.'}</p>
        <button
          onClick={() => { setLoading(true); loadPortfolioData(); }}
          className="px-6 py-2.5 rounded-full bg-amber-500 text-neutral-950 font-semibold text-xs tracking-wider uppercase hover:bg-amber-400 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-neutral-950 text-neutral-100 selection:bg-amber-500 selection:text-neutral-950' 
        : 'bg-[#fafafa] text-neutral-900 selection:bg-neutral-900 selection:text-white'
    }`}>
      {/* Top Header */}
      <Header
        artistName={data.about.name}
        artistTitle={data.about.title}
        isAdminLoggedIn={!!adminToken}
        onOpenAdmin={() => openAdminWithTab('upload')}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        photoCount={data.photos.length}
      />

      {/* Main Content Sections */}
      <main>
        {/* Hero Banner */}
        <Hero
          about={data.about}
          contact={data.contact}
          photoCount={data.photos.length}
          theme={theme}
        />

        {/* Public Photo Gallery & Category Filters */}
        <Gallery
          photos={data.photos}
          categories={data.categories}
          onSelectPhoto={(photo) => setActivePhoto(photo)}
          isAdminLoggedIn={!!adminToken}
          onEditPhoto={(photo) => openAdminWithTab('gallery')}
          theme={theme}
        />

        {/* About Me Section */}
        <AboutSection
          about={data.about}
          isAdminLoggedIn={!!adminToken}
          onEditAbout={() => openAdminWithTab('about')}
          theme={theme}
        />

        {/* Contact & Inquiries Section */}
        <ContactSection
          contact={data.contact}
          artistName={data.about.name}
          isAdminLoggedIn={!!adminToken}
          onEditContact={() => openAdminWithTab('contact')}
          theme={theme}
        />
      </main>

      {/* Lightbox Fullscreen Photo Viewer */}
      {activePhoto && (
        <Lightbox
          photo={activePhoto}
          photos={data.photos}
          onClose={() => setActivePhoto(null)}
          onSelectPhoto={(p) => setActivePhoto(p)}
        />
      )}

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        photos={data.photos}
        about={data.about}
        contact={data.contact}
        categories={data.categories}
        isLoggedIn={!!adminToken}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onDataRefresh={loadPortfolioData}
        initialTab={adminInitialTab}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
      />

      {/* Free Setup & Deployment Guide Modal */}
      <DeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

      {/* Elegant Footer */}
      <footer className={`border-t py-12 transition-colors ${
        theme === 'dark' ? 'border-neutral-800/80 bg-neutral-950 text-neutral-400' : 'border-neutral-200 bg-white text-neutral-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-serif text-lg tracking-[0.2em] font-medium uppercase text-neutral-200">
              {data.about.name}
            </span>
            <span className="text-[11px] tracking-wider mt-1 font-light">
              © {new Date().getFullYear()} All visual rights reserved. Monograph & Print editions.
            </span>
          </div>

          {/* Social / Direct Links */}
          <div className="flex items-center space-x-6 text-xs">
            {data.contact.whatsapp && (
              <a
                href={`https://wa.me/${data.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
            <a
              href={`mailto:${data.contact.email}`}
              className="hover:text-amber-400 transition-colors flex items-center space-x-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
            {data.contact.instagram && (
              <a
                href={`https://instagram.com/${data.contact.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 transition-colors flex items-center space-x-1"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
            )}
          </div>

          {/* Studio admin trigger in footer */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => openAdminWithTab('upload')}
              className="text-xs text-neutral-500 hover:text-amber-400 transition-colors flex items-center space-x-1"
            >
              <Lock className="w-3 h-3" />
              <span>Photographer Studio</span>
            </button>
            <button
              onClick={() => setIsDeployGuideOpen(true)}
              className="text-xs text-neutral-500 hover:text-neutral-300 underline underline-offset-4 transition-colors"
            >
              Deploy Free Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
