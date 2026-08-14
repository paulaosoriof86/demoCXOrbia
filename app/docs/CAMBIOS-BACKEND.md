# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 20:26 -06:00
**Estado:** `P0_READONLY_GATE_HOLD_INCONCLUSIVE__V1_MAPPING_INVALIDATED__EXACT_LINKED_OWNER_SOURCE_REPAIR_PASS__NO_DEPLOY`

## Bloque 2026-08-13 — gate real read-only + corrección source posterior

Se ejecutó **una sola vez** el gate DEV read-only autorizado para revalidar Auth/claims/perfiles/HR y preparar E2E Shopper real. No se autorizó ni ejecutó ningún write o deploy.

### Ejecución real consumida

Workflow existente `CXOrbia C6 Human Login Shopper Identity Audit`:
- run `31762716234`;
- job `94652243857`;
- artifact `9205200319`;
- digest `sha256:7d49035d2610dc35e1bf6b1bca73d49c0ba8487e6242014c01269f0bf8f3526c`;
- provider read executions: **1/1 consumido**.

Inventario leído: 231 Auth users, 209 principals Shopper efectivos, 340 perfiles, 616 visitas protegidas, 572 liquidaciones, 77 certificaciones, HR 15 periodos / 660 visitas / 212 shoppers.

El auditor v1 emitió `62 unique / 137 unmapped / 10 ambiguous-review`, pero **esa distribución quedó invalidada como resultado autoritativo**. No debe traducirse en “147 identidades rotas”. El mismo run entregó evidencia independiente `M616/L208/P194`: 616 matches exactos de visita, 208 relaciones únicas HR→shopper protegido y 194 shoppers protegidos con histórico.

### Causa del HOLD/inconsistencia

Se aislaron source-only dos brechas:

1. `tools/qa/cxorbia-p0-exact-identity-provider-readonly.mjs` v1 hacía prefiltrado por claim antes de la composición exacta completa.
2. `app/adapters/tya-cumulative-read-model-v2.js` podía relacionar una visita HR con `match.row.shopperId` todavía expresado como alias técnico legacy, sin canonicalizar ese owner a profile id antes de alimentar `liveToCanonical`.

La segunda brecha fue reproducida por un self-test sin proveedor y falló antes de la corrección. Esto demuestra que la salida 62/137/10 mezclaba defecto del instrumento + defecto source y no medía limpiamente el universo real.

### Reparación reusable aplicada

Se reforzó `app/adapters/tya-canonical-state-semantics-v2.js`, que ya se carga inmediatamente después del compositor. Antes de la composición acumulativa ahora:
- construye el índice mediante `CX_EXACT_IDENTITY_CONTRACT`;
- recorre owners de `visits`, `certifications`, `liquidations`, `postulations`, `applications` y `posts`;
- canonicaliza únicamente owners con match técnico exacto único;
- preserva el owner técnico original como diagnóstico cuando cambia;
- deja ambiguos/no resueltos fail-closed;
- no usa nombre, correo, teléfono, username ni similitud.

No se dejó un adapter paralelo: el archivo temporal `app/adapters/cxorbia-exact-linked-owner-normalizer-v1.js` fue eliminado después de integrar el seam en el adapter existente.

### Gates creados/reforzados

- `tools/qa/cxorbia-p0-exact-identity-provider-readonly.mjs`: auditor v2 preparado para composición global antes de clasificar principals; no se ha reejecutado contra proveedor.
- `tools/qa/cxorbia-p0-local-readonly-proxy.mjs`: servidor local GET/HEAD-only para ejecutar source reparado contra rutas DEV sin deploy.
- `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`: soporte de handoff privado y rutas Academia/Certificación; E2E real aún no ejecutado.
- `tools/qa/cxorbia-p0-global-composition-source-selftest.mjs`: regresión provider-free de la cadena exacta profile→alias→visita protegida→hrRowId→HR.
- `.github/workflows/cxorbia-phase-a-visual-smoke.yml`: workflow existente reforzado; no se creó workflow nuevo.
- `.github/workflows/cxorbia-c6-human-login-shopper-identity-audit.yml`: workflow existente reforzado para modo one-shot read-only; no se creó workflow nuevo.

### PASS source posterior

Run `31763545130`, job `94654691101`: **SUCCESS**.

- `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE`.
- `PASS_P0_GLOBAL_COMPOSITION_SOURCE`.
- `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`.
- Visual smoke: `GO_WITH_WARNINGS_VISUAL_SMOKE_POST_V96`.
- Hard fails: 0.
- Warning no bloqueante: `custom:custom_role_visible_nav_items:1`.
- Artifact `9205478201`.
- Digest `sha256:12c5196203588c70ebe2f2ba86774f77965d7fbb5dbdcdb27007aa916272706a`.

## E2E real y credenciales

El selector privado existente usa un handoff histórico de 109 credenciales. No obtuvo credencial Shopper vigente; no hubo exportación de valores ni sign-in. Por eso el E2E real y Academia/Certificación real se **omitieron**, no se clasifican como FAIL.

## Seguridad / STOP_RETRY

Request real consumido/deshabilitado. Run seguro `31762822792` confirmó que la neutralización omite proveedor. No hubo segundo provider read.

- provider read executions: 1;
- provider writes: 0;
- Auth/Firestore/HR/Rules/Storage writes: 0;
- password changes/resets: 0;
- Hosting/Cloud Run deploy: 0;
- Make/Gemini/pagos: 0;
- merge/producción: false.

## Clasificación

- **Reusable CXOrbia:** contrato exacto compartido + canonicalización de owners vinculados + regresión source.
- **Exclusivo cliente:** universo real TyA y cohorte de credenciales vigentes, aún no revalidados con v2.
- **Claude/prototipo:** sin rediseño UI, sin candidata nueva; no requiere parche frontend.
- **Academia:** rutas incorporadas al E2E source; validación real pendiente.
- **Sin impacto Claude:** request, CI, auditoría y evidencia.

## Pendiente exacto

Siguiente bloque source-only: resolver el **handoff privado Shopper vigente** a partir de material ya existente, sin tocar proveedor ni contraseñas. Después hará falta una nueva autorización one-shot para ejecutar auditor v2 + E2E real. El source repair no se despliega hasta ese PASS.

Evidencia: `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json`.
