# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 11:51 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-ROOT-CAUSE-RECOVERY-01`  
**Estado:** `SOURCE_TRUTH_ROOT_CAUSE_FIX_DOCUMENTED__I3_11C_IDENTITY_LINK_HOLD__GO_LIVE_35__NO_PROVIDER_ACTION_THIS_BLOCK`

## Función de este archivo

Este es el resumen vivo de cambios backend/operativos. El historial detallado permanece en Git, evidencias y addenda fechados. Para continuidad actual siempre prevalece `app/docs/CXORBIA-EXECUTION-STATE.json` + índice + source lock estable.

## Bloque 2026-08-18 — auditoría forense y corrección duradera de source truth

### Hallazgo metodológico raíz

La continuidad estaba documentada, pero no estaba técnicamente cerrada como invariante atómica. Un provider/runtime gate podía dejar evidencia y HEAD nuevos sin obligar a sincronizar índice, source lock, checkpoint, CAMBIOS/RESUMEN/PENDIENTES y PR. Por eso sesiones posteriores podían leer correctamente las fuentes declaradas y aun así recibir un estado anterior.

Esta clase de fallo se corrige en repo con:
- `app/docs/CXORBIA-EXECUTION-STATE.json` machine-readable;
- `app/docs/SOURCE-LOCK-CXORBIA-TYA.md` estable;
- índice/checkpoint/plan sincronizados;
- modelo canonical-vs-history;
- `Atomic Gate Close`;
- estados fail-closed `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION` y `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`;
- circuit breaker de dos repeticiones sin reducción causal;
- `tools/verify-cxorbia-source-truth-sync.mjs`.

### Estado técnico corregido en documentación

Último HEAD técnico/evidencia previo al sync: `528d5f0ba51e9712fee79ca0025b3dbcdf74e163`.

Se deja explícito que:
- Firestore Rules I3.11C **ya fueron desplegadas, verificadas y consumidas** en run `32163552089`;
- Staff/Admin runtime llega estable; no crear otro Admin;
- I3.9/I3.10 quedan frozen PASS/no rerun;
- el blocker vivo es `I3_11C_EXPECTED_PROVIDER_LINK_NOT_IN_APPLICABLE_RUNTIME_SET`;
- target live `shp-57d2e3769946`;
- canonical esperado `TYA_GT_0C0BA8856E`;
- prior link `irl_3ed1b9a65d36c5873c1306bae1621e9d`;
- provider global applicable links `1`, target links `0`;
- agosto `0` canonical / `2` residual live.

Evidencia activa: `app/docs/evidence/I3-11C-STAFF-READONLY-CLOSE-LATEST.json`.

### Próxima acción exacta

`NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES`.

Solo lectura focal bajo nueva autorización para distinguir `deleted | deactivated | re_scoped | mutated | intact_but_nonapplicable`. Cero writes/deploys/Historical Shopper/merge/production.

## Plan completo preservado

- I3 integral PASS → 35% a 60%.
- I4 → capacidades operativas visibles: lifecycle Shopper, documentos/certificación, disponibilidad/postulación/asignación, agenda, ejecución, cuestionario/revisión, HR bidireccional, liquidaciones/pagos, multi-proyecto/config, roles/evidencias/integraciones y Academia sincronizada.
- I5 → freeze/build lock/preprod/rollback/same-build E2E/gate producción/cutover/smoke/baseline.
- Post-producción → mismo source-truth/atomic-close/verifier; no se abandona documentación al salir a producción.

## Arquitectura reusable/no-code documentada

TyA queda como primer tenant y Cinépolis como primer proyecto/configuración de prueba operacional, nunca como lógica global.

Se formaliza el destino de configuración reusable para:
- país/moneda/timezone/locale;
- HR/roadmap source + mapping;
- cuestionario/provider/link;
- documentos/reglas/certificación;
- postulación/asignación;
- agenda/reprogram/cancel;
- ejecución/evidencias/revisión;
- pagos/liquidación;
- roles/notificaciones/integraciones;
- Academia/manuales/rutas.

Fuentes objetivo: Sheets, Excel, CSV, API, CXOrbia nativo, import manual y proveedor/link externo. Alta objetivo de proyecto: `configurar → mapear → dry-run → validar → activar`.

## Efectos de este bloque

- GitHub documentación/tooling: sí.
- `/app/modules`: 0.
- `/app/core`: 0.
- `CX.data` interface: 0.
- Auth writes: 0.
- user/password/claims writes: 0.
- Firestore data writes: 0.
- Rules deploy: 0.
- Hosting/Cloud Run deploy: 0.
- HR/Storage/Make/Gemini/payment writes: 0.
- Historical Shopper access: 0.
- merge: false.
- production: false.

## Clasificación

- **Reusable CXOrbia:** source-truth state, atomic close, verifier, loop breaker, multitenant/no-code config contracts.
- **Exclusivo tenant TyA:** IDs/evidencia exacta usados para cerrar I3.
- **Exclusivo proyecto Cinépolis:** únicamente datos/visit reconciliation del primer proyecto; no hardcode nuevo.
- **Claude/prototipo:** se documentan capacidades no-code y handoff obligatorio por archivo/módulo; ningún parche frontend desde backend.
- **Academia:** cada capacidad futura debe sincronizar manuales/cursos/rutas/notificaciones cuando cambie operación.
- **Sin impacto Claude inmediato:** reconciliación documental/source-truth y próxima adjudicación provider focal.

## Avance

Formal: **35% completado / 65% pendiente**. Este bloque corrige continuidad y no suma porcentaje funcional artificial.
