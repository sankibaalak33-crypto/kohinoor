import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tournament,
  Team,
  Match,
  AppNotification,
  Badge,
  TeamInvitation,
  MatchResultData,
  FreeFireMode,
  FreeFireMap,
} from '../types';
import {
  INITIAL_TOURNAMENTS,
  INITIAL_TEAMS,
  INITIAL_MATCHES,
  INITIAL_NOTIFICATIONS,
  INITIAL_BADGES,
} from '../data/initialData';
import { useAuth } from './AuthContext';

interface CreateTournamentInput {
  name: string;
  mode: FreeFireMode;
  map: FreeFireMap;
  maxTeams: number;
  teamsPerMatch: number;
  playersPerTeam: number;
  registrationOpenTime: string;
  registrationCloseTime: string;
  matchStartTime: string;
  rules: string[];
  entryFee?: number; // Decreased entry fee in VP (0 = Free, 10-25 VP nominal)
  pointPool: number; // e.g., 1500 VP non-monetary
  badgesAwarded: string[];
  featured?: boolean;
}

interface TournamentContextType {
  tournaments: Tournament[];
  teams: Team[];
  matches: Match[];
  notifications: AppNotification[];
  badges: Badge[];
  invitations: TeamInvitation[];
  myTeam: Team | undefined;
  
  // Tournament operations
  createTournament: (data: CreateTournamentInput) => { success: boolean; error?: string };
  updateTournament: (tournamentId: string, updates: Partial<Tournament>) => void;
  cancelTournament: (tournamentId: string) => void;
  registerTeam: (tournamentId: string, teamId: string) => { success: boolean; message: string };
  publishRoomInfo: (tournamentId: string, roomId: string, password: string, notes?: string) => void;
  toggleRegistrationStatus: (tournamentId: string, forceClose?: boolean) => void;
  
  // Team operations
  createTeam: (name: string, tag: string, logo: string) => { success: boolean; team?: Team; error?: string };
  invitePlayerToTeam: (teamId: string, inviteeIdentifier: string) => { success: boolean; message: string };
  respondToInvitation: (invitationId: string, accept: boolean) => { success: boolean; message: string };
  changeCaptain: (teamId: string, newCaptainId: string) => void;
  removeTeamMember: (teamId: string, memberId: string) => void;
  
