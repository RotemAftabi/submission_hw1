// import { useNotes } from "../contexts/NotesContext";
import { useNoteCache } from "../hooks/useNoteCache";
import Note from "./Note";
import { useNotes as useNotesFromAuth } from "../contexts/AuthContext";
// import { useState } from "react";
// import { useNotes } from "../contexts/NotesContext";

export default function NoteList() {
  const { state, dispatch } = useNotesFromAuth();
  const currentPage = state.currentPage;
  const refreshCounter = state.refreshCounter;
  // uncomment next line when state is resolved
  // const { dispatch, state } = useNotes();

  // קבלת הפתקים מה־cache לפי העמוד הנוכחי
  const notes = useNoteCache(currentPage, refreshCounter);

  return (
    <div className="note-list">
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
      <label>
        <input
          type="checkbox"
          name="toggle_sanitize"
          checked={state.sanitize}
          onChange={(e) => dispatch({ type: "TOGGLE_SANITIZE" })}
        />
        Sanitize HTML
      </label>
    </div>
  );
}
