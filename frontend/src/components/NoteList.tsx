// import { useNotes } from "../contexts/NotesContext";
import { useNoteCache } from "../hooks/useNoteCache";
import Note from "./Note";
import { useNotes } from "../contexts/AuthContext";

export default function NoteList() {
  const { state } = useNotes();
  const currentPage = state.currentPage;
  const refreshCounter = state.refreshCounter;

  // קבלת הפתקים מה־cache לפי העמוד הנוכחי
  const notes = useNoteCache(currentPage, refreshCounter);

  return (
    <div>
      {notes.map((note) => (
        <Note
          key={note._id}
          _id={note._id}
          title={note.title}
          content={note.content}
          author={note.author}
        />
      ))}
    </div>
  );
}
