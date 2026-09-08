import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  MapPin,
  Gamepad2,
  Users,
  Clock,
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Award,
  Sparkles,
  Instagram,
} from 'lucide-react';
import { Tournament, Team } from '../types';
import { useTournaments } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';
import { getModeInfo } from '../data/modes';

interface TournamentDetailModalProps {
  tournament: Tournament | null;
  onClose: () => void;
  onOpenSquadHub: () => void;
}

export const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({
  tournament,
  onClose,
  onOpenSquadHub,
}) => {
  const { registerTeam, teams, myTeam } = useTournaments();
  const { currentUser, isAdmin } = useAuth();

  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Countdown calculation - always invoke hook before any early return
  useEffect(() => {
    if (!tournament) {
      setTimeLeft('');
      return;
    }

    const updateCountdown = () => {
      const target =
        tournament.status === 'registration_open'
          ? new Date(tournament.registrationCloseTime).getTime()
          : new Date(tournament.matchStartTime).getTime();

      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired / Live');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [tournament]);

  if (!tournament) return null;

  const isRegistered = myTeam && tournament.registeredTeamIds.includes(myTeam.id);

  // Can view room credentials if registered or if user is admin
  const canViewRoomInfo =
    tournament.roomInfo?.isPublished && (isRegistered || isAdmin);

  const registeredTeamsList = teams.filter((t) => tournament.registeredTeamIds.includes(t.id));

  const handleRegister = () => {
    setActionMsg(null);
    if (!currentUser) {
      setActionMsg({ text: 'Please sign in to register your squad.', isError: true });
      return;
    }

    if (!myTeam) {
      setActionMsg({
        text: 'You do not have a squad yet. Please create a 4-player squad first.',
        isError: true,
      });
      return;
    }

    const res = registerTeam(tournament.id, myTeam.id);
    if (res.success) {
      setActionMsg({ text: res.message, isError: false });
    } else {
      setActionMsg({ text: res.message, isError: true });
    }
  };

  const copyToClipboard = (text: string, type: 'room' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'room') {
      setCopiedRoom(true);
      setTimeout(() => setCopiedRoom(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  return (
    <div
      id="tournament-detail-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="tournament-detail-card"
        className="w-full max-w-2xl bg-[#0e1019] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-white my-6 relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-950/50 via-[#161926] to-[#12141f] border-b border-amber-500/20">
          <button
            id="close-tournament-detail-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                getModeInfo(tournament.mode).badgeColor
              }`}
            >
              {tournament.mode}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{tournament.map}</span>
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                tournament.status === 'live'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                  : tournament.status === 'registration_open'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-gray-700/30 text-gray-400 border-gray-600'
              }`}
            >
              {tournament.status.replace('_', ' ')}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-heading tracking-wide uppercase text-white pr-8">
            {tournament.name}
          </h2>

          {/* Mode Briefing Snippet */}
          <div className="mt-2.5 px-3 py-2 rounded-xl bg-[#141724] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="text-gray-300 font-mono">
              <span className="text-amber-400 font-bold uppercase mr-2">
                [{getModeInfo(tournament.mode).category}]
              </span>
              <span>{getModeInfo(tournament.mode).tagline}</span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono">
              {getModeInfo(tournament.mode).playersPerTeam} Players / Team
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-300">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>{tournament.pointPool.toLocaleString()} VP Total Pool</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {tournament.entryFee && tournament.entryFee > 0
                  ? `Entry: ${tournament.entryFee} VP (Decreased)`
                  : '100% Free Entry (0 VP)'}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-gray-400">
              <Users className="w-4 h-4 text-gray-500" />
              <span>
                {tournament.registeredTeamIds.length} / {tournament.maxTeams} Squads Enrolled
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-orange-400 font-mono">
              <Clock className="w-4 h-4" />
              <span>{timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Action feedback message */}
        {actionMsg && (
          <div
            className={`p-3 mx-5 mt-4 rounded-xl text-xs flex items-center justify-between ${
              actionMsg.isError
                ? 'bg-red-950/60 border border-red-500/40 text-red-200'
                : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
            }`}
          >
            <span>{actionMsg.text}</span>
            <button
              onClick={() => setActionMsg(null)}
              className="text-xs underline opacity-80 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ROOM CREDENTIALS BANNER (CRUCIAL ESPORTS FEATURE) */}
          <div
            id="tournament-room-credentials-box"
            className="rounded-xl border p-4 bg-[#141724] relative overflow-hidden"
            style={{
              borderColor: tournament.roomInfo?.isPublished
                ? 'rgba(16, 185, 129, 0.4)'
                : 'rgba(245, 158, 11, 0.2)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <KeyRound
                  className={`w-4 h-4 ${
                    tournament.roomInfo?.isPublished ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider font-heading">
                  Custom Room Information
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  id="room-instagram-slot"
                  href="https://instagram.com/jaaniii.__121"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Host Instagram: jaaniii.__121"
                  className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-[10px] font-mono text-pink-300 transition-colors"
                >
                  <Instagram className="w-3 h-3 text-pink-400" />
                  <span>jaaniii.__121</span>
                </a>
                {tournament.roomInfo?.isPublished ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    ROOM LIVE
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    PENDING HOST
                  </span>
                )}
              </div>
            </div>

            {canViewRoomInfo ? (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Room ID */}
                  <div className="flex items-center justify-between bg-black/40 px-3.5 py-2.5 rounded-lg border border-white/10">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase font-mono">Room ID</div>
                      <div className="text-base font-bold font-mono text-emerald-400 tracking-wider">
                        {tournament.roomInfo?.roomId}
                      </div>
                    </div>
                    <button
                      id="copy-room-id-btn"
                      onClick={() =>
                        copyToClipboard(tournament.roomInfo?.roomId || '', 'room')
                      }
                      className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 transition-all flex items-center space-x-1 text-xs"
                    >
                      {copiedRoom ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Room Password */}
                  <div className="flex items-center justify-between bg-black/40 px-3.5 py-2.5 rounded-lg border border-white/10">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase font-mono">Password</div>
                      <div className="text-base font-bold font-mono text-amber-400 tracking-wider">
                        {tournament.roomInfo?.password}
                      </div>
                    </div>
                    <button
                      id="copy-room-pass-btn"
                      onClick={() =>
                        copyToClipboard(tournament.roomInfo?.password || '', 'pass')
                      }
                      className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 transition-all flex items-center space-x-1 text-xs"
                    >
                      {copiedPass ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {tournament.roomInfo?.notes && (
                  <p className="text-xs text-gray-400 italic">
                    Note from host: {tournament.roomInfo.notes}
                  </p>
                )}
                <div className="text-[10px] text-red-400/80 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>DO NOT SHARE credentials outside your 4-player team.</span>
                </div>
              </div>
            ) : tournament.roomInfo?.isPublished ? (
              <p className="text-xs text-gray-400 pt-1">
                Room credentials have been published! Only approved registered squad players and tournament Marshals can unlock credentials.
              </p>
            ) : (
              <p className="text-xs text-gray-400 pt-1">
                Room ID & Password will be published here 15 minutes before the match start time. Make sure your 4 players are assembled in Free Fire.
              </p>
            )}
          </div>

          {/* VIRTUAL POINTS DISTRIBUTION POOL (STRICT REQUIREMENT: 25%, 20%, 15%, 10%) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5 font-heading">
                <Trophy className="w-4 h-4" />
                <span>Virtual Point (VP) Pool Distribution</span>
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">
                Strictly Non-Monetary Virtual Rewards
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                <div className="text-[10px] text-amber-400 font-bold uppercase">1st Place (25%)</div>
                <div className="text-base font-black text-white mt-0.5 font-mono">
                  {tournament.virtualPointsDistribution.first.toLocaleString()} VP
                </div>
                <div className="text-[9px] text-amber-300/80 mt-0.5 font-mono">Champion Booyah</div>
              </div>

              <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700 text-center">
                <div className="text-[10px] text-gray-300 font-bold uppercase">2nd Place (20%)</div>
                <div className="text-base font-black text-white mt-0.5 font-mono">
                  {tournament.virtualPointsDistribution.second.toLocaleString()} VP
                </div>
                <div className="text-[9px] text-gray-400 mt-0.5 font-mono">Runner Up</div>
              </div>

              <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700 text-center">
                <div className="text-[10px] text-amber-700 font-bold uppercase">3rd Place (15%)</div>
                <div className="text-base font-black text-white mt-0.5 font-mono">
                  {tournament.virtualPointsDistribution.third.toLocaleString()} VP
                </div>
                <div className="text-[9px] text-gray-400 mt-0.5 font-mono">Podium Bronze</div>
              </div>

              <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700 text-center">
                <div className="text-[10px] text-gray-400 font-bold uppercase">4th Place (10%)</div>
                <div className="text-base font-black text-white mt-0.5 font-mono">
                  {tournament.virtualPointsDistribution.fourth.toLocaleString()} VP
                </div>
                <div className="text-[9px] text-gray-400 mt-0.5 font-mono">Finalist Squad</div>
              </div>
            </div>
          </div>

          {/* SQUAD REQUIREMENT CHECK: EXACTLY 4 PLAYERS */}
          <div className="p-4 rounded-xl bg-[#141723] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Squad Requirement: 4 Players per Team
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {myTeam ? (
                  <>
                    Your Squad: <span className="text-white font-bold">{myTeam.name}</span> ({myTeam.members.length}/4 players).{' '}
                    {myTeam.members.length === 4 ? (
                      <span className="text-emerald-400 font-semibold">✓ Squad Verified & Ready</span>
                    ) : (
                      <span className="text-amber-400 font-semibold">
                        ⚠️ Must invite {4 - myTeam.members.length} more player(s) before registration.
                      </span>
                    )}
                  </>
                ) : (
                  'You must form a complete 4-player squad to register for this tournament.'
                )}
              </p>
            </div>

            <button
              id="manage-squad-shortcut-btn"
              onClick={() => {
                onClose();
                onOpenSquadHub();
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 border border-white/10 whitespace-nowrap"
            >
              {myTeam ? 'Manage Squad' : 'Create Squad'}
            </button>
          </div>

          {/* RULES & GUIDELINES */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-2.5 flex items-center space-x-1.5 font-heading">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Tournament Rules & Fair Play</span>
            </h3>
            <ul className="space-y-1.5 bg-[#12141f] p-3.5 rounded-xl border border-white/5">
              {tournament.rules.map((rule, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-start space-x-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* REGISTERED TEAMS */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-2.5 flex items-center space-x-1.5 font-heading">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Enrolled Squads ({registeredTeamsList.length}/{tournament.maxTeams})</span>
            </h3>

            {registeredTeamsList.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-[#12141f] p-3 rounded-xl">
                No squads registered yet. Be the first squad to claim a slot!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {registeredTeamsList.map((team) => (
                  <div
                    key={team.id}
                    className="p-3 rounded-xl bg-[#141723] border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{team.logo}</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1">
                          <span>{team.name}</span>
                          <span className="text-[10px] px-1 rounded bg-gray-800 text-gray-400 font-mono">
                            [{team.tag}]
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {team.members.length}/4 Verified Players
                        </div>
                      </div>
                    </div>
                    {myTeam?.id === team.id && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        My Squad
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer / Registration CTA */}
        <div className="p-4 sm:p-5 bg-[#0b0d14] border-t border-white/10 flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {isRegistered ? (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Your Squad is Registered!</span>
              </span>
            ) : tournament.status !== 'registration_open' ? (
              <span className="text-red-400">Registration is Closed</span>
            ) : (
              <div className="flex flex-col">
                <span className="font-semibold text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {tournament.entryFee && tournament.entryFee > 0
                      ? `Entry: ${tournament.entryFee} VP (Decreased)`
                      : '100% Free Entry (0 VP)'}
                  </span>
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {currentUser ? `Your balance: ${currentUser.virtualPoints || 0} VP` : 'Virtual points only • Non-monetary'}
                </span>
              </div>
            )}
          </div>

          {!isRegistered && tournament.status === 'registration_open' ? (
            <button
              id="tournament-register-team-btn"
              onClick={handleRegister}
              disabled={myTeam?.members.length !== 4}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 ${
                myTeam?.members.length === 4
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-lg shadow-amber-500/20 active:scale-95'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
              title={
                myTeam?.members.length !== 4
                  ? 'Squad must have exactly 4 players'
                  : 'Register squad for tournament'
              }
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {tournament.entryFee && tournament.entryFee > 0
                  ? `Enroll Squad (${tournament.entryFee} VP)`
                  : 'Free Squad Entry (4/4)'}
              </span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
