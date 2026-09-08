import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_ADMIN_USER, DEMO_PLAYER_USER } from '../data/initialData';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; pass: string; username: string; ffNickname: string; ffPlayerId: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  switchRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  loginAsDemo: (role: 'player' | 'admin') => void;
  allUsers: UserProfile[];
  toggleBanUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'kohinoor_users_v2';
const CURRENT_USER_KEY = 'kohinoor_current_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse users', e);
      }
    }
    return [DEMO_ADMIN_USER, DEMO_PLAYER_USER];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse current user', e);
      }
    }
    return DEMO_PLAYER_USER; // Default to player on first load so user immediately sees live app
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const login = async (email: string, _pass: string) => {
    // Check if user exists
    const user = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'User not found with this email. Please create an account or use Demo Login.' };
    }
    if (user.isBanned) {
      return { success: false, error: 'This Free Fire account has been suspended for fair play violation.' };
    }
    setCurrentUser(user);
    return { success: true };
  };

  const register = async (data: { email: string; pass: string; username: string; ffNickname: string; ffPlayerId: string }) => {
    if (allUsers.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    if (allUsers.some((u) => u.ffPlayerId.toLowerCase() === data.ffPlayerId.toLowerCase())) {
      return { success: false, error: 'This Free Fire Player ID is already registered.' };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: data.email,
      username: data.username,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.username)}`,
      ffPlayerId: data.ffPlayerId,
      ffNickname: data.ffNickname,
      virtualPoints: 500, // Welcome bonus of non-monetary virtual points
      totalMatches: 0,
      wins: 0,
      kills: 0,
      positionStats: { first: 0, second: 0, third: 0, top10: 0 },
      role: 'player',
      isBanned: false,
      badges: ['badge-first-blood'],
      createdAt: new Date().toISOString(),
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    const user = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'No registered user found with that email address.' };
    }
    return { success: true, message: `Password reset verification link simulated for ${email}. Check your inbox!` };
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const loginAsDemo = (role: 'player' | 'admin') => {
    if (role === 'admin') {
      const admin = allUsers.find((u) => u.role === 'admin') || DEMO_ADMIN_USER;
      setCurrentUser(admin);
    } else {
      const player = allUsers.find((u) => u.role === 'player') || DEMO_PLAYER_USER;
      setCurrentUser(player);
    }
  };

  const toggleBanUser = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, isBanned: !u.isBanned };
          if (currentUser?.id === userId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        login,
        register,
        logout,
        resetPassword,
        switchRole,
        updateProfile,
        loginAsDemo,
        allUsers,
        toggleBanUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
