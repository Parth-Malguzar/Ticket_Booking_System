import { create } from "zustand";
import type { User } from "../types";

interface AuthStore {
  user: User | null;
  token: string | null;

  login: (
    user: User,
    token: string,
    isRemember: boolean
  ) => void;

  logout: () => void;
}

const storage =//check after each refresh
  localStorage.getItem("token")
    ? localStorage
    : sessionStorage;

export const useAuthStore =
  create<AuthStore>((set) => ({

    user: JSON.parse(
      storage.getItem("user") || "null"
    ),

    token: JSON.parse(
      storage.getItem("token") || "null"
    ),

    login: (
      user,
      token,
      isRemember
    ) => {

      const storage = isRemember//check wrt remember me checkbox
        ? localStorage
        : sessionStorage;

      storage.setItem(
        "user",
        JSON.stringify(user)
      );

      storage.setItem(
        "token",
        JSON.stringify(token)
      );

      set({ user, token });
    },

    logout: () => {

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");

      set({
        user: null,
        token: null,
      });
    },
}));