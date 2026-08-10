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
  MoreVertical,
  RefreshCw,
  X,
  User,
} from 'lucide-react';

interface FeedViewProps {
  currentUserAge?: AgeGroup;
}

export const FeedView: React.FC<FeedViewProps> = ({ currentUserAge = '4-5' }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
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

  // Extract Bunny Video GUID and generate automatic thumbnail frame
  const getItemThumbnail = (item: MediaItem): string => {
    if (
      item.thumbnailUrl &&
      !item.thumbnailUrl.includes('unsplash') &&
      !item.thumbnailUrl.includes('photo-1513519245088')
    ) {
      return item.thumbnailUrl;
    }

    const rawUrl = item.mediaUrl || '';
    const guidMatch = rawUrl.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    
    if (guidMatch && guidMatch[0]) {
      return `https://video.bunnycdn.com/${guidMatch[0]}/thumbnail.jpg`;
    }

    return item.thumbnailUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
  };

  // Filter items based on type and search query
  const filteredItems = mediaItems.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Sticky Top Bar & Filter Pills (YouTube Mobile Style) */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 p-3 space-y-2.5">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search VKid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => {
              soundFx.playPop();
              loadMedia();
            }}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-full hover:bg-slate-800 transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* YouTube Horizontal Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              soundFx.playPop();
              setSelectedType('all');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedType === 'all'
                ? 'bg-white text-slate-950'
                : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
            }`}
          >
            All
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setSelectedType('video');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedType === 'video'
                ? 'bg-white text-slate-950'
                : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
            }`}
          >
            Videos
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setSelectedType('audiobook');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedType === 'audiobook'
                ? 'bg-white text-slate-950'
                : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
            }`}
          >
            Audiobooks
          </button>

          <button
            onClick={() => {
              soundFx.playPop();
              setSelectedType('rhyme');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedType === 'rhyme'
                ? 'bg-white text-slate-950'
                : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
            }`}
          >
            Rhymes
          </button>
        </div>
      </div>

      {/* Main YouTube Feed List */}
      <div className="max-w-xl mx-auto space-y-6 pt-3">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading YouTube Feed...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Film className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="font-extrabold text-sm text-slate-300">No videos found</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Upload new videos using the upload button to see them here!
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isPlaying = activePlayingId === item.id;
            const computedThumbnail = getItemThumbnail(item);

            return (
              <div key={item.id} className="flex flex-col bg-slate-950">
                {/* 1. Full-Width Video Screen / Thumbnail Slot */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  {isPlaying ? (
                    /* Active Inline Player */
                    <div className="w-full h-full relative">
                      <TvVideoPlayer mediaUrl={item.mediaUrl} title={item.title} />
                      <button
                        onClick={() => setActivePlayingId(null)}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-black/70 hover:bg-black text-white rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Close</span>
                      </button>
                    </div>
                  ) : (
                    /* YouTube Card Thumbnail */
                    <div
                      className="relative w-full h-full cursor-pointer group"
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

                      {/* Floating Duration Badge (Bottom Right) */}
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[11px] font-bold tracking-tight">
                        {item.duration || '4:30'}
                      </div>

                      {/* Center Play Icon Hover Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. YouTube Channel / Info Row */}
                <div className="p-3 flex items-start gap-3">
                  {/* Channel Avatar Circle */}
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                    {item.uploadedBy ? item.uploadedBy.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>

                  {/* Video Title & Meta Details */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h3
                      onClick={() => {
                        soundFx.playPop();
                        setActivePlayingId(isPlaying ? null : item.id);
                      }}
                      className="font-bold text-sm text-white line-clamp-2 leading-snug cursor-pointer hover:text-amber-400 transition-colors"
                    >
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                      <span className="truncate">{item.uploadedBy || 'VKid Official'}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>Safe Kids</span>
                    </div>
                  </div>

                  {/* More Options Button */}
                  <button className="p-1 text-slate-400 hover:text-white rounded-full">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        )}
      </div>
    </div>
  );
};
