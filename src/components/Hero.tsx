import React from 'react';
import { ArrowDown, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { AboutData, ContactData } from '../types';

interface HeroProps {
  about: AboutData;
  contact: ContactData;
  photoCount: number;
  theme: 'dark' | 'light';
}

export const Hero: React.FC<HeroProps> = ({ about, contact, photoCount, theme }) => {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Subtle background ambient light */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 blur-3xl pointer-events-none opacity-20 ${
        theme === 'dark' ? 'bg-amber-500/10' : 'bg-neutral-300/40'
      }`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          {/* Availability pill & location */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{contact.availability || 'Available for commissions'}</span>
            </span>

            <span className={`inline-flex items-center space-x-1.5 text-xs font-light tracking-wide ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              <MapPin className="w-3.5 h-3.5" />
              <span>{about.location || 'Worldwide'}</span>
            </span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.08] mb-6">
            Capturing the stillness <br className="hidden sm:inline" />
            <span className="italic font-light opacity-90">between moments.</span>
          </h1>

          {/* Philosophy / Statement */}
          <p className={`text-base sm:text-lg leading-relaxed font-light mb-8 max-w-2xl ${
            theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'
          }`}>
            {about.philosophy || 'Visual stories exploring light, architectural form, and human intimacy.'}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-dashed border-neutral-800/40">
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-medium">{photoCount}</div>
              <div className={`text-[11px] uppercase tracking-widest font-medium ${
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                Archived Works
              </div>
            </div>

            <div>
              <div className="font-serif text-2xl sm:text-3xl font-medium">{about.yearsExperience}+</div>
              <div className={`text-[11px] uppercase tracking-widest font-medium ${
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                Years Practice
              </div>
            </div>

            <div>
              <div className="font-serif text-2xl sm:text-3xl font-medium">{about.exhibitionsCount}</div>
              <div className={`text-[11px] uppercase tracking-widest font-medium ${
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                Exhibitions
              </div>
            </div>

            <div>
              <div className="font-serif text-2xl sm:text-3xl font-medium">{about.awardsCount}</div>
              <div className={`text-[11px] uppercase tracking-widest font-medium ${
                theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                Awards
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
