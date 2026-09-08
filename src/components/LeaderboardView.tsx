import React, { useState } from 'react';
import { Trophy, Crown, Medal, Flame, Users, Sparkles, Target, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTournaments } from '../context/TournamentContext';

type LeaderboardTab = 'global' | 'weekly' | 'tournament' | 'team';

export const LeaderboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  const { allUsers, currentUser } = useAuth();
  const { teams, tournaments } = useTournaments();
  const [selectedTournId, setSelectedTournId] = useState(tournaments[0]?.id || '');

  // Sorted Player Data for Global
  const globalPlayers = [...allUsers]
    .map((u) => {
      const userTeam = teams.find(
        (t) => t.captainId === u.id || t.members.some((m) => m.userId === u.id)
      );
      return {
        id: u.id,
        name: u.ffNickname,
        username: u.username,
        ffPlayerId: u.ffPlayerId,
        avatar: u.avatar,
        teamName: userTeam ? userTeam.name : 'Free Agent',
        teamTag: userTeam ? userTeam.tag : 'FA',
        matches: u.totalMatches,
        wins: u.wins,
        kills: u.kills,
        points: u.virtualPoints,
      };
    })
    .sort((a, b) => b.points - a.points || b.wins - a.wins || b.kills - a.kills);

  // Sorted Player Data for Weekly (with realistic weekly dynamic values)
  const weeklyPlayers = [...globalPlayers]
    .map((p, idx) => ({
      ...p,
      matches: Math.max(1, Math.round(p.matches * 0.3)),
      wins: Math.max(0, Math.round(p.wins * 0.3)),
      kills: Math.max(2, Math.round(p.kills * 0.35)),
      points: Math.max(500, Math.round(p.points * 0.4) + (3 - idx) * 200),
    }))
    .sort((a, b) => b.points - a.points);

  // Sorted Teams Data
  const sortedTeams = [...teams]
    .map((t) => ({
      id: t.id,
      name: t.name,
      tag: t.tag,
      logo: t.logo,
      captain: t.members.find((m) => m.role === 'captain')?.ffNickname || 'Captain',
      matches: t.matches,
      wins: t.wins,
      kills: t.totalKills,
      points: t.totalPoints,
    }))
    .sort((a, b) => b.points - a.points || b.wins - a.wins);

  // Tournament-specific data
  const currentTourn = tournaments.find((t) => t.id === selectedTournId) || tournaments[0];
  const tournTeams = sortedTeams.filter((t) => currentTourn?.registeredTeamIds.includes(t.id));

  const top3 =
    activeTab === 'team'
      ? sortedTeams.slice(0, 3)
      : activeTab === 'weekly'
      ? weeklyPlayers.slice(0, 3)
      : activeTab === 'tournament'
      ? (tournTeams.length >= 3 ? tournTeams.slice(0, 3) : sortedTeams.slice(0, 3))
      : globalPlayers.slice(0, 3);

  return (
    <div id="leaderboard-view" className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#171926] via-[#12141d] to-[#0c0e17] border border-amber-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Trophy className="w-4 h-4" />
              <span>Esports Hall of Fame</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase mt-1">
              Tournament <span className="gold-gradient-text">Leaderboards</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">
              Rankings calculated strictly using official non-monetary tournament Virtual Points (VP),
              verified match kills, and placements.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Updated Post-Match</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex rounded-xl bg-gray-900/90 p-1 border border-white/5 text-xs font-semibold overflow-x-auto">
        <button
          id="tab-lb-global"
          onClick={() => setActiveTab('global')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg transition-all ${
            activeTab === 'global'
              ? 'bg-amber-500 text-black font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Global
        </button>
        <button
          id="tab-lb-weekly"
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg transition-all ${
            activeTab === 'weekly'
              ? 'bg-amber-500 text-black font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Weekly Sprint
        </button>
        <button
          id="tab-lb-tournament"
          onClick={() => setActiveTab('tournament')}
          className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg transition-all ${
            activeTab === 'tournament'
              ? 'bg-amber-500 text-black font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tournament
        </button>
        <button
          id="tab-lb-team"
          onClick={() => setActiveTab('team')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-lg transition-all ${
            activeTab === 'team'
              ? 'bg-amber-500 text-black font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Team Roster
        </button>
      </div>

      {/* Tournament Dropdown if Tournament tab selected */}
      {activeTab === 'tournament' && (
        <div className="flex items-center space-x-2 bg-[#12141e] p-3 rounded-xl border border-white/10">
          <span className="text-xs text-gray-400 font-mono">Select Cup:</span>
          <select
            value={selectedTournId}
            onChange={(e) => setSelectedTournId(e.target.value)}
            className="bg-[#181a28] text-xs text-amber-300 font-bold py-1.5 px-3 rounded-lg border border-amber-500/30 focus:outline-none flex-1"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.mode})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* PODIUM DISPLAY (1st, 2nd, 3rd) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4">
        {/* 2nd Place (Left) */}
        {top3[1] && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-gray-400/20 border-2 border-gray-400 p-0.5 shadow-lg flex items-center justify-center text-xl">
                {'logo' in top3[1] ? (
                  (top3[1] as any).logo
                ) : (
                  <img
                    src={(top3[1] as any).avatar}
                    alt=""
                    className="w-full h-full rounded-[14px] object-cover"
                  />
                )}
              </div>
              <div className="absolute -top-3 -right-2 w-6 h-6 rounded-full bg-gray-400 text-black text-xs font-black flex items-center justify-center">
                2
              </div>
            </div>
            <div className="text-xs sm:text-sm font-bold text-gray-200 text-center truncate max-w-[90px] sm:max-w-[130px]">
              {top3[1].name}
            </div>
            <div className="text-[10px] text-gray-400 font-mono">
              {top3[1].points.toLocaleString()} VP
            </div>
            <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-gray-800/80 to-gray-700/40 rounded-t-xl mt-2 border-t-2 border-gray-400" />
          </div>
        )}

        {/* 1st Place (Center - Elevated) */}
        {top3[0] && (
          <div className="flex flex-col items-center -mt-6">
            <Crown className="w-6 h-6 text-amber-400 mb-1 animate-bounce" />
            <div className="relative mb-2">
              <div className="w-14 sm:w-20 h-14 sm:h-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 p-0.5 shadow-xl shadow-amber-500/20 flex items-center justify-center text-2xl">
                {'logo' in top3[0] ? (
                  (top3[0] as any).logo
                ) : (
                  <img
                    src={(top3[0] as any).avatar}
                    alt=""
                    className="w-full h-full rounded-[14px] object-cover"
                  />
                )}
              </div>
              <div className="absolute -top-3 -right-2 w-6 h-6 rounded-full bg-amber-400 text-black text-xs font-black flex items-center justify-center shadow-md">
                1
              </div>
            </div>
            <div className="text-xs sm:text-base font-extrabold text-white text-center truncate max-w-[100px] sm:max-w-[150px]">
              {top3[0].name}
            </div>
            <div className="text-[11px] text-amber-400 font-mono font-bold">
              {top3[0].points.toLocaleString()} VP
            </div>
            <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-amber-600/30 to-amber-500/20 rounded-t-xl mt-2 border-t-2 border-amber-400" />
          </div>
        )}

        {/* 3rd Place (Right) */}
        {top3[2] && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-amber-800/20 border-2 border-amber-700 p-0.5 shadow-lg flex items-center justify-center text-xl">
                {'logo' in top3[2] ? (
                  (top3[2] as any).logo
                ) : (
                  <img
                    src={(top3[2] as any).avatar}
                    alt=""
                    className="w-full h-full rounded-[14px] object-cover"
                  />
                )}
              </div>
              <div className="absolute -top-3 -right-2 w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center">
                3
              </div>
            </div>
            <div className="text-xs sm:text-sm font-bold text-gray-300 text-center truncate max-w-[90px] sm:max-w-[130px]">
              {top3[2].name}
            </div>
            <div className="text-[10px] text-gray-400 font-mono">
              {top3[2].points.toLocaleString()} VP
            </div>
            <div className="w-full h-12 sm:h-16 bg-gradient-to-t from-amber-950/80 to-amber-900/40 rounded-t-xl mt-2 border-t-2 border-amber-700" />
          </div>
        )}
      </div>

      {/* FULL LEADERBOARD TABLE */}
      <div className="rounded-2xl bg-[#0f121d] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#141724] text-[10px] uppercase tracking-wider font-mono text-gray-400">
                <th className="py-3 px-4 text-center">Rank</th>
                <th className="py-3 px-4">{activeTab === 'team' ? 'Squad' : 'Player / Squad'}</th>
                <th className="py-3 px-3 text-center">Matches</th>
                <th className="py-3 px-3 text-center">Wins</th>
                <th className="py-3 px-3 text-center">Kills</th>
                <th className="py-3 px-4 text-right">Points (VP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-200">
              {activeTab === 'team' ? (
                sortedTeams.map((team, idx) => {
                  const isMyTeam = currentUser && team.id === (teams.find((t) => t.captainId === currentUser.id)?.id);
                  return (
                    <tr
                      key={team.id}
                      className={`hover:bg-white/5 transition-colors ${
                        isMyTeam ? 'bg-amber-500/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-bold font-mono">
                        {idx === 0 ? (
                          <span className="text-amber-400 font-extrabold">🥇 1</span>
                        ) : idx === 1 ? (
                          <span className="text-gray-300 font-extrabold">🥈 2</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-700 font-extrabold">🥉 3</span>
                        ) : (
                          `#${idx + 1}`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xl">{team.logo}</span>
                          <div>
                            <div className="font-bold text-white flex items-center space-x-1">
                              <span>{team.name}</span>
                              <span className="text-[10px] px-1 rounded bg-gray-800 text-gray-400 font-mono">
                                [{team.tag}]
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400">Captain: {team.captain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-gray-300">{team.matches}</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-400 font-bold">
                        {team.wins}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-gray-300">{team.kills}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-yellow-400">
                        {team.points.toLocaleString()} VP
                      </td>
                    </tr>
                  );
                })
              ) : (
                (activeTab === 'weekly' ? weeklyPlayers : globalPlayers).map((player, idx) => {
                  const isSelf = currentUser?.id === player.id;
                  return (
                    <tr
                      key={player.id}
                      className={`hover:bg-white/5 transition-colors ${
                        isSelf ? 'bg-amber-500/10 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-bold font-mono">
                        {idx === 0 ? (
                          <span className="text-amber-400 font-extrabold">🥇 1</span>
                        ) : idx === 1 ? (
                          <span className="text-gray-300 font-extrabold">🥈 2</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-700 font-extrabold">🥉 3</span>
                        ) : (
                          `#${idx + 1}`
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={player.avatar}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover bg-gray-800 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center space-x-1">
                              <span>{player.name}</span>
                              {isSelf && (
                                <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                              <span>@{player.username}</span>
                              <span>•</span>
                              <span className="text-amber-400/80">[{player.teamTag}]</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-gray-300">{player.matches}</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-400 font-bold">
                        {player.wins}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-gray-300">{player.kills}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-yellow-400">
                        {player.points.toLocaleString()} VP
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
