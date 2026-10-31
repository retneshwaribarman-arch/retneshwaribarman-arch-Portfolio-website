import React from 'react';
import { AboutData } from '../types';
import { Award, Camera, Calendar, MapPin, Edit3 } from 'lucide-react';

interface AboutSectionProps {
  about: AboutData;
  isAdminLoggedIn: boolean;
  onEditAbout?: () => void;
  theme: 'dark' | 'light';
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  about,
  isAdminLoggedIn,
  onEditAbout,
  theme,
}) => {
  return (
    <section id="about" className="py-20 md:py-28 scroll-mt-20 border-t border-neutral-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Portrait Photo Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Background aesthetic offset border */}
              <div className={`absolute -inset-2.5 rounded-2xl border ${
                theme === 'dark' ? 'border-neutral-800/80 bg-neutral-900/30' : 'border-neutral-200 bg-neutral-100'
              } -rotate-1`} />

              <div className="relative rounded-xl overflow-hidden aspect-[4/5] shadow-2xl bg-neutral-900">
                <img
                  src={about.portraitUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80'}
                  alt={about.name}
                  className="w-full h-full object-cover filter contrast-[1.03]"
                />
              </div>

              {/* Float location tag */}
              <div className="absolute -bottom-4 right-4 sm:-right-4 px-4 py-2 rounded-xl backdrop-blur-md bg-neutral-950/90 border border-neutral-800 text-xs text-neutral-200 flex items-center space-x-2 shadow-xl">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{about.location}</span>
              </div>
            </div>
          </div>

          {/* Text & Biography Column */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
                About The Artist
              </span>
              {isAdminLoggedIn && onEditAbout && (
                <button
                  onClick={onEditAbout}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit About</span>
                </button>
              )}
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight mb-2">
              {about.name}
            </h2>

            <p className={`text-base font-light italic mb-6 ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              {about.title}
            </p>

            {/* Bio paragraphs */}
            <div className={`space-y-4 text-sm sm:text-base leading-relaxed font-light mb-8 ${
              theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'
            }`}>
              {about.bio && about.bio.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Philosophy quote */}
            {about.philosophy && (
              <blockquote className={`pl-4 border-l-2 border-amber-500 italic text-sm mb-8 ${
                theme === 'dark' ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                "{about.philosophy}"
              </blockquote>
            )}

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/40 mb-8">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-medium text-amber-400">
                  {about.yearsExperience}+
                </div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 mt-0.5">
                  Years of Vision
                </div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-medium text-amber-400">
                  {about.exhibitionsCount}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 mt-0.5">
                  Solo & Group Shows
                </div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-medium text-amber-400">
                  {about.awardsCount}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 mt-0.5">
                  Juried Awards
                </div>
              </div>
            </div>

            {/* Clients and Publications */}
            {about.clients && about.clients.length > 0 && (
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 block mb-3 font-medium">
                  Select Publications & Commissions
                </span>
                <div className="flex flex-wrap gap-2">
                  {about.clients.map((client, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-3 py-1.5 rounded-full border ${
                        theme === 'dark'
                          ? 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                      }`}
                    >
                      {client}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
