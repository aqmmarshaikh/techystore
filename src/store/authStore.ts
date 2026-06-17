import { create } from "zustand";
import { User as FirebaseUser } from "firebase/auth";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  addresses: any[];
  wishlist: string[];
  recentlyViewed: string[];
  readBroadcasts?: string[];
  deletedBroadcasts?: string[];
  createdAt: string;
}

interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  updateProfileData: (data: Partial<UserProfile>) => void;
  addAddressData: (address: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  updateProfileData: (data) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...data } : null
  })),
  addAddressData: (address) => set((state) => ({
    profile: state.profile ? { 
      ...state.profile, 
      addresses: [...(state.profile.addresses || []), address] 
    } : null
  })),
  logout: () => set({ user: null, profile: null, isLoading: false }),
}));
