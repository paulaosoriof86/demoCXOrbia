import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Loader2 } from "lucide-react";

const PALETTE = ["#0F52BA", "#16A34A", "#D97706", "#DC2626", "#7C3AED"];

export default function Reports() {
    const [visits, setVisits] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const [v, c, p] = await Promise.all([
                api.get("/visits"), api.get("/campaigns"), api.get("/points-of-sale"),
            ]);
            setVisits(v.data); setCampaigns(c.data); setPos(p.data);
            setLoading(false);
        })();
    }, []);

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>;

    const byStatus = ["planificada","en_curso","completada","auditada","rechazada"].map(s => ({
        name: s, value: visits.filter(v => v.status === s).length,
    }));

    const byCampaign = campaigns.map(c => {
        const vs = visits.filter(v => v.campaign_id === c.id && v.percentage > 0);
        const avg = vs.length ? vs.reduce((a, x) => a + x.percentage, 0) / vs.length : 0;
        return { name: c.name.slice(0, 24), value: Math.round(avg) };
    });

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="mb-8">
                <div className="eyebrow">Análisis</div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">Reportes</h1>
                <p className="text-sm text-slate-500 mt-2">Métricas agregadas de cumplimiento y ejecución operativa.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-6">
                    <div className="eyebrow mb-1">Estado de visitas</div>
                    <div className="font-display text-lg font-semibold mb-4">Distribución global</div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={byStatus.filter(x => x.value > 0)} dataKey="value" nameKey="name" outerRadius={100} label>
                                    {byStatus.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 0, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-6">
                    <div className="eyebrow mb-1">Cumplimiento por campaña</div>
                    <div className="font-display text-lg font-semibold mb-4">Puntaje promedio</div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer>
                            <BarChart data={byCampaign}>
                                <CartesianGrid strokeDasharray="2 4" stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                                <Tooltip contentStyle={{ borderRadius: 0, fontSize: 12 }} />
                                <Bar dataKey="value" fill="#0F52BA" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-white border border-slate-200">
                <div className="p-6 border-b border-slate-200"><div className="eyebrow">Detalle</div><div className="font-display text-lg font-semibold mt-1">Ranking por punto de venta</div></div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                            <th className="px-6 py-3 font-semibold">Punto</th>
                            <th className="px-6 py-3 font-semibold">Ciudad</th>
                            <th className="px-6 py-3 font-semibold">Visitas</th>
                            <th className="px-6 py-3 font-semibold text-right">Prom.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pos.map(p => {
                            const vs = visits.filter(v => v.point_of_sale_id === p.id && v.percentage > 0);
                            const avg = vs.length ? Math.round(vs.reduce((a, x) => a + x.percentage, 0) / vs.length) : 0;
                            return (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 text-slate-900 font-medium">{p.name}</td>
                                    <td className="px-6 py-3 text-slate-500">{p.city}</td>
                                    <td className="px-6 py-3 font-mono">{vs.length}</td>
                                    <td className="px-6 py-3 text-right font-mono font-semibold">{avg > 0 ? `${avg}%` : "—"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
