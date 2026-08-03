import { useTenant } from "@/context/TenantContext";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

function Pill({ label, value, options, onPick, testid }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                data-testid={testid}
                onClick={() => setOpen(!open)}
                className="group inline-flex items-center gap-2 border border-slate-200 hover:border-slate-400 bg-white px-3 py-1.5 transition-colors"
            >
                <span className="text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-900 max-w-[180px] truncate">{value || "—"}</span>
                <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-700" />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                    <div className="absolute z-40 mt-1 min-w-[220px] bg-white border border-slate-200 shadow-lg">
                        {options.length === 0 && <div className="px-3 py-2 text-sm text-slate-500">{"—"}</div>}
                        {options.map((o) => (
                            <button
                                key={o.id}
                                onClick={() => { onPick(o.id); setOpen(false); }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
                            >
                                <div className="text-slate-900 font-medium">{o.label}</div>
                                {o.hint && <div className="text-xs text-slate-500 mt-0.5">{o.hint}</div>}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function TenantProjectSelector() {
    const { tenants, projects, periods, tenant, project, period, pickTenant, pickProject, pickPeriod } = useTenant();

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Pill
                label="Tenant" value={tenant?.name}
                options={tenants.map((t) => ({ id: t.id, label: t.name, hint: t.slug }))}
                onPick={pickTenant} testid="sel-tenant"
            />
            <Pill
                label="Proyecto" value={project?.name}
                options={projects.map((p) => ({ id: p.id, label: p.name, hint: `${p.code} · ${(p.countries||[]).join(", ")}` }))}
                onPick={pickProject} testid="sel-project"
            />
            <Pill
                label="Periodo" value={period?.label}
                options={periods.map((p) => ({ id: p.id, label: p.label, hint: `${p.country || ""} · ${p.status}` }))}
                onPick={pickPeriod} testid="sel-period"
            />
        </div>
    );
}
