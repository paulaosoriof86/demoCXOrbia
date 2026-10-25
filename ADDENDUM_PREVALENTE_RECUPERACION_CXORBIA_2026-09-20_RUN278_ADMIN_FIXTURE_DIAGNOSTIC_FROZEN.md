# ADDENDUM PREVALENTE — I3 RUN 278 ADMIN FIXTURE DIAGNOSTIC LOCK

**Fecha:** 2026-09-20  
**ID:** `CXORBIA-I3-RUN278-ADMIN-FIXTURE-DIAGNOSTIC-20260920`  
**Estado:** `FROZEN_PREVALENT_UNTIL_EXACT_SUBCAUSE_OR_I3_GO`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`

## Resultado material Run 278
- Run: `35492446889`
- Product source: `16d1bc8649f358f72d9576d6e4c20bfa6b833272`
- Product tree: `74bec1dbb83681e94b17320ea3756fa926bbb912`
- Artifact SHA-256: `89154d8d5c84582877f31045b8508b372a80b19e38ffb1b4602bf12b3bc27ebc`
- HR revision: `bbba08044f7140d1d61240989e2bca2a88938696d7a0c261214ae77a1fd47081`
- Step21 PASS, Step22 PASS, Step23 PASS, Gate20 PASS, artifact único PASS.
- Live fixtures: `7/10`, `cleanup=true`, `builds=0`, `deploys=0`, `production=false`.
- Gate21: SKIPPED.

## Primer causal
`FUNCTIONAL_DEFECT:ADMIN_FIXTURE_VISIBILITY_OR_SCOPE`.

Los cuatro shoppers sintéticos pasaron creación, ACK remoto, login visible y cleanup completo. El fallo ocurrió al evaluar el caso Admin antes de ejecutar disponibilidad/asignación y postulación.

El código anterior agregaba cuatro subcondiciones bajo un solo error y no permitía saber cuál falló:
1. filas Admin visibles;
2. read model Admin conserva país/teléfono/email/estado;
3. detalle HN muestra teléfono/email;
4. comando cross-project es rechazado.

## Cambio permitido
Solo control-plane/harness. No cambia producto, artifact, Auth general, mapping general, HR general ni producción.

`.github/control/RECOVERY-I3-LIVE-FIXTURES-20260920-V4.mjs` debe emitir `admin-fixture-diagnostic.json`, registrar `5_PERFIL_ADMIN` aunque falle y usar códigos separados:
- `FUNCTIONAL_DEFECT:ADMIN_FIXTURE_ROWS_NOT_VISIBLE`
- `FUNCTIONAL_DEFECT:ADMIN_FIXTURE_READ_MODEL_MISMATCH`
- `VISUAL_DEFECT:ADMIN_FIXTURE_HN_DETAIL_NOT_VISIBLE`
- `AUTH_FAILURE:ADMIN_CROSS_PROJECT_COMMAND_NOT_BLOCKED`

## Regla
No corregir producto por inferencia. Reejecutar el workflow canónico con la misma product source y corregir únicamente el primer subcausal físico que aparezca.
