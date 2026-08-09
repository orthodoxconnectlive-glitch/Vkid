import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, UserAccount, SupportedLanguage } from '../types';
import { getTranslation } from '../data/translations';
import { Search, X, Film, Users, Play, Headphones, Music, ChevronRight, Mail, Sparkles, UserCheck } from 'lucide-react';
import { soundFx } from '../utils/soundAndTTS';
import { UserProfileModal } from './UserProfileModal';

interface UniversalSearchBarProps {
  mediaItems: MediaItem[];
  userAccounts: UserAccount[];
  currentLanguage: SupportedLanguage;
  onSelectMedia: (item: MediaItem) => void;
}

export const UniversalSearchBar: React.FC<UniversalSearchBarProps> = ({
  mediaItems,
  userAccounts,
  currentLanguage,
  onSelectMedia,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'videos' | 'users'>('videos');
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  // Close auto-complete suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const approvedMedia = mediaItems.filter((m) => m.status === 'approved' || !m.status);

  // Search Results Filtering
  const matchingMedia = approvedMedia.filter((item) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  const matchingUsers = userAccounts.filter((user) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      (user.channelBio && user.channelBio.toLowerCase().includes(q))
    );
  });

  const totalResults = matchingMedia.length + matchingUsers.length;

  const handleMediaClick = (item: MediaItem) => {
    soundFx.playPop();
    onSelectMedia(item);
    setIsOpen(false);
    setQuery('');
  };

  const handleUserClick = (user: UserAccount) => {
    soundFx.playPop();
    setSelectedUser(user);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto z-40">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-amber-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('search_placeholder', 'Universal Search: Find videos, stories, creators & parents...')}
          className="w-full bg-white/90 border-2 border-amber-300 hover:border-amber-400 focus:border-amber-500 rounded-full pl-10 pr-9 py-2 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              soundFx.playPop();
              setQuery('');
            }}
            className="absolute right-3 p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Live Auto-Complete Suggestions & Results Panel */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-12 left-0 right-0 bg-white border-2 border-amber-300 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] overflow-y-auto">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black text-slate-800">
                Search Results ({totalResults})
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
              <button
                onClick={() => {
                  soundFx.playPop();
                  setActiveTab('videos');
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                  activeTab === 'videos'
                    ? 'bg-amber-500 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Videos ({matchingMedia.length})</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playPop();
                  setActiveTab('users');
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users ({matchingUsers.length})</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Videos & Media */}
          {activeTab === 'videos' && (
            <div className="py-2 space-y-2">
              {matchingMedia.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  <Film className="w-8 h-8 mx-auto mb-1 opacity-40" />
                  <p className="text-xs font-bold">No videos or media found matching "{query}".</p>
                </div>
              ) : (
                matchingMedia.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleMediaClick(item)}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-amber-50 border border-transparent hover:border-amber-200 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute top-1 left-1 bg-black/60 p-0.5 rounded text-white text-[8px]">
                          {item.type === 'video' && <Play className="w-2.5 h-2.5 fill-current text-rose-400" />}
                          {item.type === 'audiobook' && <Headphones className="w-2.5 h-2.5 text-indigo-400" />}
                          {item.type === 'rhyme' && <Music className="w-2.5 h-2.5 text-purple-400" />}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h5 className="font-extrabold text-xs text-slate-800 truncate group-hover:text-amber-600 transition-colors">
                          {item.title}
                        </h5>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {item.category} • Age {item.targetAgeGroup.join(', ')} yrs • {item.duration}
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-100 group-hover:bg-amber-500 text-amber-800 group-hover:text-white p-1.5 rounded-xl transition-colors shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Users & Channels */}
          {activeTab === 'users' && (
            <div className="py-2 space-y-2">
              {matchingUsers.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-1 opacity-40" />
                  <p className="text-xs font-bold">No registered users or channels found matching "{query}".</p>
                </div>
              ) : (
                matchingUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-200 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center text-lg font-bold shrink-0">
                        {user.avatarUrl || '👤'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-extrabold text-xs text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                            {user.displayName}
                          </h5>
                          {user.role === 'super_admin' && (
                            <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 rounded">👑 Owner</span>
                          )}
                          {user.role === 'admin' && (
                            <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 rounded">🛡️ Admin</span>
                          )}
                          {user.role === 'parent' && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 rounded">👨‍👩‍👧 Parent</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>{user.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-indigo-100 group-hover:bg-indigo-600 text-indigo-800 group-hover:text-white px-3 py-1 rounded-full text-[10px] font-extrabold transition-colors shrink-0">
                      View Profile
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected User Profile Details Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          userMediaItems={mediaItems.filter(
            (m) => m.uploadedBy?.toLowerCase() === selectedUser.email.toLowerCase()
          )}
          currentLanguage={currentLanguage}
          onPlayMedia={onSelectMedia}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};
