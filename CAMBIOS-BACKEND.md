# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-14 14:00 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RESET2_CONSUMED__HISTORICAL_AUTH_REACHED__LEGAL_GATE_AWARE_HARNESS_PASS__GO_LIVE_35__NO_PRODUCTION`

## Provider run ejecutado — autorización durable `...-03`

Run `31835742956`, job `94881540163`, sobre la misma candidata `docs-tya-v6-v71-audit` / PR #7.

PASS antes del STOP_RETRY:

- checkout exacto del SHA autorizado;
- mismo único Shopper histórico exacto;
- one authorized credential reset;
- UID/claims/shopperId/profile/history preservation;
- other identities modified `0`;
- exact membership/crosswalk reconciliation;
- source proxy startup;
- Firebase Shopper context authenticated exact;
- `CX_PROTECTED_AUTH_HR_AUTHORITY.applied===true` alcanzado.

STOP_RETRY:

`tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` agotó el timeout esperando `#nav-aprendizaje`. El historical checkpoint no se materializó y todos los pasos Admin/new Shopper quedaron SKIPPED. No hubo retry automático.

## Causa de contrato del harness

El E2E histórico exigía Academia y Certificación antes de cerrar el subgate de Auth exacto + HR + historia. El producto no garantiza que el router esté montado en ese punto: `CX.app.enter()` difiere `CX.router.mount()` cuando `CX.confidencialidad.pending(CX.session.role)` está activo.

El run no capturó si el NDA estaba efectivamente pendiente, por lo que no se afirma ese estado como hecho runtime. Sí queda probado el defecto source del harness: no contemplaba un gate legal que el producto soporta antes del workspace.

## Corrección source-only posterior

### `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`

- Auth/tenant/project/shopperId, exact identity, reviewQueue, HR authority, sourceRef e historia ahora se validan antes de rutas;
- se consulta `CX.confidencialidad.pending('shopper')` usando el mismo contrato de producto;
- si el gate legal está pendiente, se exige diálogo legal visible y mismo principal, se declara `workspaceState=legal-gate-pending` y se difieren Academia/Certificación;
- si no está pendiente, Academia/Certificación siguen siendo obligatorias;
- `acceptanceAutomated=false`; ninguna aceptación/firma/guardado de NDA se automatiza;
- sin `force:true` ni write APIs.

Gate source: `node --check` PASS + `PASS_I3_HISTORICAL_LEGAL_GATE_AWARE_SOURCE`.

### Source lock nuevo

`app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md`.

## Writes y seguridad

### Run `31835742956`

- historical password update/reset: `1` exacto;
- other identities: `0`;
- membership/crosswalk reconciliation: PASS; conteo final de Firestore no se afirma porque el checkpoint final no se persistió;
- Shopper nuevo: `NO`;
- Admin create/update: `NO EJECUTADO`;
- HR/Rules/Storage/Make/Gemini/pagos: `0`;
- deploy `0`; merge=false; production=false; retry automático `NO`.

### Corrección posterior

Solo source/docs. **Cero nuevos Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes, deploy, merge o producción.**

## Reusable CXOrbia

El harness ahora separa durablemente identidad/historia de un gate legal configurable, sin saltarse el consentimiento. Exact identity, tenant/project scope, protected authority y no-fuzzy se preservan.

## Exclusivo TyA

Cualquier siguiente reset permanece limitado al mismo único Shopper histórico exacto TyA/Cinépolis.

## Claude/prototipo

No reconstruir Auth/login, NDA, Academia ni Certificación. La corrección fue exclusivamente del harness E2E. El patch ACK-aware de `modules/shoppers.js` continúa preparado por el patcher y no se materializó porque Admin/new Shopper no arrancó.

## Academia

No declarar Academia/Certificación PASS cuando exista gate legal pendiente. En ese caso las rutas se validan después de aceptación humana legítima; el harness no la automatiza.

## Porcentaje

**35% completado / 65% pendiente.** Al cerrar I3 completo sube a 60% / 40%.

## Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_LEGAL_GATE_AWARE_HISTORICAL_CHECKPOINT_AND_ADMIN_NEW_SHOPPER_RESUME`.
