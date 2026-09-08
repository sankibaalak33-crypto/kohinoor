import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Copy,
  Check,
  Trophy,
  Swords,
  Clock,
  Sparkles,
  Users,
  MapPin,
} from 'lucide-react';
import { Match } from '../types';
import { useAuth } from '../context/AuthContext';
import { getModeInfo } from '../data/modes';

interface MatchCardProps {
  match: Match;
  onOpenRules?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onOpenRules }) => {
  const { currentUser, isAdmin } = useAuth();
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Determine if user is in this match
  const isUserInMatch =
    currentUser &&
    (match.teamA.players.some((p) => p.userId === currentUser.id) ||
      match.teamB.players.some((p) => p.userId === currentUser.id));

  const canSeeRoom = match.roomInfo?.isPublished && (isUserInMatch || isAdmin);

  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(match.startTime).getTime();
      const diff = target - Date.now();
      if (diff <= 0) {
        setCountdown(match.status === 'completed' ? 'Match Concluded' : 'Match Underway');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [match]);

  const copyRoom = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRoom(true);
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  const copyPass = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  return (
    <div
      id={`match-card-${match.id}`}
      className="rounded-2xl bg-[#0f121d] border border-amber-500/20 p-4 sm:p-5 shadow-xl relative overflow-hidden"
    >
      {/* Top Match Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 mb-4 gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">
              Match #{match.matchNumber} • {match.tournamentName}
            </span>
            {match.mode && (
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                  getModeInfo(match.mode).badgeColor
                }`}
              >
                {match.mode}
              </span>
            )}
            {match.map && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center space-x-1">
                <MapPin className="w-2.5 h-2.5" />
                <span>{match.map}</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-gray-400 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-amber-500/80" />
            <span className="font-mono">{countdown}</span>
          </div>
        </div>

        <span
          className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            match.status === 'live'
              ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
              : match.status === 'completed'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          {match.status}
        </span>
      </div>

      {/* Versus Grid: TEAM A (4 Players) vs TEAM B (4 Players) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Central VS Badge (Desktop) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#1e2235] border border-amber-500/40 items-center justify-center text-amber-400 font-bold text-xs font-heading">
          VS
        </div>

        {/* TEAM A */}
        <div
          className={`p-3.5 rounded-xl border ${
            match.winningTeamId === match.teamA.teamId
              ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
              : 'bg-[#151825] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                [{match.teamA.tag}]
              </span>
              <h4 className="text-sm font-bold text-white font-heading">{match.teamA.teamName}</h4>
            </div>
            {match.winningTeamId === match.teamA.teamId && (
              <span className="text-[10px] font-bold text-amber-400 flex items-center space-x-1 bg-amber-500/20 px-2 py-0.5 rounded-full">
                <Trophy className="w-3 h-3" />
                <span>Winner</span>
              </span>
            )}
          </div>

          {/* 4 Players for Team A */}
          <div className="space-y-1 mt-2">
            <div className="text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">
              Squad Lineup (4 Players)
            </div>
            {match.teamA.players.map((p, idx) => (
              <div
                key={p.userId || idx}
                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-black/30 text-gray-200 border border-white/5"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="text-[10px] text-amber-500 font-mono">P{idx + 1}</span>
                  <span className="font-medium text-white truncate">{p.ffNickname}</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 shrink-0">{p.ffPlayerId}</span>
              </div>
            ))}
          </div>

          {match.teamA.score !== undefined && (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Score: {match.teamA.score} pts</span>
              <span className="text-amber-400 font-bold">{match.teamA.kills || 0} Kills</span>
            </div>
          )}
        </div>

        {/* TEAM B */}
        <div
          className={`p-3.5 rounded-xl border ${
            match.winningTeamId === match.teamB.teamId
              ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
              : 'bg-[#151825] border-white/5'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                [{match.teamB.tag}]
              </span>
              <h4 className="text-sm font-bold text-white font-heading">{match.teamB.teamName}</h4>
            </div>
            {match.winningTeamId === match.teamB.teamId && (
              <span className="text-[10px] font-bold text-amber-400 flex items-center space-x-1 bg-amber-500/20 px-2 py-0.5 rounded-full">
                <Trophy className="w-3 h-3" />
                <span>Winner</span>
              </span>
            )}
          </div>

          {/* 4 Players for Team B */}
          <div className="space-y-1 mt-2">
            <div className="text-[9px] uppercase tracking-wider text-gray-400 font-mono mb-1">
              Squad Lineup (4 Players)
            </div>
            {match.teamB.players.map((p, idx) => (
              <div
                key={p.userId || idx}
                className="flex items-center justify-between text-xs py-1 px-2 rounded bg-black/30 text-gray-200 border border-white/5"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="text-[10px] text-blue-400 font-mono">P{idx + 1}</span>
                  <span className="font-medium text-white truncate">{p.ffNickname}</span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 shrink-0">{p.ffPlayerId}</span>
              </div>
            ))}
          </div>

          {match.teamB.score !== undefined && (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Score: {match.teamB.score} pts</span>
              <span className="text-blue-400 font-bold">{match.teamB.kills || 0} Kills</span>
            </div>
          )}
        </div>
      </div>

      {/* Room Information Box */}
      <div className="mt-4 pt-3 border-t border-white/10">
        {canSeeRoom ? (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="text-emerald-300 font-bold uppercase tracking-wider mr-2 font-mono">
                  ROOM ID: {match.roomInfo?.roomId}
                </span>
                <span className="text-gray-300 font-mono">
                  PASS: {match.roomInfo?.password}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyRoom(match.roomInfo?.roomId || '')}
                className="text-[11px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center space-x-1 font-mono"
              >
                {copiedRoom ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRoom ? 'Copied ID' : 'Copy ID'}</span>
              </button>
              <button
                onClick={() => copyPass(match.roomInfo?.password || '')}
                className="text-[11px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center space-x-1 font-mono"
              >
                {copiedPass ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPass ? 'Copied Pass' : 'Copy Pass'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Room details visible to enrolled players once published by host</span>
            </span>
            {onOpenRules && (
              <button
                onClick={onOpenRules}
                className="text-amber-400 hover:underline text-xs"
              >
                Match Rules
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
