import React, { useState } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  Trophy,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserX,
  UserCheck,
  Send,
  Sparkles,
  Search,
  Clock,
  MapPin,
  Users,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';
import { FreeFireMode, FreeFireMap, MatchResultData, Tournament } from '../types';
import { FREE_FIRE_MODES, getModeInfo } from '../data/modes';

type AdminTab = 'tournaments' | 'create' | 'results' | 'players' | 'broadcast';

export const AdminPanel: React.FC = () => {
  const {
    tournaments,
    matches,
    createTournament,
    updateTournament,
    cancelTournament,
    publishRoomInfo,
    toggleRegistrationStatus,
    enterMatchResult,
    sendNotification,
  } = useTournaments();
  const { allUsers, toggleBanUser } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('tournaments');

  // 1. Create Tournament Form State
  const [tName, setTName] = useState('');
  const [tMode, setTMode] = useState<FreeFireMode>('Battle Royale Squad');
  const [tMap, setTMap] = useState<FreeFireMap>('Bermuda');
  const [tMaxTeams, setTMaxTeams] = useState(12);
  const [tPool, setTPool] = useState(1500);
  const [tEntryFee, setTEntryFee] = useState(0);
  const [tRegOpen, setTRegOpen] = useState(new Date().toISOString().slice(0, 16));
  const [tRegClose, setTRegClose] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [tMatchStart, setTMatchStart] = useState(
    new Date(Date.now() + 90000000).toISOString().slice(0, 16)
  );
  const [tRules, setTRules] = useState(
    'No emulator or third-party scripts.\nRoom ID published 15 minutes before match.\n100% Free Entry • Non-Monetary Virtual Points only.'
  );
  const [formMsg, setFormMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // 2. Publish Room Modal State
  const [roomModalTourn, setRoomModalTourn] = useState<Tournament | null>(null);
  const [inputRoomId, setInputRoomId] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputNotes, setInputNotes] = useState('');

  // 3. Match Result Entry State
  const [selectedMatchId, setSelectedMatchId] = useState(
    matches.find((m) => m.status !== 'completed')?.id || matches[0]?.id || ''
  );
  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const selectedTourn = tournaments.find((t) => t.id === selectedMatch?.tournamentId);

  const [winningTeam, setWinningTeam] = useState<'teamA' | 'teamB'>('teamA');
  const [teamAScore, setTeamAScore] = useState(35);
  const [teamAKills, setTeamAKills] = useState(14);
  const [teamBScore, setTeamBScore] = useState(20);
  const [teamBKills, setTeamBKills] = useState(9);
  const [resultStatus, setResultStatus] = useState<string | null>(null);

  // 4. Player search
  const [playerQuery, setPlayerQuery] = useState('');

  // 5. Broadcast alert
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Handle Create Tournament
  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    if (!tName.trim()) {
      setFormMsg({ text: 'Please specify a tournament name', isError: true });
      return;
    }

    const rulesArr = tRules
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const res = createTournament({
      name: tName.trim(),
      mode: tMode,
      map: tMap,
      maxTeams: Number(tMaxTeams),
      teamsPerMatch: 2,
      playersPerTeam: 4,
      registrationOpenTime: new Date(tRegOpen).toISOString(),
      registrationCloseTime: new Date(tRegClose).toISOString(),
      matchStartTime: new Date(tMatchStart).toISOString(),
      rules: rulesArr,
      entryFee: Number(tEntryFee),
      pointPool: Number(tPool),
      badgesAwarded: ['badge-grandmaster', 'badge-bermuda-conqueror'],
    });

    if (res.success) {
      const feeText = Number(tEntryFee) > 0 ? `Entry Fee: ${tEntryFee} VP.` : '100% Free Entry.';
      setFormMsg({
        text: `Tournament "${tName}" initialized (${feeText})! Virtual point pool: 1st=25%, 2nd=20%, 3rd=15%, 4th=10%.`,
        isError: false,
      });
      setTName('');
      setTimeout(() => {
        setActiveTab('tournaments');
      }, 1200);
    }
  };

  // Handle Room Publishing
  const handlePublishRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomModalTourn || !inputRoomId.trim() || !inputPassword.trim()) return;

    publishRoomInfo(
      roomModalTourn.id,
      inputRoomId.trim(),
      inputPassword.trim(),
      inputNotes.trim()
    );
    setRoomModalTourn(null);
  };

  // Handle Match Results Submit (1st = 25%, 2nd = 20%, 3rd = 15%, 4th = 10%)
  const handleSubmitResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !selectedTourn) return;

    const pool = selectedTourn.pointPool;
    const firstPlacePoints = Math.round(pool * 0.25);
    const secondPlacePoints = Math.round(pool * 0.20);

    const isWinnerA = winningTeam === 'teamA';

    const resultData: MatchResultData = {
      matchId: selectedMatch.id,
      tournamentId: selectedTourn.id,
      winningTeamId: isWinnerA ? selectedMatch.teamA.teamId : selectedMatch.teamB.teamId,
      winningTeamName: isWinnerA ? selectedMatch.teamA.teamName : selectedMatch.teamB.teamName,
      enteredAt: new Date().toISOString(),
      enteredBy: 'Official Admin Marshal',
      teamResults: [
        {
          teamId: selectedMatch.teamA.teamId,
          teamName: selectedMatch.teamA.teamName,
          placement: isWinnerA ? 1 : 2,
          score: Number(teamAScore),
          kills: Number(teamAKills),
          virtualPointsAwarded: isWinnerA ? firstPlacePoints : secondPlacePoints,
          playerKills: selectedMatch.teamA.players.map((p, idx) => ({
            userId: p.userId,
            ffNickname: p.ffNickname,
            kills: Math.max(1, Math.round(teamAKills / 4) + (idx === 0 ? 1 : 0)),
          })),
        },
        {
          teamId: selectedMatch.teamB.teamId,
          teamName: selectedMatch.teamB.teamName,
          placement: isWinnerA ? 2 : 1,
          score: Number(teamBScore),
          kills: Number(teamBKills),
          virtualPointsAwarded: isWinnerA ? secondPlacePoints : firstPlacePoints,
          playerKills: selectedMatch.teamB.players.map((p, idx) => ({
            userId: p.userId,
            ffNickname: p.ffNickname,
            kills: Math.max(1, Math.round(teamBKills / 4)),
          })),
        },
      ],
    };

    const res = enterMatchResult(resultData);
    if (res.success) {
      setResultStatus(
        `Results published! Winner: ${resultData.winningTeamName}. Distributed ${firstPlacePoints} VP (25%) and ${secondPlacePoints} VP (20%). Stats updated!`
      );
      setTimeout(() => setResultStatus(null), 4000);
    }
  };

  // Handle Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    sendNotification('all', broadcastTitle.trim(), broadcastMessage.trim(), 'admin_announcement');
    setBroadcastSent(true);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(playerQuery.toLowerCase()) ||
      u.ffNickname.toLowerCase().includes(playerQuery.toLowerCase()) ||
      u.ffPlayerId.toLowerCase().includes(playerQuery.toLowerCase())
  );

  return (
    <div id="admin-panel-view" className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-red-950/40 via-[#18121a] to-[#0c0e17] border border-red-500/30 text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-red-400 uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4" />
              <span>Admin & Tournament Marshal Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading uppercase mt-1">
              Tournament <span className="gold-gradient-text">Operations</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">
              Manage tournaments, publish room credentials, enter official match placements, manage
              player fair play compliance, and broadcast alerts.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono font-bold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>Marshal Authority Active</span>
          </div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex rounded-xl bg-gray-900/90 p-1 border border-white/10 text-xs font-semibold overflow-x-auto">
        <button
          id="admin-tab-tournaments"
          onClick={() => setActiveTab('tournaments')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg transition-all ${
            activeTab === 'tournaments'
              ? 'bg-red-500 text-white font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tournaments
        </button>
        <button
          id="admin-tab-create"
          onClick={() => setActiveTab('create')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg transition-all ${
            activeTab === 'create'
              ? 'bg-red-500 text-white font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          + Create Cup
        </button>
        <button
          id="admin-tab-results"
          onClick={() => setActiveTab('results')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg transition-all ${
            activeTab === 'results'
              ? 'bg-red-500 text-white font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Enter Results
        </button>
        <button
          id="admin-tab-players"
          onClick={() => setActiveTab('players')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg transition-all ${
            activeTab === 'players'
              ? 'bg-red-500 text-white font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Players ({allUsers.length})
        </button>
        <button
          id="admin-tab-broadcast"
          onClick={() => setActiveTab('broadcast')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg transition-all ${
            activeTab === 'broadcast'
              ? 'bg-red-500 text-white font-bold shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Broadcast Alert
        </button>
      </div>

      {/* 1. TOURNAMENT MANAGEMENT TAB */}
      {activeTab === 'tournaments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 font-heading">
              Active & Scheduled Tournaments ({tournaments.length})
            </h3>
            <button
              onClick={() => setActiveTab('create')}
              className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {tournaments.map((tourn) => (
              <div
                key={tourn.id}
                className="p-4 rounded-xl bg-[#10131e] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white uppercase">{tourn.name}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        tourn.status === 'live'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : tourn.status === 'registration_open'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {tourn.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 flex flex-wrap items-center gap-3 font-mono">
                    <span>Mode: {tourn.mode}</span>
                    <span>•</span>
                    <span>Map: {tourn.map}</span>
                    <span>•</span>
                    <span className="text-amber-400">Pool: {tourn.pointPool.toLocaleString()} VP</span>
                    <span>•</span>
                    <span className="text-emerald-400">
                      Entry: {tourn.entryFee && tourn.entryFee > 0 ? `${tourn.entryFee} VP` : 'Free (0 VP)'}
                    </span>
                    <span>•</span>
                    <span>Squads: {tourn.registeredTeamIds.length} / {tourn.maxTeams}</span>
                  </div>

                  {tourn.roomInfo?.isPublished && (
                    <div className="text-xs text-emerald-400 font-mono flex items-center space-x-2 pt-1">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>
                        Room ID: {tourn.roomInfo.roomId} | Pass: {tourn.roomInfo.password}
                      </span>
                    </div>
                  )}
                </div>

                {/* Operations Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setRoomModalTourn(tourn);
                      setInputRoomId(tourn.roomInfo?.roomId || '');
                      setInputPassword(tourn.roomInfo?.password || '');
                      setInputNotes(tourn.roomInfo?.notes || '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{tourn.roomInfo?.isPublished ? 'Edit Room' : 'Publish Room'}</span>
                  </button>

                  <button
                    onClick={() => toggleRegistrationStatus(tourn.id)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-200"
                  >
                    {tourn.status === 'registration_open' ? 'Close Reg' : 'Open Reg'}
                  </button>

                  {tourn.status !== 'cancelled' && (
                    <button
                      onClick={() => cancelTournament(tourn.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-xs text-red-400 border border-red-500/20"
                    >
                      Cancel Cup
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CREATE TOURNAMENT FORM TAB */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#10131e] border border-amber-500/30 text-white shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold font-heading uppercase flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-amber-400" />
              <span>Host Free Fire Tournament</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Configure competitive parameters. Virtual points reward pool is strictly non-monetary.
            </p>
          </div>

          {formMsg && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs flex items-center space-x-2 ${
                formMsg.isError
                  ? 'bg-red-950/60 border border-red-500/40 text-red-200'
                  : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
              }`}
            >
              {formMsg.isError ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              )}
              <span>{formMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Tournament Name
              </label>
              <input
                type="text"
                required
                value={tName}
                onChange={(e) => setTName(e.target.value)}
                placeholder="e.g. KOHINOOR BERMUDA INVITATIONAL S5"
                className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none uppercase"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Free Fire Game Mode ({FREE_FIRE_MODES.length} Supported)
                </label>
                <select
                  value={tMode}
                  onChange={(e) => {
                    const newMode = e.target.value as FreeFireMode;
                    setTMode(newMode);
                    const modeMeta = getModeInfo(newMode);
                    if (modeMeta.recommendedMaps.length > 0 && !modeMeta.recommendedMaps.includes(tMap)) {
                      setTMap(modeMeta.recommendedMaps[0]);
                    }
                    if (modeMeta.defaultRules.length > 0) {
                      setTRules(modeMeta.defaultRules.join('\n'));
                    }
                  }}
                  className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <optgroup label="Battle Royale Modes">
                    <option value="Battle Royale Squad">Battle Royale Squad (4v4v4...)</option>
                    <option value="Battle Royale Duo">Battle Royale Duo (2v2v2...)</option>
                    <option value="Battle Royale Solo">Battle Royale Solo (1v1v1...)</option>
                    <option value="Rush Hour">Rush Hour (Fast 20-Player Blitz)</option>
                  </optgroup>
                  <optgroup label="Tactical & Clash Squad">
                    <option value="Clash Squad 4v4">Clash Squad 4v4 (Store Economy)</option>
                    <option value="Bomb Squad 5v5">Bomb Squad 5v5 (Search & Defuse)</option>
                  </optgroup>
                  <optgroup label="Duels & Mechanical">
                    <option value="Lone Wolf 1v1">Lone Wolf 1v1 (Iron Cage Duel)</option>
                    <option value="Lone Wolf 2v2">Lone Wolf 2v2 (Duo Showdown)</option>
                    <option value="Lone Wolf">Lone Wolf (Standard)</option>
                  </optgroup>
                  <optgroup label="Arcade & Esports Scrims">
                    <option value="Team Deathmatch">Team Deathmatch (40 Kills)</option>
                    <option value="Craftland Custom">Craftland Custom (Scrims / Pro)</option>
                    <option value="Gun King">Gun King (Weapon Progression)</option>
                    <option value="Rampage United">Rampage United (Hyper Buffs)</option>
                    <option value="Big Head Mode">Big Head Mode (Fun Headshots)</option>
                  </optgroup>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  {getModeInfo(tMode).tagline}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Battle Map
                </label>
                <select
                  value={tMap}
                  onChange={(e) => setTMap(e.target.value as FreeFireMap)}
                  className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="Bermuda">Bermuda (Classic)</option>
                  <option value="Purgatory">Purgatory</option>
                  <option value="Kalahari">Kalahari Desert</option>
                  <option value="Alpine">Alpine Snow</option>
                  <option value="NexTerra">NexTerra (Sci-Fi)</option>
                  <option value="Iron Cage">Iron Cage (1v1 Arena)</option>
                  <option value="El Pasto">El Pasto (Bomb Squad)</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Recommended for this mode: {getModeInfo(tMode).recommendedMaps.join(', ')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Maximum Squads (Max Teams)
                </label>
                <input
                  type="number"
                  min={2}
                  max={48}
                  value={tMaxTeams}
                  onChange={(e) => setTMaxTeams(Number(e.target.value))}
                  className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-300">
                    Decreased Entry Fee (VP)
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {tEntryFee === 0 ? 'Free' : `${tEntryFee} VP`}
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={tEntryFee}
                  onChange={(e) => setTEntryFee(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-[#161926] border border-white/10 focus:border-emerald-500/60 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none"
                />
                <div className="flex items-center gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setTEntryFee(0)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                      tEntryFee === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-black/40 text-gray-400'
                    }`}
                  >
                    0 (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTEntryFee(10)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                      tEntryFee === 10 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-black/40 text-gray-400'
                    }`}
                  >
                    10 VP
                  </button>
                  <button
                    type="button"
                    onClick={() => setTEntryFee(20)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                      tEntryFee === 20 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-black/40 text-gray-400'
                    }`}
                  >
                    20 VP
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-300">
                    Decreased VP Pool
                  </label>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {tPool.toLocaleString()} VP
                  </span>
                </div>
                <input
                  type="number"
                  step={100}
                  min={200}
                  value={tPool}
                  onChange={(e) => setTPool(Math.max(200, Number(e.target.value)))}
                  className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-3 py-2 text-sm text-amber-400 font-mono font-bold focus:outline-none"
                />
                <div className="flex items-center gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setTPool(1000)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                      tPool === 1000 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-black/40 text-gray-400'
                    }`}
                  >
                    1K VP
                  </button>
                  <button
                    type="button"
                    onClick={() => setTPool(1500)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                      tPool === 1500 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-black/40 text-gray-400'
                    }`}
                  >
                    1.5K VP
                  </button>
                  <button
                    type="button"
                    onClick={() => setTPool(2000)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                      tPool === 2000 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-black/40 text-gray-400'
                    }`}
                  >
                    2K VP
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Breakdown Display (25%, 20%, 15%, 10%) */}
            <div className="p-3.5 rounded-xl bg-[#141724] border border-white/5">
              <div className="text-[11px] font-mono text-amber-400 mb-1 font-bold">
                Auto-Calculated Virtual Rewards Distribution:
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-1.5 bg-black/40 rounded">
                  <div className="text-[9px] text-gray-400">1st (25%)</div>
                  <div className="text-amber-400 font-bold">{Math.round(tPool * 0.25)} VP</div>
                </div>
                <div className="p-1.5 bg-black/40 rounded">
                  <div className="text-[9px] text-gray-400">2nd (20%)</div>
                  <div className="text-gray-300 font-bold">{Math.round(tPool * 0.20)} VP</div>
                </div>
                <div className="p-1.5 bg-black/40 rounded">
                  <div className="text-[9px] text-gray-400">3rd (15%)</div>
                  <div className="text-amber-700 font-bold">{Math.round(tPool * 0.15)} VP</div>
                </div>
                <div className="p-1.5 bg-black/40 rounded">
                  <div className="text-[9px] text-gray-400">4th (10%)</div>
                  <div className="text-gray-400 font-bold">{Math.round(tPool * 0.10)} VP</div>
                </div>
              </div>
            </div>

            {/* Schedule Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Reg Opens
                </label>
                <input
                  type="datetime-local"
                  value={tRegOpen}
                  onChange={(e) => setTRegOpen(e.target.value)}
                  className="w-full bg-[#161926] border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Reg Closes
                </label>
                <input
                  type="datetime-local"
                  value={tRegClose}
                  onChange={(e) => setTRegClose(e.target.value)}
                  className="w-full bg-[#161926] border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Match Start
                </label>
                <input
                  type="datetime-local"
                  value={tMatchStart}
                  onChange={(e) => setTMatchStart(e.target.value)}
                  className="w-full bg-[#161926] border border-white/10 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Rules & Fair Play Guidelines (One per line)
              </label>
              <textarea
                rows={3}
                value={tRules}
                onChange={(e) => setTRules(e.target.value)}
                className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              id="submit-create-tournament-btn"
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              Publish Free Fire Tournament
            </button>
          </form>
        </div>
      )}

      {/* 3. ENTER MATCH RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#10131e] border border-amber-500/30 text-white shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold font-heading uppercase flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Record Match Results & Distribute VP</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Select match, declare winner, input team kills and placement. System automatically distributes
              25% / 20% of the tournament's Virtual Points pool directly to player accounts.
            </p>
          </div>

          {resultStatus && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{resultStatus}</span>
            </div>
          )}

          {/* Match selector */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Select Match to Score
            </label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  Match #{m.matchNumber}: {m.teamA.teamName} vs {m.teamB.teamName} ({m.tournamentName}) [{m.status}]
                </option>
              ))}
            </select>
          </div>

          {selectedMatch && selectedTourn ? (
            <form onSubmit={handleSubmitResult} className="space-y-4">
              <div className="p-4 rounded-xl bg-[#141724] border border-white/5 space-y-3">
                <div className="text-xs text-gray-400 font-mono">
                  Tournament Pool: <span className="text-amber-400 font-bold">{selectedTourn.pointPool.toLocaleString()} VP</span>
                  {' '}• 1st Place = 25% ({Math.round(selectedTourn.pointPool * 0.25)} VP), 2nd = 20% ({Math.round(selectedTourn.pointPool * 0.20)} VP)
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWinningTeam('teamA')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      winningTeam === 'teamA'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md'
                        : 'bg-black/30 border-white/10 text-gray-400'
                    }`}
                  >
                    <div className="text-xs">Winner (1st Place):</div>
                    <div className="text-sm font-bold text-white mt-1">
                      {selectedMatch.teamA.teamName} [{selectedMatch.teamA.tag}]
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWinningTeam('teamB')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      winningTeam === 'teamB'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md'
                        : 'bg-black/30 border-white/10 text-gray-400'
                    }`}
                  >
                    <div className="text-xs">Winner (1st Place):</div>
                    <div className="text-sm font-bold text-white mt-1">
                      {selectedMatch.teamB.teamName} [{selectedMatch.teamB.tag}]
                    </div>
                  </button>
                </div>
              </div>

              {/* Stats for Team A */}
              <div className="p-3.5 rounded-xl bg-[#141724] border border-white/5">
                <div className="text-xs font-bold text-white mb-2">
                  {selectedMatch.teamA.teamName} Match Stats
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Score (Points)</label>
                    <input
                      type="number"
                      value={teamAScore}
                      onChange={(e) => setTeamAScore(Number(e.target.value))}
                      className="w-full bg-[#1b1e2c] border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Total Kills</label>
                    <input
                      type="number"
                      value={teamAKills}
                      onChange={(e) => setTeamAKills(Number(e.target.value))}
                      className="w-full bg-[#1b1e2c] border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Stats for Team B */}
              <div className="p-3.5 rounded-xl bg-[#141724] border border-white/5">
                <div className="text-xs font-bold text-white mb-2">
                  {selectedMatch.teamB.teamName} Match Stats
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Score (Points)</label>
                    <input
                      type="number"
                      value={teamBScore}
                      onChange={(e) => setTeamBScore(Number(e.target.value))}
                      className="w-full bg-[#1b1e2c] border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Total Kills</label>
                    <input
                      type="number"
                      value={teamBKills}
                      onChange={(e) => setTeamBKills(Number(e.target.value))}
                      className="w-full bg-[#1b1e2c] border border-white/10 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                id="submit-match-result-btn"
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                Publish & Credit Points Automatically
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-500">No match selected.</p>
          )}
        </div>
      )}

      {/* 4. PLAYER MANAGEMENT & BAN/UNBAN TAB */}
      {activeTab === 'players' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 font-heading">
              Player Registry & Fair Play Supervision ({filteredUsers.length})
            </h3>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={playerQuery}
                onChange={(e) => setPlayerQuery(e.target.value)}
                placeholder="Search username, IGN or UID..."
                className="w-full bg-[#161926] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-xl bg-[#10131e] border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover bg-gray-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{user.ffNickname}</span>
                      <span className="text-[9px] px-1 rounded bg-gray-800 text-gray-400 font-mono">
                        {user.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      UID: {user.ffPlayerId} • @{user.username}
                    </div>
                    <div className="text-[10px] text-amber-400/80 font-mono">
                      {user.virtualPoints.toLocaleString()} VP • {user.wins} Wins • {user.kills} Kills
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => toggleBanUser(user.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                      user.isBanned
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                    }`}
                  >
                    {user.isBanned ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Unban</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>Ban User</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. BROADCAST ALERT TAB */}
      {activeTab === 'broadcast' && (
        <div className="max-w-xl mx-auto p-6 rounded-2xl bg-[#10131e] border border-amber-500/30 text-white shadow-xl">
          <div className="mb-4">
            <h2 className="text-xl font-bold font-heading uppercase flex items-center space-x-2">
              <Send className="w-5 h-5 text-amber-400" />
              <span>Broadcast System Notification</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Send an instant in-app announcement to all active players.
            </p>
          </div>

          {broadcastSent && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Broadcast alert dispatched to all registered players!</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. 📢 Free Fire Server Update Scheduled"
                className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Announcement Message
              </label>
              <textarea
                rows={4}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter details for players..."
                className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Broadcast Alert
            </button>
          </form>
        </div>
      )}

      {/* PUBLISH ROOM INFO MODAL */}
      {roomModalTourn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0f121d] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold font-heading uppercase mb-2 flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              <span>Publish Custom Room Credentials</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Tourn: <span className="text-white font-bold">{roomModalTourn.name}</span>
            </p>

            <form onSubmit={handlePublishRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Custom Room ID
                </label>
                <input
                  type="text"
                  required
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  placeholder="e.g. 772190"
                  className="w-full bg-[#161926] border border-white/10 focus:border-emerald-500/60 rounded-xl px-4 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Room Password
                </label>
                <input
                  type="text"
                  required
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="e.g. apex4"
                  className="w-full bg-[#161926] border border-white/10 focus:border-emerald-500/60 rounded-xl px-4 py-2 text-sm text-amber-400 font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Host Note / Slot Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  placeholder="e.g. Slot 1 for Team KNR, Slot 2 for Team VIPR."
                  className="w-full bg-[#161926] border border-white/10 focus:border-emerald-500/60 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoomModalTourn(null)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider"
                >
                  Publish to Players
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
