import React, { useState, useEffect } from 'react';
import { MediaItem, AgeGroup, MediaType } from '../types';
import { fetchLatestMediaItems } from '../lib/mediaService';
import { soundFx } from '../utils/soundAndTTS';
import { TvVideoPlayer } from '../components/TvVideoPlayer';
import {
  Sparkles,
  Film,
  Headphones,
  Music,
  Play,
  Search,
  Filter,
  RefreshCw,
  X,
} from 'lucide-react';

interface FeedViewProps {
  currentUserAge?: AgeGroup;
}

export const FeedView: React.FC<FeedViewProps> = ({ currentUserAge = '4-5' }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track which card ID is currently playing inline (YouTube-style)
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const allItems = await fetchLatestMediaItems();
      const approvedItems = allItems.filter(
        (item) => item.status === 'approved' || item.status === 'published'
      );
      setMediaItems(approvedItems);
    } catch (err) {
      console.error('Failed to load media items for VKid feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  // Helper to extract Bunny Video GUID and generate automatic thumbnail frame
  const getItemThumbnail = (item: MediaItem): string => {
    if (item.thumbnailUrl && !item.thumbnailUrl.includes('unsplash') && !item.thumbnailUrl.includes('photo-1513519245088')) {
      return item.thumbnailUrl;
    }

    // Extract GUID from mediaUrl or bunnyId field
    const rawUrl = item.mediaUrl || '';
    const guidMatch = rawUrl.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    
    if (guidMatch && guidMatch[0]) {
      return `https://video.bunnycdn.com/${guidMatch[0]}/thumbnail.jpg`;
    }

    return item.thumbnailUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
  };

  // Filter items based on type, age, and search query
  const filteredItems = mediaItems.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesAge =
      selectedAge === 'all' ||
      (Array.isArray(item.targetAgeGroup) && item.targetAgeGroup.includes(selectedAge as AgeGroup));
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesAge && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Filter Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 border-2 border-amber-200 shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search videos, rhymes & stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              loadMedia();
            }}
            className="p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-2xl transition-colors cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Format Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              soundFx.playPop();
              setSelectedType('all');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedType === 'all'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Content</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setSelectedType('video');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedType === 'video'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Videos</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setSelectedType('audiobook');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedType === 'audiobook'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedType === 'rhyme'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Rhymes</span>
          </button>
        </div>

        {/* Age Group Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Age:</span>
          </span>
          {(['all', '4-5', '6-7', '8-10'] as const).map((age) => (
            <button
              key={age}
              onClick={() => {
                soundFx.playPop();
                setSelectedAge(age);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                selectedAge === age
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {age === 'all' ? 'All Ages' : `${age} yrs`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Feed Video Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-amber-200 shadow-sm space-y-3">
          <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-extrabold text-slate-600">Fetching approved media library...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-amber-200 shadow-sm space-y-3">
          <Film className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-base text-slate-800">No media items found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            There are no approved videos matching your selected filters. Upload new videos using the upload button to submit them for approval!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isPlaying = activePlayingId === item.id;
            const computedThumbnail = getItemThumbnail(item);

            return (
              <div
                key={item.id}
                className="bg-white border-2 border-amber-200 hover:border-amber-400 rounded-3xl overflow-hidden shadow-md transition-all flex flex-col group"
              >
                {/* Media Screen Container */}
                <div className="relative aspect-video bg-black overflow-hidden rounded-t-3xl">
                  {isPlaying ? (
                    /* Inline YouTube-Style Player */
                    <TvVideoPlayer mediaUrl={item.mediaUrl} title={item.title} />
                  ) : (
                    /* Card Thumbnail with Play Overlay */
                    <div
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => {
                        soundFx.playPop();
                        setActivePlayingId(item.id);
                      }}
                    >
                      <img
                        src={computedThumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Type Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow">
                        {item.type === 'video' && <Film className="w-3 h-3 text-rose-400" />}
                        {item.type === 'audiobook' && <Headphones className="w-3 h-3 text-indigo-400" />}
                        {item.type === 'rhyme' && <Music className="w-3 h-3 text-purple-400" />}
                        <span>{item.type}</span>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-slate-900/80 text-white font-bold text-[10px]">
                        {item.duration || '4:30'}
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Content Information */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-bold text-amber-600 truncate">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md shrink-0">
                        Ages {Array.isArray(item.targetAgeGroup) ? item.targetAgeGroup.join(', ') : 'All'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playPop();
                      setActivePlayingId(isPlaying ? null : item.id);
                    }}
                    className={`w-full font-extrabold text-xs py-2.5 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      isPlaying
                        ? 'bg-slate-800 text-white hover:bg-slate-900'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <X className="w-4 h-4" />
                        <span>Done Watching</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Watch & Learn</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
