import React, { useState } from 'react';
import { MediaItem, MediaType, AgeGroup, SupportedLanguage } from '../types';
import { Play, Headphones, Music, Star, Search, X, Volume2, Sparkles, Heart } from 'lucide-react';
import { soundFx, speakText } from '../utils/soundAndTTS';
import { getTranslation } from '../data/translations';

interface MediaLibraryProps {
  mediaList: MediaItem[];
  userAgeGroup: AgeGroup;
  favoriteIds: string[];
  onToggleFavorite: (mediaId: string) => void;
  onRecordMediaWatch: (durationMinutes: number) => void;
  currentLanguage?: SupportedLanguage;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  mediaList,
  userAgeGroup,
  favoriteIds,
  onToggleFavorite,
  onRecordMediaWatch,
  currentLanguage = 'en',
}) => {
  const t = (key: string, fallback: string) => getTranslation(currentLanguage, key, fallback);
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  const filteredList = mediaList.filter((item) => {
    // Only show approved or default media items in public search and library
    const isApproved = item.status === 'approved' || !item.status;
    if (!isApproved) return false;

    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesAge = selectedAge === 'all' || item.targetAgeGroup.includes(selectedAge);
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesAge && matchesSearch;
  });

  const handleMediaClick = (item: MediaItem) => {
    soundFx.playPop();
    speakText(`Opening ${item.title}`);
    setActiveMedia(item);
    onRecordMediaWatch(5); // Record 5 minutes media watch engagement
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Top Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border-2 border-amber-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-amber-500" />
            <input
              type="text"
              placeholder="Search videos, stories & rhymes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-amber-50/60 border-2 border-amber-200 rounded-full pl-9 pr-4 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Type Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => {
                soundFx.playPop();
                setSelectedType('all');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedType === 'all' ? 'bg-amber-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Media
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setSelectedType('video');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedType === 'video' ? 'bg-rose-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Videos</span>
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setSelectedType('audiobook');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedType === 'audiobook' ? 'bg-indigo-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Audiobooks</span>
            </button>
            <button
              onClick={() => {
                soundFx.playPop();
                setSelectedType('rhyme');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedType === 'rhyme' ? 'bg-purple-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Rhymes</span>
            </button>
          </div>
        </div>

        {/* Age Rating Pill Toggles */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Age Group:</span>
          {(['all', '4-5', '6-7', '8-10'] as const).map((ag) => (
            <button
              key={ag}
              onClick={() => {
                soundFx.playPop();
                setSelectedAge(ag);
              }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                selectedAge === ag ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {ag === 'all' ? 'All Ages' : `${ag} yrs`}
            </button>
          ))}
        </div>
      </div>

      {/* Media Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredList.map((item) => {
          const isFav = favoriteIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border-2 border-amber-200 shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => handleMediaClick(item)}>
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                />

                {/* Media Type Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-white/20">
                  {item.type === 'video' && <Play className="w-3 h-3 fill-rose-400 text-rose-400" />}
                  {item.type === 'audiobook' && <Headphones className="w-3 h-3 text-indigo-400" />}
                  {item.type === 'rhyme' && <Music className="w-3 h-3 text-purple-400" />}
                  <span>{item.type}</span>
                </div>

                {/* Duration Badge */}
                <span className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {item.duration}
                </span>

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playPop();
                    onToggleFavorite(item.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-rose-500 shadow-md transition-transform active:scale-90"
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                </button>

                {/* Play Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-600 mb-1">
                    <span>{item.category}</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px]">
                      Ages {item.targetAgeGroup.join(', ')}
                    </span>
                  </div>
                  <h3
                    className="font-black text-slate-800 text-base leading-snug line-clamp-2 cursor-pointer hover:text-amber-600 transition-colors"
                    onClick={() => handleMediaClick(item)}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium">{item.description}</p>
                </div>

                <button
                  onClick={() => handleMediaClick(item)}
                  className="w-full mt-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-extrabold text-xs py-2 rounded-2xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch & Learn</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Media Player Modal Overlay */}
      {activeMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full border-4 border-amber-300 shadow-2xl relative">
            {/* Modal Top Bar */}
            <div className="p-4 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-900" />
                <h3 className="font-black text-base truncate max-w-md">{activeMedia.title}</h3>
              </div>
              <button
                onClick={() => {
                  soundFx.playPop();
                  setActiveMedia(null);
                }}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Player Body */}
            <div className="p-4 sm:p-6 bg-slate-900">
              {activeMedia.type === 'video' || activeMedia.type === 'rhyme' ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                  <iframe
                    src={activeMedia.mediaUrl}
                    title={activeMedia.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                /* Audiobook Player Interface */
                <div className="py-8 text-center text-white space-y-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg animate-pulse">
                    <Headphones className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black mb-1">{activeMedia.title}</h4>
                    <p className="text-xs text-indigo-300 font-medium">{activeMedia.description}</p>
                  </div>

                  {/* Audio Controls Simulation */}
                  <div className="bg-slate-800/80 rounded-2xl p-4 max-w-md mx-auto border border-indigo-500/30">
                    <audio controls autoPlay src={activeMedia.mediaUrl} className="w-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 bg-amber-50 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">
                Safe Kid Streaming • Age Group: {activeMedia.targetAgeGroup.join(', ')}
              </span>
              <button
                onClick={() => {
                  soundFx.playPop();
                  setActiveMedia(null);
                }}
                className="bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl"
              >
                Done Watching
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
