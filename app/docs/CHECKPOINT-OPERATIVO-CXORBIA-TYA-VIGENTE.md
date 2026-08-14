# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-14 13:24 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_CREDENTIAL_RECOVERY_PASS__ADMIN_LOGIN_POINTER_STOP_RETRY__GO_LIVE_35__PAULA_REVIEW_REQUIRED`

## Autoridad vigente

- Auditoría forense: `app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
- Plan durable: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`
- I2 PASS: `app/docs/SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
- I3 último lock: `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md`
- Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`

No volver a diagnóstico general, no crear otra candidata y no reconstruir Auth.

## Repo / rama / PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama/candidata canónica única: `docs-tya-v6-v71-audit`
- PR #7: draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`

## Cierres previos — NO REPROCESAR

- I1 — PASS 15/15.
- I2 — PASS 20/20.
- Firebase Auth owner, namespaces, exact identity, Staff membership, HR live/protected overlay, cumulative read model, `CX.data` command boundary, provider ACK, Mis Visitas arrays/facets/ACK y firewall fail-closed se preservan.

## I3 — ejecución focalizada real

Autorización de Paula ejecutada una sola vez en run `31833696707`, job `94875097700`.

### PASS alcanzados

1. Gate de autorización exacta.
2. Source preflight y patch same-candidate.
3. Service account DEV privada.
4. Selección del único Shopper histórico exacto sin fuzzy matching.
5. Credential recovery/reset exacto PASS.
6. Verificación post-reset de preservación de UID, claims, shopperId, profile e historia; otras identidades modificadas `0`.
7. Reconciliación membership/crosswalk exacta PASS.
8. Provider local y source proxy local PASS.

### STOP_RETRY nuevo

El paso `Execute Admin create update and new Shopper real Auth E2E` falló antes de entrar a Administración:

- `#lgSubmit` estaba visible, habilitado y estable;
- `#cxBackendPreviewStatus` interceptó eventos de puntero;
- Playwright agotó 30 s sin forzar el click.

Código de estado: `I3_ADMIN_LOGIN_CLICK_BLOCKED_BY_CX_BACKEND_PREVIEW_STATUS_POINTER_INTERCEPTION`.

## Causa raíz localizada y corrección source-only

`app/core/backend-preview-status.js` creaba un panel diagnóstico DEV `position:fixed`, `z-index:99999` sin `pointer-events:none`. Esto puede bloquear interacción humana real en Preview DEV; no es solo un problema del test.

Corrección ya commiteada sobre la misma candidata:

- overlay `pointer-events:none`;
- `aria-hidden=true`;
- `user-select:none`;
- E2E I3 valida explícitamente que el overlay no sea interactivo antes de pulsar Ingresar.

No se usó `force:true` porque eso ocultaría el defecto real.

## Credencial histórica: estado seguro después del fallo

El password aleatorio generado por el único recovery autorizado estuvo únicamente en `.tmp` privado. Cleanup lo eliminó y nunca se guardó en repo, logs o evidencia pública. El E2E histórico quedó SKIPPED porque estaba programado después del paso Admin.

Por ello:

- reset histórico exacto: PASS;
- identidad histórica: preservada;
- login histórico posterior: **NO certificado**;
- password recuperado: **no disponible** para otro run;
- no se puede hacer otro reset sin autorización nueva de Paula.

El siguiente harness debe corregir el orden: recovery autorizado → login histórico real → evidencia sanitizada preservable → Admin/new Shopper. Así, si algo posterior falla, no se pierde nuevamente la evidencia del login histórico.

## Writes y seguridad del run

- Auth password update/reset: `1` sobre el único principal autorizado;
- otras identidades modificadas: `0`;
- reconciliación membership/crosswalk: PASS; el conteo exacto final no se persistió porque el run falló después, posible 0–2 dentro del presupuesto;
- Shopper nuevo creado: `NO`;
- HR/Rules/Storage/Make/Gemini/pagos writes: `0`;
- deploy: `0`;
- merge: `false`;
- producción: `false`;
- retry automático: `NO`.

## Porcentaje

- I1: 15 PASS
- I2: 20 PASS
- I3: 0/25 hasta cierre completo
- I4: pendiente 25
- I5: pendiente 15

**GO-LIVE: 35% completado / 65% pendiente.**

## Siguiente bloque exacto

`I3_SOURCE_ONLY_HARNESS_DURABILITY_AFTER_RECOVERY_FAILURE`.

Objetivo: preparar la continuación para que el login histórico se certifique inmediatamente después de un recovery autorizado y su evidencia sanitizada sobreviva a un fallo posterior; luego solicitar un único gate nuevo para reanudar I3 desde este checkpoint, sin I1/I2, sin reauditoría general y sin nuevo candidato.
