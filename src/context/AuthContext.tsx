"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchMe,
  getStoredToken,
  loginUser,
  registerUser,
  setStoredToken,
  type AuthUser,
} from "@/lib/auth-client";
import type { AvatarSelection } from "@/lib/avatars";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  authOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    avatar?: AvatarSelection,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { user: me } = await fetchMe();
      setUser(me);
    } catch {
      setStoredToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(async (username: string, password: string) => {
    const { token, user: u } = await loginUser(username, password);
    setStoredToken(token);
    setUser(u);
    setAuthOpen(false);
  }, []);

  const register = useCallback(
    async (username: string, password: string, avatar?: AvatarSelection) => {
      const res = await registerUser(username, password, avatar);
      if (res.code !== 0 || !res.token) {
        throw new Error(res.msg || "注册失败");
      }
      setStoredToken(res.token);
      if (res.user) setUser(res.user);
      else await refreshUser();
      setAuthOpen(false);
    },
    [refreshUser],
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authOpen,
      openAuth: () => setAuthOpen(true),
      closeAuth: () => setAuthOpen(false),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, authOpen, login, register, logout, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
