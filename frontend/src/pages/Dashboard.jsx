import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
    Megaphone, CheckCircle2, Clock, TrendingUp, MapPin, AlertCircle,
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

const statusColors = {
    planificada: "bg-slate-100 text-slate-700 border-slate-200",
    en_curso: "bg-amber-50 text-amber-700 border-amber-200",
    completada: "bg-emerald-50 text-emerald-700 border-emerald-200",
    auditada: "bg-blue-50 text-blue-700 border-blue-200",
    rechazada: "bg-red-50 text-red-700 border-red-200",
};

function KPI({ label, value, hint, icon: Icon, testid }) {
    return (
        <div className="bg-white border border-slate-200 p-5" data-testid={testid}>
            <div className="flex items-start justify-between">
                <div className="eyebrow">{label}</div>
                <Icon className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
            </div>
            <div className="font-display text-3xl font-bold text-slate-900 mt-3 tracking-tight">{value}</div>
            {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/dashboard/stats").then((r) => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const chart = stats ? [
        { name: "Planif.", value: stats.pending_visits, fill: "#94A3B8" },
        { name: "En curso", value: stats.in_progress_visits, fill: "#D97706" },
        { name: "Completadas", value: stats.completed_visits, fill: "#16A34A" },
    ] : [];

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <header className="mb-8">
                <div className="eyebrow">Dashboard</div>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 mt-1 tracking-tight">
                    Buenas, {user?.full_name?.split(" ")[0]}.
                </h1>
                <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                    Panorama operativo de campañas activas, visitas en ejecución y cumplimiento en tiempo real.
                </p>
            </header>

            {loading ? (
                <div className="grid md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KPI label="Campañas activas" value={stats.active_campaigns} hint={`${stats.total_campaigns} totales`} icon={Megaphone} testid="kpi-campaigns" />
                        <KPI label="Visitas completadas" value={stats.completed_visits} hint={`${stats.total_visits} planificadas`} icon={CheckCircle2} testid="kpi-completed" />
                        <KPI label="En curso" value={stats.in_progress_visits} hint="Auditores en campo" icon={Clock} testid="kpi-inprogress" />
                        <KPI label="Cumplimiento" value={`${stats.compliance_rate}%`} hint={`Puntaje promedio ${stats.avg_score}%`} icon={TrendingUp} testid="kpi-compliance" />
                    </div>

                    <div className="mt-6 grid lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 bg-white border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="eyebrow">Distribución</div>
                                    <div className="font-display text-lg font-semibold text-slate-900 mt-1">Estado de visitas</div>
                                </div>
                            </div>
                            <div style={{ height: 240 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chart} barCategoryGap="30%">
                                        <CartesianGrid strokeDasharray="2 4" stroke="#E2E8F0" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 12 }} axisLine={{ stroke: "#CBD5E1" }} />
                                        <YAxis allowDecimals={false} tick={{ fill: "#475569", fontSize: 12 }} axisLine={{ stroke: "#CBD5E1" }} />
                                        <Tooltip cursor={{ fill: "#F1F5F9" }} contentStyle={{ borderRadius: 0, border: "1px solid #E2E8F0", fontSize: 12 }} />
                                        <Bar dataKey="value" radius={0}>
                                            {chart.map((c, i) => <Cell key={i} fill={c.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 p-6">
                            <div className="eyebrow">Alertas</div>
                            <div className="font-display text-lg font-semibold text-slate-900 mt-1">Puntos críticos</div>
                            <div className="mt-4 space-y-3">
                                {stats.pending_visits > 0 && (
                                    <div className="flex items-start gap-3 p-3 border border-amber-200 bg-amber-50">
                                        <AlertCircle className="h-4 w-4 text-amber-700 mt-0.5" />
                                        <div className="text-sm text-amber-900">{stats.pending_visits} visitas planificadas pendientes de ejecución.</div>
                                    </div>
                                )}
                                {stats.avg_score < 70 && stats.avg_score > 0 && (
                                    <div className="flex items-start gap-3 p-3 border border-red-200 bg-red-50">
                                        <AlertCircle className="h-4 w-4 text-red-700 mt-0.5" />
                                        <div className="text-sm text-red-900">Puntaje promedio bajo umbral ({stats.avg_score}%).</div>
                                    </div>
                                )}
                                {stats.pending_visits === 0 && stats.avg_score >= 70 && (
                                    <div className="text-sm text-slate-500">Sin alertas críticas.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent visits table */}
                    <div className="mt-6 bg-white border border-slate-200">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <div className="eyebrow">Actividad</div>
                                <div className="font-display text-lg font-semibold text-slate-900 mt-1">Últimas visitas</div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                        <th className="px-6 py-3 font-semibold">ID</th>
                                        <th className="px-6 py-3 font-semibold">Estado</th>
                                        <th className="px-6 py-3 font-semibold">Programada</th>
                                        <th className="px-6 py-3 font-semibold text-right">Puntaje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.recent_visits?.map((v) => (
                                        <tr key={v.id} className="hover:bg-slate-50 transition-colors" data-testid={`recent-visit-${v.id}`}>
                                            <td className="px-6 py-3 font-mono text-xs text-slate-500">{v.id.slice(0, 8)}</td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-block text-xs px-2 py-1 border ${statusColors[v.status]}`}>{v.status}</span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-700">
                                                {v.scheduled_at ? new Date(v.scheduled_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "—"}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono">{v.percentage > 0 ? `${v.percentage}%` : "—"}</td>
                                        </tr>
                                    ))}
                                    {!stats.recent_visits?.length && (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">Sin visitas registradas.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
