import { useState } from "react";
import api from "@/lib/api";
import { UploadCloud, FileText, Sparkles, Loader2 } from "lucide-react";

const INTENTS = [
    { key: "summarize", label: "Resumir reporte", desc: "Claude Sonnet 5 · razonamiento" },
    { key: "extract_form_data", label: "Extraer datos", desc: "Gemini 3.1 Pro · multimodal" },
    { key: "ocr", label: "OCR de imagen/PDF", desc: "Gemini 3.1 Pro · multimodal" },
    { key: "transcribe", label: "Transcribir audio", desc: "Gemini 3.1 Pro · multimodal" },
];

export default function DocumentAnalysis() {
    const [file, setFile] = useState(null);
    const [uploaded, setUploaded] = useState(null);
    const [intent, setIntent] = useState("summarize");
    const [result, setResult] = useState("");
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    async function upload() {
        if (!file) return;
        setUploading(true); setResult("");
        try {
            const fd = new FormData(); fd.append("file", file); fd.append("context", "ai-analysis");
            const r = await api.post("/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setUploaded(r.data);
        } finally { setUploading(false); }
    }

    async function analyze() {
        if (!uploaded) return;
        setAnalyzing(true); setResult("");
        try {
            const r = await api.post("/ai/analyze", { file_id: uploaded.id, intent });
            setResult(r.data.result);
        } catch (e) {
            setResult("Error al analizar: " + (e?.response?.data?.detail || e.message));
        } finally { setAnalyzing(false); }
    }

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="mb-8">
                <div className="eyebrow">Módulo inteligente</div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">Análisis de documentos con IA</h1>
                <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                    Subí un PDF, imagen, Excel, Word o audio. El orquestador enruta al modelo apropiado: Gemini 3.1 Pro para multimodal, Claude Sonnet 5 para reportes largos.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200">
                    <div className="p-6 border-b border-slate-200"><div className="eyebrow">Paso 1</div><div className="font-display text-lg font-semibold mt-1">Subir archivo</div></div>
                    <div className="p-6 space-y-4">
                        <label className="block border-2 border-dashed border-slate-300 p-8 text-center hover:border-brand transition-colors cursor-pointer">
                            <UploadCloud className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                            <div className="text-sm text-slate-700 font-medium">{file ? file.name : "Elegí un archivo"}</div>
                            <div className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, MP3, M4A, DOCX, XLSX</div>
                            <input data-testid="file-input" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </label>
                        <button data-testid="btn-upload" onClick={upload} disabled={!file || uploading} className="w-full bg-slate-900 text-white py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-brand transition-colors">
                            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {uploaded ? "Reemplazar archivo" : "Subir a storage"}
                        </button>
                        {uploaded && (
                            <div className="border border-emerald-200 bg-emerald-50 p-3 text-xs" data-testid="upload-status">
                                <div className="font-mono text-emerald-800">✓ {uploaded.original_filename}</div>
                                <div className="text-emerald-700 mt-1">{Math.round(uploaded.size / 1024)} KB · {uploaded.content_type}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-200">
                    <div className="p-6 border-b border-slate-200"><div className="eyebrow">Paso 2</div><div className="font-display text-lg font-semibold mt-1">Elegir análisis</div></div>
                    <div className="p-6 space-y-3">
                        {INTENTS.map(i => (
                            <label key={i.key} data-testid={`intent-${i.key}`} className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${intent === i.key ? "border-brand bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}>
                                <input type="radio" name="intent" value={i.key} checked={intent === i.key} onChange={() => setIntent(i.key)} className="mt-1" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900">{i.label}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{i.desc}</div>
                                </div>
                            </label>
                        ))}
                        <button data-testid="btn-analyze" onClick={analyze} disabled={!uploaded || analyzing} className="w-full bg-brand text-white py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-brand-hover transition-colors mt-2">
                            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Analizar con IA
                        </button>
                    </div>
                </div>
            </div>

            {(result || analyzing) && (
                <div className="mt-4 bg-white border border-slate-200" data-testid="ai-result">
                    <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand" />
                        <div>
                            <div className="eyebrow">Resultado</div>
                            <div className="font-display text-lg font-semibold mt-0.5">Análisis {intent}</div>
                        </div>
                    </div>
                    <div className="p-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-mono">
                        {analyzing ? <span className="text-slate-500 inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Analizando...</span> : result}
                    </div>
                </div>
            )}
        </div>
    );
}
