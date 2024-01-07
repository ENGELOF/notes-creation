import React, { useEffect, useState } from "react";
import "./App.css";
import { json } from "stream/consumers";

type Note = {
  id: number;
  title: string;
  content: string;
  archivada: boolean;
};

const App = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [archivedCount, setArchivedCount] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);

  const [notes, setNotes] = useState<Note[]>([]);
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes");

        const notes: Note[] = await response.json();

        console.log(notes);

        setNotes(notes);
      } catch (e) {
        console.log(e);
      }
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    const initialActiveNotes = notes.filter((note) => !note.archivada);
    setActiveCount(initialActiveNotes.length);

    const initialArchivedNotes = notes.filter((note) => note.archivada);
    setArchivedCount(initialArchivedNotes.length);

    setActiveNotes(initialActiveNotes);
    setArchivedNotes(initialArchivedNotes);
  }, [notes]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const newNote = await response.json();

      setNotes([newNote, ...notes]);
      setTitle("");
      setContent("");
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdateNote = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedNote) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/notes/${selectedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        }
      );

      const updatedNote = await response.json();

      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      );

      setNotes(updatedNotesList);
      setTitle("");
      setContent("");
      setSelectedNote(null);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedNote(null);
  };

  const deleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();

    try {
      await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "DELETE",
      });
      const updatedNotes = notes.filter((note) => note.id !== noteId);

      setNotes(updatedNotes);
    } catch (e) {
      console.log(e);
    }
  };

  const toggleArchive = (noteId: number) => {
    const updatedNotes = notes.map((note) =>
      note.id === noteId ? { ...note, archivada: !note.archivada } : note
    );
    setNotes(updatedNotes);
  };

  const renderNotes = (notesToRender: Note[]) =>
    notesToRender.map((note) => (
      <div
        className="note-item"
        key={note.id}
        onClick={() => handleNoteClick(note)}
      >
        <button className="btn-archivar" onClick={() => toggleArchive(note.id)}>
          {note.archivada ? "Desarchivar" : "Archivar"}
        </button>
        <div className="notes-header">
          <button onClick={(event) => deleteNote(event, note.id)}>x</button>
        </div>
        <h2>{note.title}</h2>
        <p>{note.content}</p>
      </div>
    ));

  return (
    <div className="app-container">
      <form
        className="note-form"
        onSubmit={(event) =>
          selectedNote ? handleUpdateNote(event) : handleAddNote(event)
        }
      >
        <h3>Nueva nota:</h3>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Titulo"
          required
        ></input>
        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
          }}
          placeholder="Nota"
          maxLength={100}
          rows={10}
          required
        ></textarea>
        {selectedNote ? (
          <div className="edit-buttons">
            <button type="submit">Guardar cambios</button>
            <button onClick={handleCancel}>Cancelar</button>
          </div>
        ) : (
          <button type="submit">Añadir Nota</button>
        )}
        <h3>Notas Activas ({activeCount})</h3>
      </form>
      <div className="notes-grid">{renderNotes(activeNotes)}</div>
      <div>
          <h3>Notas Archivadas ({archivedCount})</h3>
        <div className="archived-notes">
          {renderNotes(archivedNotes)}
        </div>
      </div>
    </div>
  );
};

export default App;
