import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { ClipboardList, Loader2 } from "lucide-react";

export default function Forms() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/forms").then(r => { setForms(r.data); setLoading(false); });
    }, []);

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="mb-8">
                <div className="eyebrow">Configuración</div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">Formularios dinámicos</h1>
                <p className="text-sm text-slate-500 mt-2">Plantillas de auditoría configurables por secciones, tipos y pesos.</p>
            </div>

            {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {forms.map(f => (
                        <div key={f.id} className="bg-white border border-slate-200 p-5" data-testid={`form-card-${f.id}`}>
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 bg-slate-900 text-white flex items-center justify-center">
                                    <ClipboardList className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-display text-lg font-semibold text-slate-900">{f.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">{f.description}</div>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                <div className="border border-slate-100 p-2"><div className="eyebrow">Secciones</div><div className="font-mono text-slate-900 text-sm mt-1">{f.sections.length}</div></div>
                                <div className="border border-slate-100 p-2"><div className="eyebrow">Preguntas</div><div className="font-mono text-slate-900 text-sm mt-1">{f.sections.reduce((a, s) => a + s.questions.length, 0)}</div></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
