export type UserRole = 'player' | 'admin';

export interface PositionStats {
  first: number;
  second: number;
  third: number;
  top10: number;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar: string;
  ffPlayerId: string; // Free Fire Player ID e.g. "FF-89240182"
  ffNickname: string; // In-game nickname e.g. "⚡KØHINØØR_APEX⚡"
  virtualPoints: number; // Strictly non-monetary esports virtual points
  totalMatches: number;
  wins: number;
  kills: number;
  positionStats: PositionStats;
  role: UserRole;
  isBanned: boolean;
  badges: string[]; // Badge IDs unlocked
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  category: 'wins' | 'kills' | 'tournament' | 'veteran';
}

export interface TeamMember {
  userId: string;
  username: string;
  ffNickname: string;
  ffPlayerId: string;
  avatar?: string;
  role: 'captain' | 'member';
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo: string;
  captainId: string;
  members: TeamMember[]; // max 4 players
  wins: number;
  matches: number;
  totalKills: number;
  totalPoints: number;
  createdAt: string;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  teamName: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeFfId: string;
  inviteeUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export type FreeFireMode =
  | 'Battle Royale Squad'
  | 'Battle Royale Duo'
  | 'Battle Royale Solo'
  | 'Clash Squad 4v4'
  | 'Lone Wolf'
  | 'Lone Wolf 1v1'
  | 'Lone Wolf 2v2'
  | 'Bomb Squad 5v5'
  | 'Team Deathmatch'
  | 'Rush Hour'
  | 'Gun King'
  | 'Craftland Custom'
  | 'Rampage United'
  | 'Big Head Mode';

export type FreeFireMap =
  | 'Bermuda'
  | 'Purgatory'
  | 'Kalahari'
  | 'Alpine'
  | 'NexTerra'
  | 'Iron Cage'
  | 'El Pasto';
export type TournamentStatus = 'upcoming' | 'registration_open' | 'registration_closed' | 'live' | 'completed' | 'cancelled';

export interface VirtualPointsDistribution {
  first: number; // 25% of pool
  second: number; // 20% of pool
  third: number; // 15% of pool
  fourth: number; // 10% of pool
}

export interface RoomInfo {
  roomId: string;
  password: string;
  isPublished: boolean;
  publishedAt?: string;
  notes?: string;
}

export interface Tournament {
  id: string;
  name: string;
  mode: FreeFireMode;
  map: FreeFireMap;
  maxTeams: number;
  teamsPerMatch: number; // typically 2 teams head-to-head or multi-team lobby
  playersPerTeam: number; // exactly 4
  registrationOpenTime: string;
  registrationCloseTime: string;
  matchStartTime: string;
  status: TournamentStatus;
  rules: string[];
  entryFee?: number; // Decreased entry fee / bet in VP (0 = Free Entry, 10-25 VP nominal)
  pointPool: number; // e.g. 1500 VP non-monetary pool
  virtualPointsDistribution: VirtualPointsDistribution;
  badgesAwarded: string[];
  registeredTeamIds: string[];
  roomInfo?: RoomInfo;
  bannerUrl?: string;
  featured?: boolean;
  createdAt: string;
}

export interface MatchPlayer {
  userId: string;
  username: string;
  ffNickname: string;
  ffPlayerId: string;
}

export interface MatchTeam {
  teamId: string;
  teamName: string;
  tag: string;
  players: MatchPlayer[]; // exactly 4 players
  score?: number;
  kills?: number;
  placement?: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  matchNumber: number;
  mode?: FreeFireMode;
  map?: FreeFireMap;
  rules?: string[];
  teamA: MatchTeam;
  teamB: MatchTeam;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  startTime: string;
  roomInfo?: RoomInfo;
  winningTeamId?: string;
  result?: MatchResultData;
}

export interface PlayerResultInput {
  userId: string;
  ffNickname: string;
  kills: number;
}

export interface TeamResultInput {
  teamId: string;
  teamName: string;
  placement: number; // 1, 2, 3, 4, etc.
  score: number;
  kills: number;
  virtualPointsAwarded: number;
  playerKills: PlayerResultInput[];
}

export interface MatchResultData {
  matchId: string;
  tournamentId: string;
  winningTeamId: string;
  winningTeamName: string;
  teamResults: TeamResultInput[];
  enteredAt: string;
  enteredBy: string;
  isCorrected?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'team_invite' | 'tournament_reg' | 'reg_closing' | 'match_starting' | 'room_info' | 'match_result' | 'tournament_completion' | 'admin_announcement';
  read: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface MatchHistoryEntry {
  id: string;
  tournamentName: string;
  matchId: string;
  date: string;
  mode: FreeFireMode;
  placement: number;
  kills: number;
  virtualPointsEarned: number;
  teamName: string;
}
