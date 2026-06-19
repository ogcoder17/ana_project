import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthed, booting } = useAuth();

  if (booting) {
    return <div style={{ padding: 40 }}>⏳ Loading...</div>;
  }

  return isAuthed ? children : <Navigate to="/login" replace />;
}