# CAMBIOS-BACKEND — M3 CERTIFICACIÓN DEL MECANISMO — 2026-08-25

**M3_MECHANISM_EPOCH:** `RC15-M3-MECHANISM-20260825-02`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**PHASE_A:** `98/100`

## Motivo

La certificación solicitada encontró que el mecanismo todavía no era sostenible. El índice/checkpoint ya declaraban M3, pero `backend/config/cxorbia-phase-a-continuity-lock.json` seguía con `masterPlan.currentPhase=F0_SYSTEMIC_AUDIT`, referencias a validadores superseded y sin autoridad M3 explícita. Además, 19 commits secuenciales de M3 generaron 78 workflow runs push fallidos en el intervalo inspeccionado.

En el HEAD pre-reparación `0e5ced7b44229cda72250b5ab80a4500506a2d6d` los cuatro workflow runs implicados fueron:

- `32907032623` — `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`
- `32907031721` — `.github/workflows/cxorbia-auth-preactivation-route-action.yml`
- `32907030161` — `.github/workflows/cxorbia-corte4-hosting-dev-visual.yml`
- `32907030972` — `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml`

Los cuatro terminaron failure sin jobs; el runtime run tampoco produjo artefactos. En la misma ventana la búsqueda de push runs exitosos devolvió cero. Por tanto no se observó ejecución de provider desde esas fallas, pero el ruido constituye un defecto real de control-plane.

## Reparación atómica

Se reemplazan los cuatro workflows históricos por stubs válidos `workflow_dispatch`-only, permiso `contents:read`, sin secretos, id-token, deploy, Auth, Hosting, Cloud Run, datos ni merge. El contenido histórico permanece preservado en Git.

Se sincroniza el continuity lock a M3, se incorpora `m3ExecutionControl`, se declara el validator authority M3, se incluye el gate de certificación y se alinean índice/checkpoint/execution/source lock/RESUMEN/PENDIENTES en el mismo tree.

A partir de este hito, toda materialización canónica M3 debe usar **un único commit Git atómico** y remote readback. La Contents API secuencial queda prohibida para estado canónico M3.

## Seguridad

En esta reparación: provider/data/Auth/Firestore/Storage/HR/Rules/Make/Gemini/pagos = 0; Cloud Build/Run/Hosting = 0; G2-B = 0; merge=false; frontend funcional=0.

## Clasificación

- **Reusable CXOrbia:** atomic state materialization, explicit validator authority, readback gate, historical-workflow inertization.
- **Exclusivo cliente:** paths y evidencias históricas TyA/G2-B/Corte4/C6.
- **Claude/prototipo:** sin cambio frontend.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** control-plane, validadores, workflows históricos y documentación.

## Criterio de certificación

No declarar PASS solo por crear el commit. Se exige: HEAD remoto igual al commit atómico, continuity lock y validator authority correctos por readback, los cuatro workflows en estado inert, y análisis de Actions del HEAD reparado sin ejecución provider/deploy/data no autorizada.

## Siguiente exacto

Si el readback certifica PASS, continuar `M3_F1_FINITE_TOMBSTONE_QUEUE_REMAINING_28`. Si falla, corregir exclusivamente el defecto focal sin reabrir M1/M2 ni crear nueva auditoría.
