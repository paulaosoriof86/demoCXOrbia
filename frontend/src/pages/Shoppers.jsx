import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { Loader2, MapPin, Search, Award } from "lucide-react";

export default function Shoppers() {
    const { t } = useTranslation();
    const { tenantId } = useTenant();
    const [shoppers, setShoppers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [country, setCountry] = useState("");

    useEffect(() => {
        if (!tenantId) return;
        setLoading(true);
        const params = new URLSearchParams({ tenant_id: tenantId });
        if (q) params.set("q", q);
        if (country) params.set("country", country);
        api.get(`/shoppers?${params}`).then((r) => { setShoppers(r.data); setLoading(false); });
    }, [tenantId, q, country]);

    const countries = useMemo(() => [...new Set(shoppers.map(s => s.country).filter(Boolean))], [shoppers]);

    return (
        <div className="p-6 md:p-10 max-w-[1400px]">
            <div className="mb-8">
                <div className="eyebrow">Directorio</div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mt-1 tracking-tight">{t("shoppers.title")}</h1>
                <p className="text-sm text-slate-500 mt-2 max-w-2xl">{t("shoppers.subtitle")}</p>
            </div>

            <div className="flex gap-2 mb-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        data-testid="shoppers-search"
                        placeholder={t("shoppers.search")}
                        value={q} onChange={(e) => setQ(e.target.value)}
                        className="w-full border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />
                </div>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none">
                    <option value="">{t("common.all")}</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="bg-white border border-slate-200">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-3 font-semibold">{t("shoppers.columns.name")}</th>
                                <th className="px-6 py-3 font-semibold">{t("shoppers.columns.country")}</th>
                                <th className="px-6 py-3 font-semibold">{t("shoppers.columns.city")}</th>
                                <th className="px-6 py-3 font-semibold">{t("shoppers.columns.email")}</th>
                                <th className="px-6 py-3 font-semibold">{t("shoppers.columns.phone")}</th>
                                <th className="px-6 py-3 font-semibold text-right">{t("shoppers.columns.visits")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {shoppers.map(s => (
                                <tr key={s.id} data-testid={`shopper-${s.id}`} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3">
                                        <Link to={`/shoppers/${s.id}`} className="font-medium text-slate-900 hover:text-brand">{s.full_name}</Link>
                                        {s.certifications?.length > 0 && (
                                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5">
                                                <Award className="h-3 w-3" /> {s.certifications.length} certif.
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-slate-700"><span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5">{s.country}</span></td>
                                    <td className="px-6 py-3 text-slate-700 flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" /> {s.city}</td>
                                    <td className="px-6 py-3 text-slate-600 font-mono text-xs">{s.email}</td>
                                    <td className="px-6 py-3 text-slate-600 font-mono text-xs">{s.phone_e164}</td>
                                    <td className="px-6 py-3 text-right font-mono">{s.total_visits}</td>
                                </tr>
                            ))}
                            {!shoppers.length && <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">{t("common.empty")}</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
