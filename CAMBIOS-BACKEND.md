# CAMBIOS-BACKEND.md

## 2026-07-09 - Checkpoint real-data preview alineado con no-reproceso

- Se actualizo `app/docs/CHECKPOINT-OPERATIVO-REALDATA-PREVIEW-TYA-20260709.md`.
- Objetivo: alinear el checkpoint operativo con la decision no-reversion/no-reproceso para que no vuelva a interpretarse Level 0/1 como trabajo pendiente por repetir.
- Cambio documental: se agrego seccion no-reproceso/no-reversion, se ajustaron bloqueos actuales y se aclaro que ejecucion local solo aplica para validacion puntual de fuentes que existen unicamente en la computadora de Paula.
- Decision: Level 0 queda superado para readiness de proyecto/periodos. Level 1 ya fue trabajado previamente y solo debe validarse puntualmente contra fuente original segura, sin reiniciar metodologia.
- Guardrail: Level 2 solo habilita siguiente gate si proviene de fuente original real/sanitizada, no de fixture ni output derivado de `.tmp`.
- Impacto Phase A: mantiene avance hacia produccion real controlada sin repetir procesos y sin desbloquear runtime/produccion.
- Impacto backend reusable: consolida patron no-reversion aplicado a checkpoints operativos.
- Impacto Claude/prototipo: refuerza copy honesto y evita presentar demo/fixture/preview tecnico como TyA real.
- Impacto Academia: agregar criterio de no-reversion y diferencia entre fuente original, fixture y output derivado.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commit: `146396495d02e469947d6c977c0b8078d423451d`.

## 2026-07-09 - Checkpoint no reversion Level 0 / Level 1 Phase A TyA

- Se agrego `app/docs/CHECKPOINT-NO-REVERSION-LEVEL0-LEVEL1-PHASE-A-TYA-20260709.md`.
- Objetivo: registrar que no se deben revertir ni repetir procesos ya superados de Level 0 / Level 1, y que el plan debe continuar encaminado a Phase A real controlada sin reiniciar metodologia.
- Decision: Level 0 manifesto/source-safe queda reconocido como superado para readiness de proyecto/periodos. Level 1 ya habia sido trabajado previamente dentro del pipeline y no debe repetirse desde cero salvo validacion puntual de no regresion.
- Aclaracion: las correcciones recientes no fueron una reversion funcional de Level 0/1; fueron hardening de gates para impedir falsos positivos con fixtures sinteticos u outputs derivados de `.tmp`.
- Guardrail: no usar `tools/migration/synthetic-fixtures/phase-a/*` ni `.tmp` generado por preflights/recoveries anteriores como evidencia real-data original.
- Siguiente linea: continuar desde HR source-safe/full-flow y outputs originales seguros, sin volver a pedir HR/reglas/shoppers/certificaciones/liquidaciones ya documentadas salvo que falte una fuente local concreta y segura.
- Impacto Phase A: continuidad de produccion real controlada, sin repetir Level 0/1 ni avanzar a runtime DEV con evidencia no original.
- Impacto backend reusable: patron no-reversion de gates y separacion formal entre fixture, output derivado y fuente real sanitizada.
- Impacto Claude/prototipo: mantener copy honesto; no presentar fixtures, demo ni preview tecnico como TyA real.
- Impacto Academia: explicar diferencia entre Level 0, Level 1, Level 2, fixtures, outputs derivados y fuente real sanitizada.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commit: `47121f64c64798f4a8c41c768c0e9cfe478f926d`.

## 2026-07-09 - Fix recovery Level 1 excluye fixtures sinteticos por defecto

- Se modifico `tools/contracts/tya-local-level1-recovery-preflight.mjs`.
- Motivo: el recovery local encontro archivos bajo `tools/migration/synthetic-fixtures/phase-a/` y los valido como candidatos Level 1/Level 2. Eso sirve para pruebas de contrato, pero no puede contarse como real-data preview de TyA.
- Cambio aplicado: el recovery ahora excluye fixtures sinteticos por defecto y solo los considera si se ejecuta explicitamente con `--allow-synthetic`, reservado para contract testing, no para evidencia real-data.
- Impacto Phase A: evita falso avance a DEV runtime preview usando datos sinteticos. El estado correcto queda: Level 0 real/source-safe GO; Level 1/Level 2 reales siguen bloqueados hasta recuperar/generar output HR source-safe local no sintetico.
- Impacto backend reusable: diferencia formal entre `realdata_only_default` y `allow_synthetic_contract_test`.
- Impacto Claude/prototipo: el prototipo no debe mostrar datos sinteticos como TyA real; copy debe distinguir fixture/preview/demo vs fuente real/sanitizada.
- Impacto Academia: agregar explicacion de fixture sintetico vs output sanitizado real, y por que un gate tecnico verde no autoriza produccion si la fuente es sintetica.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commit: `f25d6d5edb6052e9d6e13d74aa4198fba07fdbab`.

