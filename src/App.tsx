import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ActiveChatsPanel } from './components/ActiveChatsPanel';
import { LiturgicalBanner } from './components/LiturgicalBanner';
import { InviteModal } from './components/InviteModal';
import { EditProfileModal } from './components/EditProfileModal';
import { AuthModal } from './components/AuthModal';

import { FeedView } from './views/FeedView';
import { ReelsView } from './views/ReelsView';
import { LiveBroadcastView } from './views/LiveBroadcastView';
import { GroupRoomsView } from './views/GroupRoomsView';
import { MessengerView } from './views/MessengerView';
import { ProfileView } from './views/ProfileView';
import { AdminPanelView } from './views/AdminPanelView';
import { CalendarView } from './views/CalendarView';
import { NotificationsView } from './views/NotificationsView';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('feed');
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [activeMessengerContactId, setActiveMessengerContactId] = useState<string | undefined>(undefined);

  // Check URL params for referral invite link /invite?ref=xyz
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    if (path.includes('/invite') || searchParams.has('ref')) {
      setIsInviteOpen(true);
    }
  }, []);

  const handleOpenMessengerWithUser = (contactId?: string) => {
    setActiveMessengerContactId(contactId);
    setCurrentView('messages');
  };

  const renderView = () => {
    switch (currentView) {
      case 'feed':
        return <FeedView />;
      case 'reels':
        return <ReelsView />;
      case 'live':
        return <LiveBroadcastView />;
      case 'myNetwork':
        return <GroupRoomsView />;
      case 'messages':
        return <MessengerView initialContactId={activeMessengerContactId} />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return <ProfileView onOpenEditProfile={() => setIsEditProfileOpen(true)} />;
      case 'admin':
        return <AdminPanelView />;
      case 'calendar':
        return <CalendarView />;
      default:
        return <FeedView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#eddcb9] dark:bg-[#0f0c09] text-[#3d2b18] dark:text-[#f5ebd9] font-sans selection:bg-[#c5a059] selection:text-white transition-colors">
      {/* Top Navbar */}
      <Navbar
        onOpenInvite={() => setIsInviteOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onNavigate={(view) => setCurrentView(view)}
        currentView={currentView}
      />

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'feed' ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar */}
            <Sidebar
              currentView={currentView}
              onNavigate={(view) => setCurrentView(view)}
              onOpenInvite={() => setIsInviteOpen(true)}
            />

            {/* Center Dynamic View */}
            <div className="flex-1 min-w-0">{renderView()}</div>

            {/* Right Active Chats Community Panel */}
            <ActiveChatsPanel onOpenMessenger={handleOpenMessengerWithUser} />
          </div>
        ) : (
          /* Focused Dedicated View Layout for Reels, Messages, Live, Calendar, Groups, Profile, Admin, etc. */
          <div className="w-full min-h-[calc(100vh-8rem)]">
            {renderView()}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

