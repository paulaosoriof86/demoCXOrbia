# RESUMEN PARA CLAUDE — Corte 4 VIS-02 · deploy 1

**Fecha:** 2026-07-29

## No hacer
- No crear nueva candidata por este bloque.
- No tocar `app/modules`.
- No reintroducir `adapters/tya-phase-a-source-safe-dev-adapter.js`: la referencia era huérfana y el archivo no existe.
- No materializar datos para ocultar el estado vacío.

## Backend/core resuelto
`P0-C4-VIS-02` se trató en shell/core: backend vacío es estado first-class, no se montan módulos dependientes de proyecto, y el shell anterior se limpia al cambiar de rol.

Gate local: Admin vacío → logout → Shopper vacío → logout → Admin vacío = PASS.

## Hallazgo remoto posterior
El único Hosting autorizado se ejecutó. El remote browser encontró un pageerror porque `index-backend-dev.html` referenciaba `adapters/tya-phase-a-source-safe-dev-adapter.js`, archivo inexistente. Firebase Hosting reescribía esa ruta al HTML principal con status 200; por eso el navegador reportó `Unexpected token '<'`.

La referencia huérfana ya fue eliminada del repo y existe un gate reutilizable que comprueba que todos los `<script src>` locales resuelvan a archivos reales.

## Estado para Claude
Sin tarea frontend nueva. Esperar revalidación Hosting final y visual humana. Solo abrir ajuste de prototipo si esa visual demuestra un P0 adicional de UI real e independiente.
