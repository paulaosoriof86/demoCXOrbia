import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { Loader2, CheckCircle2, XCircle, Clock, User, Calendar, MapPin } from "lucide-react";

const STATUS_STYLES = {
    submitted: "bg-slate-100 text-slate-700 border-slate-200",
    under_review: "bg-amber-50 text-amber-800 border-amber-200",
    approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
    rejected: "bg-red-50 text-red-800 border-red-200",
    cancelled: "bg-slate-100 text-slate-500 border-slate-200",
    expired: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function Postulations() {
    const { t } = useTranslation();
    const { tenantId, projectId, periodId, project } = useTenant();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [rejReason, setRejReason] = useState("");
    const [saving, setSaving] = useState(false);

    async function load() {
        if (!tenantId) return;
        setLoading(true);
        const params = new URLSearchParams({ tenant_id: tenantId });
        if (projectId) params.set("project_id", projectId);
        if (periodId) params.set("period_id", periodId);
        if (statusFilter) params.set("status", statusFilter);
        const r = await api.get(`/postulations?${params}`);
        setRows(r.data);
        setLoading(false);
    }
    useEffect(() => { load(); }, [tenantId, projectId, periodId, statusFilter]);

    async function decide(decision) {
        if (!selected) return;
        setSaving(true);
        try {
            const params = new URLSearchParams({ decision });
            if (decision === "rejected" && rejReason) params.set("reason", rejReason);
            await api.patch(`/postulations/${selected.id}?${params}`);
            setSelected(null); setRejReason("");
            await load();
        } finally { setSaving(false); }
    }

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="mb-6">
                <div className="eyebrow">Operación · {project?.name || "—"}</div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">{t("postulations.title")}</h1>
                <p className="text-sm text-slate-500 mt-2 max-w-2xl">{t("postulations.subtitle")}</p>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
                {["", "submitted", "under_review", "approved", "rejected"].map(s => (
                    <button
                        key={s || "all"}
                        onClick={() => setStatusFilter(s)}
                        data-testid={`post-filter-${s || "all"}`}
                        className={`text-xs px-3 py-1.5 border transition-colors ${statusFilter === s ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                        {s || t("common.all")}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 bg-white border border-slate-200">
                    {loading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div> : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                    <th className="px-4 py-3 font-semibold">{t("postulations.columns.shopper")}</th>
                                    <th className="px-4 py-3 font-semibold">{t("postulations.columns.branch")}</th>
                                    <th className="px-4 py-3 font-semibold">{t("postulations.columns.proposedDate")}</th>
                                    <th className="px-4 py-3 font-semibold">{t("postulations.columns.status")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map(r => (
                                    <tr
                                        key={r.id}
                                        onClick={() => setSelected(r)}
                                        data-testid={`postulation-row-${r.id}`}
                                        className={`cursor-pointer transition-colors ${selected?.id === r.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{r.shopper_name || "—"}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{r.shopper_country} · {r.shopper_city}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{r.branch_name || "—"}</td>
                                        <td className="px-4 py-3 text-slate-600 text-xs">
                                            {r.proposed_date ? new Date(r.proposed_date).toLocaleDateString("es-AR") : "—"}
                                            {r.proposed_slot && <span className="ml-1 font-mono text-slate-400">· {r.proposed_slot}</span>}
                                        </td>
                                        <td className="px-4 py-3"><span className={`text-xs px-2 py-1 border ${STATUS_STYLES[r.status]}`}>{r.status}</span></td>
                                    </tr>
                                ))}
                                {!rows.length && <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-500 text-sm">{t("postulations.empty")}</td></tr>}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Ficha completa de postulación */}
                <div className="lg:col-span-2 bg-white border border-slate-200">
                    {selected ? (
                        <>
                            <div className="p-4 border-b border-slate-200 bg-slate-50">
                                <div className="eyebrow">Ficha de postulación</div>
                                <div className="font-display text-xl font-semibold mt-1">{selected.shopper_name}</div>
                                <div className="text-xs text-slate-500 mt-0.5 font-mono">ID: {selected.id.slice(0, 12)}</div>
                            </div>
                            <div className="p-4 space-y-4 text-sm" data-testid="postulation-detail">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><div className="eyebrow">Estado</div><div className="mt-1"><span className={`text-xs px-2 py-1 border ${STATUS_STYLES[selected.status]}`}>{selected.status}</span></div></div>
                                    <div><div className="eyebrow">Franja</div><div className="mt-1 font-mono">{selected.proposed_slot || "—"}</div></div>
                                    <div><div className="eyebrow">País</div><div className="mt-1">{selected.shopper_country || "—"}</div></div>
                                    <div><div className="eyebrow">Ciudad</div><div className="mt-1">{selected.shopper_city || "—"}</div></div>
                                </div>

                                <div className="border-t border-slate-100 pt-3">
                                    <div className="eyebrow mb-2">Sucursal / Punto de venta</div>
                                    <div className="flex items-center gap-2 text-slate-900"><MapPin className="h-4 w-4 text-slate-400" /> {selected.branch_name || "Por asignar"}</div>
                                </div>

                                <div className="border-t border-slate-100 pt-3">
                                    <div className="eyebrow mb-2">Fecha propuesta</div>
                                    <div className="flex items-center gap-2 text-slate-900"><Calendar className="h-4 w-4 text-slate-400" /> {selected.proposed_date ? new Date(selected.proposed_date).toLocaleString("es-AR") : "—"}</div>
                                </div>

                                {selected.notes && (
                                    <div className="border-t border-slate-100 pt-3">
                                        <div className="eyebrow mb-1">Notas del shopper</div>
                                        <div className="text-slate-700 whitespace-pre-wrap text-sm">{selected.notes}</div>
                                    </div>
                                )}

                                {selected.reviewed_at && (
                                    <div className="border-t border-slate-100 pt-3">
                                        <div className="eyebrow mb-1">Revisión</div>
                                        <div className="text-xs text-slate-600">{new Date(selected.reviewed_at).toLocaleString("es-AR")}</div>
                                        {selected.rejection_reason && <div className="text-xs text-red-700 mt-1 italic">"{selected.rejection_reason}"</div>}
                                    </div>
                                )}

                                {(selected.status === "submitted" || selected.status === "under_review") && (
                                    <div className="border-t border-slate-100 pt-3 space-y-3">
                                        <textarea
                                            data-testid="post-reason"
                                            placeholder="Motivo (para rechazo, opcional)"
                                            value={rejReason} onChange={(e) => setRejReason(e.target.value)}
                                            rows={2}
                                            className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <button data-testid="post-reject" onClick={() => decide("rejected")} disabled={saving} className="border border-red-200 text-red-700 hover:bg-red-50 py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                                                <XCircle className="h-4 w-4" /> {t("postulations.actions.reject")}
                                            </button>
                                            <button data-testid="post-approve" onClick={() => decide("approved")} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                {t("postulations.actions.approve")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                            <User className="h-8 w-8 text-slate-300" />
                            Seleccioná una postulación para ver la ficha completa
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
