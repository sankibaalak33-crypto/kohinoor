import React, { useEffect, useState } from 'react';
import { Shield, Sparkles, Trophy, Zap, Instagram } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete?: () => void;
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, onFinish }) => {
  const [progress, setProgress] = useState(0);
  const handleDone = onFinish || onComplete || (() => {});

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(handleDone, 400);
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [handleDone]);

  return (
    <div
      id="splash-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#08090d] text-white p-6 select-none overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Tag */}
      <div className="w-full flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-amber-400/80 font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Esports Protocol v4.2</span>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
          100% Free Entry
        </span>
      </div>

      {/* Center Esports Emblem */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-6"
        >
          {/* Outer rotating/pulsing ring */}
          <div className="w-32 h-32 rounded-full border-2 border-dashed border-amber-500/30 animate-spin" style={{ animationDuration: '18s' }} />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-0.5 shadow-2xl shadow-amber-500/30">
              <div className="w-full h-full bg-[#0d0f17] rounded-[14px] flex flex-col items-center justify-center">
                <Shield className="w-10 h-10 text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 -mt-1" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl sm:text-4xl font-extrabold tracking-wider font-heading uppercase text-white"
        >
          KOHINOOR <span className="gold-gradient-text">FF</span>
        </motion.h1>
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-amber-400 uppercase mt-1"
        >
          TOURNAMENTS
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-xs text-gray-400 max-w-xs mt-3 leading-relaxed"
        >
          Competitive Free Fire Battle Arena with Squad Formations, Room IDs & Virtual Rewards
        </motion.p>
      </div>

      {/* Bottom Progress Bar & Disclaimer */}
      <div className="w-full max-w-xs flex flex-col items-center pb-6">
        {/* Instagram ID Slot */}
        <motion.a
          id="splash-instagram-slot"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          href="https://instagram.com/jaaniii.__121"
          target="_blank"
          rel="noopener noreferrer"
          title="Follow on Instagram: jaaniii.__121"
          className="mb-3 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#121524] hover:bg-[#1a1f36] border border-pink-500/30 hover:border-pink-500/60 shadow-sm shadow-pink-500/10 transition-all duration-200 group cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center p-0.5">
            <Instagram className="w-2.5 h-2.5 text-white shrink-0" />
          </div>
          <span className="font-mono text-[11px] font-medium text-gray-300 group-hover:text-pink-300 transition-colors">
            jaaniii.__121
          </span>
        </motion.a>

        <div className="w-full flex justify-between text-[11px] font-mono text-gray-400 mb-2">
          <span>CONNECTING TO LOBBY</span>
          <span className="text-amber-400 font-bold">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-75 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] text-gray-500 text-center">
          <Trophy className="w-3 h-3 text-amber-500/70" />
          <span>Non-monetary virtual points & badges only • Zero betting</span>
        </div>

        <button
          id="skip-splash-button"
          onClick={handleDone}
          className="mt-3 text-xs text-amber-400/80 hover:text-amber-300 underline font-mono tracking-wider"
        >
          Skip to App →
        </button>
      </div>
    </div>
  );
};
