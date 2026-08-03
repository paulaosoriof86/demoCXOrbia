import { useEffect, useRef, useState } from "react";
import { MessageSquareText, X, Send, Loader2 } from "lucide-react";
import { API } from "@/lib/api";

export default function AIChat() {
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState([
        { role: "assistant", content: "Hola, soy el asistente TyA. Consultame sobre campañas, visitas, formularios o reportes." },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bodyRef = useRef(null);
    const sessionId = useRef(`s-${Date.now()}`).current;

    useEffect(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }, [msgs, open]);

    async function send() {
        const text = input.trim();
        if (!text || loading) return;
        setInput("");
        setMsgs((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
        setLoading(true);
        try {
            const token = localStorage.getItem("tya_token");
            const res = await fetch(`${API}/ai/chat/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ session_id: sessionId, message: text }),
            });
            const reader = res.body.getReader();
            const dec = new TextDecoder();
            let acc = "";
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                acc += dec.decode(value, { stream: true });
                setMsgs((m) => {
                    const c = [...m];
                    c[c.length - 1] = { role: "assistant", content: acc };
                    return c;
                });
            }
        } catch (e) {
            setMsgs((m) => {
                const c = [...m];
                c[c.length - 1] = { role: "assistant", content: "No pude conectar con la IA. Reintentá en unos segundos." };
                return c;
            });
        } finally { setLoading(false); }
    }

    if (!open) {
        return (
            <button
                data-testid="ai-chat-open"
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white h-12 px-5 flex items-center gap-2 hover:bg-brand transition-colors duration-200 shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
            >
                <MessageSquareText className="h-4 w-4" />
                <span className="text-sm font-medium">Asistente IA</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] bg-white border border-slate-200 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
            <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between bg-slate-900 text-white">
                <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-300">Powered by GPT 5.6</div>
                    <div className="font-display font-semibold text-sm">Asistente TyA</div>
                </div>
                <button data-testid="ai-chat-close" onClick={() => setOpen(false)} className="p-1 hover:bg-slate-800">
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="ai-chat-body">
                {msgs.map((m, i) => (
                    <div key={i} className={`text-sm leading-relaxed ${m.role === "user" ? "text-slate-900" : "text-slate-700"}`}>
                        <div className="eyebrow mb-1">{m.role === "user" ? "Vos" : "Asistente"}</div>
                        <div className={`whitespace-pre-wrap px-3 py-2 border ${m.role === "user" ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200"}`}>
                            {m.content || (loading && i === msgs.length - 1 ? <Loader2 className="h-3 w-3 animate-spin inline" /> : "")}
                        </div>
                    </div>
                ))}
            </div>
            <div className="border-t border-slate-200 p-3 flex gap-2">
                <input
                    data-testid="ai-chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Preguntá sobre auditorías, visitas..."
                    className="flex-1 text-sm border border-slate-200 px-3 py-2 focus:border-brand focus:outline-none"
                />
                <button
                    data-testid="ai-chat-send"
                    onClick={send}
                    disabled={loading}
                    className="bg-brand hover:bg-brand-hover text-white px-3 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}
