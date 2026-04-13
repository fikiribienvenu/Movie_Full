// src/hooks/useAuth.ts
"use client";

import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const store = useAuthStore();
  return {
    isLoggedIn: store.isLoggedIn,
    isSubscribed: store.isSubscribed,
    plan: store.plan,
    user: store.user,
    token: store.token,
    watchlist: store.watchlist,
    login: store.login,       // now (email, password) => Promise<void>
    logout: store.logout,
    signup: store.signup,     // now (name, email, password) => Promise<void>
    subscribe: store.subscribe,
    addToWatchlist: store.addToWatchlist,
    removeFromWatchlist: store.removeFromWatchlist,
    isInWatchlist: store.isInWatchlist,
  };
};