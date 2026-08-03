export default function GravicentraLogo({ className = "h-6 w-6", withText = true, textClass = "" }) {
    return (
        <span className={`inline-flex items-center gap-2 ${textClass}`}>
            <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Gravicentra">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
                <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                <circle cx="19.5" cy="12.5" r="3" fill="currentColor" />
                <circle cx="10" cy="19" r="1.4" fill="currentColor" opacity="0.55" />
            </svg>
            {withText && (
                <span className="font-display font-bold tracking-tight leading-none">
                    Gravicentra<span className="opacity-60 font-normal ml-0.5">CX</span>
                </span>
            )}
        </span>
    );
}