  // Match & Results
  enterMatchResult: (result: MatchResultData) => { success: boolean; error?: string };
  correctMatchResult: (matchId: string, result: MatchResultData) => { success: boolean };
  
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendNotification: (userId: string | 'all', title: string, message: string, type: AppNotification['type']) => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

const TOURNAMENTS_KEY = 'kohinoor_tournaments_v3';
const TEAMS_KEY = 'kohinoor_teams_v2';
const MATCHES_KEY = 'kohinoor_matches_v2';
const NOTIFICATIONS_KEY = 'kohinoor_notifications_v2';
const INVITATIONS_KEY = 'kohinoor_invitations_v2';

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allUsers, updateProfile } = useAuth();

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    // Check v3 first, then check v2 for migration
    const savedV3 = localStorage.getItem(TOURNAMENTS_KEY);
    const savedV2 = localStorage.getItem('kohinoor_tournaments_v2');
    const saved = savedV3 || savedV2;

    if (saved) {
      try {
        const parsed: Tournament[] = JSON.parse(saved);
        // Ensure decreased pools and proper entryFee are applied to any previously saved items
        return parsed.map((t) => {
          const isHighPool = t.pointPool > 3500;
          const decreasedPool = isHighPool ? Math.round(t.pointPool * 0.2) : t.pointPool;
          return {
            ...t,
            entryFee: t.entryFee !== undefined ? t.entryFee : (t.id === 'tourn-clash-showdown' || t.id === 'tourn-tdm-skirmish' || t.id === 'tourn-br-duo-clash' ? 10 : t.id === 'tourn-lone-wolf-kings' ? 15 : t.id === 'tourn-craftland-scrims' ? 20 : 0),
            pointPool: decreasedPool,
            virtualPointsDistribution: isHighPool
              ? {
                  first: Math.round(decreasedPool * 0.25),
                  second: Math.round(decreasedPool * 0.20),
                  third: Math.round(decreasedPool * 0.15),
                  fourth: Math.round(decreasedPool * 0.10),
                }
              : t.virtualPointsDistribution,
          };
        });
      } catch {
        return INITIAL_TOURNAMENTS;
      }
    }
    return INITIAL_TOURNAMENTS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(TEAMS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem(MATCHES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [invitations, setInvitations] = useState<TeamInvitation[]>(() => {
    const saved = localStorage.getItem(INVITATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const badges = INITIAL_BADGES;

  // Persist states
  useEffect(() => {
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));
  }, [invitations]);

  // Find user's active team
  const myTeam = teams.find(
    (t) => t.captainId === currentUser?.id || t.members.some((m) => m.userId === currentUser?.id)
  );

  // Send Notification Helper
  const sendNotification = (
    targetUserId: string | 'all',
    title: string,
    message: string,
    type: AppNotification['type']
  ) => {
    const userIds = targetUserId === 'all' ? allUsers.map((u) => u.id) : [targetUserId];
    const newNotifs: AppNotification[] = userIds.map((uid) => ({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: uid,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    }));

    setNotifications((prev) => [newNotifs[0], ...prev]);
  };

  // Tournament Creation (Enforcing 25%, 20%, 15%, 10% non-monetary virtual points)
  const createTournament = (input: CreateTournamentInput) => {
    const pool = Number(input.pointPool) || 1500;
    const entryFee = Number(input.entryFee) >= 0 ? Number(input.entryFee) : 0;
    const distribution = {
      first: Math.round(pool * 0.25),
      second: Math.round(pool * 0.20),
      third: Math.round(pool * 0.15),
      fourth: Math.round(pool * 0.10),
    };

    const newTournament: Tournament = {
      id: `tourn-${Date.now()}`,
      name: input.name,
      mode: input.mode,
      map: input.map,
      maxTeams: input.maxTeams || 12,
      teamsPerMatch: 2,
      playersPerTeam: 4,
      registrationOpenTime: input.registrationOpenTime,
      registrationCloseTime: input.registrationCloseTime,
      matchStartTime: input.matchStartTime,
      status: 'registration_open',
      rules: input.rules.length > 0 ? input.rules : [
        entryFee === 0 ? '100% Free Entry - Absolutely no cash or betting allowed.' : `Decreased nominal entry fee of ${entryFee} VP.`,
        'Team must contain exactly 4 verified players before deadline.',
        'Gun skin weapon attributes are turned OFF for competitive balance.',
        'Room ID & Password will be published here 15 mins prior to match start.',
        'All virtual points awarded are non-monetary and non-redeemable for cash.',
      ],
      entryFee,
      pointPool: pool,
      virtualPointsDistribution: distribution,
      badgesAwarded: input.badgesAwarded,
      registeredTeamIds: [],
      featured: input.featured || false,
      createdAt: new Date().toISOString(),
    };

    setTournaments((prev) => [newTournament, ...prev]);

    // Broadcast notification to all players
    const feeNotice = entryFee > 0 ? `Decreased entry fee: ${entryFee} VP.` : '100% Free registration!';
    sendNotification(
      'all',
      `🏆 New Tournament: ${newTournament.name}`,
      `${feeNotice} Prize Pool: ${pool.toLocaleString()} Virtual Points (VP). Register your 4-player squad now.`,
      'tournament_reg'
    );

    return { success: true };
  };

  const updateTournament = (tournamentId: string, updates: Partial<Tournament>) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? { ...t, ...updates } : t))
    );
  };

  const cancelTournament = (tournamentId: string) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          return { ...t, status: 'cancelled' };
        }
        return t;
      })
    );

    // Cancel related matches
    setMatches((prev) =>
      prev.map((m) => (m.tournamentId === tournamentId ? { ...m, status: 'cancelled' } : m))
    );
  };

  // Publish Room ID and Password
  const publishRoomInfo = (tournamentId: string, roomId: string, password: string, notes?: string) => {
    const publishedAt = new Date().toISOString();
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          return {
            ...t,
            roomInfo: {
              roomId,
              password,
              isPublished: true,
              publishedAt,
              notes,
            },
          };
        }
        return t;
      })
    );

    // Also update matches for this tournament
    setMatches((prev) =>
      prev.map((m) => {
        if (m.tournamentId === tournamentId) {
          return {
            ...m,
            roomInfo: {
              roomId,
              password,
              isPublished: true,
              publishedAt,
              notes,
            },
          };
        }
        return m;
      })
    );

    // Notify all registered teams' members
    const tourn = tournaments.find((t) => t.id === tournamentId);
    if (tourn && currentUser) {
      sendNotification(
        currentUser.id,
        `Room Credentials Live! 🎮 (Room: ${roomId})`,
        `Custom Room ID: ${roomId} | Password: ${password}. Join your slot on Free Fire now!`,
        'room_info'
      );
    }
  };

  const toggleRegistrationStatus = (tournamentId: string, forceClose?: boolean) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const newStatus = forceClose
            ? 'registration_closed'
            : t.status === 'registration_open'
            ? 'registration_closed'
            : 'registration_open';
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  // Register Team to Tournament (Strict validation)
  const registerTeam = (tournamentId: string, teamId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { success: false, message: 'Tournament not found.' };

    const team = teams.find((t) => t.id === teamId);
    if (!team) return { success: false, message: 'Team not found.' };

    // Registration status check
    if (tournament.status !== 'registration_open') {
      return { success: false, message: 'Registration is closed for this tournament.' };
    }

    // Registration deadline check
    if (new Date(tournament.registrationCloseTime).getTime() <= Date.now()) {
      return { success: false, message: 'Registration deadline has passed. Late entries are strictly prevented.' };
    }

    // Max teams limit check
    if (tournament.registeredTeamIds.length >= tournament.maxTeams) {
      return { success: false, message: 'Tournament slots are completely full.' };
    }

    // Team already registered
    if (tournament.registeredTeamIds.includes(teamId)) {
      return { success: false, message: 'This team is already registered for this tournament.' };
    }

    // STRICT 4-PLAYER RULE
    if (team.members.length !== 4) {
      return {
        success: false,
        message: `Your team has ${team.members.length}/4 players. You must have EXACTLY 4 players before the registration deadline!`,
      };
    }

    // Decreased Entry Fee / Stake validation
    const fee = tournament.entryFee ?? 0;
    if (fee > 0 && currentUser) {
      const userVP = currentUser.virtualPoints || 0;
      if (userVP < fee) {
        return {
          success: false,
          message: `Insufficient Virtual Points. This tournament entry fee is ${fee} VP (Your current balance: ${userVP} VP).`,
        };
      }
      // Deduct decreased entry fee
      updateProfile({
        virtualPoints: Math.max(0, userVP - fee),
      });
    }

    // Register team
    const updatedTourn = {
      ...tournament,
      registeredTeamIds: [...tournament.registeredTeamIds, teamId],
    };

    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? updatedTourn : t))
    );

    // If we now have 2 teams, schedule a match
    if (updatedTourn.registeredTeamIds.length >= 2 && matches.filter((m) => m.tournamentId === tournamentId).length === 0) {
      const teamAData = teams.find((t) => t.id === updatedTourn.registeredTeamIds[0]);
      const teamBData = team;
      if (teamAData) {
        const newMatch: Match = {
          id: `match-${Date.now()}`,
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          matchNumber: 1,
          teamA: {
            teamId: teamAData.id,
            teamName: teamAData.name,
            tag: teamAData.tag,
            players: teamAData.members.map((m) => ({
              userId: m.userId,
              username: m.username,
              ffNickname: m.ffNickname,
              ffPlayerId: m.ffPlayerId,
            })),
          },
          teamB: {
            teamId: teamBData.id,
            teamName: teamBData.name,
            tag: teamBData.tag,
            players: teamBData.members.map((m) => ({
              userId: m.userId,
              username: m.username,
              ffNickname: m.ffNickname,
              ffPlayerId: m.ffPlayerId,
            })),
          },
          status: 'scheduled',
          startTime: tournament.matchStartTime,
          roomInfo: tournament.roomInfo,
        };
        setMatches((prev) => [newMatch, ...prev]);
      }
    }

    // Notify team captain & members
    team.members.forEach((member) => {
      sendNotification(
        member.userId,
        `Enrolled in ${tournament.name}! 🎯`,
        `Your squad "${team.name}" is successfully registered. Match starts on ${new Date(
          tournament.matchStartTime
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        'tournament_reg'
      );
    });

    const feeNote = fee > 0 ? ` (Entry fee of ${fee} VP deducted)` : ' (100% Free Entry)';
    return { success: true, message: `Successfully registered "${team.name}" for ${tournament.name}!${feeNote}` };
  };

  // Team Management
  const createTeam = (name: string, tag: string, logo: string) => {
    if (!currentUser) return { success: false, error: 'You must be logged in to create a team.' };

    // Check if player is already captain or member of a team
    const existing = teams.find(
      (t) => t.captainId === currentUser.id || t.members.some((m) => m.userId === currentUser.id)
    );
    if (existing) {
      return { success: false, error: `You are already part of team "${existing.name}". Leave that team first.` };
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      tag: tag.toUpperCase(),
      logo: logo || '🛡️',
      captainId: currentUser.id,
      members: [
        {
          userId: currentUser.id,
          username: currentUser.username,
          ffNickname: currentUser.ffNickname,
          ffPlayerId: currentUser.ffPlayerId,
          avatar: currentUser.avatar,
          role: 'captain',
          joinedAt: new Date().toISOString(),
        },
      ],
      wins: 0,
      matches: 0,
      totalKills: 0,
      totalPoints: 0,
      createdAt: new Date().toISOString(),
    };

    setTeams((prev) => [...prev, newTeam]);
    return { success: true, team: newTeam };
  };

  const invitePlayerToTeam = (teamId: string, inviteeIdentifier: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { success: false, message: 'Team not found.' };

    if (team.members.length >= 4) {
      return { success: false, message: 'Your team already has the maximum of 4 players.' };
    }

    // Look up user by Free Fire ID or username
    const targetUser = allUsers.find(
      (u) =>
        u.ffPlayerId.toLowerCase() === inviteeIdentifier.trim().toLowerCase() ||
        u.username.toLowerCase() === inviteeIdentifier.trim().toLowerCase()
    );

    if (!targetUser) {
      return {
        success: false,
        message: `No player found with Free Fire ID or Username "${inviteeIdentifier}". Make sure they have registered an account.`,
      };
    }

    if (team.members.some((m) => m.userId === targetUser.id)) {
      return { success: false, message: `${targetUser.username} is already in your team.` };
    }

    const newInvite: TeamInvitation = {
      id: `invite-${Date.now()}`,
      teamId: team.id,
      teamName: team.name,
      inviterId: currentUser?.id || 'admin',
      inviterName: currentUser?.username || 'Captain',
      inviteeId: targetUser.id,
      inviteeFfId: targetUser.ffPlayerId,
      inviteeUsername: targetUser.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setInvitations((prev) => [...prev, newInvite]);

    // Send notification to invitee
    sendNotification(
      targetUser.id,
      `Squad Invitation from ${team.name} 📩`,
      `${currentUser?.username || 'Captain'} invited you to join team "${team.name}". Check your Team Invitations tab.`,
      'team_invite'
    );

    return { success: true, message: `Invitation sent to ${targetUser.username} (${targetUser.ffPlayerId})!` };
  };

  const respondToInvitation = (invitationId: string, accept: boolean) => {
    const invite = invitations.find((i) => i.id === invitationId);
    if (!invite) return { success: false, message: 'Invitation not found.' };

    if (!accept) {
      setInvitations((prev) => prev.map((i) => (i.id === invitationId ? { ...i, status: 'rejected' } : i)));
      return { success: true, message: 'Invitation declined.' };
    }

    const team = teams.find((t) => t.id === invite.teamId);
    if (!team) return { success: false, message: 'Team no longer exists.' };

    if (team.members.length >= 4) {
      return { success: false, message: 'Team is already full with 4 players.' };
    }

    if (!currentUser) return { success: false, message: 'Please log in to accept.' };

    // Add to team members
    const newMember = {
      userId: currentUser.id,
      username: currentUser.username,
      ffNickname: currentUser.ffNickname,
      ffPlayerId: currentUser.ffPlayerId,
      avatar: currentUser.avatar,
      role: 'member' as const,
      joinedAt: new Date().toISOString(),
    };

    const updatedTeam = {
      ...team,
      members: [...team.members, newMember],
    };

    setTeams((prev) => prev.map((t) => (t.id === team.id ? updatedTeam : t)));
    setInvitations((prev) => prev.map((i) => (i.id === invitationId ? { ...i, status: 'accepted' } : i)));

    // Notify captain
    sendNotification(
      team.captainId,
      `New Squad Member Joined! 🛡️`,
      `${currentUser.username} (${currentUser.ffNickname}) accepted the invitation to join ${team.name} (${updatedTeam.members.length}/4 players).`,
      'team_invite'
    );

    return { success: true, message: `You have successfully joined ${team.name}!` };
  };

  const changeCaptain = (teamId: string, newCaptainId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            captainId: newCaptainId,
            members: t.members.map((m) => ({
              ...m,
              role: m.userId === newCaptainId ? 'captain' : 'member',
            })),
          };
        }
        return t;
      })
    );
  };

  const removeTeamMember = (teamId: string, memberId: string) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            members: t.members.filter((m) => m.userId !== memberId),
          };
        }
        return t;
      })
    );
  };

  // Match Results & Point Distribution (1st 25%, 2nd 20%, 3rd 15%, 4th 10%)
  const enterMatchResult = (resultData: MatchResultData) => {
    const match = matches.find((m) => m.id === resultData.matchId);
    if (!match) return { success: false, error: 'Match not found.' };

    const tournament = tournaments.find((t) => t.id === resultData.tournamentId);
    if (!tournament) return { success: false, error: 'Tournament not found.' };

    // Update match status and result
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === resultData.matchId) {
          return {
            ...m,
            status: 'completed',
            winningTeamId: resultData.winningTeamId,
            result: resultData,
          };
        }
        return m;
      })
    );

    // Update teams stats
    setTeams((prev) =>
      prev.map((team) => {
        const teamRes = resultData.teamResults.find((r) => r.teamId === team.id);
        if (!teamRes) return team;

        const isWinner = team.id === resultData.winningTeamId;
        return {
          ...team,
          matches: team.matches + 1,
          wins: isWinner ? team.wins + 1 : team.wins,
          totalKills: team.totalKills + teamRes.kills,
          totalPoints: team.totalPoints + teamRes.virtualPointsAwarded,
        };
      })
    );

    // If current logged-in user participated, update their profile stats & points immediately!
    resultData.teamResults.forEach((tResult) => {
      tResult.playerKills.forEach((pKill) => {
        if (currentUser && pKill.userId === currentUser.id) {
          const isWinner = tResult.placement === 1;
          const updatedWins = isWinner ? currentUser.wins + 1 : currentUser.wins;
          const updatedMatches = currentUser.totalMatches + 1;
          const updatedKills = currentUser.kills + pKill.kills;
          const updatedPoints = currentUser.virtualPoints + tResult.virtualPointsAwarded;

          const updatedPos = { ...currentUser.positionStats };
          if (tResult.placement === 1) updatedPos.first += 1;
          else if (tResult.placement === 2) updatedPos.second += 1;
          else if (tResult.placement === 3) updatedPos.third += 1;
          if (tResult.placement <= 10) updatedPos.top10 += 1;

          // Badges checking
          const newBadges = [...currentUser.badges];
          if (updatedKills >= 50 && !newBadges.includes('badge-apex-predator')) {
            newBadges.push('badge-apex-predator');
          }
          if (updatedWins >= 5 && !newBadges.includes('badge-grandmaster')) {
            newBadges.push('badge-grandmaster');
          }

          updateProfile({
            virtualPoints: updatedPoints,
            wins: updatedWins,
            totalMatches: updatedMatches,
            kills: updatedKills,
            positionStats: updatedPos,
            badges: newBadges,
          });

          sendNotification(
            currentUser.id,
            `Match Result Verified! 🎖️ (Rank #${tResult.placement})`,
            `Your squad earned ${tResult.virtualPointsAwarded.toLocaleString()} VP! Your individual frags: ${pKill.kills}. Non-monetary points credited.`,
            'match_result'
          );
        }
      });
    });

    return { success: true };
  };

  const correctMatchResult = (matchId: string, resultData: MatchResultData) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, result: { ...resultData, isCorrected: true } } : m))
    );
    return { success: true };
  };

  // Notification management
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        teams,
        matches,
        notifications: notifications.filter((n) => n.userId === currentUser?.id || currentUser?.role === 'admin'),
        badges,
        invitations: invitations.filter(
          (i) => i.inviteeId === currentUser?.id || i.inviterId === currentUser?.id
        ),
        myTeam,
        createTournament,
        updateTournament,
        cancelTournament,
        registerTeam,
        publishRoomInfo,
        toggleRegistrationStatus,
        createTeam,
        invitePlayerToTeam,
        respondToInvitation,
        changeCaptain,
        removeTeamMember,
        enterMatchResult,
        correctMatchResult,
        markNotificationRead,
        markAllNotificationsRead,
        sendNotification,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournaments must be used within a TournamentProvider');
  }
  return context;
};
