import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role) && user.role !== "super_admin") {
        return <Navigate to="/" replace />;
    }
    return children;
}
