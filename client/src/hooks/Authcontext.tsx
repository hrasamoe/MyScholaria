import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { getMe, logout as lougoutServide } from "@/services/auth.service";
interface User {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  establishment_name?: string;
  is_aproved?: boolean;
  establishment_id?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuth: boolean;
  saveAuth: (user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const saveAuth = (user: User) => {
    setUser(user);
  };

  const clearAuth = async () => {
    await lougoutServide();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuth: !!user,
        saveAuth,
        clearAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
