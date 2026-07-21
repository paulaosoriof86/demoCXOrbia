# PENDIENTES-PROTOTIPO.md

> Lista viva de mejoras del prototipo CXOrbia. Actualizada 2026-07-21.
> P0 crítico · P1 importante · P2 posterior · [TyA] específico · [CX] reusable.

## 🔴 P0 ACTUAL — V171b / AISLAMIENTO SHOPPER

### Resuelto y preservado

- [Backend] HR viva read-only confirmada con cambios reales.
- [Backend] Refresco al cargar, `pageshow` y sondeo de 15 segundos desplegados.
- [Backend] Cuatro reportes operativos live preservados.
- [Claude/CX] V171b conserva reportKit, reportes multiformato, branding, gráficas, multiproyecto, Panorama, add-ons, Novedades y las correcciones principales de V170.
- [Gobierno] V171b no fue aplicada; no pedir reinicio desde V164 ni reabrir HR, histórico, shoppers o Finanzas.

### P0 — identidad Shopper fail-open

- [Claude/CX] `app/modules/misvisitas.js`: eliminar `shopperId || 'sh1'`.
- [Claude/CX] Sin `shopperId`, Mis Visitas debe mostrar cero filas y bloquear acciones.
- [Claude/CX] Sin `CX.data.visitsForShopper`, usar `[]`; nunca caer a `CX.data.visitas()`.
- [Claude/CX] `app/modules/reservas.js`: eliminar fallback `sh1`; cero reservas y acciones sin identidad.
- [Claude/CX] `app/modules/midia.js`: Mi Día y próxima visita deben filtrar exclusivamente por `shopperId`; no ampliar por estado.
- [Claude/CX] `app/app.js`: el seed `sh1` solo puede existir bajo guard demo explícito; live/real falla cerrado.

### Gates obligatorios

- [QA] Shopper A ve solo A.
- [QA] Shopper B ve solo B.
- [QA] Sesión sin identidad ve cero datos privados y ejecuta cero acciones.
- [QA] Una visita agendada de B no aparece en Mi Día de A.
- [QA] Sin `visitsForShopper`, Mis Visitas queda vacío.
- [QA] Búsqueda global de `sh1`: solo semillas demo protegidas.
- [QA] Las siete correcciones V170 continúan pasando.
- [QA] PDF/XLSX/PPTX conservan extensión, contenido, identidad y legibilidad.

### P1/P2

- [Claude/CX] Corregir o renombrar el campo `bytes` del manifiesto/inventario para representar bytes UTF-8 reales.
- [Academia] Documentar diferencia entre oportunidades disponibles y visitas privadas; sin identidad no se muestran datos.

### Paquete vinculante

- `app/docs/PAQUETE-CORRECCION-CLAUDE-V171B-CORTE1B-20260721.md`.

### Cierre pendiente

`CANDIDATA V171B CORREGIDA → EXECUTION_LANE_READY → AUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`
