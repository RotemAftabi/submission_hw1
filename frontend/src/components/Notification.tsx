// import { useNotes } from "../contexts/NotesContext";
import { useNotes } from "../contexts/AuthContext";

export default function Notification() {
  const { state } = useNotes();
  const { notification } = state;

  return <div className="notification">{notification}</div>;
}
