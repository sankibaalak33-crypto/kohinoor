import React from 'react';
import { X, Check, Bell, Trophy, Users, ShieldAlert, Sparkles, KeyRound, Clock } from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { AppNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useTournaments();

  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'room_info':
        return <KeyRound className="w-4 h-4 text-emerald-400" />;
      case 'team_invite':
        return <Users className="w-4 h-4 text-cyan-400" />;
      case 'match_result':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'tournament_reg':
      case 'tournament_completion':
        return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'match_starting':
      case 'reg_closing':
        return <Clock className="w-4 h-4 text-orange-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-300" />;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      id="notification-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="notification-drawer"
        className="w-full max-w-md h-full bg-[#0c0e17] border-l border-amber-500/20 shadow-2xl flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#11131f]">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading font-bold text-lg uppercase tracking-wide">Notifications</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {notifications.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {notifications.some((n) => !n.read) && (
              <button
                id="mark-all-read-btn"
                onClick={markAllNotificationsRead}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1 py-1 px-2 rounded-lg bg-amber-500/10"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
              <Bell className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-medium">No alerts right now</p>
              <p className="text-xs text-gray-600 mt-1">
                Room credentials, match results, and squad invitations will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                id={`notification-item-${notif.id}`}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.type === 'team_invite' && onSelectTab) {
                    onSelectTab('teams');
                    onClose();
                  } else if (notif.type === 'room_info' && onSelectTab) {
                    onSelectTab('tournaments');
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  notif.read
                    ? 'bg-[#12141e]/70 border-white/5 text-gray-300 hover:bg-[#161824]'
                    : 'bg-[#181a28] border-amber-500/40 text-white hover:border-amber-400 shadow-md shadow-amber-500/5'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gray-900/80 border border-white/10 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 pr-3">
                    <h4 className="text-xs font-bold text-gray-100 flex items-center justify-between">
                      <span>{notif.title}</span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-gray-500 mt-2 block font-mono">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-white/10 bg-[#0a0b10] text-[10px] text-gray-500 text-center">
          Kohinoor FF Esports Notification Service • Real-time alerts
        </div>
      </div>
    </div>
  );
};
