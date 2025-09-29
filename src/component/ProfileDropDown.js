import { useState, useEffect } from "react";
import { useAuth } from "./../AuthContext";
import { supabase } from "./../supabaseClient";
import { toast } from "react-toastify"; // ✅ for notifications
import "react-toastify/dist/ReactToastify.css";

const ProfileDropdown = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [avatarPath, setAvatarPath] = useState(null); // store only file path in DB
  const [avatarUrl, setAvatarUrl] = useState(null);   // signed URL for display
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ✅ Helper to generate signed URL
  const generateSignedUrl = async (path) => {
    if (!path) return null;
    const { data, error } = await supabase.storage
      .from("profile-pic")
      .createSignedUrl(path, 3600); // 1 hour
    if (error) {
      console.error("Signed URL error:", error);
      return null;
    }
    return data.signedUrl;
  };

  // ✅ Load profile (always regenerates signed URL)
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("notes-profile")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        return;
      }

      if (data) {
        setUsername(data.username || "");
        setAvatarPath(data.avatar_url || null);

        if (data.avatar_url) {
          const signedUrl = await generateSignedUrl(data.avatar_url);
          setAvatarUrl(signedUrl);
        }
      }
    };

    fetchProfile();
  }, [user]);

  // ✅ Refresh signed URL every 55 mins (before expiry)
  useEffect(() => {
    if (!avatarPath) return;
    const interval = setInterval(async () => {
      const signedUrl = await generateSignedUrl(avatarPath);
      setAvatarUrl(signedUrl);
    }, 55 * 60 * 1000);
    return () => clearInterval(interval);
  }, [avatarPath]);

  // ✅ Handle file selection
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

  // ✅ Upload avatar
  const uploadAvatar = async () => {
    if (!file || !user) return;

    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-pic")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error("❌ Failed to upload avatar");
      return;
    }

    // Save file path (not signed URL) in DB
    const { error: dbError } = await supabase
      .from("notes-profile")
      .upsert({ id: user.id, username, avatar_url: filePath });

    if (dbError) {
      console.error("DB error:", dbError);
      toast.error("❌ Failed to save avatar in profile");
      return;
    }

    // Show immediately with signed URL
    const signedUrl = await generateSignedUrl(filePath);
    setAvatarPath(filePath);
    setAvatarUrl(signedUrl);
    setFile(null);
    setPreviewUrl(null);

    toast.success("✅ Avatar updated successfully!");
  };

  // ✅ Save username only
  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("notes-profile")
      .upsert({ id: user.id, username, avatar_url: avatarPath }); // save path only
    if (error) {
      console.error("Save error:", error);
      toast.error("❌ Failed to save profile");
    } else {
      toast.success("✅ Profile updated successfully!");
    }
  };

  return (
    <div className="absolute top-12 right-0 bg-white text-black rounded shadow-md p-3 w-64">
      <p className="font-bold mb-2">Profile</p>
      <hr className="my-2" />

      {/* Avatar Preview */}
      <div className="flex flex-col items-center mb-4">
        {previewUrl ? (
          <img src={previewUrl} alt="preview" className="w-20 h-20 rounded-full object-cover mb-2" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover mb-2" />
        ) : (
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mb-2">
            <span className="text-gray-600">No Img</span>
          </div>
        )}

        

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
