import { FreeFireMode, FreeFireMap } from '../types';

export interface FreeFireModeInfo {
  id: string;
  name: FreeFireMode;
  mode: FreeFireMode;
  shortName: string;
  category: 'Battle Royale' | 'Clash & Tactical' | 'Duels & 1v1' | 'Arcade & Scrims';
  defaultPlayersPerTeam: number;
  playersPerTeam: number;
  teamsPerMatch: number;
  tagline: string;
  description: string;
  recommendedMaps: FreeFireMap[];
  defaultRules: string[];
  badgeColor: string;
  borderHoverColor: string;
  accentBg: string;
}

export type FreeFireModeMetadata = FreeFireModeInfo;

const RAW_MODES: Array<Omit<FreeFireModeInfo, 'mode' | 'playersPerTeam'>> = [
  {
    id: 'br-squad',
    name: 'Battle Royale Squad',
    shortName: 'BR Squad',
    category: 'Battle Royale',
    defaultPlayersPerTeam: 4,
    teamsPerMatch: 12,
    tagline: 'Standard 48-Player Esports Survival',
    description:
      'Classic 48-player Free Fire survival on full-scale maps. 12 squads drop, loot, and rotate through safe zones. Points awarded for placement & kill tallies.',
    recommendedMaps: ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'NexTerra'],
    defaultRules: [
      'Squad of 4 players required. No third-party emulators.',
      'Gun skin weapon attributes disabled for fair competitive play.',
      'Placement points: 1st (12 pts), 2nd (9 pts), 3rd (8 pts), etc.',
      'Kill point: 1 point per confirmed elimination.',
      'Room credentials published 15 minutes before launch.',
    ],
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    borderHoverColor: 'group-hover:border-amber-500/50',
    accentBg: 'bg-amber-500/10',
  },
  {
    id: 'clash-squad',
    name: 'Clash Squad 4v4',
    shortName: 'CS 4v4',
    category: 'Clash & Tactical',
    defaultPlayersPerTeam: 4,
    teamsPerMatch: 2,
    tagline: 'Round-Based Economy & Gun Combat',
    description:
      'Head-to-head 4v4 tactical arena battle. 7 rounds of intense store purchasing, economy management, and fast engagements in close-quarters zones.',
    recommendedMaps: ['Alpine', 'Bermuda', 'Kalahari', 'NexTerra'],
    defaultRules: [
      'Clash Squad 7 rounds (first to 4 round wins).',
      'Tournament standard store settings & 1500 starting coin economy.',
      'Maximum 2 gloo walls & 2 grenades per player per round.',
      'Character active skills allowed; passive attributes balanced.',
      'All virtual points awarded instantly on official match completion.',
    ],
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    borderHoverColor: 'group-hover:border-cyan-500/50',
    accentBg: 'bg-cyan-500/10',
  },
  {
    id: 'lone-wolf-1v1',
    name: 'Lone Wolf 1v1',
    shortName: '1v1 Duel',
    category: 'Duels & 1v1',
    defaultPlayersPerTeam: 1,
    teamsPerMatch: 2,
    tagline: 'Iron Cage Ultimate Solo Duel',
    description:
      'Pure mechanical gun skill in the Iron Cage. Players take turns choosing the weapon loadout every 2 rounds. First to 5 round victories takes the glory.',
    recommendedMaps: ['Iron Cage'],
    defaultRules: [
      'Solo 1v1 format, first to 5 rounds.',
      'Players alternate picking weapons each round pair.',
      'Strictly mobile device only; zero aim-assist tools permitted.',
      'Continuous toxicity or disconnect forfeits the duel match.',
    ],
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    borderHoverColor: 'group-hover:border-rose-500/50',
    accentBg: 'bg-rose-500/10',
  },
  {
    id: 'lone-wolf-2v2',
    name: 'Lone Wolf 2v2',
    shortName: '2v2 Duels',
    category: 'Duels & 1v1',
    defaultPlayersPerTeam: 2,
    teamsPerMatch: 2,
    tagline: 'Tactical Duo Showdown in Iron Cage',
    description:
      'Coordinated duo combat in the confined Iron Cage arena. Fast revives, crossfire setups, and alternating weapon picks across 5 victory rounds.',
    recommendedMaps: ['Iron Cage'],
    defaultRules: [
      '2v2 Duo showdown, first to 5 rounds.',
      'Revives permitted inside the barrier before zone shrink.',
      'No secondary smoke bug abuse allowed.',
    ],
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    borderHoverColor: 'group-hover:border-red-500/50',
    accentBg: 'bg-red-500/10',
  },
  {
    id: 'bomb-squad',
    name: 'Bomb Squad 5v5',
    shortName: 'Bomb Squad 5v5',
    category: 'Clash & Tactical',
    defaultPlayersPerTeam: 5,
    teamsPerMatch: 2,
    tagline: 'Search & Destroy Tactical Defusal',
    description:
      'Objective-driven 5v5 tactical tournament. Attackers plant the bomb at sites A or B, while Defenders strategize site holds and execute retakes.',
    recommendedMaps: ['El Pasto', 'Alpine', 'NexTerra'],
    defaultRules: [
      '5v5 Search & Destroy ruleset, best of 9 rounds.',
      'Defusal kit grants 50% faster defuse times.',
      'One active bomb carrier per round; timer is 45 seconds once planted.',
      'Coordinated squad communications recommended.',
    ],
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    borderHoverColor: 'group-hover:border-orange-500/50',
    accentBg: 'bg-orange-500/10',
  },
  {
    id: 'team-deathmatch',
    name: 'Team Deathmatch',
    shortName: 'TDM 4v4',
    category: 'Arcade & Scrims',
    defaultPlayersPerTeam: 4,
    teamsPerMatch: 2,
    tagline: 'Instant Respawn 40-Elimination Race',
    description:
      'High-cadence tactical skirmish with continuous respawns. First squad to rack up 40 total kills or highest score at round expiration wins.',
    recommendedMaps: ['El Pasto', 'Bermuda'],
    defaultRules: [
      'Target: First team to reach 40 kills or highest score in 10 minutes.',
      '3-second invulnerability shield on respawn.',
      'Standard loadout weapon selection enabled at spawn base.',
    ],
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    borderHoverColor: 'group-hover:border-purple-500/50',
    accentBg: 'bg-purple-500/10',
  },
  {
    id: 'rush-hour',
    name: 'Rush Hour',
    shortName: 'Rush Hour',
    category: 'Battle Royale',
    defaultPlayersPerTeam: 4,
    teamsPerMatch: 5,
    tagline: 'Rapid Zone 20-Player Blitz Survival',
    description:
      'Condensed battle royale with only 20 players per lobby. The safe zone is already restricted from jump, packed with high-tier airdrop weaponry.',
    recommendedMaps: ['Bermuda', 'Purgatory'],
    defaultRules: [
      'Fast safe zone shrink intervals (half normal duration).',
      'High density Level 3 vests & specialized weapons.',
      'Match typically concludes in under 8 fast-paced minutes.',
    ],
    badgeColor: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    borderHoverColor: 'group-hover:border-lime-500/50',
    accentBg: 'bg-lime-500/10',
  },
  {
    id: 'br-duo',
    name: 'Battle Royale Duo',
    shortName: 'BR Duo',
    category: 'Battle Royale',
    defaultPlayersPerTeam: 2,
    teamsPerMatch: 24,
    tagline: 'Two-Player Strategic Partner Cup',
    description:
      'Duo teams battle across expansive terrain. Pair coordination, revive timing, and shared ammo supplies dictate survival through the final circle.',
    recommendedMaps: ['Bermuda', 'Purgatory', 'NexTerra'],
    defaultRules: [
      'Duo teams of 2 players.',
      'Revival points active until Zone 4.',
      'Rank points awarded based on combined duo score & eliminations.',
    ],
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    borderHoverColor: 'group-hover:border-yellow-500/50',
    accentBg: 'bg-yellow-500/10',
  },
  {
    id: 'br-solo',
    name: 'Battle Royale Solo',
    shortName: 'BR Solo',
    category: 'Battle Royale',
    defaultPlayersPerTeam: 1,
    teamsPerMatch: 48,
    tagline: 'Solo Lone Survivor Championship',
    description:
      'No teammates, no revives, pure individual grit. 48 solo contenders land across the island to determine the lone grandmaster of the arena.',
    recommendedMaps: ['Bermuda', 'Kalahari', 'Alpine'],
    defaultRules: [
      'Solo survival only. Strict no-teaming rule enforced by replays.',
      'Teaming or cross-fire agreements result in permanent tournament ban.',
      'Last survivor takes 1st place virtual point share.',
    ],
    badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
    borderHoverColor: 'group-hover:border-amber-400/50',
    accentBg: 'bg-amber-400/10',
  },
  {
    id: 'craftland-custom',
    name: 'Craftland Custom',
    shortName: 'Craftland Scrims',
    category: 'Arcade & Scrims',
    defaultPlayersPerTeam: 4,
    teamsPerMatch: 2,
    tagline: 'Esports Pro Community Scrim Maps',
    description:
      'Tournaments staged on verified pro-level Craftland custom maps featuring symmetrical cover, endless gloo walls, and customized competitive movement.',
    recommendedMaps: ['Bermuda', 'Alpine'],
    defaultRules: [
      'Unlimited Gloo Wall custom room preset active.',
      'Standardized competition weapons: Desert Eagle, Shotguns, MP40.',
      'Room passcode delivered to approved team captains in Squad Hub.',
    ],
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    borderHoverColor: 'group-hover:border-emerald-500/50',
    accentBg: 'bg-emerald-500/10',
  },
  {
    id: 'gun-king',
    name: 'Gun King',
    shortName: 'Gun King',
    category: 'Arcade & Scrims',
    defaultPlayersPerTeam: 4,
    teamsPerMatch: 2,
    tagline: 'Weapon Ladder Cycling Master',
    description:
      'Every elimination upgrades your weapon to the next firearm on the progression ladder. Complete the ladder with the final blade kill to win.',
    recommendedMaps: ['El Pasto', 'Bermuda'],
    defaultRules: [
      'Progressive weapon tree: SMGs -> Shotguns -> ARs -> Pistols -> Melee.',
      'First team or player to claim final knife kill claims victory.',
    ],
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    borderHoverColor: 'group-hover:border-fuchsia-500/50',
    accentBg: 'bg-fuchsia-500/10',
  },
  {
    id: 'rampage-united',
    name: 'Rampage United',
    shortName: 'Rampage',
    category: 'Arcade & Scrims',
    defaultPlayersPerTeam: 4,
    teamsPerMatch: 2,
    tagline: 'Relic Control & Super Battle Skills',
    description:
      'Special arena mode combining tactical squad coordination with empowered combat attributes, hyper speed, and capture-the-relic dominance.',
    recommendedMaps: ['Bermuda', 'Alpine'],
    defaultRules: [
      'Capture and defend point relics to accumulate team score to 1000.',
      'Rampage rage buffs unlock after 3 consecutive kills.',
    ],
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    borderHoverColor: 'group-hover:border-indigo-500/50',
    accentBg: 'bg-indigo-500/10',
  },
  {
    id: 'big-head-mode',
    name: 'Big Head Mode',
    shortName: 'Big Head',
    category: 'Arcade & Scrims',
    defaultPlayersPerTeam: 4,
    teamsPerMatch: 2,
    tagline: 'Arcade Elimination & Giant Hitboxes',
    description:
      'Action-packed arcade mode where successful eliminations scale up your avatar’s head size, increasing incoming headshot vulnerability while boosting movement & stats.',
    recommendedMaps: ['Bermuda', 'El Pasto'],
    defaultRules: [
      'Eliminations increase head size tier up to 5x.',
      'Headshots yield double score towards team elimination target.',
    ],
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    borderHoverColor: 'group-hover:border-blue-500/50',
    accentBg: 'bg-blue-500/10',
  },
];

export const FREE_FIRE_MODES: FreeFireModeInfo[] = RAW_MODES.map((m) => ({
  ...m,
  mode: m.name,
  playersPerTeam: m.defaultPlayersPerTeam,
}));

export const getModeInfo = (mode: FreeFireMode | string): FreeFireModeInfo => {
  const found = FREE_FIRE_MODES.find(
    (m) => m.name.toLowerCase() === mode?.toLowerCase() || m.id.toLowerCase() === mode?.toLowerCase()
  );
  if (found) return found;

  // Fallback for legacy or unknown
  return FREE_FIRE_MODES[0];
};
