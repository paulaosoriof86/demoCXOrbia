# ADDENDUM PREVALENTE — HUMAN VISUAL REJECTION + ROOT CAUSE FREEZE
## CXORBIA RECOVERY — GO-LIVE
## 2026-09-24

### 1. Estado prevalente
La aceptación visual humana de Paula RECHAZA la candidata DEV basada en app source `f5b96e853698f9cf96e0752fd641e7e21e9e5ed0`.
El technical lock `CXORBIA_PRE_I4_TECHNICAL_ACCEPTANCE_LOCK_2026-09-24.json` se conserva como evidencia histórica de lo que los gates probaron, pero deja de ser autoridad de promoción.
Estado operativo vigente: **HOLD en I3 / PRE-I4**. I4 sigue bloqueado. Producción `tya-plataforma.web.app` permanece DO_NOT_TOUCH.

### 2. Conclusión forense
El problema NO es que Paula haya abierto otro backend. Las capturas corresponden al mismo DEV certificado: `cxorbia-backend-dev.web.app`.
La causa es una combinación de **regresión de composición**, **residuo persistente de QA** y **gates terminales semánticamente insuficientes**.
Run333 navegó y renderizó rutas reales contra HR fresca y probó bytes, pero no probó suficiente verdad humana. Por ello su PASS fue un falso positivo para aceptación funcional/visual.

### 3. Evidencia decisiva
- Run333 registró para `shopper_gt_0c198c1055`: expectedName=`Julissa Flores`, observed name=`shopper_gt_0c198c1055`; el gate aun así pasó porque no comparaba ambos nombres.
- Commit `6bcbc1df70c29c2ad3ad57ecfa906917e6372ace` cambió explícitamente `unmatchedProfilesExcludedFromOperationalList:true` a `false` y añadió perfiles platform-only al listado Admin.
- El script de aceptación I3 crea reservas durables `I3 QA TEMP`; la captura humana muestra cinco residuos y Run333 no probó Admin → Reservas.
- El carryover de certificación activo se declara a sí mismo `APPROVED_NOT_COMPOSED`, con 78 registros útiles históricos y 22 matches técnicos determinísticos, pero `certifications: []`. La Matrix v6 lo convirtió erróneamente en MATCH.
- Run333 aceptó Recursos con count=0 y Storage no autorizado/configurado; eso prueba fail-closed, no cierre funcional.
- Run333 aceptó Finanzas con obligaciones HR correctas pero ingreso/margen/CxC sin fuente configurada; eso prueba no-invención, no equivalencia con el módulo de negocio aprobado.

