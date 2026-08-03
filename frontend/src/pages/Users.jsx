import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, X, Loader2 } from "lucide-react";

const ROLES = ["super_admin", "admin", "coordinador", "supervisor", "auditor"];

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ full_name: "", email: "", role: "auditor", password: "" });
    const [err, setErr] = useState("");

    async function load() { setLoading(true); const r = await api.get("/users"); setUsers(r.data); setLoading(false); }
    useEffect(() => { load(); }, []);

    async function create() {
        setErr("");
        try {
            await api.post("/users", form);
            setOpen(false);
            setForm({ full_name: "", email: "", role: "auditor", password: "" });
            load();
        } catch (e) { setErr(e?.response?.data?.detail || "Error"); }
    }

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <div className="eyebrow">Administración</div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">Usuarios</h1>
                    <p className="text-sm text-slate-500 mt-2">Gestión de accesos y roles del equipo TyA.</p>
                </div>
                <button data-testid="btn-new-user" onClick={() => setOpen(true)} className="bg-slate-900 text-white text-sm px-4 py-2 flex items-center gap-2 hover:bg-brand transition-colors">
                    <Plus className="h-4 w-4" /> Nuevo usuario
                </button>
            </div>

            <div className="bg-white border border-slate-200">
                {loading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div> : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-3 font-semibold">Nombre</th>
                                <th className="px-6 py-3 font-semibold">Email</th>
                                <th className="px-6 py-3 font-semibold">Rol</th>
                                <th className="px-6 py-3 font-semibold">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-medium text-slate-900">{u.full_name}</td>
                                    <td className="px-6 py-3 text-slate-700 font-mono text-xs">{u.email}</td>
                                    <td className="px-6 py-3"><span className="text-xs uppercase tracking-wider border border-slate-200 px-2 py-0.5">{u.role.replace("_", " ")}</span></td>
                                    <td className="px-6 py-3">{u.active ? <span className="text-xs text-emerald-700">Activo</span> : <span className="text-xs text-slate-500">Inactivo</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {open && (
                <div className="fixed inset-0 z-40 bg-slate-900/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
                    <div className="bg-white border border-slate-200 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                            <div className="font-display text-lg font-semibold">Nuevo usuario</div>
                            <button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {err && <div className="border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">{err}</div>}
                            <label className="block"><div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Nombre completo</div><input data-testid="user-name" value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" /></label>
                            <label className="block"><div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Email</div><input data-testid="user-email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none font-mono" /></label>
                            <label className="block"><div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Rol</div><select data-testid="user-role" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none">{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></label>
                            <label className="block"><div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Contraseña temporal</div><input data-testid="user-password" type="text" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none font-mono" /></label>
                        </div>
                        <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
                            <button onClick={() => setOpen(false)} className="text-sm px-4 py-2 border border-slate-200 hover:bg-slate-50">Cancelar</button>
                            <button data-testid="user-create" onClick={create} className="text-sm px-4 py-2 bg-brand text-white hover:bg-brand-hover">Crear y enviar email</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
