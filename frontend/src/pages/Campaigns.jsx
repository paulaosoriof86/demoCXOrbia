import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Plus, X, Loader2 } from "lucide-react";

const statusBadges = {
    borrador: "bg-slate-100 text-slate-700 border-slate-200",
    activa: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pausada: "bg-amber-50 text-amber-700 border-amber-200",
    finalizada: "bg-slate-50 text-slate-500 border-slate-200",
};

export default function Campaigns() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openNew, setOpenNew] = useState(false);
    const [clients, setClients] = useState([]);
    const [forms, setForms] = useState([]);
    const [form, setForm] = useState({ name: "", client_id: "", form_id: "", description: "", status: "borrador" });

    async function load() {
        setLoading(true);
        const [c, cl, f] = await Promise.all([
            api.get("/campaigns"), api.get("/clients"), api.get("/forms"),
        ]);
        setRows(c.data); setClients(cl.data); setForms(f.data);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    async function create() {
        if (!form.name || !form.client_id || !form.form_id) return;
        await api.post("/campaigns", { ...form, target_points_of_sale: [] });
        setOpenNew(false);
        setForm({ name: "", client_id: "", form_id: "", description: "", status: "borrador" });
        await load();
    }

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <div className="eyebrow">Operación</div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">Campañas</h1>
                    <p className="text-sm text-slate-500 mt-2">Programas de auditoría en ejecución y planificación.</p>
                </div>
                <button data-testid="btn-new-campaign" onClick={() => setOpenNew(true)} className="bg-slate-900 text-white text-sm px-4 py-2 flex items-center gap-2 hover:bg-brand transition-colors">
                    <Plus className="h-4 w-4" /> Nueva campaña
                </button>
            </div>

            <div className="bg-white border border-slate-200">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-3 font-semibold">Nombre</th>
                                <th className="px-6 py-3 font-semibold">Cliente</th>
                                <th className="px-6 py-3 font-semibold">Estado</th>
                                <th className="px-6 py-3 font-semibold">Puntos de venta</th>
                                <th className="px-6 py-3 font-semibold">Vencimiento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((r) => {
                                const cli = clients.find(c => c.id === r.client_id);
                                return (
                                    <tr key={r.id} className="hover:bg-slate-50 transition-colors" data-testid={`campaign-row-${r.id}`}>
                                        <td className="px-6 py-4">
                                            <Link to={`/campaigns/${r.id}`} className="font-medium text-slate-900 hover:text-brand">{r.name}</Link>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{r.id.slice(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">{cli?.name || "—"}</td>
                                        <td className="px-6 py-4"><span className={`text-xs px-2 py-1 border ${statusBadges[r.status]}`}>{r.status}</span></td>
                                        <td className="px-6 py-4 font-mono text-slate-700">{r.target_points_of_sale?.length || 0}</td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">{r.ends_at ? new Date(r.ends_at).toLocaleDateString("es-AR") : "—"}</td>
                                    </tr>
                                );
                            })}
                            {!rows.length && <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">Sin campañas todavía.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>

            {openNew && (
                <div className="fixed inset-0 z-40 bg-slate-900/40 flex items-center justify-center p-4" onClick={() => setOpenNew(false)}>
                    <div className="bg-white border border-slate-200 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                            <div className="font-display text-lg font-semibold">Nueva campaña</div>
                            <button onClick={() => setOpenNew(false)} className="text-slate-400 hover:text-slate-900"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <label className="block">
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Nombre</div>
                                <input data-testid="campaign-name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                            </label>
                            <label className="block">
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Cliente</div>
                                <select data-testid="campaign-client" value={form.client_id} onChange={(e) => setForm({...form, client_id: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none">
                                    <option value="">— Elegir —</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Formulario</div>
                                <select data-testid="campaign-form" value={form.form_id} onChange={(e) => setForm({...form, form_id: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none">
                                    <option value="">— Elegir —</option>
                                    {forms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Descripción</div>
                                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                            </label>
                        </div>
                        <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
                            <button onClick={() => setOpenNew(false)} className="text-sm px-4 py-2 border border-slate-200 hover:bg-slate-50">Cancelar</button>
                            <button data-testid="campaign-create" onClick={create} className="text-sm px-4 py-2 bg-brand text-white hover:bg-brand-hover">Crear</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
