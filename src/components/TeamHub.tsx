import React, { useState } from 'react';
import {
  Users,
  Crown,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  Target,
  Sparkles,
  Trash2,
  Check,
} from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';

export const TeamHub: React.FC = () => {
  const {
    myTeam,
    createTeam,
    invitePlayerToTeam,
    invitations,
    respondToInvitation,
    changeCaptain,
    removeTeamMember,
  } = useTournaments();
  const { currentUser } = useAuth();

  // Create Team form state
  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [teamLogo, setTeamLogo] = useState('⚔️');
  const [createError, setCreateError] = useState<string | null>(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviteStatus, setInviteStatus] = useState<{ msg: string; isError: boolean } | null>(null);

  const isCaptain = myTeam && currentUser && myTeam.captainId === currentUser.id;
  const isSquadFull = myTeam && myTeam.members.length === 4;

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!teamName.trim() || !teamTag.trim()) {
      setCreateError('Please enter a team name and 3-4 letter tag.');
      return;
    }
    const res = createTeam(teamName.trim(), teamTag.trim(), teamLogo);
    if (!res.success) {
      setCreateError(res.error || 'Failed to create team');
    } else {
      setTeamName('');
      setTeamTag('');
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus(null);
    if (!myTeam || !inviteIdentifier.trim()) return;

    const res = invitePlayerToTeam(myTeam.id, inviteIdentifier.trim());
    setInviteStatus({ msg: res.message, isError: !res.success });
    if (res.success) {
      setInviteIdentifier('');
      setTimeout(() => setShowInviteModal(false), 1500);
    }
  };

  const myPendingInvites = invitations.filter(
    (inv) => inv.inviteeId === currentUser?.id && inv.status === 'pending'
  );

  return (
    <div id="team-hub-view" className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#171926] via-[#12141d] to-[#0c0e17] border border-amber-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Users className="w-4 h-4" />
              <span>Squad Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white uppercase mt-1">
              Esports <span className="gold-gradient-text">Squad Roster</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">
              Form a 4-player Free Fire roster. Every tournament requires exactly 4 verified squad
              members before registration closes.
            </p>
          </div>

          {myTeam && isCaptain && !isSquadFull && (
            <button
              id="invite-player-top-btn"
              onClick={() => {
                setShowInviteModal(true);
                setInviteStatus(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Player ({myTeam.members.length}/4)</span>
            </button>
          )}
        </div>
      </div>

      {/* PENDING INVITATIONS RECEIVED */}
      {myPendingInvites.length > 0 && (
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
            <Users className="w-4 h-4" />
            <span>Pending Squad Invitations ({myPendingInvites.length})</span>
          </div>
          <div className="space-y-2">
            {myPendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="p-3 rounded-xl bg-[#111422] border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-bold text-white">
                    Team: <span className="text-cyan-300">{invite.teamName}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Invited by <span className="text-gray-200">{invite.inviterName}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => respondToInvitation(invite.id, true)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => respondToInvitation(invite.id, false)}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NO TEAM: SHOW CREATE SQUAD FORM */}
      {!myTeam ? (
        <div className="max-w-xl mx-auto rounded-2xl bg-[#0f121d] border border-amber-500/30 p-6 sm:p-8 shadow-xl text-white">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold font-heading uppercase">Create Your 4-Player Squad</h2>
            <p className="text-xs text-gray-400 mt-1">
              You are not currently enrolled in any esports team. Create your team and invite 3 teammates.
            </p>
          </div>

          {createError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateTeam} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Team Name</label>
              <input
                id="create-team-name-input"
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. KOHINOOR WARRIORS"
                className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Team Tag (3-4 Chars)
                </label>
                <input
                  id="create-team-tag-input"
                  type="text"
                  required
                  maxLength={5}
                  value={teamTag}
                  onChange={(e) => setTeamTag(e.target.value.toUpperCase())}
                  placeholder="e.g. KNR"
                  className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 uppercase font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Team Crest Emblem
                </label>
                <select
                  value={teamLogo}
                  onChange={(e) => setTeamLogo(e.target.value)}
                  className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="⚔️">⚔️ Crossed Swords</option>
                  <option value="🔥">🔥 Phoenix Flame</option>
                  <option value="🐍">🐍 Viper Strike</option>
                  <option value="🛡️">🛡️ Aegis Shield</option>
                  <option value="⚡">⚡ Thunder Bolt</option>
                  <option value="👑">👑 Royal Crown</option>
                  <option value="🎯">🎯 Sniper Target</option>
                  <option value="🌪️">🌪️ Apex Vortex</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141724] border border-white/5 text-[11px] text-gray-400">
              <span className="text-amber-400 font-bold">Rule Note:</span> You will become Team
              Captain and must invite 3 other players to complete your 4-player tournament roster.
            </div>

            <button
              id="create-team-submit-button"
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              Establish Squad
            </button>
          </form>
        </div>
      ) : (
        /* MY SQUAD CARD & 4-PLAYER ROSTER */
        <div className="space-y-6">
          {/* Squad Status Header Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0f121d] border border-amber-500/30 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#161928] border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
                  {myTeam.logo}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl sm:text-2xl font-black font-heading tracking-wide uppercase">
                      {myTeam.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">
                      [{myTeam.tag}]
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Captain:{' '}
                    <span className="text-gray-200 font-medium">
                      {myTeam.members.find((m) => m.role === 'captain')?.ffNickname || 'Captain'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Readiness status badge */}
              <div className="flex flex-col sm:items-end">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center space-x-1.5 ${
                    isSquadFull
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  }`}
                >
                  {isSquadFull ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>4/4 Verified • Tournament Ready</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{myTeam.members.length}/4 Players • Incomplete</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] text-gray-500 mt-1 font-mono">
                  {isSquadFull
                    ? 'Eligible for all tournament registrations'
                    : `Requires ${4 - myTeam.members.length} more player(s)`}
                </span>
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
              <div className="p-2.5 rounded-xl bg-[#141724] text-center">
                <div className="text-[10px] text-gray-400 uppercase font-mono">Matches</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">{myTeam.matches}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141724] text-center">
                <div className="text-[10px] text-gray-400 uppercase font-mono">Tourn Wins</div>
                <div className="text-base font-bold font-mono text-amber-400 mt-0.5">{myTeam.wins}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141724] text-center">
                <div className="text-[10px] text-gray-400 uppercase font-mono">Total Kills</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">{myTeam.totalKills}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141724] text-center">
                <div className="text-[10px] text-gray-400 uppercase font-mono">Points (VP)</div>
                <div className="text-base font-bold font-mono text-yellow-400 mt-0.5">
                  {myTeam.totalPoints.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* 4 ROSTER SLOTS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200 flex items-center space-x-2 font-heading">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Squad Members (Exactly 4 Required)</span>
              </h3>

              {isCaptain && !isSquadFull && (
                <button
                  id="invite-member-slot-btn"
                  onClick={() => setShowInviteModal(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite Teammate</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((slotIdx) => {
                const member = myTeam.members[slotIdx];

                if (member) {
                  const isMemberCaptain = member.role === 'captain';
                  const isSelf = member.userId === currentUser?.id;

                  return (
                    <div
                      key={member.userId}
                      id={`squad-slot-${slotIdx + 1}`}
                      className={`p-4 rounded-xl border relative transition-all ${
                        isMemberCaptain
                          ? 'bg-[#151928] border-amber-500/40 shadow-md shadow-amber-500/5'
                          : 'bg-[#121420] border-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={
                                member.avatar ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                                  member.username
                                )}`
                              }
                              alt={member.username}
                              className="w-11 h-11 rounded-xl object-cover bg-gray-800"
                            />
                            {isMemberCaptain && (
                              <div className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-amber-500 text-black">
                                <Crown className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-sm font-bold text-white">{member.ffNickname}</span>
                              {isSelf && (
                                <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">
                              UID: {member.ffPlayerId}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              @{member.username} • Slot #{slotIdx + 1}
                            </div>
                          </div>
                        </div>

                        {/* Captain actions: promote captain or remove */}
                        {isCaptain && !isSelf && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => changeCaptain(myTeam.id, member.userId)}
                              title="Make Team Captain"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-white/5"
                            >
                              <Crown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeTeamMember(myTeam.id, member.userId)}
                              title="Remove from squad"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Empty Slot
                return (
                  <div
                    key={`empty-slot-${slotIdx}`}
                    id={`squad-empty-slot-${slotIdx + 1}`}
                    onClick={() => {
                      if (isCaptain) setShowInviteModal(true);
                    }}
                    className={`p-4 rounded-xl border border-dashed border-gray-700 bg-[#0c0e16]/50 flex items-center justify-between transition-all ${
                      isCaptain ? 'hover:border-amber-500/50 cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-gray-900 border border-white/5 flex items-center justify-center text-gray-600">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-400">
                          Slot #{slotIdx + 1} Empty
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {isCaptain
                            ? 'Tap to invite verified player'
                            : 'Waiting for captain to fill slot'}
                        </div>
                      </div>
                    </div>

                    {isCaptain && (
                      <span className="text-xs text-amber-400 font-medium px-2 py-1 rounded bg-amber-500/10">
                        + Invite
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INVITE PLAYER MODAL */}
      {showInviteModal && (
        <div
          id="invite-player-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-md bg-[#0f121d] border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-heading uppercase flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Invite Free Fire Teammate</span>
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Enter player's registered Free Fire Player ID (e.g. <span className="font-mono text-amber-300">FF-77218390</span>) or Username:
            </p>

            {inviteStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  inviteStatus.isError
                    ? 'bg-red-950/60 border border-red-500/40 text-red-200'
                    : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                }`}
              >
                {inviteStatus.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                ) : (
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                )}
                <span>{inviteStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <input
                  id="invitee-search-input"
                  type="text"
                  required
                  value={inviteIdentifier}
                  onChange={(e) => setInviteIdentifier(e.target.value)}
                  placeholder="Enter Free Fire UID or Username"
                  className="w-full bg-[#161926] border border-white/10 focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  id="submit-invite-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
