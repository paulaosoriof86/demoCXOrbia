# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-12 17:16 -06:00  
**Estado:** `C6_RUNTIME_07_STOP_RETRY_NESTED_HEREDOC_PRE_HOSTING__PHASE_A_88__SOURCE_REPAIR_APPLIED`

## Bloque ejecutado

One-shot `HOSTING_RUNTIME_ONCE` para `C6_LIVE_USER_ADMIN_FRONTEND_WIRING_RUNTIME_READONLY_PROOF`.

## Resultado runtime 07

Request `c6-live-user-admin-membership-runtime-proof-20260812-07` → run `31649967019` / job `94291913408` / artifact `9162195599` / digest `sha256:91af7648302218477177f7e2785b4b32bea517e2cdebe0b41cc60d082136891e`.

PASS antes del fallo:
- request/action/mode exactos;
- `PASS_C6_STAFF_LANE_SOURCE_PREFLIGHT`;
- Google Cloud DEV auth;
- selector Staff dedicado;
- role `coordinador`;
- Shopper/Cliente selection=false;
- Auth/password writes=0.

El bloque Hosting falló al parsear bash antes de source gate/deploy/runtime: `here-document ... wanted NODE` + `syntax error: unexpected end of file`.

Artifact decisivo: `FAIL_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`, `deploy.attempted=false`, Hosting=0, runtime=null.

Clasificación: `PREFLIGHT_SHELL_SYNTAX_COVERAGE_GAP__NESTED_HEREDOC_INDENTATION`.

## Reparación aplicada después de STOP_RETRY

Sin rerun ni provider adicional:
1. `.github/workflows/cxorbia-c6-dev-root-entrypoint-hosting.yml` — commit `66cffe4a0f236097264d2e0b2f361115464c8e34`:
   - eliminados heredocs Node dentro del subshell Hosting;
   - asserts sustituidos por `node -e`, evitando dependencia de indentación heredoc.
2. `tools/qa/cxorbia-c6-staff-lane-source-preflight.mjs` — commit `b024fd97cd7360a90a32041eb57bd0b003a029a2`:
   - extrae el `run:` exacto del paso Hosting;
   - exige `bash -n` PASS antes del provider;
   - bloquea reintroducción de `node <<'NODE'` en ese paso.
3. Evidencia durable: `app/docs/evidence/c6-live-user-admin-runtime-proof-31649967019.json`.

No se modificó `/app/modules` ni UI de producto. Los commits source-only posteriores no dispararon un nuevo workflow.

## Seguridad

- Hosting runtime 07: `0/1` físicamente consumido.
- Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes nuevos: `0`.
- Segundo Exact Write: `0`.
- Segundo intento: `0`.
- merge=false; producción=false; secretos/tokens expuestos=false.

## Progreso Phase A

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=0/5 | M8=0/3 | M9=0/3 | M10=0/1`

**TOTAL CERTIFICADO=88% | RESTANTE=12% | DELTA CERTIFICADO=+0%.**

## No reabrir

Exact Write V2, private handoff, D rebase, provider snapshot, Auth340, SKIP13, MultiAuth, HR y M4 permanecen cerrados salvo drift reproducible.

## Siguiente frontera exacta

No rerunear `31649967019`. Nueva autorización explícita para un nuevo `HOSTING_RUNTIME_ONCE` bound al HEAD vivo reparado. El preflight actualizado debe compilar el shell Hosting con `bash -n` antes de provider. Con PASS real cerrar M7 y continuar M8 → M9 → M10.

## Clasificación

- **Reusable CXOrbia:** validación shell real pre-provider y eliminación de heredocs anidados.
- **Exclusivo cliente:** próximo runtime Staff TyA.
- **Claude/prototipo:** cero frontend modificado.
- **Academia:** sin cambio hasta runtime PASS.
- **Sin impacto Claude:** workflow/QA/evidencia/docs.
