# RESUMEN PARA CLAUDE — ADDENDUM F10 OPERATIONAL EVIDENCE — 2026-08-29

**STATE_SYNC_EPOCH:** `CXORBIA-20260829-F10-OP-EVIDENCE-SOURCE-PASS-12`  
**F10:** `OPEN_P1_SOURCE_REPAIRED_PENDING_PREDEPLOY_AND_DEPLOY`  
**NEXT:** `F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE_THEN_REQUIRE_EXPLICIT_DEPLOY_AUTHORIZATION`

Este addendum es el handoff frontend vigente para el incidente F10 y corrige cualquier instrucción anterior que apunte a reconstruir módulos o a `app/core/tya-phase-a-source-safe-preview.js` / `app/core/data.js` como causa primaria de este incidente.

## HARD PRESERVE — no tocar

Los módulos aprobados siguen siendo los correctos. La matriz `backend/config/cxorbia-f10-approved-module-authority-matrix-v1.json` verificó `0` mismatches en 26 módulos Phase A, 10 soporte y 5 post-Phase-A cargados.

Blobs críticos que deben permanecer exactos:

- Dashboard `app/modules/dashboard.js` → `e879fc3f1dd5a7486762b197346cadd086e1d99d`
- Visitas `app/modules/visitas.js` → `d7c65650e4972d438f2641cbcaaff25486fb7f01`
- Postulaciones `app/modules/postulaciones.js` → `f38593885c245841710934971dd335ee5eddf1da`
- Shoppers `app/modules/shoppers.js` → `92f834bb2b7fcf5d8674acb717ce6b4e920c5766`
- Mis Visitas `app/modules/misvisitas.js` → `19feb19b96c7d2f69c3cfed785fdbfcaabd96e2d`
- Finanzas `app/modules/finanzas.js` → `623fab9ba1e06c39f83beda610bb771e23910a07`
- Cliente `app/modules/cliente.js` → `4e5981081bdd01de368c4f412ed476244426634e`
- Reservas `app/modules/reservas.js` → `ddc54bad9dfc7b242b06d39daf872c9f9b327c80`
- Academia `app/modules/academia.js` → `0b42dd790d946d327eb1110b78878e302d51aa6e`
- Entry point → `7a5f169dd0e239d46fa4af09cf67f2eb4329a477`
- `app/app.js` → `2043d33dee611adacebc947c8423ed1739c1a8da`

No proponer restore V182, reescritura global, nueva candidata ni cambio de estos blobs por el incidente F10.

## Qué se reparó en backend/adapters

La causa real fue la mezcla entre dos verdades distintas:

1. **canonical lifecycle**: una evidencia posterior puede permitir inferir un hito anterior para historia/auditoría;
2. **operational HR evidence**: un KPI actual solo debe contar la evidencia directa disponible para ese hito en HR.

El sucesor F10 ya está aplicado en source:

- commit `6392736070dcf34d24f9b27b8bb1d0ecbcf116b0`;
- `app/adapters/tya-canonical-state-semantics-v2.js`;
- blob `941051c96a26017363acfc72f7e88edbe70c68ba`;
- atomic run `33283725070` = `APPLIED_AND_VERIFIED`;
- gate `PASS_F10_OPERATIONAL_EVIDENCE_SEMANTICS`.

El adapter mantiene el lifecycle canónico y publica aparte facetas/resumen de evidencia operacional. Dashboard/Periodos/Historico/HR Source/Visitas/Postulaciones/Shoppers/Reservas pueden consumir esa fachada sin cambiar los módulos aprobados.

## Evidencia fresca que motivó el fix

Run `33281688280`, revision provider `b7bc89176161a8a1b83e3d33098634ae77a5a8bc3f6f44ee7c749e2d11da598d`, `sourceReadAt=2026-08-29T23:44:58.827Z`.

Para agosto 2026, la evidencia operacional directa fue: 44 total; 30 realizadas (`GT24/HN6`); 14 pendientes de realizar; 4 cuestionarios pendientes (`GT4`); 4 sin agendar operativas (`GT3/HN1`); 30 submitidas/candidatas a liquidación; 0 liquidaciones confirmadas; 0 pagos confirmados.

No hardcodear esas cifras. El producto debe derivarlas de la HR viva.

## Único ajuste frontend aún potencialmente necesario

El source ahora distingue `liquidationCandidates` de `liquidationConfirmed`, pero el Dashboard aprobado solo tiene el tile visible **Liquidadas**. Ese tile debe seguir significando liquidación confirmada; no convertirlo en candidatas.

Si Paula aprueba una mejora visible, el cambio frontend correcto es **agregar/exponer “Candidatas a liquidación” como indicador separado**, preservando “Liquidadas” y “Pagadas” como estados confirmados. Ese ajuste debe ir por el lane frontend autorizado y no es razón para reemplazar Dashboard.

## Cliente/Cliente 360

El HOLD de Cliente permanece separado. No mezclarlo con la corrección HR/KPI ni utilizarlo para reabrir versiones de módulos ya certificadas.

## Estado de deploy

El sucesor F10 todavía **no está desplegado**. No afirmar que ya es visible en Hosting. El release servido continúa siendo el release congelado F8.5, cuyos módulos sí corresponden al linaje aprobado.

Siguiente gate exacto: `F10_PREDEPLOY_EXACT_SOURCE_BROWSER_AND_MODULE_MATRIX_GATE`. Después hace falta autorización explícita de deploy y revalidación live browser contra una revisión provider fresca.

## Academia/manuales

No actualizar todavía material visible por un cambio source-only. Tras deploy/aceptación, revisar definiciones de “Realizada”, “Cuestionario pendiente”, “Submitida”, “Candidata a liquidación”, “Liquidada” y “Pagada”, manteniendo la distinción evidencia operacional vs lifecycle histórico.
