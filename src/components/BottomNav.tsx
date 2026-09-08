import React from 'react';
import { Home, Trophy, Users, BarChart3, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab?: (tab: any) => void;
  onTabChange?: (tab: any) => void;
  onNavigate?: (tab: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onTabChange,
  onNavigate,
}) => {
  const { isAdmin } = useAuth();
  const navigate = onTabChange || setCurrentTab || onNavigate || (() => {});

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'matches', label: 'Matches', icon: Trophy },
    { id: 'teams', label: 'My Squad', icon: Users },
    { id: 'leaderboard', label: 'Ranks', icon: BarChart3 },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck }] : []),
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e17]/95 backdrop-blur-lg border-t border-amber-500/20 px-2 py-1.5 select-none"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (item.id === 'matches' && currentTab === 'tournaments');
          const isAdminItem = item.id === 'admin';

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? isAdminItem
                    ? 'text-red-400 font-bold scale-105'
                    : 'text-amber-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div
                className={`relative p-1 rounded-lg transition-colors ${
                  isActive
                    ? isAdminItem
                      ? 'bg-red-500/20'
                      : 'bg-amber-500/20'
                    : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                      isAdminItem ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                  />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
