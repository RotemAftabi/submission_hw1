import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import * as authService from "../services/auth";

// Types
export interface Note {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
}

export interface User {
  name: string;
  email: string;
  username: string;
}

interface State {
  notes: Note[];
  totalPages: number;
  currentPage: number;
  notification: string;
  refreshCounter: number; // Used to trigger cache refresh, no regard to value.
}

// AuthContext types
interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    user: Omit<User, "username"> & { username: string; password: string }
  ) => Promise<void>;
  logout: () => void;
  state: State;
  dispatch: React.Dispatch<Action>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Actions
type Action =
  | { type: "SET_NOTES"; payload: { notes: Note[]; totalPages: number } }
  | { type: "ADD_NOTE"; payload: Note }
  | { type: "UPDATE_NOTE"; payload: Note }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_NOTIFICATION"; payload: string }
  | { type: "TRIGGER_REFRESH_CACHE" };

const initialState: State = {
  notes: [],
  totalPages: 1,
  currentPage: 1,
  notification: "",
  refreshCounter: 0,
};

function reducer(state: State, action: Action): State {
  console.log("Reducer got state:", state);
  console.log("Reducer got action:", action);
  switch (action.type) {
    case "SET_NOTES": {
      const { notes, totalPages } = action.payload;
      return { ...state, notes, totalPages };
    }
    case "ADD_NOTE":
      return {
        ...state,
        notes: [action.payload, ...(state.notes || [])],
        notification: "Added a new note",
      };
    case "UPDATE_NOTE":
      return {
        ...state,
        notes: state.notes.map((n) =>
          n._id === action.payload._id ? action.payload : n
        ),
        notification: "Note updated",
      };
    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter((n) => n._id !== action.payload),
        notification: "Note deleted",
      };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_NOTIFICATION":
      return { ...state, notification: action.payload };
    case "TRIGGER_REFRESH_CACHE":
      return {
        ...state,
        refreshCounter: (state.refreshCounter ?? 0) + 1,
      };
    default:
      return state;
  }
}

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [initialized, setInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem("user-token");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.token || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user-token");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          name: parsed.name,
          email: parsed.email,
          username: parsed.username,
        };
      } catch {
        return null;
      }
    }
    return null;
  });
  // inital useEffect to load token and user from localStorage:
  useEffect(() => {
    const saved = localStorage.getItem("user-token");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setToken(parsed.token);
        setUser({
          name: parsed.name,
          email: parsed.email,
          username: parsed.username,
        });
      } catch {
        console.error("Failed to parse user-token from localStorage");
      }
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    dispatch({ type: "SET_NOTIFICATION", payload: "" });

    if (token && user) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem("user-token", JSON.stringify({ token, ...user }));
    } else {
      delete axios.defaults.headers.common.Authorization;
      localStorage.removeItem("user-token");
    }
  }, [token, user]);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/notes`,
          {
            params: { _page: state.currentPage, _per_page: 10 },
          }
        );
        const total = parseInt(res.headers["x-total-count"], 10);
        dispatch({
          type: "SET_NOTES",
          payload: { notes: res.data.notes, totalPages: Math.ceil(total / 10) },
        });
      } catch (err) {
        dispatch({
          type: "SET_NOTIFICATION",
          payload: "Failed to fetch notes",
        });
      }
    }

    fetchNotes();
  }, [state.currentPage]);

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
      return false;
    }
  };

  const register = async (
    data: Omit<User, "username"> & { username: string; password: string }
  ) => {
    await authService.createUser(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };
  if (!initialized) return null;
  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, state, dispatch }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
export const useNotes = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useNotes must be used within NotesProvider");
  return context;
};
