import React, { useState } from 'react';
import { X, BookOpen, ExternalLink, Copy, Check, Server, Database, Cloud, Terminal, CheckCircle2 } from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'vercel' | 'render' | 'storage' | 'architecture'>('vercel');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-white font-medium">Free Setup & Deployment Guide</h2>
              <p className="text-xs text-neutral-400">Step-by-step instructions to publish your portfolio online for free</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="px-6 border-b border-neutral-800 bg-neutral-950/40 flex items-center space-x-1 shrink-0 overflow-x-auto scrollbar-none">
          {[
            { id: 'vercel', label: '1. Vercel & Netlify (Free)', icon: Cloud },
            { id: 'render', label: '2. Render / Railway Full-Stack', icon: Server },
            { id: 'storage', label: '3. Database & File Storage', icon: Database },
            { id: 'architecture', label: '4. Local Code & Structure', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 border-b-2 text-xs font-medium tracking-wide flex items-center space-x-2 transition-all whitespace-nowrap ${
                  active
                    ? 'border-amber-500 text-white font-semibold'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm">
          {/* TAB 1: VERCEL / NETLIFY */}
          {activeTab === 'vercel' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-neutral-200 text-xs">
                <span className="font-semibold text-amber-400">Quickest Path: </span>
                Vercel and Netlify offer 100% free hosting for your frontend with global CDN, custom domain support, and automatic SSL certificates.
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">1</span>
                  <span>Push your code to GitHub</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Initialize git and push your repository to your free personal GitHub account:
                </p>
                <div className="relative p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300">
                  <pre className="overflow-x-auto">
{`git init
git add .
git commit -m "Initial Lumina portfolio release"
git remote add origin https://github.com/your-username/my-portfolio.git
git push -u origin main`}
                  </pre>
                  <button
                    onClick={() => copyCode(`git init\ngit add .\ngit commit -m "Initial Lumina portfolio release"\ngit remote add origin https://github.com/your-username/my-portfolio.git\ngit push -u origin main`, 'git')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                  >
                    {copiedSection === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">2</span>
                  <span>Deploy to Vercel (Free)</span>
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300 pl-2">
                  <li>Go to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">vercel.com</a> and sign in with GitHub.</li>
                  <li>Click <b>"Add New..."</b> &gt; <b>"Project"</b> and select your <code>my-portfolio</code> repository.</li>
                  <li>Framework Preset: <b>Vite</b> (automatically detected).</li>
                  <li>Build Command: <code>npm run build</code></li>
                  <li>Output Directory: <code>dist</code></li>
                  <li>Click <b>"Deploy"</b>. Your portfolio goes live in 45 seconds at <code>https://your-portfolio.vercel.app</code>!</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-lg font-medium text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-800 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">3</span>
                  <span>Connect a Custom Domain (Optional)</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  In Vercel Settings &gt; Domains, you can add your domain (e.g. <code>www.elenavance.photo</code>). Vercel provides free automatic SSL HTTPS certificates.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: RENDER / RAILWAY FULLSTACK */}
          {activeTab === 'render' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-neutral-200 text-xs">
                <span className="font-semibold text-blue-400">Full-Stack Hosting: </span>
                If you want the Node.js Express backend and uploaded photo files to run on a live cloud server, use <b>Render</b> or <b>Railway</b> free tiers.
              </div>

              <div className="space-y-3">
                <h4 className="font-serif text-base text-white font-medium">Deploy on Render (Free Tier)</h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300 pl-2">
                  <li>Visit <a href="https://render.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">render.com</a> and sign in.</li>
                  <li>Click <b>"New Web Service"</b> and connect your GitHub repo.</li>
                  <li>Runtime: <b>Node</b></li>
                  <li>Build Command: <code>npm install && npm run build</code></li>
                  <li>Start Command: <code>npm run start</code></li>
                  <li>Instance Type: <b>Free</b></li>
                  <li>Add Disk (Optional): To persist uploads across restarts on Render, attach a free/low-cost disk mounted at <code>/data</code>, or use Supabase/Cloudinary for zero-maintenance image storage.</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif text-base text-white font-medium">Deploy on Railway</h4>
                <p className="text-xs text-neutral-300">
                  Railway automatically detects the <code>package.json</code> and starts the application using <code>npm start</code> on port 3000.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE & DATABASE */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-serif text-base text-white font-medium flex items-center space-x-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>How Current Storage Works</span>
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Your portfolio is currently backed by a persistent file database in <code>/data/portfolio.json</code> and photo uploads in <code>/data/uploads/</code>. All changes made in the Admin Studio (new uploads, deletions, reorders, about info, contacts, and inquiries) are permanently saved on disk immediately.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif text-base text-white font-medium flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span>Connecting Free Cloud Storage (Supabase or Cloudinary)</span>
                </h4>
                <p className="text-xs text-neutral-400">
                  For high-volume production portfolios with thousands of client photos, we recommend either of these two free tier providers:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                    <h5 className="font-semibold text-xs text-emerald-400 mb-1">Option 1: Supabase (Free)</h5>
                    <p className="text-xs text-neutral-400 mb-3">
                      Generous free tier including 1GB file storage, 500MB PostgreSQL database, and global CDN delivery.
                    </p>
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:underline"
                    >
                      <span>supabase.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                    <h5 className="font-semibold text-xs text-amber-400 mb-1">Option 2: Cloudinary (Free)</h5>
                    <p className="text-xs text-neutral-400 mb-3">
                      Specialized for photography. Automatically creates responsive thumbnails, WebP/AVIF formats, and watermarks for free.
                    </p>
                    <a
                      href="https://cloudinary.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:underline"
                    >
                      <span>cloudinary.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-serif text-base text-white font-medium">Backup & Portability</h4>
                <p className="text-xs text-neutral-300">
                  You can at any time click <b>"Download JSON Backup"</b> in your Studio Admin Panel. This exports all your photographs, tags, captions, About section, and contacts as a clean JSON file that you can restore anywhere with a single click.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h4 className="font-serif text-base text-white font-medium">Project Architecture</h4>
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-1">
                <div>├── server.ts             # Express full-stack API + static file server</div>
                <div>├── data/                 # Persistent storage directory</div>
                <div>│   ├── portfolio.json    # JSON database (photos, about, contact, inquiries)</div>
                <div>│   └── uploads/          # Saved high-res client photos</div>
                <div>├── src/</div>
                <div>│   ├── App.tsx           # Main application entry point</div>
                <div>│   ├── api.ts            # Client API caller functions</div>
                <div>│   ├── types.ts          # TypeScript schemas</div>
                <div>│   └── components/</div>
                <div>│       ├── Header.tsx    # Responsive header & theme toggle</div>
                <div>│       ├── Hero.tsx      # Editorial banner & career metrics</div>
                <div>│       ├── Gallery.tsx   # Masonry/Grid gallery with category filters</div>
                <div>│       ├── Lightbox.tsx  # Fullscreen image viewer & WhatsApp share</div>
                <div>│       ├── AboutSection  # Artist bio, portrait & awards</div>
                <div>│       ├── ContactSection# WhatsApp chat link & inquiry form</div>
                <div>│       └── AdminModal.tsx# Password-protected studio management</div>
              </div>

              <div className="pt-2 text-xs text-neutral-400">
                Designed to run anywhere with standard Node.js & React 19. No vendor lock-in.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-400">Lumina Portfolio Engine v1.0</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Got it, Back to Gallery
          </button>
        </div>
      </div>
    </div>
  );
};
