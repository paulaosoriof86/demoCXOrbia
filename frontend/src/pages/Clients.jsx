import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, X, Building2, MapPin, Loader2 } from "lucide-react";

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [pos, setPos] = useState([]);
    const [selected, setSelected] = useState(null);
    const [openC, setOpenC] = useState(false);
    const [openP, setOpenP] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fc, setFc] = useState({ name: "", industry: "", contact_email: "" });
    const [fp, setFp] = useState({ name: "", city: "", region: "", code: "", address: "" });

    async function load() {
        setLoading(true);
        const [c, p] = await Promise.all([api.get("/clients"), api.get("/points-of-sale")]);
        setClients(c.data); setPos(p.data);
        if (!selected && c.data[0]) setSelected(c.data[0]);
        setLoading(false);
    }
    useEffect(() => { load(); }, []);

    async function createClient() {
        await api.post("/clients", fc);
        setOpenC(false); setFc({ name: "", industry: "", contact_email: "" });
        load();
    }
    async function createPos() {
        if (!selected) return;
        await api.post("/points-of-sale", { ...fp, client_id: selected.id });
        setOpenP(false); setFp({ name: "", city: "", region: "", code: "", address: "" });
        load();
    }

    const posFiltered = pos.filter(p => p.client_id === selected?.id);

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <div className="eyebrow">Administración</div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">Clientes y puntos de venta</h1>
                    <p className="text-sm text-slate-500 mt-2">Empresas auditadas y su red de sucursales.</p>
                </div>
            </div>

            {loading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div> : (
                <div className="grid lg:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                            <div className="eyebrow">Clientes</div>
                            <button data-testid="btn-new-client" onClick={() => setOpenC(true)} className="text-xs text-brand hover:underline">+ Nuevo</button>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {clients.map(c => (
                                <li key={c.id} onClick={() => setSelected(c)} data-testid={`client-${c.id}`} className={`px-4 py-3 cursor-pointer flex items-start gap-3 ${selected?.id === c.id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                                    <Building2 className="h-4 w-4 text-slate-500 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">{c.name}</div>
                                        <div className="text-xs text-slate-500">{c.industry}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2 bg-white border border-slate-200">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <div className="eyebrow">Puntos de venta</div>
                                <div className="font-display text-lg font-semibold mt-1">{selected?.name || "—"}</div>
                            </div>
                            {selected && <button data-testid="btn-new-pos" onClick={() => setOpenP(true)} className="text-sm text-brand hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Nuevo punto</button>}
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                    <th className="px-4 py-2 font-semibold">Nombre</th>
                                    <th className="px-4 py-2 font-semibold">Código</th>
                                    <th className="px-4 py-2 font-semibold">Ciudad</th>
                                    <th className="px-4 py-2 font-semibold">Región</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {posFiltered.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 flex items-center gap-2"><MapPin className="h-3 w-3 text-slate-400" /> {p.name}</td>
                                        <td className="px-4 py-2 font-mono text-xs">{p.code}</td>
                                        <td className="px-4 py-2">{p.city}</td>
                                        <td className="px-4 py-2 text-slate-500">{p.region}</td>
                                    </tr>
                                ))}
                                {!posFiltered.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">Sin puntos.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {openC && (
                <div className="fixed inset-0 z-40 bg-slate-900/40 flex items-center justify-center p-4" onClick={() => setOpenC(false)}>
                    <div className="bg-white border w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b flex items-center justify-between"><div className="font-display text-lg font-semibold">Nuevo cliente</div><button onClick={() => setOpenC(false)}><X className="h-4 w-4" /></button></div>
                        <div className="p-5 space-y-3">
                            <input data-testid="client-name" placeholder="Nombre" value={fc.name} onChange={(e) => setFc({...fc, name: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                            <input placeholder="Industria" value={fc.industry} onChange={(e) => setFc({...fc, industry: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                            <input placeholder="Email de contacto" value={fc.contact_email} onChange={(e) => setFc({...fc, contact_email: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none font-mono" />
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2"><button onClick={() => setOpenC(false)} className="text-sm px-4 py-2 border">Cancelar</button><button data-testid="client-create" onClick={createClient} className="text-sm px-4 py-2 bg-brand text-white">Crear</button></div>
                    </div>
                </div>
            )}
            {openP && (
                <div className="fixed inset-0 z-40 bg-slate-900/40 flex items-center justify-center p-4" onClick={() => setOpenP(false)}>
                    <div className="bg-white border w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b flex items-center justify-between"><div className="font-display text-lg font-semibold">Nuevo punto de venta</div><button onClick={() => setOpenP(false)}><X className="h-4 w-4" /></button></div>
                        <div className="p-5 space-y-3">
                            <input data-testid="pos-name" placeholder="Nombre" value={fp.name} onChange={(e) => setFp({...fp, name: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                            <input placeholder="Código" value={fp.code} onChange={(e) => setFp({...fp, code: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm font-mono focus:border-brand focus:outline-none" />
                            <input placeholder="Dirección" value={fp.address} onChange={(e) => setFp({...fp, address: e.target.value})} className="w-full border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                            <div className="grid grid-cols-2 gap-2">
                                <input placeholder="Ciudad" value={fp.city} onChange={(e) => setFp({...fp, city: e.target.value})} className="border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                                <input placeholder="Región" value={fp.region} onChange={(e) => setFp({...fp, region: e.target.value})} className="border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2"><button onClick={() => setOpenP(false)} className="text-sm px-4 py-2 border">Cancelar</button><button data-testid="pos-create" onClick={createPos} className="text-sm px-4 py-2 bg-brand text-white">Crear</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
