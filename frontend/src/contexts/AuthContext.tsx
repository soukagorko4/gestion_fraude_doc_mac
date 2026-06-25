import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface BackendUser {
  id: number;
  username: string;
  prenom: string;
  nom: string;
  contact: string | null;
  active: boolean;
  force_password_change: boolean;
  password_last_changed: string;
  roleId: number | null;
  serviceId: number | null;
  role?: { nomRole: string };
}

interface AuthContextType {
  user: BackendUser | null;
  loading: boolean;
  profile: { username: string; full_name: string; role: string } | null;
  appUser: BackendUser | null;
  refreshAppUser: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ username: string; full_name: string; role: string } | null>(null);
  const [appUser, setAppUser] = useState<BackendUser | null>(null);

  const normalizeUser = (user: any): BackendUser => ({
    ...user,
    force_password_change: user.force_password_change ?? user.forcePasswordChange ?? false,
    password_last_changed: user.password_last_changed ?? user.passwordLastChanged ?? "",
  });

  useEffect(() => {
    loadSession();
  }, []);

  const setCurrentUser = (currentUser: BackendUser | null) => {
    const normalizedUser = currentUser ? normalizeUser(currentUser) : null;
    setUser(normalizedUser);
    setAppUser(normalizedUser);
    setProfile(
      normalizedUser
        ? {
            username: normalizedUser.username,
            full_name: `${normalizedUser.prenom} ${normalizedUser.nom}`,
            role: normalizedUser.role?.nomRole ?? "",
          }
        : null
    );
  };

  const getAccessToken = () => localStorage.getItem("accessToken");
  const getRefreshToken = () => localStorage.getItem("refreshToken");

  const clearAuthStorage = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const fetchCurrentUser = async (accessToken: string) => {
    const res = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user as BackendUser;
  };

  const loadSession = async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const currentUser = await fetchCurrentUser(token);
    if (currentUser) {
      setCurrentUser(currentUser);
    } else {
      clearAuthStorage();
    }
    setLoading(false);
  };

  const signIn = async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) return { error: data };

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setCurrentUser(data.user);

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    }
    clearAuthStorage();
    setCurrentUser(null);
  };

  const refreshAppUser = async () => {
    const token = getAccessToken();
    if (!token) return;

    const currentUser = await fetchCurrentUser(token);
    if (currentUser) {
      setCurrentUser(currentUser);
    } else {
      clearAuthStorage();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, profile, appUser, refreshAppUser, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