## 2026-07-09 - Recovery local Level 1 real-data preview ampliado

- Se agrego `tools/contracts/tya-local-level1-recovery-preflight.mjs`.
- Objetivo: eliminar reprocesos manuales buscando outputs sanitizados ya generados fuera del worktree actual, especialmente en carpetas locales de documentos, descargas y reportes CXOrbia/TyA.
- Funcion: escanea rutas locales probables, ignora `.git`, `node_modules` y carpetas tecnicas, inspecciona JSON source-safe, detecta candidatos Level 1 con filas de visita sanitizadas, y si encuentra candidato ejecuta automaticamente el preflight existente contra ese input.
- Estado seguro: sin llamadas HR, sin Firestore writes, sin imports, sin deploy, sin runtime switch, sin HR writes, sin base vieja y sin subir outputs locales al repo.
- Impacto Phase A: siguiente paso operativo despues de Level 0 GO; permite recuperar Level 1/Level 2 si el output sanitizado existe localmente sin pedir HR otra vez.
- Impacto backend reusable: patron de recovery local source-safe para tenants con outputs sanitizados previos, manteniendo gates y revision humana.
- Impacto Claude/prototipo: ninguno visual directo; mantener estados honestos y no prometer datos reales si solo existe Level 0.
- Impacto Academia: documentar diferencia entre Level 0 manifesto, Level 1 visitas sanitizadas, Level 2 operacional, y por que no se deben usar datos crudos ni resolver conflictos por coincidencia visual.
- Nota: se intento agregar wrapper PowerShell, pero la llamada de escritura fue bloqueada por controles de herramienta; no se afirmo como creado. Se continua con comando `node` directo desde copia temporal actualizada.
- Commit: `07dfbcaefd3e3fd39947521f7f6507cbfac5105c`.

## 2026-07-09 - Fix Level 0 preflight real-data preview sin marcador prohibido

- Se modifico `tools/contracts/tya-minimal-sanitized-input-from-manifest.mjs`.
- Motivo: el preflight local de Paula genero Level 0, pero marco `NO_GO_LOCAL_REALDATA_PREFLIGHT` porque el payload/documentacion interna incluia texto seguro que contenia un marcador prohibido de datos sensibles. No era dato real ni PII cruda; era una palabra dentro del mensaje de issue seguro.
- Cambio aplicado: se reemplazo el mensaje seguro del issue `sensitive_shopper_data_policy` para evitar el marcador prohibido literal y mantener el bloqueo conceptual de datos restringidos de shopper/pago.
- Impacto Phase A: debe permitir que Level 0 valide correctamente proyecto/periodos/readiness sin desbloquear produccion ni runtime. Level 1/Level 2 siguen dependiendo de recuperar output local sanitizado.
- Impacto backend reusable: refuerza la regla de que los validadores no deben fallar por copy interno seguro que contenga marcadores prohibidos, sin relajar la politica de datos sensibles.
- Impacto Claude/prototipo: ninguno visual directo; mantener copy honesto sobre preview, datos restringidos, no import, no pago real y no runtime.
- Impacto Academia: explicar que los gates pueden bloquear por marcadores sensibles incluso cuando no hay dato real; la solucion correcta es conservar la politica y ajustar mensajes seguros, no relajar protecciones.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
- Commit: `72e00496e5e6197528259970a3fb0b35daec3501`.

## 2026-07-08 - Conflict review/import readiness expanded fixture preview-only

