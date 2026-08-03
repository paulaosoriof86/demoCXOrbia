import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CampaignDetail() {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [visits, setVisits] = useState([]);
    const [form, setForm] = useState(null);
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const c = await api.get(`/campaigns/${id}`);
            setCampaign(c.data);
            const [v, f, p] = await Promise.all([
                api.get(`/visits?campaign_id=${id}`),
                api.get(`/forms/${c.data.form_id}`),
                api.get(`/points-of-sale?client_id=${c.data.client_id}`),
            ]);
            setVisits(v.data); setForm(f.data); setPos(p.data);
            setLoading(false);
        })();
    }, [id]);

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>;
    if (!campaign) return <div className="p-10">No encontrada</div>;

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <Link to="/campaigns" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-4"><ArrowLeft className="h-4 w-4" /> Campañas</Link>
            <div className="eyebrow">Campaña</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">{campaign.name}</h1>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">{campaign.description}</p>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white border border-slate-200 p-4"><div className="eyebrow">Estado</div><div className="font-display text-xl mt-2">{campaign.status}</div></div>
                <div className="bg-white border border-slate-200 p-4"><div className="eyebrow">Puntos de venta</div><div className="font-display text-xl mt-2">{campaign.target_points_of_sale.length}</div></div>
                <div className="bg-white border border-slate-200 p-4"><div className="eyebrow">Visitas</div><div className="font-display text-xl mt-2">{visits.length}</div></div>
            </div>

            <div className="mt-6 grid lg:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200">
                    <div className="p-4 border-b border-slate-200"><div className="eyebrow">Formulario</div><div className="font-display text-lg mt-1">{form?.name}</div></div>
                    <div className="p-4 space-y-3">
                        {form?.sections.map((s) => (
                            <div key={s.id}>
                                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{s.title}</div>
                                <ul className="mt-2 space-y-1">
                                    {s.questions.map(q => (
                                        <li key={q.id} className="text-sm text-slate-600 flex justify-between border-b border-slate-100 py-1">
                                            <span>{q.text}</span>
                                            <span className="text-xs text-slate-400 font-mono">{q.type} · w{q.weight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-slate-200">
                    <div className="p-4 border-b border-slate-200"><div className="eyebrow">Puntos de venta objetivo</div></div>
                    <ul className="divide-y divide-slate-100">
                        {pos.filter(p => campaign.target_points_of_sale.includes(p.id)).map(p => (
                            <li key={p.id} className="px-4 py-3 text-sm flex items-center justify-between">
                                <span className="text-slate-900">{p.name}</span>
                                <span className="text-xs text-slate-500 font-mono">{p.code}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-6 bg-white border border-slate-200">
                <div className="p-4 border-b border-slate-200"><div className="eyebrow">Visitas de esta campaña</div></div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                            <th className="px-4 py-2 font-semibold">Punto</th>
                            <th className="px-4 py-2 font-semibold">Estado</th>
                            <th className="px-4 py-2 font-semibold">Programada</th>
                            <th className="px-4 py-2 font-semibold text-right">Puntaje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {visits.map(v => {
                            const p = pos.find(x => x.id === v.point_of_sale_id);
                            return (
                                <tr key={v.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-2"><Link to={`/visits/${v.id}`} className="text-slate-900 hover:text-brand">{p?.name || "—"}</Link></td>
                                    <td className="px-4 py-2"><span className="text-xs border border-slate-200 px-2 py-0.5">{v.status}</span></td>
                                    <td className="px-4 py-2 text-slate-600 text-xs">{v.scheduled_at ? new Date(v.scheduled_at).toLocaleString("es-AR") : "—"}</td>
                                    <td className="px-4 py-2 text-right font-mono">{v.percentage > 0 ? `${v.percentage}%` : "—"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
