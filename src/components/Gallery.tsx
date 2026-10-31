import React, { useState, useMemo } from 'react';
import { Photo } from '../types';
import { Search, Eye, Maximize2, Tag, Camera, Share2, Check, Edit3, Grid3X3, Columns, Sparkles } from 'lucide-react';

interface GalleryProps {
  photos: Photo[];
  categories: string[];
  onSelectPhoto: (photo: Photo) => void;
  isAdminLoggedIn: boolean;
  onEditPhoto?: (photo: Photo) => void;
  theme: 'dark' | 'light';
}

export const Gallery: React.FC<GalleryProps> = ({
  photos,
  categories,
  onSelectPhoto,
  isAdminLoggedIn,
  onEditPhoto,
  theme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [layoutStyle, setLayoutStyle] = useState<'masonry' | 'grid'>('masonry');

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: photos.length };
    photos.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchCategory =
        selectedCategory === 'All' || photo.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = photo.title?.toLowerCase().includes(q);
      const inDesc = photo.description?.toLowerCase().includes(q);
      const inCategory = photo.category?.toLowerCase().includes(q);
      const inTags = photo.tags?.some((t) => t.toLowerCase().includes(q));
      const inClient = photo.client?.toLowerCase().includes(q);

      return inTitle || inDesc || inCategory || inTags || inClient;
    });
  }, [photos, selectedCategory, searchQuery]);

  const handleCopyLink = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set('photo', photo.id);
    navigator.clipboard.writeText(url.toString());
    setCopiedId(photo.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="gallery" className="py-8 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls Bar: Category Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-800/40">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                      : theme === 'dark'
                        ? 'bg-neutral-900/70 text-neutral-400 hover:text-white hover:bg-neutral-800'
                        : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected 
                      ? 'bg-neutral-950/20 text-neutral-950' 
                      : theme === 'dark' ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Layout Toggles */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                theme === 'dark' ? 'text-neutral-500' : 'text-neutral-400'
              }`} />
              <input
                type="text"
                placeholder="Search works, tags, lens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-full text-xs transition-all border outline-none ${
                  theme === 'dark'
                    ? 'bg-neutral-900/60 border-neutral-800 focus:border-neutral-600 text-neutral-200 placeholder:text-neutral-500'
                    : 'bg-neutral-50 border-neutral-200 focus:border-neutral-400 text-neutral-900 placeholder:text-neutral-400'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Layout switch */}
            <div className={`flex items-center p-0.5 rounded-full border ${
              theme === 'dark' ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-neutral-100'
            }`}>
              <button
                onClick={() => setLayoutStyle('masonry')}
                title="Masonry Gallery"
                className={`p-1.5 rounded-full transition-all ${
                  layoutStyle === 'masonry'
                    ? theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayoutStyle('grid')}
                title="Uniform Grid"
                className={`p-1.5 rounded-full transition-all ${
                  layoutStyle === 'grid'
                    ? theme === 'dark' ? 'bg-neutral-800 text-white' : 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Results Count */}
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-6 font-mono">
          <span>Showing {filteredPhotos.length} of {photos.length} photographs</span>
          {searchQuery && <span>Filtered by "{searchQuery}"</span>}
        </div>

        {/* Empty state */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-24 border border-dashed border-neutral-800 rounded-2xl">
            <p className="text-sm text-neutral-400 font-light mb-2">No photographs found in this filter.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="text-xs text-amber-500 underline underline-offset-4 hover:text-amber-400"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Masonry Layout */}
        {layoutStyle === 'masonry' ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onSelect={() => onSelectPhoto(photo)}
                onCopyLink={(e) => handleCopyLink(e, photo)}
                isCopied={copiedId === photo.id}
                isAdminLoggedIn={isAdminLoggedIn}
                onEditPhoto={onEditPhoto}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          /* Uniform Grid Layout */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onSelect={() => onSelectPhoto(photo)}
                onCopyLink={(e) => handleCopyLink(e, photo)}
                isCopied={copiedId === photo.id}
                isAdminLoggedIn={isAdminLoggedIn}
                onEditPhoto={onEditPhoto}
                theme={theme}
                isGridSquare
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

interface PhotoCardProps {
  photo: Photo;
  onSelect: () => void;
  onCopyLink: (e: React.MouseEvent) => void;
  isCopied: boolean;
  isAdminLoggedIn: boolean;
  onEditPhoto?: (photo: Photo) => void;
  theme: 'dark' | 'light';
  isGridSquare?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onSelect,
  onCopyLink,
  isCopied,
  isAdminLoggedIn,
  onEditPhoto,
  theme,
  isGridSquare,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl cursor-pointer break-inside-avoid border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        theme === 'dark' 
          ? 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700' 
          : 'bg-white border-neutral-200/80 hover:border-neutral-400'
      }`}
    >
      {/* Featured Badge */}
      {photo.featured && (
        <div className="absolute top-3 left-3 z-20 flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold tracking-wider bg-neutral-950/70 text-amber-400 backdrop-blur-md border border-amber-500/30">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span>Featured</span>
        </div>
      )}

      {/* Admin quick edit button */}
      {isAdminLoggedIn && onEditPhoto && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditPhoto(photo);
          }}
          title="Edit photo in Studio"
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-neutral-950/80 text-neutral-200 hover:text-white backdrop-blur-md border border-neutral-700/80 hover:scale-105 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
        </button>
      )}

      {/* Image container */}
      <div className={`relative w-full overflow-hidden ${
        isGridSquare 
          ? 'aspect-square' 
          : photo.aspectRatio === 'portrait' 
            ? 'aspect-[4/5]' 
            : photo.aspectRatio === 'landscape' 
              ? 'aspect-[16/10]' 
              : 'aspect-square'
      } bg-neutral-900`}>
        {/* Skeleton placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-neutral-800/60 animate-pulse flex items-center justify-center">
            <span className="text-xs text-neutral-500 font-mono tracking-widest uppercase">Lumina</span>
          </div>
        )}

        <img
          src={photo.thumbnailUrl || photo.url}
          alt={photo.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Hover Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {/* Category */}
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold mb-1 block">
              {photo.category}
            </span>

            {/* Title */}
            <h3 className="font-serif text-lg text-white font-medium mb-1">
              {photo.title}
            </h3>

            {/* Tags */}
            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {photo.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-200 backdrop-blur-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom tools row */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-neutral-300">
              <div className="flex items-center space-x-1">
                <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[11px] tracking-wider uppercase font-medium">View full size</span>
              </div>

              <button
                onClick={onCopyLink}
                title="Copy direct link to this photo"
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-neutral-300 hover:text-white"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer (Clean editorial caption below image) */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h4 className="font-serif text-sm font-medium tracking-wide truncate max-w-[200px]">
            {photo.title}
          </h4>
          <p className="text-[11px] text-neutral-400 font-light truncate max-w-[200px]">
            {photo.category} {photo.date ? `• ${photo.date.substring(0, 4)}` : ''}
          </p>
        </div>

        {photo.camera && (
          <div className="hidden sm:flex items-center space-x-1 text-[11px] text-neutral-500 font-mono">
            <Camera className="w-3 h-3 text-neutral-400" />
            <span className="truncate max-w-[100px]">{photo.camera}</span>
          </div>
        )}
      </div>
    </div>
  );
};
