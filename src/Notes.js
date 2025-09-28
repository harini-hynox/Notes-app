import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Editor from "react-simple-wysiwyg";
import axios from "axios";

const API_URL = "http://localhost:5000"; // backend URL

const Notes = () => {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch notes only if user exists
  useEffect(() => {
    if (!user) return;
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/notes/${user.id}`);
        setNotes(res.data);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [user]);

  // ✅ Save a new note
  const handleSave = async () => {
    if (!note.trim() || !user) return;
    try {
      const newNote = {
        userId: user.id,
        content: note,
        color: getRandomColor(),
      };
      const res = await axios.post(`${API_URL}/notes`, newNote);
      setNotes([res.data, ...notes]);
      setNote("");
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  // ✅ Delete a note
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/notes/${id}`);
      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

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

  // ✅ Redirect AFTER hooks are declared
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="p-6">
      {/* New Note Template */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Create a Note</h2>
        <Editor value={note} onChange={(e) => setNote(e.target.value)} />
        <button
          onClick={handleSave}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Save Note
        </button>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading notes...</p>}

      {/* Saved Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((n) => (
          <div
            key={n._id}
            className={`${n.color} p-4 rounded-lg shadow-md relative`}
          >
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: n.content }}
            />
            <button
              onClick={() => handleDelete(n._id)}
              className="absolute top-2 right-2 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && notes.length === 0 && (
        <p className="text-gray-600 mt-4">No notes yet. Start writing!</p>
      )}
    </div>
  );
};

export default Notes;
