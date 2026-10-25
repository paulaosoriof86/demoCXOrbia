# R17N post-materialization read-only + CX.data smoke — PASS

Fecha: 2026-07-30

## Decisión
`PASS_R17N_POST_MATERIALIZATION_READONLY_AND_CXDATA_SMOKE`

## Runtime corregido
- P0: `P0-C5-CXDATA-PERIOD-MODEL`.
- Archivo: `app/core/backend-firebase.js`.
- Commit: `96cb7601559a76595d6203724a4bcf2d0b35b390`.
- `CX.data.periods` ya consume la subcolección canónica del proyecto activo `tenants/tya/projects/cinepolis/periods`.
- Los documentos raíz de `projects` ya no se convierten en periodos.
- `currentPeriodId` inválido/stale se reemplaza por un periodo canónico; resultado actual `2026-07`.

## Re-smoke read-only final
- Run: `30544595440`.
- Artifact: `8760141578`.
- Digest: `sha256:337c4e8b07786effea5c326c77dfb31f9edc2fa49e09d7e46e18fa4c8dacbc98`.
- Provider paths: 1,406/1,406.
- Missing/auth drift/production drift: 0/0/0.
- Proyecto padre: 1 (`cinepolis`).
- Periodos canónicos: 14; adapter: 14; IDs: match exacto.
- `currentPeriodId=2026-07`, canónico.
- Visitas: 616.
- Shoppers en tenant: 340; 194 perfiles canónicos únicos referenciados por las visitas; 616/616 visitas con target existente y nombre real.
- Certificaciones: 77/77 con shopper existente.
- Controles de liquidación: 572; `paid=true`: 0.
- `source=firestore`, `fallbackUsed=false`, interfaz CX.data preservada, read-only/writeMode disabled.
- Blockers: 0.

## Instrumentación
El primer intento post-fix (`30544254033`) devolvió `periods=0` porque el snapshot Firestore simulado del propio smoke no incluía la colección `periods`, aunque el bloque proveedor sí la había leído y comprobado con 14 documentos. Se corrigió únicamente el harness QA en `21ce464772bfe6543b3672ad4b6d7deafd564adc` para pasar esos 14 documentos al adapter en memoria. No hubo cambio de datos ni un segundo runtime fix.

## Seguridad
Provider/data/Auth/Storage/HR/legacy writes=0; deletes=0; pagos=0; deploy=0; merge=false; producción=false; PII cruda en repo/artifact=0.

## Estado
El P0 de modelo proyecto/periodo queda técnicamente resuelto. Corte 5 queda `TECHNICAL_PASS_PENDING_OPERATIONAL_VISUAL` hasta validar el consumidor en pantalla antes del freeze.
