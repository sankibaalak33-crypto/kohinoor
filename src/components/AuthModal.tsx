import React, { useState } from 'react';
import { Shield, Sparkles, User, Mail, Lock, Gamepad2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, resetPassword, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regFfNickname, setRegFfNickname] = useState('');
  const [regFfPlayerId, setRegFfPlayerId] = useState('');

  // Forgot pass state
  const [forgotEmail, setForgotEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(loginEmail, loginPass);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Authentication failed');
    } else {
      if (onClose) onClose();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regUsername || !regEmail || !regPass || !regFfNickname || !regFfPlayerId) {
      setError('Please fill out all registration fields.');
      return;
    }
    if (regPass.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const res = await register({
      email: regEmail,
      pass: regPass,
      username: regUsername,
      ffNickname: regFfNickname,
      ffPlayerId: regFfPlayerId,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Registration failed');
    } else {
      if (onClose) onClose();
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!forgotEmail) {
      setError('Enter your registered email address.');
      return;
    }
    setLoading(true);
    const res = await resetPassword(forgotEmail);
    setLoading(false);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-md bg-[#0f1118] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-white my-8"
      >
        {/* Top Emblem */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 mb-3">
            <div className="w-full h-full bg-[#0a0b10] rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold font-heading uppercase tracking-wide text-white">
            KOHINOOR <span className="gold-gradient-text">FF</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'login' && 'Sign in to join esports tournaments'}
            {mode === 'register' && 'Register your Free Fire contender profile'}
            {mode === 'forgot' && 'Reset your password securely'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-gray-900/90 p-1 border border-white/5 mb-6 text-xs font-semibold">
          <button
            id="tab-login"
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            id="tab-register"
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            id="tab-forgot"
            type="button"
            onClick={() => {
              setMode('forgot');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'forgot'
                ? 'bg-amber-500 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Forgot
          </button>
        </div>

        {/* Error / Success alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 flex items-start space-x-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-start space-x-2 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="player@kohinooresports.com"
                  className="w-full bg-[#161822] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-gray-300">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#161822] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Login Bar */}
            <div className="pt-3 border-t border-white/10">
              <div className="text-[11px] text-gray-400 text-center mb-2.5 font-mono uppercase">
                ⚡ Instant Test Credentials
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="demo-login-player"
                  type="button"
                  onClick={() => {
                    loginAsDemo('player');
                    if (onClose) onClose();
                  }}
                  className="py-2 px-3 rounded-lg bg-[#1a1d28] hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 text-xs text-amber-300 font-medium transition-all text-center flex items-center justify-center space-x-1"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo Player</span>
                </button>
                <button
                  id="demo-login-admin"
                  type="button"
                  onClick={() => {
                    loginAsDemo('admin');
                    if (onClose) onClose();
                  }}
                  className="py-2 px-3 rounded-lg bg-[#1a1d28] hover:bg-yellow-500/10 border border-white/10 hover:border-yellow-500/40 text-xs text-yellow-300 font-medium transition-all text-center flex items-center justify-center space-x-1"
                >
                  <Shield className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Demo Admin</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="register-username-input"
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="ApexHunter"
                  className="w-full bg-[#161822] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  FF Nickname (IGN)
                </label>
                <input
                  id="register-ign-input"
                  type="text"
                  required
                  value={regFfNickname}
                  onChange={(e) => setRegFfNickname(e.target.value)}
                  placeholder="⚡APEX_KNG⚡"
                  className="w-full bg-[#161822] border border-white/10 focus:border-amber-500/60 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Free Fire Player ID (UID)
                </label>
                <input
                  id="register-ffuid-input"
                  type="text"
                  required
                  value={regFfPlayerId}
                  onChange={(e) => setRegFfPlayerId(e.target.value)}
                  placeholder="FF-88491024"
                  className="w-full bg-[#161822] border border-white/10 focus:border-amber-500/60 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="register-email-input"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="hunter@example.com"
                  className="w-full bg-[#161822] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="register-password-input"
                  type="password"
                  required
                  minLength={6}
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#161822] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              <span>🎁 Bonus 500 Virtual Points (VP) + Rookie Contender Badge upon registration!</span>
            </div>

            <button
              id="register-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="forgot-email-input"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="player@kohinooresports.com"
                  className="w-full bg-[#161822] border border-white/10 focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              id="forgot-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 px-4 rounded-xl text-sm transition-all"
            >
              {loading ? 'Sending link...' : 'Send Reset Verification Link'}
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-xs text-gray-400 hover:text-amber-400 text-center py-1 block"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Anti-gambling footer notice */}
        <p className="text-[10px] text-gray-500 text-center mt-5 leading-tight">
          Kohinoor FF Tournaments is a free esports ranking network. No real-money betting, cash prizes, or financial wagering is allowed or supported.
        </p>
      </div>
    </div>
  );
};
