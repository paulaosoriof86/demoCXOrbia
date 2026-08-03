import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard, Megaphone, MapPin, ClipboardList, FileCheck2,
    BarChart3, Users, Building2, FileSearch, LogOut, ChevronRight,
} from "lucide-react";
import AIChat from "@/components/AIChat";

const nav = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", testid: "nav-dashboard" },
    { to: "/campaigns", icon: Megaphone, label: "Campañas", testid: "nav-campaigns" },
    { to: "/visits", icon: MapPin, label: "Visitas", testid: "nav-visits" },
    { to: "/forms", icon: ClipboardList, label: "Formularios", testid: "nav-forms" },
    { to: "/evaluations", icon: FileCheck2, label: "Evaluaciones", testid: "nav-evaluations" },
    { to: "/reports", icon: BarChart3, label: "Reportes", testid: "nav-reports" },
    { to: "/documents", icon: FileSearch, label: "IA · Documentos", testid: "nav-documents" },
    { to: "/clients", icon: Building2, label: "Clientes", testid: "nav-clients", roles: ["admin", "coordinador"] },
    { to: "/users", icon: Users, label: "Usuarios", testid: "nav-users", roles: ["admin"] },
];

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar */}
            <aside className="hidden md:flex md:flex-col w-[260px] bg-white border-r border-slate-200 shrink-0">
                <div className="px-6 py-6 border-b border-slate-200">
                    <div className="eyebrow">Consultores</div>
                    <div className="font-display text-2xl font-bold tracking-tight text-slate-900 mt-1">
                        TyA<span className="text-brand">.</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Plataforma de auditoría</div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {nav.filter(n => !n.roles || n.roles.includes(user?.role) || user?.role === "super_admin").map((n) => (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.to === "/"}
                            data-testid={n.testid}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 px-3 py-2 text-sm font-medium border-l-2 transition-colors duration-150 ${
                                    isActive
                                        ? "border-brand bg-slate-50 text-slate-900"
                                        : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`
                            }
                        >
                            <n.icon className="h-4 w-4" strokeWidth={1.75} />
                            <span>{n.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-slate-900 text-white flex items-center justify-center font-display font-bold text-sm">
                            {user?.full_name?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate" data-testid="user-name">{user?.full_name}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">{user?.role?.replace("_", " ")}</div>
                        </div>
                        <button
                            onClick={logout}
                            data-testid="btn-logout"
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Mobile header */}
                <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <div className="font-display text-lg font-bold">TyA<span className="text-brand">.</span></div>
                    <button onClick={logout} data-testid="btn-logout-mobile" className="p-2 text-slate-600"><LogOut className="h-5 w-5" /></button>
                </header>

                <main className="flex-1 overflow-y-auto animate-fade-in">
                    {children}
                </main>

                {/* Mobile bottom nav */}
                <nav className="md:hidden bg-white border-t border-slate-200 flex justify-around py-1">
                    {nav.slice(0, 5).map(n => (
                        <NavLink key={n.to} to={n.to} end={n.to === "/"} data-testid={`m-${n.testid}`} className={({isActive}) => `flex flex-col items-center gap-1 py-2 px-3 text-[10px] font-medium ${isActive ? "text-brand" : "text-slate-500"}`}>
                            <n.icon className="h-4 w-4" />
                            <span>{n.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <AIChat />
        </div>
    );
}
