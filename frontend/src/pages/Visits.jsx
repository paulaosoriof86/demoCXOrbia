import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

const statusBadges = {
    planificada: "bg-slate-100 text-slate-700",
    en_curso: "bg-amber-50 text-amber-800",
    completada: "bg-emerald-50 text-emerald-800",
    auditada: "bg-blue-50 text-blue-800",
    rechazada: "bg-red-50 text-red-800",
};

export default function Visits() {
    const [visits, setVisits] = useState([]);
    const [pos, setPos] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const q = status ? `?status=${status}` : "";
        const [v, p, c, u] = await Promise.all([
            api.get(`/visits${q}`),
            api.get("/points-of-sale"),
            api.get("/campaigns"),
            api.get("/users").catch(() => ({ data: [] })),
        ]);
        setVisits(v.data); setPos(p.data); setCampaigns(c.data); setUsers(u.data);
        setLoading(false);
    }
    useEffect(() => { load(); }, [status]);

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <div className="eyebrow">Operación</div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">Visitas</h1>
                    <p className="text-sm text-slate-500 mt-2">Planificación y ejecución de auditorías de campo.</p>
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                {["", "planificada", "en_curso", "completada", "auditada"].map(s => (
                    <button
                        key={s || "all"}
                        onClick={() => setStatus(s)}
                        data-testid={`filter-${s || "all"}`}
                        className={`text-xs px-3 py-1.5 border transition-colors ${status === s ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                        {s || "todas"}
                    </button>
                ))}
            </div>

            <div className="bg-white border border-slate-200">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-3 font-semibold">Punto</th>
                                <th className="px-6 py-3 font-semibold">Campaña</th>
                                <th className="px-6 py-3 font-semibold">Auditor</th>
                                <th className="px-6 py-3 font-semibold">Programada</th>
                                <th className="px-6 py-3 font-semibold">Estado</th>
                                <th className="px-6 py-3 font-semibold text-right">Puntaje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {visits.map(v => {
                                const p = pos.find(x => x.id === v.point_of_sale_id);
                                const c = campaigns.find(x => x.id === v.campaign_id);
                                const u = users.find(x => x.id === v.auditor_id);
                                return (
                                    <tr key={v.id} className="hover:bg-slate-50" data-testid={`visit-row-${v.id}`}>
                                        <td className="px-6 py-3"><Link to={`/visits/${v.id}`} className="font-medium text-slate-900 hover:text-brand">{p?.name || "—"}</Link><div className="text-xs text-slate-400">{p?.city}</div></td>
                                        <td className="px-6 py-3 text-slate-700">{c?.name || "—"}</td>
                                        <td className="px-6 py-3 text-slate-700">{u?.full_name || "—"}</td>
                                        <td className="px-6 py-3 text-xs text-slate-500">{v.scheduled_at ? new Date(v.scheduled_at).toLocaleString("es-AR") : "—"}</td>
                                        <td className="px-6 py-3"><span className={`text-xs px-2 py-1 ${statusBadges[v.status]}`}>{v.status}</span></td>
                                        <td className="px-6 py-3 text-right font-mono">{v.percentage > 0 ? `${v.percentage}%` : "—"}</td>
                                    </tr>
                                );
                            })}
                            {!visits.length && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">Sin visitas.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
