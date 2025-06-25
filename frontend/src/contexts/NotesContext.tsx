import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

export interface Note {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    email: string;
  };
}

interface State {
  notes: Note[];
  totalPages: number;
  currentPage: number;
  notification: string;
  refreshCache: boolean; // Used to trigger cache refresh, no regard to value.
}

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
  refreshCache: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_NOTES": {
      const { notes, totalPages } = action.payload;
      return { ...state, notes, totalPages };
    }
    case "ADD_NOTE":
      return {
        ...state,
        notes: [action.payload, ...state.notes],
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
      return { ...state, refreshCache: !state.refreshCache };
    default:
      return state;
  }
}

const NotesContext = createContext<
  | {
      state: State;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const page = state.currentPage;
  // const cache = useNoteCache(page);
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
          payload: { notes: res.data, totalPages: Math.ceil(total / 10) },
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

  return (
    <NotesContext.Provider value={{ state, dispatch }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within NotesProvider");
  return context;
};
