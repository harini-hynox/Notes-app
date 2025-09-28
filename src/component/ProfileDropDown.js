import { useAuth } from "./../AuthContext";

const ProfileDropdown = () => {
  const { user } = useAuth();

  return (
    <div className="absolute top-12 right-0 bg-white text-black rounded shadow-md p-3 w-48">
      <p className="font-bold">Profile</p>
      <hr className="my-2" />
      <p>Email: {user?.email}</p>
      <p>ID: {user?.id}</p>
    </div>
  );
};

export default ProfileDropdown;
