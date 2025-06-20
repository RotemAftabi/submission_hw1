import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  JSX,
} from "react";
import axios from "axios";
import * as authService from "../services/auth";

export interface User {
  name: string;
  email: string;
  username: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    user: Omit<User, "username"> & { username: string; password: string }
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem("user-token");
    // now in stored find the value of "token" key:
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("Parsed token from localStorage:", parsed);
        return parsed.token || null; // Assuming the token is stored under the key "token"
      } catch (error) {
        console.error("Failed to parse token from localStorage:", error);
        return null;
      }
    }
  });

  //    When the provider mounts try to read localStorage if a token already exists

  useEffect(() => {
    if (token && user) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem(
        "user-token",
        JSON.stringify({
          token,
          name: user.name,
          email: user.email,
          username: user.username,
        })
      );
    } else {
      delete axios.defaults.headers.common.Authorization;
      localStorage.removeItem("user-token");
    }
  }, [token, user]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const {
        token: newToken,
        name,
        email,
      } = await authService.login(username, password);
      setToken(newToken);
      setUser({ name, email, username });
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const register = async (
    data: Omit<User, "username"> & { username: string; password: string }
  ) => {
    await authService.createUser(data);
    // After registration, user is redirected to login page
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
