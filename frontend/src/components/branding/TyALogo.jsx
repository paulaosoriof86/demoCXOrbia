/**
 * TyA Consultores tenant logo — uses the original PNG asset.
 * The logo is a per-tenant asset (each tenant will point to its own file).
 * Wrap in a white surface to guarantee contrast on any background.
 */
export default function TyALogo({ className = "h-10", withSurface = true }) {
    const img = (
        <img
            src="/tya-logo.png"
            alt="TyA Consultores"
            className={`${className} w-auto object-contain block`}
            draggable={false}
        />
    );
    if (!withSurface) return img;
    return (
        <span className="inline-flex items-center bg-white px-3 py-1.5">
            {img}
        </span>
    );
}