- Se agrego `tools/contracts/cxorbia-conflict-review-import-readiness-expanded-fixture.mjs`.
- Se agrego `app/docs/CONFLICT-REVIEW-IMPORT-READINESS-EXPANDED-FIXTURE-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-CONFLICT-REVIEW-IMPORT-READINESS-EXPANDED-FIXTURE-CXORBIA-20260708.md`.
- Se agrego `app/docs/NEXT-CANDIDATE-AUDIT-ACADEMIA-ADMIN-ACTIONS-20260708.md` para auditar la proxima candidata Claude con foco en acciones administrativas de Academia.
- Objetivo: preparar un input sintetico/sanitizado ampliado para validar conflict review/import readiness con conflictos de asignacion, identidad shopper y pago, sin fuentes reales ni datos sensibles.
- Decision tecnica: fixture/runner preview-only que exporta `expandedConflictReviewImportReadinessManifest()` y `runExpandedConflictReviewImportReadinessFixture()`; imprime JSON por consola y no escribe outputs por defecto.
- Impacto Claude/comercializable: UI futura debe mostrar severidad, estado de cola, sourceRefs opacas, stable keys no sensibles, razon de revision y bloqueo de import si hay blocker; no debe deduplicar visualmente ni resolver automaticamente.
- Impacto Academia: explicar cola de conflictos, blocker vs warning, sourceRefs opacas, stable keys, revision humana, pago en revision vs pago real y administracion completa de Academia.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.

## 2026-07-08 - Readiness dashboard bridge runner preview-only

- Se agrego `tools/contracts/cxorbia-readiness-dashboard-bridge-runner.mjs`.
- Se agrego `app/docs/READINESS-DASHBOARD-BRIDGE-RUNNER-CXORBIA-20260708.md`.
- Se agrego `app/docs/CAMBIOS-READINESS-DASHBOARD-BRIDGE-RUNNER-CXORBIA-20260708.md`.
- Objetivo: preparar un puente source-safe entre el synthetic input pack runner y el manifest de readiness dashboard, sin runtime real ni outputs por defecto.
- Decision tecnica: el bridge usa `runSyntheticInputPack()` por defecto o lee un reporte JSON con `--input`, mapea cada resultado a un item de readiness y valida el manifest con `validateReadinessDashboardSourceSafe()`.
- Outputs: imprime JSON por consola; solo escribe reportes locales si se usa `--out`, sin subir reportes generados al repo.
- Impacto Claude/comercializable: dashboard futuro puede consumir el patron para mostrar area, estado honesto, sourceRef opaca, gate apagado, revision humana y motivo; nunca production ready, import real, sync real, envio real, pago real, provider activo, Firestore conectado, HR sincronizada o deploy realizado.
- Impacto Academia: explicar como un reporte de validadores se convierte en dashboard, source-safe, fixture sintetico, input sanitizado, gates apagados, warnings/fails/blockers y revision humana.
- Hallazgo Claude/prototipo: captura de Academia muestra que no existe accion visible de borrar/archivar/duplicar/versionar cursos; queda documentado como pendiente UI, no backend.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.

## 2026-07-08 - Readiness dashboard source-safe contract preview-only

- Se agrego `tools/contracts/cxorbia-readiness-dashboard-source-safe-contract.mjs`.
- Se agrego `app/docs/READINESS-DASHBOARD-SOURCE-SAFE-CONTRACT-CXORBIA-20260708.md`.
- Objetivo: preparar un contrato reusable para representar resultados de contratos/runners/readiness como estados honestos de dashboard sin activar runtime real.
- Decision tecnica: contrato preview-only con `sampleManifest()` y `validateReadinessDashboardSourceSafe()`; valida `mode=preview_only`, source-safe, input sintetico/sanitizado, sourceRefs opacas, gates reales apagados y ausencia de claims prohibidos.
- Bloquea: production ready, import real, sync real, envio real, pago real, provider activo, deploy realizado, Firestore conectado, HR sincronizada, Make/Gemini/Storage activo y campos sensibles/raw.
- Impacto Claude/comercializable: UI futura de readiness debe mostrar area, estado preview, sourceRef opaca, gate apagado, revision humana y motivo; no debe prometer produccion ni integraciones reales.
- Impacto Academia: explicar readiness dashboard, preview vs real, fixture sintetico, input sanitizado, source-safe report, gates apagados, errores, warnings, blockers y revision humana.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp, sin pagos reales, sin import real y sin datos sensibles.
