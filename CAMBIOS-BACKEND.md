# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-15 17:03 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_PROVIDER_WIRING_SOURCE_ONLY_PASS__GO_LIVE_35__NO_PRODUCTION`

## Preservado

I1 PASS 15/15 e I2 PASS 20/20. Histórico I3 congelado desde run `31906391682`: exact identity, un único reset ya consumido, UID/claims/profile/membership/crosswalk/history, login real + HR authority + history E2E PASS. No repetir reset/reconcile ni acceder a credencial histórica; continuaciones `passwordResets=0`.

## Request08 — STOP seguro

Request commit `d21fb78aa012b1739fea03053a0a947fcd379ee4`; run `31909354336`; job `95071998299`; parking commit `8fa887900a5507b606b31dc0386a135060980837`.

Bloqueo exacto antes de Alta:
`I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`.

Se detuvo fail-closed, sin aceptar/firmar/guardar consentimiento, sin `shopper.create`, update, readback ni login de Shopper nuevo. Auth/Firestore writes nuevos `0/0`. Request08 consumido; no rerun.

## Cambios source-only de autoridad legal durable

### Contrato y adapter durable
Commit `c3f8fc362a4b2dddb0a19fa3327170f87b5f9eed`.

- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`
- `app/adapters/cxorbia-legal-acceptance-durable-contract-v1.js`
- `tools/qa/verify-i3-legal-acceptance-durable-source-only.mjs`
- existing checkpoint workflow extendido para verificar el contrato.

Define exact identity, human-only, provider authority, versioned receipt, server `acceptedAt`, fail-closed read model y cero localStorage authority.

### Provider runtime y bridge source-only
Commit `09092fec7e95d6ccc33aefb780bffdc0b81ff1a0`.

- creado `backend/runtime/cxorbia-legal-acceptance-provider-v1.mjs`;
- creado `app/adapters/cxorbia-legal-acceptance-provider-bridge-v1.js`;
- actualizado el contrato con presupuestos/gates provider;
- ampliado el verificador con fake provider store, idempotencia, actor spoof, acceptedAt spoof, versión/digest y gate-before-IO.

No se cargan credenciales al importar el módulo, no se importa `firebase-admin`, no se activó el bridge en el product entrypoint y no se tocaron `/app/modules` ni `/app/core`.

### Corrección focal de gate
El run `31913585259` falló únicamente en el `grep` contractual porque el reporte del verificador no incluía la llave explícita `firestoreWrites`, aunque el propio reporte ya mostraba provider IO real 0 y las pruebas source habían pasado. No fue una falla de provider/producto y no hubo ejecución provider.

Commit focal `0602d6ca0f64280222a4b1522b36f3be77c65c87`: añadió `authWrites=0` y `firestoreWrites=0` al reporte source-safe, sin cambiar la lógica provider.

Gate canónico push `31913700755`, job `95082399402`: `SUCCESS` completo. Gate PR `31913704247`, job `95082407608`: `SUCCESS` completo.

## Seguridad / efectos reales

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legal acceptance writes `0/0/0`; password resets `0`; historical credential access/reconciliation `0/0`; otras identidades `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false.

El texto NDA demo/local actual del prototipo no se aprobó ni materializó como contenido legal provider-authoritative.

## Documentación

Lock prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.

Índice, checkpoint, tracker, RESUMEN-PARA-CLAUDE, PENDIENTES-PROTOTIPO y Academia quedan reconciliados con este estado.

## Clasificación

- **Reusable CXOrbia:** receipt legal durable exact-identity/versioned/provider-authoritative; human-only; server timestamp; idempotencia; fail-closed; no localStorage authority.
- **Exclusivo TyA:** contenido legal TyA exacto todavía requiere revisión humana y eventual materialización provider antes de aceptación real.
- **Claude/prototipo:** no rediseñar frontend. El modal humano existente se preserva; cuando backend se active deberá leer/guardar contra autoridad provider. `#bnOk` sigue siendo solo informativo.
- **Academia:** manuales/cursos deben mostrar aceptación humana real y persistente; QA nunca acepta legalmente por el usuario.
- **Sin impacto Claude:** provider runtime, source verifier, gates y source lock.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`.

Precondición: revisar contenido legal TyA exacto, versión y digest, y autorizar materialización si falta. No iniciar request09/provider write antes de ese gate.
