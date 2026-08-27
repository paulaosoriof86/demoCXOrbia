# CAMBIOS BACKEND — RC15 F5 mecanismo sintético — 2026-08-27

## Bloque
F5 — promoción del runtime y aceptación sintética integral canónica.

## Continuidad y autorización
Paula autorizó explícitamente continuar con el siguiente bloque después de que F5 quedara `SOURCE_MECHANISM_READY`. El alcance autorizado es: un máximo de 1 Cloud Build y 1 update de `cxorbia-live-hr-dev`, sin Hosting deploy, para ejecutar exclusivamente `CXORBIA_E2E_SYNTH_*`, cleanup obligatorio y post-clean readback. Datos reales, HR externa, Firebase Auth writes, pagos, Rules, Storage, Make, Gemini y merge permanecen prohibidos.

## Defectos de mecanismo encontrados antes del provider write
1. `F5-MECH-004 — MECHANISM_P0`: el Dockerfile no copiaba el provider F5 importado por `g2b-synthetic-runtime.mjs`; un build habría producido una imagen incompleta.
2. `F5-MECH-005 — MECHANISM_P0`: el lifecycle canónico exige actor + membership, pero el source F5 inicial solo sembraba visit/shopper y no podía usar Auth real ni crear Auth sintético bajo el budget autorizado.
3. `F5-MECH-006 — hardening`: faltaba expiración automática del gate runtime F5.
4. `F5-MECH-007 — hardening`: un fallo entre transacción canónica y tagging podía dejar artifacts del actor sintético sin `syntheticRequestId`.

## Reparación materializada
- `backend/runtime/hr-live-service/Dockerfile`: copia explícitamente `cxorbia-f5-synthetic-acceptance-provider-v1.mjs`.
- `backend/runtime/cxorbia-f5-synthetic-acceptance-provider-v1.mjs`:
  - agrega IDs exactos para aplicación y memberships sintéticos;
  - usa dos actors sintéticos efímeros (`shopper` y `admin`) sin crear usuarios Firebase Auth;
  - firma tokens F5 ligados a `requestId + authorizationId`;
  - conserva la validación de membership del provider canónico mediante documentos Firestore exact-tag temporales;
  - amplía readback a fixtures/estado;
  - cleanup elimina tags exactos y también artifacts huérfanos de los UIDs sintéticos exactos, con fail-closed ante cualquier identidad no sintética.
- `backend/runtime/hr-live-service/g2b-synthetic-runtime.mjs`:
  - exige TTL válido y no expirado;
  - exige actor operator sintético para `SEED/READBACK/CLEANUP`;
  - pasa IDs a readback/cleanup;
  - mantiene endpoint, tenant y project canónicos.
- `backend/config/cxorbia-f5-synthetic-acceptance-authority.json`: autorización runtime F5 estructurada y budget 1/1/0.
- `backend/config/cxorbia-f5-synthetic-acceptance-execute.json`: marcador single-use, no retry, ligado al HEAD fuente exacto.
- `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml`: reutiliza el workflow existente; no crea workflow nuevo. Ejecuta preflight, build, Cloud Run, E2E, cleanup y post-clean evidence.

## Verificación source
- `node --check` provider F5: PASS.
- `node --check` runtime F5: PASS.
- Dockerfile contiene el COPY faltante.
- El workflow valida `GITHUB_RUN_ATTEMPT=1`; rerun del mismo run queda fail-closed.

## Seguridad antes de disparar
En la materialización source: Cloud Build 0, Cloud Run update 0, Hosting 0, Firestore 0, Auth 0, HR externa 0, pagos/Rules/Storage/Make/Gemini/merge 0. La mutación provider comienza únicamente si el push activa el workflow y sus preflights pasan.

`PRODUCTION_REAL_READINESS` permanece 81/100 hasta que F5 termine PASS con cleanup y post-clean readback cero.

## Clasificación
- Reusable CXOrbia: gate con TTL, actores sintéticos sin Auth write, cleanup de orphans, post-clean evidence.
- Exclusivo cliente: target `tya/cinepolis`.
- Claude/prototipo: sin cambio frontend.
- Academia: revisar solo si F5 demuestra comportamiento operativo que deba documentarse.
- Sin impacto Claude: backend/runtime/control-plane.
