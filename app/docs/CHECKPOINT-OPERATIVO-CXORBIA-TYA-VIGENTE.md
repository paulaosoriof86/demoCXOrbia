# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-14 12:14 -06:00  
**Estado:** `FORENSIC_ROOT_CAUSE_LOCKED__ITERATION_2_CANONICAL_PERSISTENCE_PASS__I3_STOP_RETRY_HISTORICAL_SHOPPER_CREDENTIAL_H0_S0__GO_LIVE_35__PAULA_REVIEW_REQUIRED`

## Autoridad vigente

- Auditoría forense: `app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
- Plan durable: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`
- Source lock I2 PASS: `app/docs/SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
- Source lock I3 STOP_RETRY: `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-HISTORICAL-SHOPPER-CREDENTIAL-20260814.md`
- Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`

No volver a diagnóstico general, no crear otra candidata y no reconstruir Auth. El bloqueo I3 se corrige focalizadamente dentro de la misma Iteración 3.

## Repo / rama / PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama/candidata canónica única: `docs-tya-v6-v71-audit`
- PR #7: draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`

## NO REPROCESO Auth y cierres previos

Se preservan Firebase Auth owner, namespaces, exact identity, Admin/Exact Write V2, Staff membership, HR live/protected overlay, cumulative read model, portal Shopper y los source locks previos.

### `ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION` — PASS

Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`.

### `ITERATION_2_CANONICAL_PERSISTENCE_PASS` — PASS

Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE`.

Cierre: `SOURCE_READY_FOR_DEV_WRITE_GATES`.

Se preservan `CX.data` command boundary, cero local fallback productivo, provider ACK obligatorio, Shopper store provider-only en runtime canónico, Mis Visitas arrays/facets/ACK y firewall fail-closed.

## `ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE` — STOP_RETRY real en provider-read

Autorización de Paula consumida una sola vez hasta provider-read mediante run `31826443230`, job `94851603411`.

La ejecución pasó gate exacto de autorización, source preflight, patch same-candidate source-safe, instalación de tooling, carga privada de service account DEV y alcanzó la selección exacta de credenciales existentes.

Se detuvo allí con:

`HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`.

### Qué significa

- 109 referencias Shopper revisadas;
- 104 resolvieron a Auth exacto;
- existe **1 identidad Shopper exacta** con claims + historia protegida (`V1`);
- esa identidad tiene perfil (`D1`);
- 616 visitas exactas y 208 relaciones exactas de Shopper respaldan la historia;
- ninguna contraseña reconstruible desde las fuentes aprobadas coincide con el hash histórico (`H0`);
- no existe todavía sign-in histórico real certificable (`S0`).

No hubo matching por similitud.

## Causa raíz del blocker de credencial

La importación histórica de Auth usó `firebase-admin.auth().importUsers()` con `passwordHashHex` SHA256. Esto preservó la contraseña funcional como hash en Firebase, pero no conservó plaintext en repo/evidencia. El selector E2E solo puede reconstruir password desde `profile.pass/profile.password` o desde el patrón exacto `FirstName123*`; ninguna fuente coincide para el único Shopper histórico exacto.

No está perdido el universo Auth ni la identidad histórica. Falta una credencial humana recuperable para certificar el login real de ese principal exacto.

## Seguridad I3

El STOP_RETRY ocurrió antes de reconciliación o comandos de escritura:

- Auth writes: `0`
- Firestore writes: `0`
- Auth deletes: `0`
- password changes: `0`
- password resets: `0`
- identidades existentes modificadas: `0`
- Shopper nuevo creado: `NO`
- HR/Rules/Storage/Make/Gemini/pagos writes: `0`
- deploy: `0`
- merge: `false`
- production: `false`

No hubo segundo intento automático. El workflow provider quedó PARKED.

## Source I3 preparado — PRESERVAR / NO REHACER

- `app/adapters/cxorbia-command-http-transport-v1.js`
- `app/adapters/cxorbia-shopper-membership-wiring-v1.js`
- `backend/runtime/cxorbia-shopper-command-provider-v1.mjs`
- `tools/qa/cxorbia-i3-shopper-persistence-e2e.mjs`
- `tools/qa/cxorbia-i3-source-patcher.mjs`
- patch ACK-aware preparado para alta/edición Shopper y entrypoint.

## Plan cerrado — cinco iteraciones base

1. `ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION` — PASS.
2. `ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION` — PASS / `ITERATION_2_CANONICAL_PERSISTENCE_PASS`.
3. `ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE` — STOP_RETRY focalizado, no reiniciar.
4. `ITERACION_4_HR_BIDIRECTIONAL_PHASE_A_E2E_FINANCE` — pendiente.
5. `ITERACION_5_EXACT_BUILD_PREPROD_AND_GO_LIVE` — pendiente.

No sexta iteración por rutina.

## Porcentaje productivo

- I1: 15% — PASS
- I2: 20% — PASS
- I3: 25% — STOP_RETRY / 0 puntos todavía
- I4: 25% — pendiente
- I5: 15% — pendiente

**GO-LIVE: 35% completado / 65% pendiente.**

## Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_HISTORICAL_SHOPPER_CREDENTIAL_RECOVERY`

Para reanudar la misma I3 sin reiniciarla, el siguiente gate debe autorizar únicamente recuperación/reset de password para el único Shopper histórico exacto ya resuelto, manteniendo uid, claims, shopperId, profile, membership e historia y cero fuzzy matching; después se retoma I3 desde el punto bloqueado.

Hasta esa autorización: estado seguro, workflow provider PARKED, cero retry.
