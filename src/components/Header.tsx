import React from 'react';
import { Shield, Bell, Sparkles, User, ShieldAlert, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTournaments } from '../context/TournamentContext';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenAuth?: () => void;
  currentTab: string;
  setCurrentTab?: (tab: any) => void;
  onNavigate?: (tab: any) => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenAuth,
  setCurrentTab,
  onNavigate,
  unreadCount: propUnreadCount,
}) => {
  const { currentUser, isAuthenticated, switchRole } = useAuth();
  const { notifications } = useTournaments();

  const navigate = onNavigate || setCurrentTab || (() => {});
  const unreadCount = propUnreadCount ?? notifications.filter((n) => !n.read).length;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full bg-[#0a0b12]/95 backdrop-blur-md border-b border-amber-500/20 px-4 py-3 select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Identity */}
        <div
          id="brand-logo-trigger"
          onClick={() => navigate('home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0c0e16] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="font-heading font-extrabold text-base tracking-wider text-white">
                KOHINOOR <span className="gold-gradient-text">FF</span>
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-amber-400/80 uppercase">
              Esports Arena
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated && currentUser ? (
            <>
              {/* Virtual Points Counter (Non-Monetary) */}
              <div
                id="vp-counter-pill"
                onClick={() => navigate('profile')}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                title="Non-monetary Virtual Esports Points"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-bold font-mono">
                  {currentUser.virtualPoints.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-amber-400/80">VP</span>
              </div>

              {/* Role Switcher (Player <-> Admin) for instant reviewer testing */}
              <div className="relative group">
                <button
                  id="role-switch-button"
                  onClick={() => switchRole(currentUser.role === 'admin' ? 'player' : 'admin')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    currentUser.role === 'admin'
                      ? 'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25'
                      : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25'
                  }`}
                  title="Click to switch role between Admin and Player"
                >
                  {currentUser.role === 'admin' ? (
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                  ) : (
                    <Shield className="w-3 h-3 text-cyan-400" />
                  )}
                  <span>{currentUser.role}</span>
                  <span className="text-[9px] opacity-60">⇄</span>
                </button>
              </div>

              {/* Notification Bell */}
              <button
                id="notification-bell-button"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-gray-900/80 border border-white/10 text-gray-300 hover:text-white hover:border-amber-500/40 transition-all"
                aria-label="View Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span
                    id="unread-notifications-badge"
                    className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-[9px] font-black rounded-full flex items-center justify-center animate-pulse"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Avatar / Profile link */}
              <button
                id="user-avatar-button"
                onClick={() => navigate('profile')}
                className="flex items-center space-x-1.5 p-1 pr-2 rounded-xl bg-gray-900/80 border border-white/10 hover:border-amber-500/50 transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-7 h-7 rounded-lg object-cover bg-gray-800"
                />
                <span className="hidden md:inline text-xs font-semibold text-gray-200 truncate max-w-[80px]">
                  {currentUser.username}
                </span>
              </button>
            </>
          ) : (
            <button
              id="auth-sign-in-button"
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-amber-500/20"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
