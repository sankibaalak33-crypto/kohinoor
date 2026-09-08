import React, { useState } from 'react';
import { Swords, Clock, Trophy, Shield, KeyRound, AlertCircle } from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';
import { MatchCard } from './MatchCard';
import { Match } from '../types';

export const MyMatchesView: React.FC = () => {
  const { matches, myTeam, tournaments } = useTournaments();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [rulesMatch, setRulesMatch] = useState<Match | null>(null);

  // Filter matches involving current user or current user's team
  const userMatches = matches.filter((m) => {
    if (!currentUser) return false;
    const inTeamA =
      (myTeam && m.teamA.teamId === myTeam.id) ||
      m.teamA.players.some((p) => p.userId === currentUser.id);
    const inTeamB =
      (myTeam && m.teamB.teamId === myTeam.id) ||
      m.teamB.players.some((p) => p.userId === currentUser.id);
    return inTeamA || inTeamB;
  });

  const displayedMatches = userMatches.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return m.status === 'scheduled';
    return m.status === filter;
  });

  return (
    <div id="my-matches-view" className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#171926] via-[#12141d] to-[#0c0e17] border border-amber-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Swords className="w-4 h-4" />
              <span>Personal Match Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase mt-1">
              My Squad <span className="gold-gradient-text">Matches</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">
              Track your scheduled 4v4 showdowns, live custom room credentials, and concluded match
              placements.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-gray-300 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            <span>Squad:</span>
            <span className="text-amber-400 font-bold">{myTeam ? myTeam.name : 'No Squad Assigned'}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex rounded-xl bg-gray-900/80 p-1 border border-white/10 text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            filter === 'all' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          All Matches ({userMatches.length})
        </button>
        <button
          onClick={() => setFilter('live')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            filter === 'live' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          Live ({userMatches.filter((m) => m.status === 'live').length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            filter === 'upcoming' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          Upcoming ({userMatches.filter((m) => m.status === 'scheduled').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-2 rounded-lg transition-all ${
            filter === 'completed' ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          Concluded ({userMatches.filter((m) => m.status === 'completed').length})
        </button>
      </div>

      {/* Matches List */}
      {displayedMatches.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0f121d] border border-white/5 text-center text-gray-400 space-y-2">
          <Swords className="w-8 h-8 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-gray-300">No matches found in this category</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {myTeam
              ? 'Register your 4-player squad in an upcoming tournament to generate match fixtures.'
              : 'Create or join a 4-player squad first to participate in esports tournaments.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onOpenRules={() => setRulesMatch(match)}
            />
          ))}
        </div>
      )}

      {/* Rules Modal */}
      {rulesMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0f121d] border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold font-heading uppercase mb-2">
              Match #{rulesMatch.matchNumber} Rules
            </h3>
            <p className="text-xs text-gray-400 mb-4">{rulesMatch.tournamentName}</p>

            <ul className="space-y-2 text-xs text-gray-300 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
              {(
                rulesMatch.rules ||
                tournaments.find((t) => t.id === rulesMatch.tournamentId)?.rules || [
                  'Standard competitive Free Fire fair play rules apply.',
                  'No third-party emulators, scripts, or weapon modifiers.',
                  'Match room credentials accessible in Squad Hub upon publish.',
                ]
              ).map((rule, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-400">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setRulesMatch(null)}
              className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
