// src/store/authStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, PlanType } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface AuthStore {
  isLoggedIn: boolean;
  isSubscribed: boolean;
  plan: PlanType | null;
  user: User | null;
  token: string | null;
  watchlist: number[];

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  subscribe: (plan: PlanType) => void;
  refreshSubscription: () => Promise<void>; // ← NEW
  addToWatchlist: (movieId: number) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      isSubscribed: false,
      plan: null,
      user: null,
      token: null,
      watchlist: [],

      login: async (email: string, password: string) => {
        const res = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed.");
        const { token, data: { user } } = data;
        set({
          isLoggedIn: true,
          token,
          user,
          isSubscribed: user.subscription?.status === "active",
          plan: user.subscription?.plan !== "none" ? user.subscription?.plan : null,
        });
      },

      signup: async (name: string, email: string, password: string) => {
        const res = await fetch(`${API}/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, confirmPassword: password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Signup failed.");
        const { token, data: { user } } = data;
        set({
          isLoggedIn: true,
          token,
          user,
          isSubscribed: false,
          plan: null,
        });
      },

      logout: () =>
        set({
          isLoggedIn: false,
          isSubscribed: false,
          plan: null,
          user: null,
          token: null,
          watchlist: [],
        }),

      subscribe: (plan: PlanType) =>
        set({ isSubscribed: true, plan }),

      // ── NEW: Fetches latest subscription status from backend ─────
      refreshSubscription: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API}/subscriptions/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) return;

          const isActive = data?.data?.isSubscribed === true ||
                           data?.data?.subscription?.status === "active";
          const plan = data?.data?.subscription?.plan || null;

          set({
            isSubscribed: isActive,
            plan: isActive ? plan : null,
          });
        } catch {
          // silently fail — keep existing state
        }
      },

      addToWatchlist: (movieId: number) =>
        set((state) => ({
          watchlist: state.watchlist.includes(movieId)
            ? state.watchlist
            : [...state.watchlist, movieId],
        })),

      removeFromWatchlist: (movieId: number) =>
        set((state) => ({
          watchlist: state.watchlist.filter((id) => id !== movieId),
        })),

      isInWatchlist: (movieId: number) => get().watchlist.includes(movieId),
    }),
    {
      name: "REBAFLIX-auth",
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        isSubscribed: state.isSubscribed,
        plan: state.plan,
        user: state.user,
        token: state.token,
        watchlist: state.watchlist,
      }),
    }
  )
);