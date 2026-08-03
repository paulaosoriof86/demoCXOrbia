import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard, Megaphone, MapPin, ClipboardList, FileCheck2,
    BarChart3, Users, Building2, FileSearch, LogOut, Briefcase,
    UserSearch, Users2,
} from "lucide-react";
import AIChat from "@/components/AIChat";
import TyALogo from "@/components/branding/TyALogo";
import GravicentraLogo from "@/components/branding/GravicentraLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TenantProjectSelector from "@/components/TenantProjectSelector";

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    const nav = [
        { to: "/", icon: LayoutDashboard, label: t("nav.dashboard"), testid: "nav-dashboard" },
        { to: "/projects", icon: Briefcase, label: t("nav.projects"), testid: "nav-projects" },
        { to: "/campaigns", icon: Megaphone, label: t("nav.campaigns"), testid: "nav-campaigns" },
        { to: "/visits", icon: MapPin, label: t("nav.visits"), testid: "nav-visits" },
        { to: "/postulations", icon: UserSearch, label: t("nav.postulations"), testid: "nav-postulations" },
        { to: "/shoppers", icon: Users2, label: t("nav.shoppers"), testid: "nav-shoppers" },
        { to: "/forms", icon: ClipboardList, label: t("nav.forms"), testid: "nav-forms" },
        { to: "/evaluations", icon: FileCheck2, label: t("nav.evaluations"), testid: "nav-evaluations" },
        { to: "/reports", icon: BarChart3, label: t("nav.reports"), testid: "nav-reports" },
        { to: "/documents", icon: FileSearch, label: t("nav.documents"), testid: "nav-documents" },
        { to: "/clients", icon: Building2, label: t("nav.clients"), testid: "nav-clients", roles: ["admin", "coordinador"] },
        { to: "/users", icon: Users, label: t("nav.users"), testid: "nav-users", roles: ["admin"] },
    ];

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar */}
            <aside className="hidden md:flex md:flex-col w-[260px] bg-white border-r border-slate-200 shrink-0">
                {/* Tenant brand */}
                <div className="px-6 py-5 border-b border-slate-200">
                    <div className="eyebrow">Tenant</div>
                    <div className="mt-2"><TyALogo className="h-11" /></div>
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

                {/* User */}
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
                            title={t("nav.logout")}
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Gravicentra CX brand footer */}
                <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between bg-slate-50">
                    <div className="text-[10px] text-slate-500 leading-tight">
                        <GravicentraLogo className="h-3 w-3 text-slate-700" withText={true} textClass="text-xs text-slate-700" />
                        <div className="mt-0.5 opacity-70">{t("brand.poweredBy")}</div>
                    </div>
                    <LanguageSwitcher />
                </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Top bar with tenant/project/period selector */}
                <header className="hidden md:flex bg-white border-b border-slate-200 px-6 py-3 items-center justify-between">
                    <TenantProjectSelector />
                    <div className="text-[11px] text-slate-500 font-mono">v1.0 · MVP · {new Date().getFullYear()}</div>
                </header>

                {/* Mobile header */}
                <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <TyALogo className="h-8" />
                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <button onClick={logout} data-testid="btn-logout-mobile" className="p-2 text-slate-600"><LogOut className="h-5 w-5" /></button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto animate-fade-in">
                    {children}
                </main>

                {/* Mobile bottom nav */}
                <nav className="md:hidden bg-white border-t border-slate-200 flex justify-around py-1">
                    {nav.slice(0, 5).map(n => (
                        <NavLink key={n.to} to={n.to} end={n.to === "/"} data-testid={`m-${n.testid}`} className={({isActive}) => `flex flex-col items-center gap-1 py-2 px-2 text-[10px] font-medium ${isActive ? "text-brand" : "text-slate-500"}`}>
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
