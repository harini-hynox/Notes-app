import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Editor from "react-simple-wysiwyg";
import { API } from "./api"; // axios instance that attaches Supabase token
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notes = () => {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch notes
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const fetchNotes = async () => {
      try {
        setLoading(true);
        const res = await API.get("/notes");
        if (mounted) setNotes(res.data || []);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        toast.error("Failed to load notes");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotes();
    return () => {
      mounted = false;
    };
  }, [user]);

  const getRandomColor = () => {
    const colors = [
      "bg-yellow-200",
      "bg-green-200",
      "bg-pink-200",
      "bg-blue-200",
      "bg-purple-200",
      "bg-red-200",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Create or update note
  const handleSave = async () => {
    if (!note.trim() || !user) return;

    try {
      if (editingNote) {
        const res = await API.put(`/notes/${editingNote._id}`, { content: note });
        setNotes((prev) => prev.map((n) => (n._id === editingNote._id ? res.data : n)));
        toast.success("Note updated");
        setEditingNote(null);
      } else {
        const newNote = { content: note, color: getRandomColor() };
        const res = await API.post("/notes", newNote);
        setNotes((prev) => [res.data, ...prev]);
        toast.success("Note saved");
      }
      setNote("");
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Failed to save note");
    }
  };

  // Delete note
  const handleDelete = async (id) => {
    const previous = notes;
    setDeletingId(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));

    try {
      await API.delete(`/notes/${id}`);
      toast.success("Note deleted");
      if (editingNote?._id === id) {
        setEditingNote(null);
        setNote("");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      setNotes(previous); // rollback
      toast.error("Failed to delete note");
    } finally {
      setDeletingId(null);
    }
  };

  // Click a note to edit
  const handleNoteClick = (n) => {
    setNote(n.content);
    setEditingNote(n);
  };

  const handleCancel = () => {
    setEditingNote(null);
    setNote("");
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="p-6">
      {/* Editor */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">
          {editingNote ? "Edit Note" : "Create a Note"}
        </h2>
        <Editor value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {editingNote ? "Update Note" : "Save Note"}
          </button>

          {editingNote && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      {loading && <p className="text-gray-500">Loading notes...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((n) => (
          <div
            key={n._id}
            onClick={() => handleNoteClick(n)}
            className={`${n.color} p-4 rounded-lg shadow-md relative cursor-pointer hover:shadow-lg transition`}
          >
            {/* Render styled content */}
            <div
              className="prose prose-sm sm:prose lg:prose-lg max-w-none prose-a:text-blue-600 prose-a:underline prose-li:marker:text-gray-700"
              dangerouslySetInnerHTML={{ __html: n.content }}
            />

            {/* Delete Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(n._id);
              }}
              disabled={deletingId === n._id}
              aria-label="Delete note"
              className="absolute top-2 right-2 text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              {deletingId === n._id ? "..." : "✕"}
            </button>
          </div>
        ))}
      </div>

      {!loading && notes.length === 0 && (
        <p className="text-gray-600 mt-4">No notes yet. Start writing!</p>
      )}
    </div>
  );
};

export default Notes;
