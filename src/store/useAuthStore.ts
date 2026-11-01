import { create } from 'zustand';
import { UserProfile } from '../types';
import { getStoredUserProfile, updateUserProfile, purgeAllUserData } from '../services/api';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, fullName?: string) => Promise<void>;
  logout: () => void;
  setConsent: (consent: boolean) => void;
  refreshUser: () => void;
  purgeUserData: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUserProfile(),
  isAuthenticated: true, // Auto-authenticated in demo/hackathon mode for seamless evaluation
  isLoading: false,

  login: async (email: string, fullName: string = 'Policyholder') => {
    set({ isLoading: true });
    const updated = updateUserProfile({
      email,
      full_name: fullName,
      consent_given: true,
      consent_timestamp: new Date().toISOString()
    });
    set({ user: updated, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    set({ isAuthenticated: false });
  },

  setConsent: (consent: boolean) => {
    const updated = updateUserProfile({
      consent_given: consent,
      consent_timestamp: consent ? new Date().toISOString() : undefined
    });
    set({ user: updated });
  },

  refreshUser: () => {
    set({ user: getStoredUserProfile() });
  },

  purgeUserData: () => {
    purgeAllUserData();
    set({ user: getStoredUserProfile() });
  }
}));
