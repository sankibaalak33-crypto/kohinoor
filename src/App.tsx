import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TournamentProvider, useTournaments } from './context/TournamentContext';
import { SplashScreen } from './components/SplashScreen';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NotificationDrawer } from './components/NotificationDrawer';
import { HomeDashboard } from './components/HomeDashboard';
import { MyMatchesView } from './components/MyMatchesView';
import { TeamHub } from './components/TeamHub';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { AdminPanel } from './components/AdminPanel';
import { ShieldCheck } from 'lucide-react';

type TabType = 'home' | 'matches' | 'teams' | 'leaderboard' | 'profile' | 'admin';

const MainLayout: React.FC = () => {
  const { currentUser, isAuthModalOpen, openAuthModal, closeAuthModal, isAdmin } = useAuth();
  const { notifications } = useTournaments();

  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Check if splash was already shown in this session
  useEffect(() => {
    const splashSeen = sessionStorage.getItem('kohinoor_splash_seen');
    if (splashSeen) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('kohinoor_splash_seen', 'true');
    // If not logged in, show AuthModal to allow quick login or guest exploration
    if (!currentUser) {
      openAuthModal('login');
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <div className="min-h-screen bg-[#07090f] text-gray-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={() => openAuthModal('login')}
        onOpenNotifications={() => setIsNotifOpen(true)}
        unreadCount={unreadNotifsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 pt-4 pb-24">
        {currentTab === 'home' && <HomeDashboard onNavigate={setCurrentTab} />}
        {(currentTab === 'matches' || (currentTab as string) === 'tournaments') && <MyMatchesView />}
        {currentTab === 'teams' && <TeamHub />}
        {currentTab === 'leaderboard' && <LeaderboardView />}
        {currentTab === 'profile' && <ProfileView />}
        {currentTab === 'admin' && <AdminPanel />}

        {/* Responsible Gaming & Non-Monetary Fair Play Compliance Notice */}
        <footer className="mt-12 pt-6 border-t border-white/10 text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[11px] text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">
              KOHINOOR ESPORTS • 100% FREE ENTRY • ZERO MONETARY WAGERS • NON-REDEEMABLE VIRTUAL REWARDS ONLY
            </span>
          </div>
          <p className="text-[10px] text-gray-500 max-w-xl mx-auto">
            Kohinoor FF Tournaments is an independent, community-driven esports competition platform.
            This application does not engage in real-money gambling, cash deposits, or cash withdrawals.
            All prize pools consist solely of in-app Virtual Points (VP) and digital badges.
          </p>
        </footer>
      </main>

      {/* Bottom Navigation for Mobile Viewports */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onTabChange={setCurrentTab}
        onNavigate={setCurrentTab}
      />

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <MainLayout />
      </TournamentProvider>
    </AuthProvider>
  );
}

