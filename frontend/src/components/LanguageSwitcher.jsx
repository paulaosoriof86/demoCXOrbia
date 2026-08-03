import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const lang = i18n.language || "es";

    function toggle() {
        const next = lang.startsWith("es") ? "en" : "es";
        i18n.changeLanguage(next);
        localStorage.setItem("gvc_lang", next);
    }

    return (
        <button
            data-testid="lang-switcher"
            onClick={toggle}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors font-mono"
            title="Cambiar idioma / Switch language"
        >
            <Globe className="h-3 w-3" />
            <span>{lang.startsWith("es") ? "ES" : "EN"}</span>
        </button>
    );
}
