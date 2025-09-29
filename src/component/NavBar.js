import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";
import ProfileDropdown from "./ProfileDropDown";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();    
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <h4 className="font-bold text-lg">NotesApp</h4>

      {!user ? (
        <div className="space-x-4">
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/signup" className="hover:underline">Signup</Link>
        </div>
      ) : (
        <div className="relative flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
          <FaUserCircle
            size={28}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
          {open && <ProfileDropdown />}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
