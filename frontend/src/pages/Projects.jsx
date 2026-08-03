import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTenant } from "@/context/TenantContext";
import api from "@/lib/api";
import { Loader2, Globe, ClipboardList, Wallet, RefreshCw, Check, AlertCircle } from "lucide-react";

export default function Projects() {
    const { t } = useTranslation();
    const { tenantId, projects, project, pickProject } = useTenant();
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [periods, setPeriods] = useState([]);

    useEffect(() => {
        if (!project?.id) return;
        api.get(`/periods?project_id=${project.id}`).then((r) => setPeriods(r.data));
    }, [project?.id]);

    async function sync() {
        if (!project) return;
        setSyncing(true); setSyncResult(null);
        try {
            const r = await api.post(`/hr/sync/${project.id}`);
            setSyncResult(r.data);
        } catch (e) {
            setSyncResult({ status: "error", message: e?.response?.data?.detail || e.message });
        } finally { setSyncing(false); }
    }

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="mb-8">
                <div className="eyebrow">Configuración</div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">{t("projects.title")}</h1>
                <p className="text-sm text-slate-500 mt-2 max-w-2xl">{t("projects.subtitle")}</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1 bg-white border border-slate-200">
                    <div className="p-4 border-b border-slate-200"><div className="eyebrow">Proyectos</div></div>
                    <ul className="divide-y divide-slate-100">
                        {projects.map(p => (
                            <li key={p.id} onClick={() => pickProject(p.id)} data-testid={`project-item-${p.id}`}
                                className={`px-4 py-3 cursor-pointer transition-colors ${project?.id === p.id ? "bg-blue-50 border-l-2 border-brand" : "hover:bg-slate-50"}`}>
                                <div className="text-sm font-medium text-slate-900">{p.name}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{p.code} · {(p.countries || []).join(", ")}</div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    {project ? (
                        <>
                            <div className="bg-white border border-slate-200 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="eyebrow">Cliente</div>
                                        <div className="font-display text-2xl font-bold mt-1">{project.name}</div>
                                        <div className="text-sm text-slate-500 mt-1">{project.client_name} · <span className="font-mono">{project.code}</span></div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 border ${project.status === "active" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>{project.status}</span>
                                </div>
                                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="border border-slate-100 p-3"><div className="eyebrow">Países</div><div className="font-display text-lg mt-1">{(project.countries || []).join(", ") || "—"}</div></div>
                                    <div className="border border-slate-100 p-3"><div className="eyebrow">Monedas</div><div className="font-display text-lg mt-1">{(project.currencies || []).join(", ") || "—"}</div></div>
                                    <div className="border border-slate-100 p-3"><div className="eyebrow">Periodos</div><div className="font-display text-lg mt-1">{periods.length}</div></div>
                                    <div className="border border-slate-100 p-3"><div className="eyebrow">Reembolsos</div><div className="font-display text-lg mt-1">{(project.payment_config?.reimbursements || []).length}</div></div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                {/* HR Config */}
                                <div className="bg-white border border-slate-200 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Globe className="h-4 w-4 text-brand" />
                                        <div className="font-display text-lg font-semibold">{t("projects.config.hr")}</div>
                                    </div>
                                    <dl className="text-sm space-y-2">
                                        <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Fuente</dt><dd className="text-slate-900 font-mono">{project.hr_config?.source_type || "manual"}</dd></div>
                                        <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Sheet ID</dt><dd className="text-slate-900 font-mono text-xs truncate max-w-[120px]">{project.hr_config?.sheet_id || "no configurado"}</dd></div>
                                        <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Tabs</dt><dd className="text-slate-900 font-mono text-xs">{Object.keys(project.hr_config?.sheet_tabs || {}).length}</dd></div>
                                        <div className="flex justify-between"><dt className="text-slate-500">Última sync</dt><dd className="text-xs text-slate-600">{project.hr_config?.last_synced_at || "nunca"}</dd></div>
                                    </dl>
                                    <button data-testid="hr-sync-btn" onClick={sync} disabled={syncing} className="mt-4 w-full bg-slate-900 hover:bg-brand text-white text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                                        {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                        {t("projects.syncNow")}
                                    </button>
                                    {syncResult && (
                                        <div className={`mt-3 p-2 text-xs flex items-start gap-2 border ${syncResult.status === "simulated_ok" ? "bg-blue-50 border-blue-200 text-blue-900" : "bg-amber-50 border-amber-200 text-amber-900"}`}>
                                            {syncResult.status === "simulated_ok" ? <Check className="h-3 w-3 mt-0.5" /> : <AlertCircle className="h-3 w-3 mt-0.5" />}
                                            <span>{syncResult.message}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Questionnaire */}
                                <div className="bg-white border border-slate-200 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ClipboardList className="h-4 w-4 text-brand" />
                                        <div className="font-display text-lg font-semibold">{t("projects.config.questionnaire")}</div>
                                    </div>
                                    <dl className="text-sm space-y-2">
                                        <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Modo</dt><dd className="text-slate-900 font-mono">{project.questionnaire_config?.mode || "internal"}</dd></div>
                                        <div className="border-b border-slate-100 pb-1"><div className="text-slate-500 mb-1">URL externa</div><div className="text-xs text-slate-900 font-mono break-all">{project.questionnaire_config?.external_url_template || "—"}</div></div>
                                        <div className="flex justify-between"><dt className="text-slate-500">Form interno</dt><dd className="text-slate-900 font-mono text-xs">{project.questionnaire_config?.internal_form_id?.slice(0,8) || "—"}</dd></div>
                                    </dl>
                                </div>

                                {/* Payments */}
                                <div className="bg-white border border-slate-200 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Wallet className="h-4 w-4 text-brand" />
                                        <div className="font-display text-lg font-semibold">{t("projects.config.payments")}</div>
                                    </div>
                                    <dl className="text-sm space-y-2">
                                        <div className="flex justify-between border-b border-slate-100 pb-1"><dt className="text-slate-500">Honorario</dt><dd className="text-slate-900 font-mono">{project.payment_config?.honorarium_amount || 0} {project.payment_config?.currency}</dd></div>
                                        <div className="border-b border-slate-100 pb-1">
                                            <div className="text-slate-500 mb-1">Reembolsos</div>
                                            {(project.payment_config?.reimbursements || []).map((r, i) => (
                                                <div key={i} className="flex justify-between text-xs">
                                                    <span className="text-slate-700">{r.label}</span>
                                                    <span className="font-mono text-slate-900">{r.amount} {project.payment_config?.currency}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-xs text-slate-600 pt-1">{project.payment_config?.fortnight_rule}</div>
                                    </dl>
                                </div>
                            </div>

                            {/* Periods */}
                            <div className="bg-white border border-slate-200">
                                <div className="p-4 border-b border-slate-200"><div className="eyebrow">{t("projects.config.periods")}</div></div>
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                            <th className="px-4 py-2 font-semibold">Etiqueta</th>
                                            <th className="px-4 py-2 font-semibold">País</th>
                                            <th className="px-4 py-2 font-semibold">Franja</th>
                                            <th className="px-4 py-2 font-semibold">Inicio</th>
                                            <th className="px-4 py-2 font-semibold">Fin</th>
                                            <th className="px-4 py-2 font-semibold">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {periods.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-2 font-medium text-slate-900">{p.label}</td>
                                                <td className="px-4 py-2 font-mono text-xs">{p.country}</td>
                                                <td className="px-4 py-2 text-slate-600">{p.fortnight || "—"}</td>
                                                <td className="px-4 py-2 text-xs text-slate-500">{new Date(p.start_date).toLocaleDateString("es-AR")}</td>
                                                <td className="px-4 py-2 text-xs text-slate-500">{new Date(p.end_date).toLocaleDateString("es-AR")}</td>
                                                <td className="px-4 py-2"><span className={`text-xs px-2 py-0.5 border ${p.status === "open" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>{p.status}</span></td>
                                            </tr>
                                        ))}
                                        {!periods.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">Sin periodos configurados</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white border border-slate-200 p-12 text-center text-slate-500 text-sm">Seleccioná un proyecto</div>
                    )}
                </div>
            </div>
        </div>
    );
}
