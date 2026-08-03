import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { ArrowLeft, Loader2, Check, Camera } from "lucide-react";

export default function VisitExecute() {
    const { id } = useParams();
    const nav = useNavigate();
    const [visit, setVisit] = useState(null);
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            const v = await api.get(`/visits/${id}`);
            setVisit(v.data);
            const c = await api.get(`/campaigns/${v.data.campaign_id}`);
            const f = await api.get(`/forms/${c.data.form_id}`);
            setForm(f.data);
            const map = {};
            (v.data.answers || []).forEach(a => { map[a.question_id] = a.value; });
            setAnswers(map);
            setLoading(false);
        })();
    }, [id]);

    async function uploadPhoto(qid, file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("context", `visit:${id}`);
        const r = await api.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setAnswers(a => ({ ...a, [qid]: r.data.id }));
    }

    async function save(status) {
        setSaving(true);
        try {
            const payload = {
                answers: Object.entries(answers).map(([qid, val]) => ({ question_id: qid, value: val, score: 0, evidence_files: [] })),
            };
            if (status) payload.status = status;
            await api.patch(`/visits/${id}`, payload);
            if (status === "completada") nav("/visits");
            else {
                const v = await api.get(`/visits/${id}`);
                setVisit(v.data);
            }
        } finally { setSaving(false); }
    }

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>;

    return (
        <div className="p-4 md:p-10 max-w-3xl">
            <Link to="/visits" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-4"><ArrowLeft className="h-4 w-4" /> Visitas</Link>
            <div className="eyebrow">Ejecución de visita</div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mt-1 tracking-tight">{form?.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="border border-slate-200 px-2 py-0.5">{visit.status}</span>
                {visit.percentage > 0 && <span className="font-mono text-slate-700">Puntaje: {visit.percentage}%</span>}
            </div>

            <div className="mt-6 space-y-6">
                {form?.sections.map(s => (
                    <div key={s.id} className="bg-white border border-slate-200">
                        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-700">{s.title}</div>
                        </div>
                        <div className="p-5 space-y-4">
                            {s.questions.map(q => (
                                <div key={q.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                    <div className="text-sm font-medium text-slate-900 mb-2">
                                        {q.text} {q.required && <span className="text-red-500">*</span>}
                                        <span className="text-xs text-slate-400 font-mono ml-2">peso {q.weight}</span>
                                    </div>
                                    {q.type === "yes_no" && (
                                        <div className="flex gap-2">
                                            {["si", "no"].map(o => (
                                                <button key={o} data-testid={`q-${q.id}-${o}`} onClick={() => setAnswers({...answers, [q.id]: o})} className={`px-4 py-2 text-sm border transition-colors ${answers[q.id] === o ? "bg-brand text-white border-brand" : "border-slate-200 hover:bg-slate-50"}`}>{o.toUpperCase()}</button>
                                            ))}
                                        </div>
                                    )}
                                    {q.type === "scale" && (
                                        <div className="flex gap-1">
                                            {q.options.map(o => (
                                                <button key={o} data-testid={`q-${q.id}-scale-${o}`} onClick={() => setAnswers({...answers, [q.id]: parseInt(o)})} className={`w-10 h-10 text-sm border font-mono ${answers[q.id] == parseInt(o) ? "bg-brand text-white border-brand" : "border-slate-200 hover:bg-slate-50"}`}>{o}</button>
                                            ))}
                                        </div>
                                    )}
                                    {q.type === "text" && (
                                        <textarea data-testid={`q-${q.id}-text`} value={answers[q.id] || ""} onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})} rows={2} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                                    )}
                                    {q.type === "number" && (
                                        <input data-testid={`q-${q.id}-num`} type="number" value={answers[q.id] || ""} onChange={(e) => setAnswers({...answers, [q.id]: parseFloat(e.target.value)})} className="w-40 border border-slate-200 px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
                                    )}
                                    {q.type === "photo" && (
                                        <label className="inline-flex items-center gap-2 border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
                                            <Camera className="h-4 w-4" />
                                            {answers[q.id] ? "Foto subida ✓" : "Subir foto"}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(q.id, e.target.files[0])} />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="sticky bottom-0 mt-6 flex flex-col sm:flex-row gap-3 bg-white border-t border-slate-200 py-4">
                <button data-testid="btn-save-draft" onClick={() => save("en_curso")} disabled={saving} className="px-4 py-3 text-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar borrador
                </button>
                <button data-testid="btn-complete" onClick={() => save("completada")} disabled={saving} className="flex-1 px-4 py-3 text-sm bg-brand hover:bg-brand-hover text-white disabled:opacity-50 flex items-center justify-center gap-2">
                    <Check className="h-4 w-4" /> Completar visita
                </button>
            </div>
        </div>
    );
}