### 4. Hallazgos congelados
**VRM-033 — MAPPING_FAILURE — Admin shopper identities regress to technical IDs despite live HR display names.**\nOwners: `app/adapters/tya-cumulative-read-model-v2.js`, `backend/runtime/cxorbia-shopper-command-provider-v1.mjs`, `app/core/data.js`, `tools/qa/cxorbia-pre-i4-focal-remote-browser.mjs`.\nExpected: Authorized Admin sees resolved operational display names and exact history/KPIs. Unresolved technical identities stay in review and never render as human shopper rows. No fuzzy matching.\n\n**VRM-034 — PERSISTENCE_FAILURE — Durable DEV QA reservation residue is visible in human lane.**\nOwners: `RECOVERY-I3-HUMAN-LIVE-ACCEPTANCE-20260918.mjs`, `app/adapters/tya-canonical-reservations-guard-v2.js`, `backend/runtime/cxorbia-operational-command-provider-v1.mjs`, `tools/qa/cxorbia-pre-i4-focal-remote-browser.mjs`.\nExpected: Zero QA/test reservations in the human candidate; fixture writes use deterministic isolated IDs and exact cleanup/readback, with Admin reservas asserted before PASS.\n\n**VRM-035 — RELEASE_COMPOSITION_FAILURE — Terminal browser proof was structurally green but semantically under-specified.**\nOwners: `tools/qa/cxorbia-pre-i4-focal-remote-browser.mjs`, `.github/workflows/cxorbia-recovery-i3-dev-certification.yml`, `RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json`.\nExpected: PASS requires semantic assertions for names, profile fields/history, benefit rows, reservations cleanliness, out-of-range, resource usability or explicit approved empty-state, certification carryover, and no technical-language leakage.\n\n**VRM-036 — RELEASE_COMPOSITION_FAILURE — Certification historical authority remains explicitly APPROVED_NOT_COMPOSED but matrix was forced to MATCH.**\nOwners: `app/data/tya-certification-carryover-source-safe.js`, `app/modules/cert.js`, `RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json`.\nExpected: Adjudicate approved historical certification records by exact identity into the durable/read model without granting unsupported eligibility; ambiguous records stay review-only.\n\n**VRM-037 — FUNCTIONAL_DEFECT — Shopper benefits/profile/history contract was not semantically proven by the final focal.**\nOwners: `app/adapters/tya-canonical-shopper-portal-v2.js`, `app/modules/misvisitas.js`, `app/modules/beneficios.js`, `app/core/liquidacion.js`, `tools/qa/cxorbia-pre-i4-focal-remote-browser.mjs`.\nExpected: Paula and representative GT/HN shoppers render exact identity, real historical visits/KPIs and benefit obligations from the same canonical identity; no technical ID fallback.\n\n**VRM-038 — FUNCTIONAL_DEFECT — Human Admin surfaces leak technical vocabulary and incomplete operational states.**\nOwners: `app/modules/dashboard.js`, `app/modules/visitas.js`, `app/modules/finanzas.js`, `tools/qa/cxorbia-pre-i4-focal-remote-browser.mjs`.\nExpected: Human labels only; technical state/source terminology is hidden from normal Admin/Shopper UI and retained only in optional traceability.\n\n**VRM-039 — RELEASE_COMPOSITION_FAILURE — Resources and finance were fail-closed safely but incorrectly promoted as complete production-ready modules.**\nOwners: `app/core/backend-resources.js`, `app/modules/documentos.js`, `app/core/finanzas-core.js`, `app/modules/finanzas.js`, `RECOVERY-I3-MODULE-TRUTH-MATRIX-20260918.json`.\nExpected: Preserve truthful fail-closed behavior, but do not call the module complete until the last approved resource/financial authority is composed or explicitly adjudicated as intentionally unavailable.

### 5. Regla anti-regresión adicional
A partir de este addendum:
1. Ningún gate puede convertir un estado fail-closed/incompleto en PASS funcional.
2. Un identificador técnico `shopper_*`, `shp-*`, UID, fingerprint o alias interno jamás sustituye el nombre humano en una superficie autorizada cuando existe nombre exacto en HR/perfil aprobado.
3. Perfiles sin crosswalk exacto permanecen en cola de revisión y NO se muestran como filas humanas normales.
4. Fixtures que escriban backend deben llevar namespace de prueba, cleanup exacto y readback de ausencia; cero residuos antes de visual humana.
5. MODULE_TRUTH no puede sobrescribir una clasificación source-declared `APPROVED_NOT_COMPOSED` a MATCH sin evidencia de composición material.
6. Gate terminal debe comparar semántica visible con un oráculo independiente: nombres, filas, estados, perfiles, histórico, beneficios, certificaciones, recursos, finanzas y reservas.
7. Producción sigue bloqueada hasta nueva aceptación humana sobre la candidata corregida.

### 6. Orden de corrección dentro del MISMO microbloque I3
No se abre nueva iteración. Se corrige por owners probados:
- Identity/read-model: retirar exposición platform-only no resuelta y dar precedencia al display name HR exacto; corregir persistencia de placeholders técnicos.
- QA persistence: localizar y eliminar exclusivamente residuos `I3 QA TEMP` y blindar cleanup.
- Shopper contract: revalidar Paula + GT/HN representativos con identidad, Mi Perfil, histórico, Mis Visitas, Beneficios y Reportes visibles.
- Postulaciones/Reservas: contrastar exclusivamente records durables reales contra HR, sin fixtures; eliminar `undefined` y estados ajenos al negocio.
- Resources/Certifications/Finance: recuperar última autoridad aprobada demostrada o mantener clasificación APPROVED_NOT_COMPOSED/HOLD; no inventar datos.
- Human UI: retirar lenguaje técnico.
- Repetir solo focal acumulativo + MODULE_TRUTH corregido + visual semantic gate.

### 7. Siguiente acción exacta
Crear la candidata incremental corregida desde `f5b96e85...`, sin rebuild histórico ni reimport, empezando por VRM-033/034/035 porque son causas raíz transversales. Luego ejecutar un único focal semántico exhaustivo antes de volver a pedir visualización humana.
