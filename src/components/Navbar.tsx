import React, { useState, useEffect } from 'react';
import {
  Cross,
  Search,
  MessageSquare,
  Plus,
  Menu,
  X,
  Bell,
  Rss,
  Film,
  Users,
  Calendar,
  ShieldAlert,
  Video,
  User as UserIcon,
  Globe,
  Sparkles,
  QrCode,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationItem } from '../types';
import { NotificationDropdown } from './NotificationDropdown';
import { loadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../utils/notifications';

interface NavbarProps {
  onOpenInvite: () => void;
  onOpenEditProfile: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenInvite,
  onOpenEditProfile,
  onNavigate,
  currentView,
}) => {
  const { profile, signOut, openAuthModal } = useAuth();
  const { theme, setTheme, language, setLanguage, t } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifs = async () => {
    const data = await loadNotifications('me');
    setNotifications(data);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length || 1;

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const subTabs = [
    { id: 'feed', icon: Rss, label: t('feed') },
    { id: 'reels', icon: Film, label: t('reels') },
    { id: 'myNetwork', icon: Users, label: t('myNetwork') },
    { id: 'calendar', icon: Calendar, label: t('calendar') },
  ];

  const drawerMenuItems = [
    { id: 'feed', label: t('feed'), icon: Rss },
    { id: 'reels', label: t('reels'), icon: Film },
    { id: 'messages', label: t('messages'), icon: MessageSquare },
    { id: 'calendar', label: t('calendar'), icon: Calendar },
    { id: 'myNetwork', label: t('myNetwork'), icon: Users },
    { id: 'profile', label: t('profile'), icon: UserIcon },
    { id: 'admin', label: t('adminPanel'), icon: ShieldAlert, isAdmin: true },
  ];

  const isAdminOrOwner = profile?.role === 'admin' || profile?.role === 'owner';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#eedcb5] dark:bg-[#120e0b] border-b-2 border-[#c5a059] dark:border-[#8b6b4a] text-[#3d2b18] dark:text-[#f5ebd9] shadow-md">
        {/* Top Header Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Left: Hamburger Menu, Coptic Cross Icon, Brand Title */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl bg-[#e6d3ab]/80 dark:bg-[#282019] border border-[#c5a059] dark:border-[#8b6b4a] text-[#3d2b18] dark:text-[#f5ebd9] hover:bg-[#c5a059]/20 transition-all cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => onNavigate('feed')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#c5a059] dark:bg-[#d4af37] p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-[#3d2b18] dark:bg-[#120e0b] rounded-[10px] flex items-center justify-center text-[#c5a059] font-bold">
                  ☨
                </div>
              </div>
              <div className="text-left">
                <h1 className="font-serif-coptic font-bold text-base sm:text-lg text-[#3d2b18] dark:text-[#f5ebd9] tracking-tight leading-none">
                  {t('appName')}
                </h1>
                <p className="text-[8px] text-[#7c5f3d] dark:text-[#a89379] tracking-[0.2em] uppercase font-serif mt-0.5 font-semibold">
                  FAITH · FELLOWSHIP
                </p>
              </div>
            </button>
          </div>

          {/* Center Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7c5f3d] dark:text-[#a89379]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchParish')}
                className="w-full pl-9 pr-3 py-1.5 text-[11px] font-serif uppercase tracking-wider rounded-full bg-[#f6ebd6] dark:bg-[#1c1611] border border-[#c5a059] dark:border-[#8b6b4a] text-[#3d2b18] dark:text-[#f5ebd9] placeholder-[#7c5f3d]/60 focus:outline-none focus:border-[#a8833c]"
              />
            </div>
          </div>

          {/* Right Action Circle Buttons */}
          <div className="flex items-center gap-2">
            {/* Create Post / Meeting (+) button */}
            <button
              onClick={() => onNavigate('feed')}
              className="w-9 h-9 rounded-full bg-[#f6ebd6] dark:bg-[#1c1611] border border-[#c5a059] dark:border-[#8b6b4a] text-[#3d2b18] dark:text-[#f5ebd9] flex items-center justify-center hover:bg-[#c5a059] hover:text-white transition-all cursor-pointer shadow-sm"
              title="Create Post or Meeting"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Search Icon button for mobile */}
            <button
              onClick={() => onNavigate('feed')}
              className="w-9 h-9 rounded-full bg-[#f6ebd6] dark:bg-[#1c1611] border border-[#c5a059] dark:border-[#8b6b4a] text-[#3d2b18] dark:text-[#f5ebd9] md:hidden flex items-center justify-center hover:bg-[#c5a059] hover:text-white transition-all cursor-pointer shadow-sm"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Messages / Notifications Bell button with Red Badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-9 h-9 rounded-full bg-[#f6ebd6] dark:bg-[#1c1611] border border-[#c5a059] dark:border-[#8b6b4a] text-[#3d2b18] dark:text-[#f5ebd9] flex items-center justify-center hover:bg-[#c5a059] hover:text-white transition-all cursor-pointer relative shadow-sm"
                title="Notifications & Messages"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                notifications={notifications}
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
                onNavigateToNotifications={() => onNavigate('notifications')}
              />
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tab Bar (Photo 2) */}
        <div className="border-t border-[#c5a059]/40 bg-[#f3e3be]/90 dark:bg-[#18120e]/90 px-4">
          <div className="max-w-2xl mx-auto flex items-center justify-around h-11">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`relative h-full px-4 flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isActive
                      ? 'text-[#a8833c] dark:text-[#d4af37] font-bold'
                      : 'text-[#7c5f3d] dark:text-[#a89379] hover:text-[#3d2b18]'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-1 bg-[#a8833c] dark:bg-[#d4af37] rounded-t-md shadow-sm" />
                  )}
                </button>
              );
            })}

            {/* Coptic Cross Icon Badge in Sub-Bar */}
            <button
              onClick={() => onNavigate('myNetwork')}
              className={`relative h-full px-3 flex items-center justify-center text-[#7c5f3d] dark:text-[#a89379] hover:text-[#3d2b18] ${
                currentView === 'myNetwork' ? 'text-[#a8833c]' : ''
              }`}
              title="Coptic Parish Rooms"
            >
              <div className="w-6 h-6 rounded-full bg-[#3d2b18] text-[#c5a059] flex items-center justify-center font-bold text-xs shadow-sm">
                ☨
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / Side Menu Drawer (Matching Photo 1 Exactly) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] bg-[#eddcb9] dark:bg-[#18120e] h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto border-r-2 border-[#c5a059] dark:border-[#8b6b4a] z-50">
            {/* Top Branding & Close Button */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#c5a059]/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#3d2b18] text-[#c5a059] font-bold flex items-center justify-center text-base shadow-md">
                    ☨
                  </div>
                  <div>
                    <h2 className="font-serif-coptic font-bold text-base text-[#3d2b18] dark:text-[#f5ebd9]">
                      OrthodoxConnect
                    </h2>
                    <p className="text-[8px] text-[#7c5f3d] dark:text-[#a89379] tracking-[0.2em] font-serif uppercase">
                      FAITH · FELLOWSHIP
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl bg-[#f6ebd6] dark:bg-[#282019] border border-[#c5a059] text-[#3d2b18] dark:text-[#f5ebd9] flex items-center justify-center hover:bg-[#c5a059] hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Start Prayer Meeting Callout Box */}
              <button
                onClick={() => {
                  onNavigate('live');
                  setIsDrawerOpen(false);
                }}
                className="w-full p-3.5 rounded-2xl bg-[#f6ebd6] dark:bg-[#241c15] border-2 border-[#c5a059] dark:border-[#8b6b4a] shadow-md flex items-center gap-3 text-left group cursor-pointer hover:border-[#a8833c] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#e6d3ab] dark:bg-[#32251a] flex items-center justify-center text-[#a8833c] shrink-0 border border-[#c5a059]/50">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-coptic font-bold text-xs text-[#3d2b18] dark:text-[#f5ebd9] tracking-wide">
                    START PRAYER MEETING
                  </h3>
                  <p className="text-[9px] text-[#7c5f3d] dark:text-[#a89379] tracking-wider uppercase font-serif">
                    PRAY TOGETHER OVER VIDEO
                  </p>
                </div>
              </button>

              {/* Drawer Menu Navigation Items */}
              <nav className="space-y-1.5 pt-2">
                {drawerMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  if (item.isAdmin && !isAdminOrOwner) return null;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-serif text-xs tracking-wider uppercase transition-all cursor-pointer ${
                        isActive || (item.id === 'admin' && currentView === 'admin')
                          ? 'bg-[#e8d6b0] dark:bg-[#32251a] border border-[#c5a059] text-[#3d2b18] dark:text-[#f5ebd9] font-bold shadow-sm'
                          : 'text-[#3d2b18] dark:text-[#f5ebd9] hover:bg-[#f6ebd6]/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#a8833c] dark:text-[#d4af37]" />
                        <span>{item.label}</span>
                      </div>

                      {/* Pill Badge indicator for Admin or active items */}
                      {item.id === 'admin' && (
                        <span className="w-2 h-2 rounded-full bg-[#a8833c] dark:bg-[#d4af37]" />
                      )}
                    </button>
                  );
                })}

                {/* Invite Friends Button */}
                <button
                  onClick={() => {
                    onOpenInvite();
                    setIsDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-serif text-xs tracking-wider uppercase text-[#3d2b18] dark:text-[#f5ebd9] hover:bg-[#f6ebd6]/80 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#a8833c]" />
                  <span>INVITE FRIENDS</span>
                </button>

                {/* Language Indicator */}
                <div className="flex items-center justify-between px-3.5 py-2.5 font-serif text-xs tracking-wider uppercase text-[#3d2b18] dark:text-[#f5ebd9]">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#a8833c]" />
                    <span>LANGUAGE</span>
                  </div>
                  <button
                    onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                    className="text-xs font-bold text-[#a8833c]"
                  >
                    {language.toUpperCase()}
                  </button>
                </div>

                {/* ANCIENT VIEW Theme Toggle (Circled in Red in Photo 1!) */}
                <button
                  onClick={() => {
                    setTheme(theme === 'ancient' ? 'dark' : 'ancient');
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#e8d6b0]/90 dark:bg-[#32251a] border-2 border-[#a8833c] text-[#3d2b18] dark:text-[#f5ebd9] font-serif font-bold text-xs tracking-wider uppercase shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#a8833c]" />
                    <span>ANCIENT VIEW</span>
                  </div>
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#c5a059] text-white">
                    {theme.toUpperCase()}
                  </span>
                </button>
              </nav>
            </div>

            {/* Bottom User Profile Card */}
            {profile ? (
              <div className="pt-4 border-t border-[#c5a059]/40 flex items-center justify-between p-3 rounded-2xl bg-[#f6ebd6] dark:bg-[#241c15] border border-[#c5a059]">
                <div className="flex items-center gap-2.5">
                  <img
                    src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                    alt={profile.full_name}
                    className="w-10 h-10 rounded-full border-2 border-[#c5a059] object-cover"
                  />
                  <div>
                    <h4 className="font-serif-coptic font-bold text-xs text-[#3d2b18] dark:text-[#f5ebd9] uppercase tracking-wider">
                      {profile.full_name}
                    </h4>
                    <p className="text-[9px] text-[#7c5f3d] dark:text-[#a89379] uppercase font-serif">
                      {profile.parish || 'ST. MARK'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="px-2.5 py-1 rounded-full bg-[#e6d3ab] dark:bg-[#382b20] border border-[#c5a059] text-[9px] font-serif font-bold text-[#a8833c] uppercase">
                    {profile.role?.toUpperCase() || 'USER'}
                  </span>
                  <button
                    onClick={signOut}
                    className="p-1.5 rounded-lg text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal();
                  setIsDrawerOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#c5a059] text-white font-serif font-bold text-xs tracking-wider uppercase shadow-md"
              >
                SIGN IN / REGISTER
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

