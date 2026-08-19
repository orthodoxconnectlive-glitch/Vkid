import React, { useState } from 'react';
import { MediaItem, MediaType, AgeGroup, SupportedLanguage } from '../types';
import { Play, Headphones, Music, Star, Search, X, Volume2, Sparkles, Heart, Trash2, ShieldCheck, ExternalLink, ChevronRight, PlayCircle, UploadCloud } from 'lucide-react';
import { soundFx, speakText } from '../utils/soundAndTTS';
import { getTranslation } from '../data/translations';
import { TvVideoPlayer } from './TvVideoPlayer';
import { VideoPlayerModal } from './VideoPlayerModal';
import { useTvNavigation } from '../hooks/useTvNavigation';
import { parseExternalVideoUrl } from '../utils/mediaUtils';

interface MediaLibraryProps {
  mediaList: MediaItem[];
  userAgeGroup: AgeGroup;
  favoriteIds: string[];
  onToggleFavorite: (mediaId: string) => void;
  onRecordMediaWatch: (durationMinutes: number) => void;
  currentLanguage?: SupportedLanguage;
  isAdmin?: boolean;
  currentUserEmail?: string;
  userRole?: string;
  isAuthenticated?: boolean;
  onDeleteVideo?: (id: string) => Promise<void> | void;
  onApproveVideo?: (id: string) => Promise<void> | void;
  onOpenUploadModal?: () => void;
  onOpenParentPin?: () => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  mediaList,
  userAgeGroup,
  favoriteIds,
  onToggleFavorite,
  onRecordMediaWatch,
  currentLanguage = 'en',
  isAdmin = false,
  currentUserEmail,
  userRole,
  isAuthenticated = false,
  onDeleteVideo,
  onApproveVideo,
  onOpenUploadModal,
  onOpenParentPin,
}) => {
  const t = (key: string, fallback: string) => getTranslation(currentLanguage, key, fallback);
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [selectedAge, setSelectedAge] = useState<AgeGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUploadClick = () => {
    soundFx.playPop();
    const isAuthorizedRole =
      isAdmin ||
      userRole === 'parent' ||
      userRole === 'educator' ||
      userRole === 'admin' ||
      userRole === 'super_admin';

    if (isAuthorizedRole && onOpenUploadModal) {
      onOpenUploadModal();
    } else if (onOpenParentPin) {
      speakText('Parent PIN required to upload video');
      onOpenParentPin();
    } else if (onOpenUploadModal) {
      onOpenUploadModal();
    }
  };

  // Helper to record watch history into localStorage
  const recordWatchHistory = (item: MediaItem) => {
    try {
      const raw = localStorage.getItem('vkid_watch_history');
      let list = raw ? JSON.parse(raw) : [];
      const newEntry = {
        id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        mediaId: item.id,
        title: item.title,
        category: item.category,
        type: item.type,
        watchedAt: new Date().toISOString(),
        duration: item.duration || '5:00',
        thumbnailUrl: item.thumbnailUrl,
        mediaUrl: item.mediaUrl,
      };
      list = [newEntry, ...list.filter((x: any) => x.mediaId !== item.id)].slice(0, 50);
      localStorage.setItem('vkid_watch_history', JSON.stringify(list));
    } catch (e) {
      console.warn('Watch history error:', e);
    }
  };

  // Smart TV Remote D-Pad Navigation Back Key Listener
  useTvNavigation({
    onBack: () => {
      if (deletingItem) {
        setDeletingItem(null);
      } else if (activeMedia) {
        soundFx.playPop();
        setActiveMedia(null);
      }
    },
    enabled: !!activeMedia || !!deletingItem,
  });

  const filteredList = mediaList.filter((item) => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesAge = selectedAge === 'all' || item.targetAgeGroup.includes(selectedAge);
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const isPending = item.status === 'pending_approval' || item.status === 'pending' || item.status === 'pending_moderation';
    const isUploader = currentUserEmail && item.uploadedBy?.toLowerCase() === currentUserEmail.toLowerCase();
    const isVisibleStatus = !isPending || isAdmin || isUploader;

    return matchesType && matchesAge && matchesSearch && isVisibleStatus;
  });

  const handleMediaClick = (item: MediaItem) => {
    soundFx.playPop();
    speakText(`Opening ${item.title}`);
    setActiveMedia(item);
    recordWatchHistory(item);
    onRecordMediaWatch(5); // Record 5 minutes media watch engagement
  };

  const handlePlayNext = () => {
    if (!activeMedia) return;
    const currentIndex = filteredList.findIndex((x) => x.id === activeMedia.id);
    const nextIndex = (currentIndex + 1) % filteredList.length;
    const nextItem = filteredList[nextIndex] || filteredList[0];
    if (nextItem) {
      handleMediaClick(nextItem);
    }
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
              tabIndex={0}
              placeholder="Search videos, stories & rhymes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-amber-50/60 border-2 border-amber-200 rounded-full pl-9 pr-4 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-300"
            />
          </div>

          {/* Type Category Pills & Upload CTA */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {/* Prominent Upload Video CTA Button */}
            <button
              type="button"
              tabIndex={0}
              onClick={handleUploadClick}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-slate-900 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-sm border border-amber-300 transition-all cursor-pointer active:scale-95 shrink-0 focus:outline-none focus:ring-4 focus:ring-amber-400"
              title="Upload a new kid-friendly video, cartoon or story"
            >
              <UploadCloud className="w-4 h-4 text-amber-950" />
              <span>+ Upload Video</span>
            </button>

            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setSelectedType('all');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400 ${
                selectedType === 'all' ? 'bg-amber-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Media
            </button>
            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setSelectedType('video');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-400 ${
                selectedType === 'video' ? 'bg-rose-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Videos</span>
            </button>
            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setSelectedType('audiobook');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-400 ${
                selectedType === 'audiobook' ? 'bg-indigo-500 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Audiobooks</span>
            </button>
            <button
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setSelectedType('rhyme');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-400 ${
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
              type="button"
              tabIndex={0}
              onClick={() => {
                soundFx.playPop();
                setSelectedAge(ag);
              }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-400 ${
                selectedAge === ag ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {ag === 'all' ? 'All Ages' : `${ag} yrs`}
            </button>
          ))}
        </div>
      </div>

      {/* Media Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border-2 border-amber-200 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Play className="w-8 h-8 fill-current" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-800">No videos uploaded yet</h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            Try adjusting your search query or age filters above, or upload a new kid-friendly video!
          </p>
          <button
            type="button"
            tabIndex={0}
            onClick={() => {
              setSelectedType('all');
              setSelectedAge('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs rounded-full shadow transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredList.map((item) => {
            const isFav = favoriteIds.includes(item.id);
            return (
              <div
                key={item.id}
                tabIndex={0}
                role="button"
                aria-label={`Play ${item.title}`}
                onClick={() => handleMediaClick(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.keyCode === 13 || e.key === ' ') {
                    e.preventDefault();
                    handleMediaClick(item);
                  }
                }}
                className="bg-white rounded-3xl overflow-hidden border-2 border-amber-200 shadow-md hover:shadow-xl transition-all duration-200 group flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-amber-400 focus:scale-[1.02]"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />

                  {/* Media Type Badge */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-white/20">
                    {item.type === 'video' && <Play className="w-3 h-3 fill-rose-400 text-rose-400" />}
                    {item.type === 'audiobook' && <Headphones className="w-3 h-3 text-indigo-400" />}
                    {item.type === 'rhyme' && <Music className="w-3 h-3 text-purple-400" />}
                    <span>{item.type}</span>
                  </div>

                  {/* Pending Moderation Badge */}
                  {(item.status === 'pending_approval' || item.status === 'pending' || item.status === 'pending_moderation') && (
                    <div className="absolute bottom-3 left-3 bg-amber-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 shadow border border-amber-300 z-10">
                      <span>⏳ Pending Review</span>
                    </div>
                  )}

                  {/* Duration Badge */}
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                    {item.duration}
                  </span>

                  {/* Favorite & Admin Action Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                    {/* Admin-Only Trash Delete Button */}
                    {isAdmin && (
                      <button
                        type="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playPop();
                          setDeletingItem(item);
                        }}
                        className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform active:scale-90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                        title="Delete Video permanently (Admin Only)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Favorite Button */}
                    <button
                      type="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playPop();
                        onToggleFavorite(item.id);
                      }}
                      className="p-2 rounded-full bg-white/80 hover:bg-white text-rose-500 shadow-md transition-transform active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    </button>
                  </div>

                  {/* Pending Approval / Review Badges */}
                  {(item.status === 'pending_approval' || item.status === 'pending' || item.status === 'pending_moderation') && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
                      <div className="bg-amber-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow border border-amber-300">
                        <span>⏳ Pending Review</span>
                      </div>

                      {/* Quick Admin Approve Button */}
                      {isAdmin && onApproveVideo && (
                        <button
                          type="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playSuccess();
                            onApproveVideo(item.id);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow border border-emerald-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                          title="Approve video for public feed"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Play Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-focus:scale-110 transition-transform">
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
                    <h3 className="font-black text-slate-800 text-base leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium">{item.description}</p>
                  </div>

                  <div className="w-full mt-2 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:from-amber-500 group-hover:to-orange-500 text-amber-950 font-extrabold text-xs py-2 rounded-2xl shadow transition-all flex items-center justify-center gap-1.5">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch & Learn</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Player Modal Overlay */}
      {activeMedia && (
        <VideoPlayerModal
          media={activeMedia}
          relatedMedia={mediaList.filter((m) => m.id !== activeMedia.id).slice(0, 4)}
          onSelectRelated={(item) => handleMediaClick(item)}
          onClose={() => setActiveMedia(null)}
        />
      )}

      {/* Admin Delete Video Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-4 border-rose-300 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-extrabold text-xl text-slate-900">Delete Video Confirmation</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900 font-bold">"{deletingItem.title}"</strong> from VKid?
              </p>
              <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-2xl font-bold text-left">
                ⚠️ This will permanently purge the video record from state/database and remove the underlying media file.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                tabIndex={0}
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-4 focus:ring-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                tabIndex={0}
                onClick={async () => {
                  soundFx.playPop();
                  setIsDeleting(true);
                  try {
                    if (onDeleteVideo) {
                      await onDeleteVideo(deletingItem.id);
                    }
                  } finally {
                    setIsDeleting(false);
                    setDeletingItem(null);
                  }
                }}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-400"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Video</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
