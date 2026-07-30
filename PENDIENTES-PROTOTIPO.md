# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-29  
**Estado vivo:** `CORTE3_FROZEN__LEGACY_REFRESH_PASS__R17N_PASS__HR_SHOPPER_CROSSWALK_PENDING__NO_PRODUCTION`

Este archivo contiene pendientes reales de frontend/prototipo para Claude y dependencias backend que condicionan cuándo Claude debe intervenir. Backend, Firebase, adapters, tools, workflows y provider reads/writes no son tareas de Claude.

## 1. No reabrir
- M1: `FROZEN/APROBADO`.
- Corte 1: `FROZEN/APROBADO`.
- Corte 2A: `FROZEN/APROBADO`.
- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no crear V183/R33.
- Finanzas canónicas y pagos históricos mayo/junio congelados.

Solo un P0 reproducible puede reabrir un corte congelado.

## 2. Arquitectura vigente — no crear nueva base
El intento histórico de Corte 4 con Firebase nuevo/vacío quedó superado.

- `cxorbia-backend-dev` = backend DEV canónico y reutilizable.
- `tya-plataforma` = legacy a retirar y Hosting/URL a conservar para cutover final.
- `cxorbia-tya-dev-260729-c4` = sandbox técnico, no destino de materialización.

Claude no debe proponer otra base, otra candidata ni fallback local/mock.

## 3. Pendiente bloqueante backend antes de producción
`HR_PROTECTED_SHOPPER_CROSSWALK_UNRESOLVED`.

- 210 refs shopper HR del plan canónico.
- 215 shoppers existentes.
- 0 matches por stable HR ID.
- 0 matches por stable HR code.
- 210 unmapped; 0 collisions.
- Prohibido dedupe por nombre.

Siguiente gate backend: crosswalk read-only por identidad exacta de visita (`hrRowId`, `sourceSheet/sourceRow`, `visitId`) entre HR source-safe y visitas existentes de `cxorbia-backend-dev`. No leer visitas legacy.

## 4. Shoppers/certificaciones recuperados
Refresh read-only legacy ya cerrado:
- 149 shoppers únicos;
- 120 profile create candidates;
- 22 stable-linked existing profiles;
- 7 HOLD = 6 name-only + 1 source conflict;
- 78 certificaciones útiles;
- 77 candidatas + 1 HOLD;
- 30 recovery mirrors colapsados.

En 22 existing profiles: phone faltante en 22 y email en 8; code/name/city con diferencias no vacías se preservan, no overwrite.

No pedir al shopper repetir una certificación ya válida por un problema de crosswalk.

## 5. Próxima intervención de Claude
Ninguna por rutina ahora.

Solo abrir frontend si:
1. un smoke posterior al write/read-path canónico demuestra P0 reproducible; o
2. Paula decide atender backlog P1/P2 transversal después del cierre operativo.

## 6. Backlog frontend no bloqueante
### Reportes
- PDF: gráfica ausente/impresión del reporte.
- Excel: formato básico.
- `reportKit`: consolidación transversal.
- Mismo alcance/filas entre exportaciones.

### Copy
- Especificar fuente faltante cuando sea posible.
- No mostrar pago/import/sync/proveedor como ejecutado sin evidencia.

### Academia/manuales
- Perfil canónico ≠ referencia HR ≠ identidad Auth.
- Stable key/evidencia transaccional exacta antes de dedupe.
- Conflictos pasan a review.
- Carryover de certificación debe evitar recertificación innecesaria.

## 7. Pendientes transversales preservados
- Multi-tenant/multi-proyecto; Cinépolis configurable, no global.
- Beneficios/liquidaciones/pagos separados por honorario, reembolso, total, moneda y estado.
- Postulaciones/asignaciones con `assignmentSource`, sync status y review; no dedupe por nombre.
- Readiness/source-safe con estados honestos.
- No proveedores reales desde UI.
- `AGOSTO 26 HN` sigue HOLD por país/tab incorrecto.

## 8. Estado seguro
PR #7 draft/open/no merge. Legacy/Firestore/Auth/Storage/HR writes=0; deploy=0; producción=false; imports/pagos/lotes/Make/Gemini=0.
