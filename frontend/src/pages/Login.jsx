import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            await login(email, password);
            nav("/");
        } catch (e) {
            setErr(e?.response?.data?.detail || "No pudimos iniciar sesión");
        } finally { setLoading(false); }
    }

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            {/* Left brand panel */}
            <div className="hidden md:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="relative">
                    <div className="eyebrow text-slate-400">Consultores</div>
                    <div className="font-display text-5xl font-bold mt-2">TyA<span className="text-brand">.</span></div>
                </div>
                <div className="relative">
                    <h1 className="font-display text-3xl leading-tight font-semibold max-w-md">
                        Auditoría de campo,<br />
                        con precisión de consultora.
                    </h1>
                    <p className="text-sm text-slate-400 mt-4 max-w-md leading-relaxed">
                        Gestión de campañas, planificación de visitas, evaluaciones y reportería asistida por inteligencia artificial. Diseñado para operar con rigor en cada punto de venta.
                    </p>
                </div>
                <div className="relative text-xs text-slate-500 font-mono">
                    v1.0 · MVP · {new Date().getFullYear()}
                </div>
            </div>

            {/* Right form */}
            <div className="flex items-center justify-center px-6 py-12 bg-white">
                <form onSubmit={submit} className="w-full max-w-sm" data-testid="login-form">
                    <div className="eyebrow">Ingreso</div>
                    <h2 className="font-display text-3xl font-bold text-slate-900 mt-2">Iniciá sesión</h2>
                    <p className="text-sm text-slate-500 mt-2">Accedé a la plataforma con tu cuenta corporativa.</p>

                    {err && (
                        <div className="mt-6 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" data-testid="login-error">
                            {err}
                        </div>
                    )}

                    <div className="mt-6 space-y-4">
                        <label className="block">
                            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Email</div>
                            <input
                                data-testid="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none font-mono"
                                placeholder="tu@empresa.com"
                            />
                        </label>
                        <label className="block">
                            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Contraseña</div>
                            <input
                                data-testid="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none font-mono"
                                placeholder="••••••••"
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        data-testid="login-submit"
                        className="mt-6 w-full bg-brand hover:bg-brand-hover text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Ingresar
                    </button>

                    <div className="mt-8 border-t border-slate-100 pt-4">
                        <div className="eyebrow mb-2">Cuentas demo</div>
                        <div className="text-xs text-slate-500 space-y-1 font-mono">
                            <div>paula.osorio.f86@gmail.com · TyA2026!</div>
                            <div>coordinador@tya.com · Coord2026!</div>
                            <div>auditor@tya.com · Audit2026!</div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
