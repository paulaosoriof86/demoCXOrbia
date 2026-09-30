# PENDIENTES PROTOTIPO — ADDENDUM LEGACY REFRESH / R17N

Fecha: 2026-07-29

## Bloqueante real Phase A
`HR_PROTECTED_SHOPPER_CROSSWALK_UNRESOLVED`

- 210 referencias shopper HR canonical-shadow.
- 215 shoppers existentes en `cxorbia-backend-dev`.
- 0 match por stable HR ID.
- 0 match por stable HR code.
- 210 unmapped; 0 collision.
- Prohibido resolver por nombre.

Siguiente investigación permitida solo con nueva autorización read-only: cruzar visitas HR source-safe con visitas ya existentes en `cxorbia-backend-dev` por `hrRowId`, `sourceSheet/sourceRow` o `visitId` estable y derivar shopper crosswalk desde esa evidencia transaccional.

## Pendientes de identidad/perfil
- 120 perfiles legacy create candidates.
- 22 perfiles stable-linked: candidatos a fill-missing (phone 22, email 8), sin overwrite de campos canónicos no vacíos.
- 6 perfiles con solapamiento solo por nombre: REVIEW.
- 1 stable-ID legacy con conflicto interno de nombre entre dos representaciones: REVIEW.

## Certificaciones
- 78 registros útiles recuperados.
- 77 pueden enrutar cuando su perfil esté resuelto.
- 1 queda HOLD por perfil no resuelto.
- 30 espejos de recuperación fueron colapsados; no duplicarlos.

## Otros pendientes preservados
- `AGOSTO 26 HN`: HOLD país/tab.
- PDF sin gráfica y Excel sin formato: P1/P2 transversal, no bloqueante Corte 3.
- 2 cleanup candidates previos: HOLD_NO_DELETE.

No nueva candidata, no reauditar V182, no writes/deploy/producción todavía.
