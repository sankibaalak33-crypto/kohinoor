import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Clock,
  MapPin,
  Users,
  Search,
  KeyRound,
  Sparkles,
  ChevronRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Gamepad2,
  BookOpen,
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';
import { Tournament, FreeFireMode } from '../types';
import { TournamentDetailModal } from './TournamentDetailModal';
import { FreeFireModesModal } from './FreeFireModesModal';
import { FREE_FIRE_MODES, getModeInfo } from '../data/modes';

interface HomeDashboardProps {
  onNavigate: (tab: 'home' | 'matches' | 'teams' | 'leaderboard' | 'profile' | 'admin') => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onNavigate }) => {
  const { tournaments, myTeam } = useTournaments();
  const { currentUser, isAdmin } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isModesModalOpen, setIsModesModalOpen] = useState(false);

  const filteredTournaments = tournaments.filter((t) => {
    // Category filter
    if (selectedCategory === 'live' && t.status !== 'live') return false;
    if (
      selectedCategory === 'upcoming' &&
      t.status !== 'upcoming' &&
      t.status !== 'registration_open' &&
      t.status !== 'registration_closed'
    )
      return false;
    if (selectedCategory === 'completed' && t.status !== 'completed') return false;

    // Mode filter
    if (selectedMode !== 'all' && t.mode !== selectedMode) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchMode = t.mode.toLowerCase().includes(q);
      const matchMap = t.map.toLowerCase().includes(q);
      return matchName || matchMode || matchMap;
    }

    return true;
  });

  const liveTournamentsCount = tournaments.filter((t) => t.status === 'live').length;
  const upcomingCount = tournaments.filter(
    (t) => t.status === 'upcoming' || t.status === 'registration_open'
  ).length;

  return (
    <div id="home-dashboard" className="space-y-6 pb-20">
      {/* HERO ESPORTS PROMO BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#181102] via-[#151726] to-[#0c0e17] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL FREE FIRE ESPORTS PORTAL</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-wide uppercase text-white leading-tight">
            KOHINOOR <span className="gold-gradient-text">TOURNAMENTS</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
            Compete in 100% free-entry Free Fire squad tournaments. Build your 4-player squad,
            secure room credentials, Booyah your way to the top, and claim official non-monetary
            Virtual Points & Hall of Fame badges.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => onNavigate('teams')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 active:scale-95 flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>{myTeam ? 'Manage My Squad' : 'Form 4-Player Squad'}</span>
            </button>

            <button
              onClick={() => onNavigate('leaderboard')}
              className="px-4 py-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 text-white font-semibold text-xs border border-white/10 transition-all flex items-center space-x-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Hall of Fame</span>
            </button>
          </div>
        </div>

        {/* Squad Status Mini-Card */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-amber-400" />
            {myTeam ? (
              <span>
                Your Squad:{' '}
                <strong className="text-white">
                  {myTeam.name} [{myTeam.tag}]
                </strong>{' '}
                ({myTeam.members.length}/4 Players)
              </span>
            ) : (
              <span className="text-gray-400">
                You have not joined a squad yet.{' '}
                <button
                  onClick={() => onNavigate('teams')}
                  className="text-amber-400 underline font-semibold ml-1"
                >
                  Create one now
                </button>
              </span>
            )}
          </div>

          {myTeam && (
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                myTeam.members.length === 4
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {myTeam.members.length === 4
                ? '✓ 4/4 Verified Roster'
                : `⚠️ Needs ${4 - myTeam.members.length} player(s)`}
            </span>
          )}
        </div>
      </div>

      {/* QUICK STATS & ROLE BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setSelectedCategory('live')}
          className="p-3.5 rounded-2xl bg-[#0e111d] border border-red-500/20 hover:border-red-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-red-400 font-bold">Live Action</span>
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="text-xl font-extrabold font-mono text-white mt-1">
            {liveTournamentsCount} Cups
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Rooms active now</div>
        </div>

        <div
          onClick={() => setSelectedCategory('upcoming')}
          className="p-3.5 rounded-2xl bg-[#0e111d] border border-amber-500/20 hover:border-amber-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">Open Cups</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-white mt-1">{upcomingCount} Cups</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Registration open</div>
        </div>

        <div
          onClick={() => onNavigate('matches')}
          className="p-3.5 rounded-2xl bg-[#0e111d] border border-blue-500/20 hover:border-blue-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-blue-400 font-bold">My Matches</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-white mt-1">
            {currentUser?.totalMatches || 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Participated</div>
        </div>

        <div
          onClick={() => onNavigate('profile')}
          className="p-3.5 rounded-2xl bg-[#0e111d] border border-yellow-500/20 hover:border-yellow-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-yellow-400 font-bold">My Balance</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-xl font-extrabold font-mono text-yellow-400 mt-1">
            {currentUser?.virtualPoints.toLocaleString() || 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Virtual Points (VP)</div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex rounded-xl bg-gray-900/90 p-1 border border-white/10 text-xs font-semibold overflow-x-auto">
          <button
            id="tab-all-tournaments"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({tournaments.length})
          </button>
          <button
            id="tab-live-tournaments"
            onClick={() => setSelectedCategory('live')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'live'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Live Now ({liveTournamentsCount})
          </button>
          <button
            id="tab-upcoming-tournaments"
            onClick={() => setSelectedCategory('upcoming')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'upcoming'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            id="tab-completed-tournaments"
            onClick={() => setSelectedCategory('completed')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === 'completed'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            id="search-tournaments-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tournament, map or mode..."
            className="w-full bg-[#141724] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* FREE FIRE MODES HORIZONTAL FILTER BAR & CODEX BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[#0e111d] border border-white/5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-[10px] uppercase font-mono text-gray-400 font-bold whitespace-nowrap mr-1 flex items-center space-x-1">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Modes:</span>
          </span>
          <button
            onClick={() => setSelectedMode('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMode === 'all'
                ? 'bg-white text-black font-bold'
                : 'bg-[#161928] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            All Modes
          </button>
          <button
            onClick={() => setSelectedMode('Battle Royale Squad')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMode === 'Battle Royale Squad'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-[#161928] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            BR Squad
          </button>
          <button
            onClick={() => setSelectedMode('Clash Squad 4v4')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMode === 'Clash Squad 4v4'
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-[#161928] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            Clash Squad 4v4
          </button>
          <button
            onClick={() => setSelectedMode('Lone Wolf 1v1')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMode === 'Lone Wolf 1v1'
                ? 'bg-purple-500 text-white font-bold'
                : 'bg-[#161928] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            Lone Wolf 1v1
          </button>
          <button
            onClick={() => setSelectedMode('Bomb Squad 5v5')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMode === 'Bomb Squad 5v5'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-[#161928] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            Bomb Squad 5v5
          </button>
          <button
            onClick={() => setSelectedMode('Team Deathmatch')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMode === 'Team Deathmatch'
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-[#161928] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            TDM
          </button>
          <button
            onClick={() => setSelectedMode('Craftland Custom')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMode === 'Craftland Custom'
                ? 'bg-fuchsia-500 text-white font-bold'
                : 'bg-[#161928] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            Craftland
          </button>
          <button
            onClick={() => setSelectedMode('Rush Hour')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMode === 'Rush Hour'
                ? 'bg-orange-500 text-black font-bold'
                : 'bg-[#161928] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            Rush Hour
          </button>
        </div>

        {/* Explore All 14 Modes Button */}
        <button
          onClick={() => setIsModesModalOpen(true)}
          className="self-end sm:self-auto px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:from-amber-500/20 hover:to-yellow-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center space-x-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Modes Codex ({FREE_FIRE_MODES.length})</span>
        </button>
      </div>

      {/* TOURNAMENT CARDS GRID */}
      {filteredTournaments.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0f121d] border border-white/5 text-center text-gray-400 space-y-2">
          <Trophy className="w-8 h-8 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-gray-300">No tournaments match criteria</h3>
          <p className="text-xs text-gray-500">
            {selectedMode !== 'all'
              ? `No tournaments currently found for "${selectedMode}". Try clicking "All Modes" or exploring other modes!`
              : 'Check another category or clear your search terms to explore available cups.'}
          </p>
          {selectedMode !== 'all' && (
            <button
              onClick={() => setSelectedMode('all')}
              className="mt-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
            >
              Reset Mode Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTournaments.map((tourn) => {
            const isRegistered = myTeam && tourn.registeredTeamIds.includes(myTeam.id);
            const modeInfo = getModeInfo(tourn.mode);

            return (
              <div
                key={tourn.id}
                id={`tournament-card-${tourn.id}`}
                className="rounded-2xl bg-[#0f121d] border border-amber-500/20 hover:border-amber-500/40 p-5 shadow-xl transition-all relative flex flex-col justify-between overflow-hidden group"
              >
                {/* Decorative background glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />

                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${modeInfo.badgeColor}`}
                      >
                        {tourn.mode}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{tourn.map}</span>
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        tourn.status === 'live'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                          : tourn.status === 'registration_open'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {tourn.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-heading uppercase text-white tracking-wide group-hover:text-amber-300 transition-colors">
                    {tourn.name}
                  </h3>

                  {/* Rewards & Entry Breakdown */}
                  <div className="mt-3 p-2.5 rounded-xl bg-[#141724] border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-400 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Decreased VP Pool:</span>
                      </span>
                      <span className="text-amber-400 font-bold">
                        {tourn.pointPool.toLocaleString()} VP
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono pb-1 border-b border-white/5">
                      <span className="text-gray-400">Entry / Stake:</span>
                      <span className="text-emerald-400 font-bold">
                        {tourn.entryFee && tourn.entryFee > 0 ? `${tourn.entryFee} VP (Decreased)` : '0 VP (100% Free)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center pt-0.5">
                      <span className="text-amber-300">
                        1st: {tourn.virtualPointsDistribution.first.toLocaleString()}
                      </span>
                      <span className="text-gray-300">
                        2nd: {tourn.virtualPointsDistribution.second.toLocaleString()}
                      </span>
                      <span className="text-amber-700">
                        3rd: {tourn.virtualPointsDistribution.third.toLocaleString()}
                      </span>
                      <span className="text-gray-400">
                        4th: {tourn.virtualPointsDistribution.fourth.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-2">
                    <div className="flex items-center space-x-1 font-mono">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <span>
                        {tourn.registeredTeamIds.length} / {tourn.maxTeams} Squads
                      </span>
                    </div>

                    {tourn.roomInfo?.isPublished ? (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1 font-bold">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Room Credentials Ready</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-gray-500">
                        Room 15m pre-match
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    {isRegistered ? (
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enrolled</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono flex items-center space-x-1">
                        <span className="text-gray-400">Entry:</span>
                        <span className="text-emerald-400 font-bold">
                          {tourn.entryFee && tourn.entryFee > 0 ? `${tourn.entryFee} VP` : 'Free (0 VP)'}
                        </span>
                      </span>
                    )}
                  </div>

                  <button
                    id={`open-tournament-btn-${tourn.id}`}
                    onClick={() => setSelectedTournament(tourn)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1 shadow-md active:scale-95 transition-all"
                  >
                    <span>View & Register</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TOURNAMENT DETAIL & REGISTRATION MODAL */}
      {selectedTournament && (
        <TournamentDetailModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
          onOpenSquadHub={() => onNavigate('teams')}
        />
      )}

      {/* FREE FIRE MODES CODEX MODAL */}
      <FreeFireModesModal
        isOpen={isModesModalOpen}
        onClose={() => setIsModesModalOpen(false)}
        onSelectMode={(mode) => {
          setSelectedMode(mode);
        }}
      />
    </div>
  );
};
