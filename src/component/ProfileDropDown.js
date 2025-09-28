import { useState, useEffect } from "react";
import { useAuth } from "./../AuthContext";
import { supabase } from "./../supabaseClient";

const ProfileDropdown = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Load profile data
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("notes-profile")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setUsername(data.username || "");
        setAvatarUrl(data.avatar_url || null);
      }
      if (error) console.error("Error loading profile:", error);
    };

    fetchProfile();
  }, [user]);

  // Handle image selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  // Upload avatar to Supabase
  const uploadAvatar = async () => {
    if (!file || !user) return;

    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-pic")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }

    const { data } = supabase.storage.from("profile-pic").getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from("notes-profile")
      .upsert({ id: user.id, username, avatar_url: data.publicUrl });

    if (dbError) console.error("DB error:", dbError);

    setAvatarUrl(data.publicUrl);
    setFile(null);
    setPreviewUrl(null);
  };

  // Save username only
  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("notes-profile")
      .upsert({ id: user.id, username, avatar_url: avatarUrl });
    if (error) console.error("Save error:", error);
  };

  return (
    <div className="absolute top-12 right-0 bg-white text-black rounded shadow-md p-3 w-64">
      <p className="font-bold mb-2">Profile</p>
      <hr className="my-2" />

      {/* Avatar Preview */}
      <div className="flex flex-col items-center mb-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="preview"
            className="w-20 h-20 rounded-full object-cover mb-2"
          />
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover mb-2"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-2">
            <span className="text-gray-600">No Img</span>
          </div>
        )}

        {/* File chosen message */}
        <p className="text-sm text-gray-500 mb-1">
          {file ? file.name : "No file chosen"}
        </p>

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          id="fileInput"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Custom Choose File button */}
        <button
          onClick={() => document.getElementById("fileInput").click()}
          className="bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 mb-2"
        >
          Choose File
        </button>

        {/* Upload button */}
        <button
          onClick={uploadAvatar}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Upload
        </button>
      </div>

      {/* Username */}
      <label className="block mb-1">Username:</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border w-full p-2 rounded mb-3"
      />
      <button
        onClick={saveProfile}
        className="w-full bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
      >
        Save Profile
      </button>

      {/* User Email */}
      <p className="mt-4 text-sm text-gray-600">Email: {user?.email}</p>
    </div>
  );
};

export default ProfileDropdown;
