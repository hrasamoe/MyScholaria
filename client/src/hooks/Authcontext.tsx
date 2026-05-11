import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuth: boolean;
  saveAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    try {
      if (saved && saved !== "undefined") setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem("user");
      setLoading(false);
    }
  }, []);

  const saveAuth = (user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(user);
  };

  const clearAuth = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuth: !!user,
        saveAuth,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
