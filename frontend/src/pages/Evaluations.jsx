import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function Evaluations() {
    const [visits, setVisits] = useState([]);
    const [pos, setPos] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState("");
    const [saving, setSaving] = useState(false);

    async function load() {
        setLoading(true);
        const [v, p] = await Promise.all([
            api.get("/visits?status=completada"),
            api.get("/points-of-sale"),
        ]);
        setVisits(v.data); setPos(p.data);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    async function decide(decision) {
        if (!selected) return;
        setSaving(true);
        await api.patch(`/visits/${selected.id}`, {
            status: decision === "approve" ? "auditada" : "rechazada",
            notes: comments,
        });
        setSelected(null); setComments("");
        await load();
        setSaving(false);
    }

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="mb-8">
                <div className="eyebrow">Control de calidad</div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">Evaluaciones</h1>
                <p className="text-sm text-slate-500 mt-2">Revisión y aprobación de visitas completadas por los auditores.</p>
            </div>

            {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200">
                        <div className="p-4 border-b border-slate-200"><div className="eyebrow">Pendientes de auditar</div></div>
                        <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                            {visits.map(v => {
                                const p = pos.find(x => x.id === v.point_of_sale_id);
                                return (
                                    <li key={v.id} onClick={() => setSelected(v)} data-testid={`eval-row-${v.id}`} className={`px-4 py-3 cursor-pointer transition-colors ${selected?.id === v.id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{p?.name || "—"}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{v.executed_at ? new Date(v.executed_at).toLocaleString("es-AR") : "—"}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-lg font-semibold text-slate-900">{v.percentage}%</div>
                                                <div className="text-xs text-slate-500">{v.total_score}/{v.max_score}</div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                            {!visits.length && <li className="p-8 text-center text-sm text-slate-500">Sin visitas pendientes.</li>}
                        </ul>
                    </div>

                    <div className="bg-white border border-slate-200">
                        {selected ? (
                            <>
                                <div className="p-4 border-b border-slate-200">
                                    <div className="eyebrow">Detalle</div>
                                    <div className="font-display text-lg font-semibold mt-1">{pos.find(x => x.id === selected.point_of_sale_id)?.name}</div>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="border border-slate-100 p-3"><div className="eyebrow">Puntaje</div><div className="font-display text-xl mt-1">{selected.total_score}</div></div>
                                        <div className="border border-slate-100 p-3"><div className="eyebrow">Máx</div><div className="font-display text-xl mt-1">{selected.max_score}</div></div>
                                        <div className="border border-slate-100 p-3"><div className="eyebrow">%</div><div className="font-display text-xl mt-1">{selected.percentage}%</div></div>
                                    </div>

                                    <div>
                                        <div className="eyebrow">Respuestas</div>
                                        <ul className="mt-2 divide-y divide-slate-100 max-h-64 overflow-y-auto border border-slate-100">
                                            {selected.answers.map((a, i) => (
                                                <li key={i} className="px-3 py-2 text-xs flex justify-between">
                                                    <span className="font-mono text-slate-400">{a.question_id.slice(0, 6)}</span>
                                                    <span className="text-slate-700 truncate mx-2 flex-1">{String(a.value)}</span>
                                                    <span className="font-mono text-slate-900">{a.score}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <label className="block">
                                        <div className="eyebrow mb-1">Comentarios de auditoría</div>
                                        <textarea data-testid="eval-comments" rows={3} value={comments} onChange={(e) => setComments(e.target.value)} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                                    </label>

                                    <div className="flex gap-2">
                                        <button data-testid="eval-reject" onClick={() => decide("reject")} disabled={saving} className="flex-1 border border-red-200 text-red-700 hover:bg-red-50 py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                                            <XCircle className="h-4 w-4" /> Rechazar
                                        </button>
                                        <button data-testid="eval-approve" onClick={() => decide("approve")} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Aprobar
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-12 text-center text-slate-500 text-sm">Seleccioná una visita para revisar.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
