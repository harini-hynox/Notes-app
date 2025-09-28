import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./component/NavBar.js";
import Login from "./Login.js";
import Signup from "./Signup.js";
import Notes from "./Notes.js";
import { AuthProvider, useAuth } from "./AuthContext.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginRedirect><Login /></LoginRedirect>} />
          <Route path="/signup" element={<LoginRedirect><Signup /></LoginRedirect>} />
          <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

const LoginRedirect = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/notes" /> : children;
};

export default App;
