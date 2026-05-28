import { create } from "zustand";
import type { User } from "../types";
import api from "../lib/axios.ts";

interface AuthStore {
  user: User | null;
  login: (user: User) => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),

  login: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");//remove cookie
    } catch (err) {
      // ignore network/server errors but ensure client state cleared
      console.warn("Logout request failed", err);
    } finally {
      localStorage.removeItem("user");
      set({ user: null });
    }
  },
}));