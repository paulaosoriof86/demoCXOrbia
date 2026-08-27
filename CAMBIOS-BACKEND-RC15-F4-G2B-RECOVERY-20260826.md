# CAMBIOS-BACKEND — RC15 F4 G2-B RECOVERY — 2026-08-26

**Bloque:** `F4_G2B_RECOVERY_ONE_SHOT`  
**Estado actual:** `MECHANISM_REPAIR_2_PENDING_EXECUTION`  
**PHASE_A:** `98/100`  
**PRODUCTION_REAL_READINESS:** `76/100`

## Hallazgo de entrada y reparación 1

Antes de consumir el lease se verificó que `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml` seguía `HISTORICAL_INERT_M3`, aunque el mismo path en `1d2cfecba0a89b637398d747a628e549d9823c68` conserva el ejecutor previamente probado Cloud Build → Cloud Run → smoke → Hosting → post-readback. Se clasificó `MECHANISM_P0`, no `PRODUCT_P0`, y se reparó focalmente el mismo workflow en el commit `1f636b79954ab0a5474f7f1ca16a7701c0f64edf`.

## Resultado del primer evento reparado

GitHub reconoció el workflow F4 y creó run `33027014684`, pero terminó `skipped` antes de crear un job porque el `if` del job dependía de `github.event.head_commit.added/modified` y la condición resultó falsa. Por tanto: checkout=0, provider reads=0, provider writes=0, lease consumed=false, Cloud Build=0, Cloud Run update=0, Hosting deploy=0. Este evento no consume el intento F4 ni es evidencia de fallo de producto.

## Reparación 2

- Se elimina únicamente el `if` redundante del job; el trigger `paths` del workflow sigue limitando la ejecución al execute F4 o al propio workflow.
- Se mantiene la autorización original `F4-G2B-RECOVERY-20260826-01`; no se reautoriza ni se crea otro lease.
- El lease `F4-G2B-PROVIDER-LEASE-20260826-01` sigue emitido/no consumido.
- La autorización continúa ligada al HEAD original `fdba595ac83bee69f1d4d50cf02ab174ce8d7eda`. El nuevo runner exige que el parent actual descienda de ese HEAD y que todo delta acumulado intermedio sea exclusivamente control-plane F4.
- El commit de reparación 2 solo puede tocar el workflow, esta bitácora y la evidencia del `MECHANISM_P0`.
- Source funcional `f9802fdd498934a8e7729fa5c7d18341bec1cd71` y source-fix/release pin `1d2cfecba0a89b637398d747a628e549d9823c68` permanecen intactos.

## Budget y seguridad

Máximo vigente: Cloud Build=1, Cloud Run update=1, Hosting deploy=1. Firestore/Auth/Storage/HR externa/datos reales/credenciales reales/pagos/Rules/Make/Gemini/merge=0. Retry automático=0. Rollback conocido `cxorbia-live-hr-dev-00011-f2f`.

Hasta la materialización de esta reparación 2: provider reads=0, provider writes=0, deploys=0, lease consumed=false, intento provider consumido=0.

## Clasificación

- **Reusable CXOrbia:** eliminación de job-filter frágil, autorización anclada a ancestor, cumulative control-plane gate y lease mutation-boundary.
- **Exclusivo TyA:** G2-B y proyecto `cxorbia-backend-dev`.
- **Claude/prototipo:** sin cambio funcional frontend.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** workflow/control-plane/evidence/docs.

## Siguiente exacto

Materializar reparación 2 por fast-forward y observar el nuevo F4 run. El porcentaje solo sube a 81 si provider post-readback termina `RECOVERY_PASS_FULL`.
