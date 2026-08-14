# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-14 11:22 -06:00  
**Estado:** `ITERATION_2_CANONICAL_PERSISTENCE_PASS__SOURCE_READY_FOR_DEV_WRITE_GATES__GO_LIVE_35__NO_PRODUCTION`

## Bloque ejecutado

Se ejecutó y cerró `ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION` sobre la misma candidata canónica `docs-tya-v6-v71-audit` / PR #7. No se creó candidata, rama, PR ni workflow nuevo.

Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE`.

Cierre: `SOURCE_READY_FOR_DEV_WRITE_GATES`.

## Archivos creados/tocados en Iteración 2

- `app/adapters/cxorbia-cxdata-command-boundary-v1.js` — creado; commit `4d1e88ddab6fa6eb23cb43cdc5b38a81c49842b3`.
- `app/adapters/cxorbia-command-adapter-v1.js` — reforzado scope/autorización/ACK; commit `56a967ec4fa43edbb964ee92f45ad868ee4f39ec`.
- `app/adapters/cxorbia-shopper-admin-command-contract-v1.js` — datos protegidos + cifrado/backend-only; commit `2644f40dc401d834521af43737ee0c4be1e29a97`.
- `app/core/shoppers-store.js` — localStorage solo demo/lab; canonical provider-only; commit `f403b4b4cbaf19546e22d882b69ceaccceca9070`.
- `app/adapters/cxorbia-canonical-write-firewall-v1.js` — creado como fail-closed para direct writes legacy; commit `c975ce8783c191ae09e8ba49d6145a9c88a3d65b`.
- `app/modules/misvisitas.js` — P0 de una sola visita/estados literales corregido; listas completas + facets + ACK; commit `9d8f44b0fea7f2513018339e54a0bef4ae152ea0`.
- `app/index-backend-dev.html` — carga real de command/shopper/HR contracts + final mutation owner + firewall; commit `e531f679c627ce9c28e5746c0b7480c569334eda`.
- `tools/qa/verify-root-cause-correction-iteration1.mjs` — conserva I1 y reconoce sucesor I2 de Mis Visitas; commit `aded9dd0adfbd32a52f482564a92817db248d079`.
- `tools/qa/verify-root-cause-correction-iteration2.mjs` — creado; commit `32379e07008b0220f86dcb08110e33e400d350c6`.
- `.github/workflows/cxorbia-phase-a-live-checkpoint.yml` — workflow existente extendido con gate I2; commit `3f4b1ae39bde4a57973f9cd8a8987dd5bc527c8e`.
- `tools/qa/verify-phase-a-live-execution-checkpoint.mjs` — reconoce I2/35% como estado forense vigente; commit `3f0b9c7a81e76012bfcadf54d5b8f68f87680d2d`.
- `app/docs/SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md` — source lock I2 creado; commit `2a2b0878d25a18a2335871d02100a45959809e23`.
- documentos vivos de checkpoint/tracker/índice/Claude/pendientes/CAMBIOS actualizados después del gate.

## Qué cambió de fondo

### Persistencia canónica

En runtime canónico el contrato queda:

`CX.data -> canonical command boundary -> RBAC/scope -> provider transport gated -> provider ACK -> refresh`.

Con write gate cerrado: `blocked`, cero mutación local, cero localStorage como verdad y cero success UI.

Los nombres públicos de `CX.data` se conservan. El patrón local-first de `backend-firebase.wrapDataMethods()` ya no puede apropiarse del flujo canónico porque el boundary final marca `__firebaseWrapped` y se reinstala después de eventos del guard read-only.

### Shopper Admin

La alta/edición no puede considerarse persistente por `cx_shoppers` ni `cx_shopper_patches`. Ese mecanismo queda únicamente para demo/lab. El contrato productivo exige Auth + claims + membership + profile + exact crosswalk + provider ACK. DPI/banco/cuenta se tratan como datos protegidos backend-only/cifrados.

### Mis Visitas

Se cerró el P0 forense sin rediseño:

- shopperId exacto fail-closed;
- todas las visitas activas se renderizan como arrays completos;
- facets canónicas reemplazan la clasificación literal principal;
- histórico usa contrato canónico de visita/pago;
- agenda/realizada/reprogramación/cancelación son ACK-aware;
- check-in no muta visita local; Storage sigue explícitamente pendiente.

### Controles legacy restantes

Los flujos complejos que aún mutaban closure/localStorage directamente no se declaran funcionales. El firewall canónico los bloquea antes de la mutación/falso éxito. Los casos simples de Postulaciones se enrutan al command boundary. La activación real de los demás se hace en I3/I4 con provider ACK, no con otra arquitectura.

## Evidencia

Workflow existente `CXOrbia Phase A Live Execution Checkpoint`:

- run source I2 `31823098359`: SUCCESS;
- run final con checkpoint/documentación I2 `31823620461`: SUCCESS.

El run final confirmó:

- `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`;
- `PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE`;
- `PASS_PHASE_A_CURRENT_OPERATIONAL_CHECKPOINT_FORENSIC_PLAN`;
- `goLiveCorrectionCompletedPct=35`, `goLiveCorrectionRemainingPct=65`, `iteration=2/5`;
- same candidate / no general rediagnosis / no Auth rebuild / no new branch or PR;
- Auth/Firestore/HR/Rules/Storage writes=false; deploy/merge/production=false.

## Porcentaje productivo

**GO-LIVE: 35% completado / 65% pendiente.**

I1=15 PASS · I2=20 PASS · I3=25 pendiente · I4=25 pendiente · I5=15 pendiente.

## Reusable CXOrbia

Command boundary, scope, idempotencia, expectedVersion, provider ACK, protected-data policy y source adapters son multi-tenant/multi-proyecto. Los adapters nuevos no hardcodean Cinépolis como arquitectura global.

## Exclusivo cliente

TyA/Cinépolis conserva su configuración real en el entrypoint y su HR live. El endpoint/identificador Cinépolis permanece como configuración de este proyecto, no se trasladó a los contracts reusables.

## Claude/prototipo

`app/modules/misvisitas.js` ya fue corregido en la misma candidata. **No volver a aplicar el P0 `find()`; está cerrado.**

Pendiente de conversión ACK-aware funcional en I3/I4, sin rediseño:

- alta/edición Shopper UI y registro para consumir provider real;
- edición/reasignación compleja de Postulaciones;
- submit de cuestionario/evidencias;
- mutaciones de Reservas;
- sync HR real.

Mientras no estén activados, el runtime canónico debe permanecer fail-closed; no reactivar localStorage/local mutation para “hacerlos funcionar”.

## Academia

Actualizar materiales/rutas cuando I3/I4 active provider real: creación Shopper, errores de persistencia, Mis Visitas multi-registro, ACK real, cuestionario/evidencias y sync HR. No documentar como activo lo que hoy está fail-closed.

## Sin impacto Claude

Gates QA, workflow y documentos/source locks no requieren reconstrucción frontend.

## Seguridad

Auth/Firestore/HR/Rules/Storage/Make/Gemini/pagos writes=0; cambios/reset de credenciales=0; deploy=0; merge=false; producción=false.

## Siguiente acción exacta

`ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE` — requiere gate explícito DEV write.
