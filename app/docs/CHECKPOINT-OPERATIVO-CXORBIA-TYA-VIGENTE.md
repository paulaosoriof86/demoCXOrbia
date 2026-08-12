# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-12 17:42 -06:00  
**Estado:** `C6_RUNTIME_09_STOP_RETRY_POST_AUTH_FRONTEND_HANDOFF__HOSTING_1_OF_1__SOURCE_REPAIR_APPLIED__PHASE_A_88__NO_PRODUCTION`

## Estado vivo

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Exact Write V2: PASS cerrado/no repetible.
- Producción: intacta.
- Phase A certificado: **88%**; restante **12%**.

## One-shot runtime 09

Request `c6-live-user-admin-membership-runtime-proof-20260812-09`, target `9b33bfbe6d1807fbfa917360d6e37ecd5c33dce4`, request commit `f94bf1f60b8d1fb12bddde7006ef1415bdc2ebd6`.

- run: `31651410812`;
- job: `94296350609`;
- artifact: `9162751195`;
- digest: `sha256:16970fb360a1fc54d3b94f7a6ff87138afa959ac6b6fa31f7299b78dfeee48d8`.

PASS demostrado antes del fallo final:
- autorización/action/mode exactos;
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT` v3;
- `bash -n` del shell Hosting exacto: PASS;
- ausencia de heredoc anidado: PASS;
- submit canónico por Enter desde `#lgPass`: contrato source PASS;
- Google Cloud DEV auth: PASS;
- selector Staff dedicado: PASS (`coordinador`);
- source parity: PASS;
- Hosting DEV: **deploy físico PASS, 1/1 consumido**;
- remote parity: `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`, exact=true, root 302 y canonical 200;
- el formulario sí fue submitido;
- contexto Staff autenticado alcanzado: role `coordinador`, namespace `staff`, tenant `tya`, projectIds=`cinepolis`;
- autoridad HR viva aplicada: **15 periodos / 660 visitas / 211 shoppers**, de `2025-06` a `2026-08`, duplicados de visitas/shoppers = 0.

## STOP_RETRY y causa raíz

El runtime llegó a Auth/contexto y a la composición HR canónica, pero el shell final no entró: `appOn=false`, `loginHidden=false` y el marcador heredado `CX_BACKEND_LAST_STATE.empty=true` permaneció activo pese a existir 15 periodos y 660 visitas.

Clasificación: `C6_POST_AUTH_HR_AUTHORITY_FRONTEND_ENTRY_HANDOFF_GAP__STALE_FIRESTORE_EMPTY_STATE`.

La inspección source confirmó el desacople: `backend-browser-auth.js` entra al producto con `backend-ready`; la autoridad HR protegida finaliza después y publica `cx:protected-auth-hr-authority-ready`, sin garantizar el handoff final al shell. Al mismo tiempo, el guard Corte 4 puede seguir interpretando un marcador Firestore-vacío anterior aunque la autoridad HR ya haya poblado `CX.data`.

Esto **no demuestra** fallo de credenciales, claims, membership, Firestore read ni HR. El fallo demostrado es el handoff post-auth hacia el frontend canónico.

Artifact decisivo: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`. El verde exterior del workflow no sustituye el artifact sanitizado.

`STOP_RETRY` aplicado: no rerun, no segundo request y no segundo Hosting bajo runtime 09.

## Reparación source-only posterior

Sin nuevo provider ni Hosting:
- `app/adapters/tya-c6-live-user-admin-membership-wiring-v1.js`, commit `a89ec134fe1b3b9cd0a8f014b39133d7a72ccd5a`: al evento `cx:protected-auth-hr-authority-ready`, Staff revalida fail-closed la membership canónica, reconcilia los marcadores stale de vacío contra la autoridad HR+Firestore ya poblada y reutiliza `CX.app.enter()`; no manipula directamente la UI.
- `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs`, commit `87bcddebeb74147dc0862ff3115186795978f058`: ahora exige membership verificada, handoff `entered`, stale-empty=false, `appOn`, `loginHidden`, tres reloads y new-tab.
- `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs`, commit `84e736b064d66bf7f7bde3d54955d98fb0f0a9a9`: preflight v4 incorpora el contrato membership→authority→frontend y bloquea entrada por mutación directa de UI.
- Evidencia durable: `app/docs/evidence/c6-live-user-admin-runtime-proof-31651410812.json`.

No se modificó `/app/modules`, `app/core/backend-preview-status.js` ni UI visual del prototipo.

Un intento local auxiliar de descargar raw GitHub para ejecutar el preflight v4 fuera de Actions falló por DNS del entorno (`raw.githubusercontent.com` no resolvió). No se sustituyó por otro carril ni se ejecutó provider. El próximo one-shot deberá ejecutar el preflight v4 real antes del provider y fallará cerrado si la reparación no compila o no cumple contrato.

## Seguridad

- Hosting runtime 09: **1/1 físicamente consumido y deploy PASS**.
- Nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes: `0`.
- Segundo Exact Write: `0`.
- Segundo intento runtime 09: `0`.
- Provider/Hosting posteriores al STOP_RETRY: `0`.
- Secretos/tokens expuestos: `false`.
- Merge: `false`.
- Producción: `false`.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**Phase A=88% | restante=12% | delta certificado runtime 09=+0%.** M7 no se cierra porque el frontend final no quedó visible/estable, aunque Auth/contexto, HR authority, Hosting y remote parity sí avanzaron técnicamente.

## Siguiente bloque exacto

No rerunear `31651410812`. Por STOP_RETRY se requiere una **nueva autorización explícita** para un nuevo `HOSTING_RUNTIME_ONCE` Staff bound al HEAD vivo posterior a esta reparación. El preflight v4 debe PASS antes de provider. Con PASS real: cerrar M7 y continuar inmediatamente M8 → M9 → M10.

## Clasificación

- **Reusable CXOrbia:** handoff fail-closed membership→autoridad→shell y reconciliación de stale empty state.
- **Exclusivo cliente:** próximo runtime Staff TyA en `cxorbia-backend-dev`.
- **Claude/prototipo:** cero módulos/UI visual modificados; adapter C6 solamente.
- **Academia:** sin cambio de contenido hasta runtime PASS.
- **Sin impacto Claude:** QA tooling, evidencia y documentación.
