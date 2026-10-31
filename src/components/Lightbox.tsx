import React, { useState, useEffect, useCallback } from 'react';
import { Photo } from '../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Share2,
  Check,
  Download,
  Camera,
  Calendar,
  User,
  ZoomIn,
  ZoomOut,
  Maximize,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface LightboxProps {
  photo: Photo | null;
  photos: Photo[];
  onClose: () => void;
  onSelectPhoto: (photo: Photo) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  photo,
  photos,
  onClose,
  onSelectPhoto,
}) => {
  const [showInfo, setShowInfo] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find index of current photo
  const currentIndex = photos.findIndex((p) => p.id === photo?.id);
  const total = photos.length;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onSelectPhoto(photos[currentIndex - 1]);
      setIsZoomed(false);
    } else if (total > 0) {
      // Loop around
      onSelectPhoto(photos[total - 1]);
      setIsZoomed(false);
    }
  }, [currentIndex, photos, total, onSelectPhoto]);

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      onSelectPhoto(photos[currentIndex + 1]);
      setIsZoomed(false);
    } else if (total > 0) {
      // Loop around
      onSelectPhoto(photos[0]);
      setIsZoomed(false);
    }
  }, [currentIndex, photos, total, onSelectPhoto]);

  // Keyboard navigation
  useEffect(() => {
    if (!photo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'i' || e.key === 'I') {
        setShowInfo((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, handlePrev, handleNext, onClose]);

  // Update URL search param for deep linking
  useEffect(() => {
    if (photo) {
      const url = new URL(window.location.href);
      url.searchParams.set('photo', photo.id);
      window.history.replaceState({}, '', url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('photo');
      window.history.replaceState({}, '', url.toString());
    }
  }, [photo]);

  if (!photo) return null;

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('photo', photo.id);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const shareUrl = window.location.href;
    const text = encodeURIComponent(`Take a look at "${photo.title}" by Lumina: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl flex flex-col select-none animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-neutral-900 bg-neutral-950/80 z-20">
        <div className="flex items-center space-x-4">
          <span className="font-serif text-sm tracking-widest text-neutral-400 uppercase">
            {currentIndex + 1} <span className="text-neutral-600">/</span> {total}
          </span>
          <span className="hidden sm:inline-block h-3 w-[1px] bg-neutral-800" />
          <h2 className="hidden sm:block font-serif text-sm text-neutral-200 tracking-wide truncate max-w-sm">
            {photo.title}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            title={isZoomed ? 'Fit to screen' : 'Zoom 100%'}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>

          {/* Toggle Info drawer */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            title="Toggle Details"
            className={`p-2 rounded-full transition-colors ${
              showInfo ? 'text-amber-400 bg-neutral-900' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Share on WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            title="Share on WhatsApp"
            className="p-2 rounded-full text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          {/* Copy Direct Link */}
          <button
            onClick={handleCopyLink}
            title="Copy share link"
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Open full raw in new tab */}
          <a
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open high-resolution file"
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Close button */}
          <button
            onClick={onClose}
            title="Close Lightbox (Esc)"
            className="p-2 ml-2 rounded-full bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Navigation Arrow: Previous */}
        <button
          onClick={handlePrev}
          title="Previous photo (Left Arrow)"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800/80 transition-all backdrop-blur-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Navigation Arrow: Next */}
        <button
          onClick={handleNext}
          title="Next photo (Right Arrow)"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800/80 transition-all backdrop-blur-md"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Image Display */}
        <div
          className={`w-full h-full p-4 sm:p-8 flex items-center justify-center overflow-auto cursor-${
            isZoomed ? 'zoom-out' : 'zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={photo.url}
            alt={photo.title}
            className={`transition-all duration-300 rounded-sm shadow-2xl ${
              isZoomed
                ? 'max-w-none w-auto h-auto scale-125 my-auto'
                : 'max-w-full max-h-full object-contain'
            }`}
          />
        </div>

        {/* Photo Info Slide-out Panel */}
        {showInfo && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-88 max-h-[70vh] overflow-y-auto bg-neutral-950/90 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md z-30 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                  {photo.category}
                </span>
                <h3 className="font-serif text-xl font-medium text-white mt-0.5">
                  {photo.title}
                </h3>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {photo.description && (
              <p className="text-xs text-neutral-300 leading-relaxed font-light mb-4">
                {photo.description}
              </p>
            )}

            {/* Tags */}
            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {photo.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-neutral-800/80 text-neutral-300 border border-neutral-700/50"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Technical EXIF Meta List */}
            <div className="space-y-2 pt-3 border-t border-neutral-800/80 text-xs">
              {photo.camera && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Camera</span>
                  </span>
                  <span className="font-mono text-neutral-200">{photo.camera}</span>
                </div>
              )}

              {photo.lens && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-neutral-500">Lens</span>
                  <span className="font-mono text-neutral-200">{photo.lens}</span>
                </div>
              )}

              {photo.date && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Captured</span>
                  </span>
                  <span className="font-mono text-neutral-200">{photo.date}</span>
                </div>
              )}

              {photo.client && (
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Client</span>
                  </span>
                  <span className="text-neutral-200">{photo.client}</span>
                </div>
              )}
            </div>

            {/* Direct Share Button in Panel */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-200 flex items-center justify-center space-x-2 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-xs font-medium text-emerald-300 flex items-center justify-center space-x-1 transition-colors"
                title="Send via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom helper tip */}
      <div className="h-10 px-6 hidden sm:flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-900 bg-neutral-950/80">
        <div className="flex items-center space-x-4">
          <span>Use <b>←</b> and <b>→</b> arrow keys to browse</span>
          <span>•</span>
          <span>Press <b>i</b> to toggle photo info</span>
          <span>•</span>
          <span>Press <b>Esc</b> to return to gallery</span>
        </div>
        <span className="font-mono">{photo.id}</span>
      </div>
    </div>
  );
};
