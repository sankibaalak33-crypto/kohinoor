import React, { useState } from 'react';
import {
  User,
  Shield,
  Trophy,
  Target,
  Sparkles,
  Award,
  Copy,
  Check,
  Edit3,
  Calendar,
  Zap,
  Flame,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTournaments } from '../context/TournamentContext';
import { Badge } from '../types';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile, logout } = useAuth();
  const { badges, matches, myTeam } = useTournaments();

  const [copiedId, setCopiedId] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIgn, setEditIgn] = useState(currentUser?.ffNickname || '');
  const [editFfId, setEditFfId] = useState(currentUser?.ffPlayerId || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');

  if (!currentUser) return null;

  const copyUid = () => {
    navigator.clipboard.writeText(currentUser.ffPlayerId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ffNickname: editIgn,
      ffPlayerId: editFfId,
      avatar: editAvatar,
    });
    setIsEditing(false);
  };

  // Find user match history
  const userMatches = matches.filter(
    (m) =>
      m.teamA.players.some((p) => p.userId === currentUser.id) ||
      m.teamB.players.some((p) => p.userId === currentUser.id)
  );

  const winRate =
    currentUser.totalMatches > 0
      ? Math.round((currentUser.wins / currentUser.totalMatches) * 100)
      : 0;

  const kdRatio =
    currentUser.totalMatches > 0
      ? (currentUser.kills / currentUser.totalMatches).toFixed(1)
      : '0.0';

  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div id="profile-view" className="space-y-6 pb-20">
      {/* ESPORTS PLAYER CARD BANNER */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-[#1b1e2c] via-[#12141f] to-[#0a0b12] border border-amber-500/30 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400/80 shadow-xl shadow-amber-500/20 bg-gray-900"
              />
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider font-mono">
                {currentUser.role}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-wide uppercase text-white">
                  {currentUser.ffNickname}
                </h1>
                {myTeam && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                    [{myTeam.tag}]
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-400 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 font-mono">
                <span>@{currentUser.username}</span>
                <span>•</span>
                <span className="text-gray-300 flex items-center space-x-1">
                  <span>UID: {currentUser.ffPlayerId}</span>
                  <button
                    onClick={copyUid}
                    className="p-1 hover:text-amber-400 transition-colors"
                    title="Copy Free Fire Player ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </span>
              </div>

              {/* Non-Monetary Virtual Points Balance */}
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-base font-black font-mono">
                    {currentUser.virtualPoints.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-amber-400">VP (Virtual Points)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  Decreased Entry Fees: 0 - 20 VP
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center justify-center gap-2">
            <button
              id="edit-profile-button"
              onClick={() => {
                setEditIgn(currentUser.ffNickname);
                setEditFfId(currentUser.ffPlayerId);
                setEditAvatar(currentUser.avatar);
                setIsEditing(true);
              }}
              className="px-4 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-white/10 flex items-center space-x-1.5 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              id="logout-button"
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-300 border border-red-500/20 transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Anti-Gambling / Virtual Points Note */}
        <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-gray-400 flex items-center justify-between">
          <span>Official Kohinoor Free Fire Contender License</span>
          <span className="text-amber-400/80 font-mono">Non-Redeemable Virtual Rewards</span>
        </div>
      </div>

      {/* STATS MATRIX (Matches, Wins, Kills, Win Rate, Positions) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 font-heading flex items-center space-x-1.5">
          <Target className="w-4 h-4 text-amber-400" />
          <span>Esports Career Statistics</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#10131e] border border-white/10 text-center">
            <div className="text-[10px] text-gray-400 uppercase font-mono">Total Tournaments</div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {currentUser.totalMatches}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Competitive Matches</div>
          </div>

          <div className="p-4 rounded-xl bg-[#10131e] border border-amber-500/30 text-center">
            <div className="text-[10px] text-amber-400 uppercase font-mono font-bold">
              Tournament Wins
            </div>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              {currentUser.wins}
            </div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">#1 Booyah Cups</div>
          </div>

          <div className="p-4 rounded-xl bg-[#10131e] border border-white/10 text-center">
            <div className="text-[10px] text-gray-400 uppercase font-mono">Total Kills</div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {currentUser.kills}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Avg {kdRatio} / match</div>
          </div>

          <div className="p-4 rounded-xl bg-[#10131e] border border-white/10 text-center">
            <div className="text-[10px] text-gray-400 uppercase font-mono">Win Rate</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {winRate}%
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Victory Ratio</div>
          </div>
        </div>

        {/* Position Stats: 1st, 2nd, 3rd, Top 10 */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="p-2 rounded-lg bg-[#141724] border border-white/5 text-center">
            <div className="text-[9px] text-gray-400 uppercase">1st Place</div>
            <div className="text-sm font-bold font-mono text-amber-400">
              {currentUser.positionStats.first}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#141724] border border-white/5 text-center">
            <div className="text-[9px] text-gray-400 uppercase">2nd Place</div>
            <div className="text-sm font-bold font-mono text-gray-300">
              {currentUser.positionStats.second}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#141724] border border-white/5 text-center">
            <div className="text-[9px] text-gray-400 uppercase">3rd Place</div>
            <div className="text-sm font-bold font-mono text-amber-700">
              {currentUser.positionStats.third}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#141724] border border-white/5 text-center">
            <div className="text-[9px] text-gray-400 uppercase">Top 10</div>
            <div className="text-sm font-bold font-mono text-cyan-400">
              {currentUser.positionStats.top10}
            </div>
          </div>
        </div>
      </div>

      {/* BADGES SHOWCASE */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-heading flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Badges & Accomplishments</span>
          </h3>
          <span className="text-[10px] text-gray-400 font-mono">
            {currentUser.badges.length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((badge) => {
            const isUnlocked = currentUser.badges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border flex items-start space-x-3 transition-all ${
                  isUnlocked
                    ? 'bg-[#151825] border-amber-500/40 text-white shadow-md shadow-amber-500/5'
                    : 'bg-[#0e1017] border-white/5 text-gray-500 opacity-60'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    isUnlocked
                      ? badge.tier === 'legendary'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                        : badge.tier === 'diamond'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                      : 'bg-gray-800 text-gray-600'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-white">{badge.name}</h4>
                    <span
                      className={`text-[9px] uppercase font-mono px-1 rounded ${
                        isUnlocked
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'bg-gray-800 text-gray-600'
                      }`}
                    >
                      {badge.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MATCH HISTORY */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 font-heading flex items-center space-x-1.5">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Recent Match History</span>
        </h3>

        {userMatches.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/5 text-center text-gray-500">
            <p className="text-xs">No completed match history yet.</p>
            <p className="text-[10px] text-gray-600 mt-1">
              Join a tournament to record placements, frags, and earn non-monetary virtual points.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {userMatches.map((m) => {
              const isTeamA = m.teamA.players.some((p) => p.userId === currentUser.id);
              const myTeamData = isTeamA ? m.teamA : m.teamB;
              const opponent = isTeamA ? m.teamB : m.teamA;
              const isWinner = m.winningTeamId === myTeamData.teamId;

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-[#12141f] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{m.tournamentName}</span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                          isWinner
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {isWinner ? '🏆 Booyah #1' : 'Concluded'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      VS <span className="text-gray-200">{opponent.teamName}</span> [{opponent.tag}]
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <div className="text-gray-400">
                      Score: <span className="text-white font-bold">{myTeamData.score || 0}</span>
                    </div>
                    <div className="text-amber-400 font-bold">
                      {isWinner ? '+3,000 VP' : '+800 VP'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0f121d] border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold font-heading uppercase mb-4">Edit Gamer Profile</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Free Fire Nickname (IGN)
                </label>
                <input
                  type="text"
                  required
                  value={editIgn}
                  onChange={(e) => setEditIgn(e.target.value)}
                  className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Free Fire Player ID (UID)
                </label>
                <input
                  type="text"
                  required
                  value={editFfId}
                  onChange={(e) => setEditFfId(e.target.value)}
                  className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Choose Avatar
                </label>
                <div className="flex items-center space-x-3">
                  {avatarPresets.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      onClick={() => setEditAvatar(url)}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        editAvatar === url
                          ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
