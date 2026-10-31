import React, { useState } from 'react';
import { ContactData } from '../types';
import { sendContactMessage } from '../api';
import {
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  MapPin,
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  Edit3,
} from 'lucide-react';

interface ContactSectionProps {
  contact: ContactData;
  artistName?: string;
  isAdminLoggedIn: boolean;
  onEditContact?: () => void;
  theme: 'dark' | 'light';
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contact,
  artistName,
  isAdminLoggedIn,
  onEditContact,
  theme,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Editorial Commission',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const cleanWhatsAppNumber = (contact.whatsapp || '').replace(/[^0-9]/g, '');
  const whatsAppUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    `Hello ${artistName || 'Hamanta'}, I viewed your portfolio and would like to inquire about an upcoming project.`
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('sending');
    try {
      await sendContactMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: 'Editorial Commission', message: '' });
      setTimeout(() => setStatus('idle'), 6000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to send message. Please try again or use WhatsApp.');
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 scroll-mt-20 border-t border-neutral-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
              Inquiries & Bookings
            </span>
            {isAdminLoggedIn && onEditContact && (
              <button
                onClick={onEditContact}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Contact</span>
              </button>
            )}
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight mb-4">
            Let's create something timeless.
          </h2>

          <p className={`text-base font-light leading-relaxed ${
            theme === 'dark' ? 'text-neutral-300' : 'text-neutral-600'
          }`}>
            {contact.bookingNotice || 'Currently accepting editorial commissions, private portrait monographs, and brand collaborations.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Direct Contact Cards Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* WhatsApp Direct Card */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-6 rounded-2xl border transition-all duration-300 flex items-start space-x-4 group hover:shadow-xl hover:-translate-y-0.5 ${
                theme === 'dark'
                  ? 'bg-neutral-900/60 border-neutral-800 hover:border-emerald-500/50'
                  : 'bg-white border-neutral-200 hover:border-emerald-500/50'
              }`}
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-semibold tracking-widest text-emerald-500 block mb-0.5">
                  Instant Messaging
                </span>
                <h4 className="font-medium text-base text-neutral-100 group-hover:text-emerald-400 transition-colors">
                  Chat on WhatsApp
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                  {contact.whatsapp || '+1 (555) 234-8900'}
                </p>
                <span className="inline-block mt-2 text-xs text-emerald-400 font-medium group-hover:underline">
                  Start conversation →
                </span>
              </div>
            </a>

            {/* Email Card */}
            <a
              href={`mailto:${contact.email}`}
              className={`p-6 rounded-2xl border transition-all duration-300 flex items-start space-x-4 group hover:shadow-xl hover:-translate-y-0.5 ${
                theme === 'dark'
                  ? 'bg-neutral-900/60 border-neutral-800 hover:border-amber-500/50'
                  : 'bg-white border-neutral-200 hover:border-amber-500/50'
              }`}
            >
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-semibold tracking-widest text-amber-500 block mb-0.5">
                  Direct Email
                </span>
                <h4 className="font-medium text-base text-neutral-100 group-hover:text-amber-400 transition-colors">
                  {contact.email || 'studio@lumina.photo'}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  General inquiries, press kits, and print licensing
                </p>
              </div>
            </a>

            {/* Phone Card */}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className={`p-5 rounded-2xl border transition-all duration-300 flex items-center space-x-4 group ${
                  theme === 'dark'
                    ? 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-neutral-800 text-neutral-300">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">
                    Phone / Studio Line
                  </span>
                  <span className="text-sm font-mono text-neutral-200">
                    {contact.phone}
                  </span>
                </div>
              </a>
            )}

            {/* Studio Location & Social */}
            <div className={`p-5 rounded-2xl border ${
              theme === 'dark' ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <div className="flex items-center space-x-3 text-xs text-neutral-300 mb-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{contact.location}</span>
              </div>
              {contact.instagram && (
                <div className="flex items-center space-x-3 text-xs text-neutral-400">
                  <Instagram className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>Instagram: <span className="text-neutral-200 font-mono">{contact.instagram}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* Client Inquiry Form Column */}
          <div className="lg:col-span-7">
            <div className={`p-8 rounded-2xl border ${
              theme === 'dark'
                ? 'bg-neutral-900/60 border-neutral-800'
                : 'bg-white border-neutral-200 shadow-sm'
            }`}>
              <h3 className="font-serif text-xl font-medium mb-1">
                Send an Inquiry
              </h3>
              <p className="text-xs text-neutral-400 font-light mb-6">
                Tell me about your concept, timeline, and scope. Responses typically within 24 hours.
              </p>

              {status === 'success' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-3 mb-6 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div>
                    <p className="font-semibold">Message dispatched successfully!</p>
                    <p className="font-light text-emerald-300/80 mt-0.5">Thank you for getting in touch. I will review your inquiry shortly.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-6">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Lin"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-neutral-950 border-neutral-800 focus:border-amber-500/70 text-white'
                          : 'bg-neutral-50 border-neutral-200 focus:border-neutral-800 text-black'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-neutral-950 border-neutral-800 focus:border-amber-500/70 text-white'
                          : 'bg-neutral-50 border-neutral-200 focus:border-neutral-800 text-black'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Commission / Project Type
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-neutral-950 border-neutral-800 focus:border-amber-500/70 text-white'
                        : 'bg-neutral-50 border-neutral-200 focus:border-neutral-800 text-black'
                    }`}
                  >
                    <option value="Editorial Commission">Editorial & Fashion Commission</option>
                    <option value="Architectural Photography">Architectural & Spatial Monograph</option>
                    <option value="Private Portrait Session">Private Portraiture</option>
                    <option value="Print Licensing">Fine Art Print Licensing & Purchase</option>
                    <option value="Exhibition Inquiry">Exhibition & Gallery Representation</option>
                    <option value="Other">Other Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Project Vision & Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your location, preferred dates, aesthetic direction, or client brief..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none transition-all resize-none ${
                      theme === 'dark'
                        ? 'bg-neutral-950 border-neutral-800 focus:border-amber-500/70 text-white'
                        : 'bg-neutral-50 border-neutral-200 focus:border-neutral-800 text-black'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{status === 'sending' ? 'Dispatching...' : 'Send Inquiry'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
