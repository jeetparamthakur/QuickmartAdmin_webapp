"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { AdminUser } from "@/lib/types";
import { hasPermission, type Permission } from "@/lib/permissions/matrix";
import { authApi } from "@/lib/api/admin";
import { clearStoredTokens, getStoredToken } from "@/lib/api/client";

interface AuthContextValue {
  user: AdminUser | null;
  permissions: string[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "m3ad-admin-auth";

function readStoredUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AdminUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => readStoredUser());
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => {
        const u: AdminUser = {
          id: res.user.id,
          name: res.user.name ?? res.user.email,
          email: res.user.email,
          role: "OPERATIONS_MANAGER",
          status: "ACTIVE",
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        setUser(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        return authApi.permissions();
      })
      .then((perms) => setPermissions(perms ?? []))
      .catch(() => {
        clearStoredTokens();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const u: AdminUser = {
      id: res.user.id,
      name: res.user.name ?? email,
      email: res.user.email,
      role: "OPERATIONS_MANAGER",
      status: "ACTIVE",
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    const perms = await authApi.permissions().catch(() => [] as string[]);
    setPermissions(perms);
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    setUser(null);
    setPermissions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const can = useCallback(
    (permission: Permission) => {
      if (!user) return false;
      if (permissions.includes("admin:all")) return true;
      return hasPermission(user.role, permission);
    },
    [user, permissions],
  );

  return (
    <AuthContext.Provider value={{ user, permissions, login, logout, can, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
