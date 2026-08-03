import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem("tya_user");
        return raw ? JSON.parse(raw) : null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("tya_token");
        if (token && !user) {
            api.get("/auth/me").then((r) => {
                setUser(r.data);
                localStorage.setItem("tya_user", JSON.stringify(r.data));
            }).catch(() => {});
        }
    }, []);

    async function login(email, password) {
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });
            localStorage.setItem("tya_token", data.access_token);
            localStorage.setItem("tya_user", JSON.stringify(data.user));
            setUser(data.user);
            return data.user;
        } finally { setLoading(false); }
    }

    function logout() {
        localStorage.removeItem("tya_token");
        localStorage.removeItem("tya_user");
        setUser(null);
        window.location.href = "/login";
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
