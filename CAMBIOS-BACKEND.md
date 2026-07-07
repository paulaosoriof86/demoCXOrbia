# CAMBIOS-BACKEND.md

## 2026-07-06 - Auditoria frontend candidate V89 Claude

- Se agrego `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V89-CLAUDE-20260706.md`.
- Se agrego `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V89-CLAUDE-20260706.md`.
- Se agrego `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V89-20260706.md`.
- Se agrego `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V89-CLAUDE-20260706.md`.
- Objetivo: auditar V89 correctiva de Claude contra V88 y verificar afirmaciones sobre IDs duplicados, textos honestos P0, Academia y restricciones backend.
- Decision: V89 mejora V88, corrige IDs duplicados de Academia y algunos textos, pero NO queda como source lock final, NO production ready y NO backlog 100% cerrado porque persisten textos visibles/operativos que prometen WhatsApp/correo/HR/Make/sincronizacion/en vivo sin backend real activo.
- Estado seguro: solo auditoria documental; sin empalme frontend, sin runtime, sin deploy, sin produccion, sin import real, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini/WhatsApp/correo real y sin datos sensibles.

## 2026-07-04 - Paquete Claude V82 source lock actualizado

- Se agrego `app/docs/PAQUETE-CLAUDE-V82-SOURCE-LOCK-PHASE-A-ACTUALIZADO-20260704.md`.
- Objetivo: entregar a Claude un paquete completo y acumulado sobre V82 source lock, incorporando pendientes V82, cambios backend recientes de liquidaciones/Cinepolis source-safe preview, pendientes de prototipo, Academia y reglas de no tocar backend.
- Decision: no pedir un candidato nuevo libre. Si Claude tiene capacidad, pedir V83 ultra-controlada sobre V82 y luego auditarla antes de aceptarla.
- Estado seguro: solo documento; sin cambios frontend, sin runtime, sin deploy, sin produccion, sin escrituras reales y sin datos sensibles.

## 2026-07-04 - Liquidaciones/Cinepolis source-safe preview validator Phase A

- Se agrego `app/contracts/liquidation-cinepolis-source-safe-preview-phase-a.tya.contract.json`.
- Se agrego `tools/migration/tya-liquidation-cinepolis-source-safe-preview-validator.mjs`.
- Se agrego `app/docs/LIQUIDATIONS-CINEPOLIS-SOURCE-SAFE-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`.
- Se agrego `app/docs/ACADEMIA-IMPACT-LIQUIDACIONES-CINEPOLIS-SOURCE-SAFE-PREVIEW-TYA-20260704.md`.
- Se agrego `app/docs/CAMBIOS-BACKEND-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`.
- Se agrego `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`.
- Se agrego `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-LIQUIDACIONES-CINEPOLIS-PREVIEW-VALIDATOR-20260704.md`.
- Objetivo: cerrar el siguiente bloque del tracker con preview validator y source-safe mapping para liquidaciones/corte junio y Cinepolis Boleto/Combo sin leer archivos reales ni datos sensibles.
- Decision tecnica: el validador solo acepta entrada sintetica o sanitizada con `sourceSafe=true`, `containsRawSensitiveData=false` e `isSyntheticOrSanitized=true`; si faltan llaves estables, referencia de pago o aparecen campos sensibles, pasa a `manual_review_required`/conflicto.
- Impacto Claude/comercializable: Mis beneficios, Admin/Liquidaciones y Movimientos deben separar honorario, Boleto, Combo, total, lote/item y estados honestos sin prometer pagos reales ni exponer banco/DPI/NDA.
- Estado seguro: sin cambios en `/app/modules` o `/app/core`, sin runtime, sin deploy, sin produccion, sin lectura de fuentes reales, sin Firestore writes, sin HR writes, sin pagos reales, sin Make/Gemini/correo real y sin datos sensibles.

## 2026-07-04 - Auditoria frontend candidate V82 Claude

- Se agrego `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V82-CLAUDE-20260704.md`.
- Se actualizo `RESUMEN-PARA-CLAUDE.md` con el addendum V82.
- Se actualizo `PENDIENTES-PROTOTIPO.md` con pendientes V82.
- Objetivo: auditar el nuevo ZIP de Claude sin empalmarlo y sin cambiar baseline/source lock.
- Decision: V82 corrige la mayoria de pendientes V81, pero todavia no se recomienda source lock porque quedan textos `cuestionario enviado`, textos de HR sync real en `misvisitas.js` y `postulaciones.js`, y ajuste fino de `revision-admin.js` para `status`, `projectId` y `hrRowId`.
- Estado seguro: sin empalme V82, sin source lock V82, sin runtime, sin deploy, sin produccion, sin Auth real, sin escritura Firestore, sin HR writes, sin Make/Gemini/WhatsApp real y sin cambios frontend aplicados.

## 2026-07-04 - Auditoria frontend candidate V81 Claude

- Se agrego `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V81-CLAUDE-20260704.md`.
- Se actualizo `RESUMEN-PARA-CLAUDE.md` con el addendum V81.
- Se actualizo `PENDIENTES-PROTOTIPO.md` con pendientes V81.
- Objetivo: auditar el nuevo ZIP de Claude sin empalmarlo y sin cambiar baseline/source lock.
- Decision: V81 mejora V80, pero no debe empalmarse completo todavia porque faltan defaults Phase A en `proyecto-wizard.js`, quedan textos `cuestionario enviado`, `revision-admin.js` aun no cumple estructura contractual/auditTrail completa, y `misvisitas.js` aun promete sincronizacion HR.
- Estado seguro: sin empalme V81, sin source lock V81, sin runtime, sin deploy, sin produccion, sin Auth real, sin escritura Firestore, sin HR writes, sin Make/Gemini/WhatsApp real y sin cambios frontend aplicados.

## 2026-07-04 - Auditoria frontend candidate V80 Claude

- Se agrego `app/docs/AUDITORIA-FRONTEND-CANDIDATE-V80-CLAUDE-20260704.md`.
- Se actualizo `RESUMEN-PARA-CLAUDE.md` con el addendum V80.
- Se actualizo `PENDIENTES-PROTOTIPO.md` con pendientes y no regresiones V80.
- Objetivo: auditar el nuevo ZIP de Claude sin empalmarlo y sin cambiar baseline/source lock.
- Decision: V80 trae avances utiles, pero no debe empalmarse completo todavia por regresiones en `proyecto-wizard.js`, `cuestionario-shopper.js` y `misvisitas.js`, y porque `revision-admin.js` necesita mapear estados canonicos y no quedar aislado en localStorage.
- Estado seguro: sin empalme V80, sin source lock V80, sin runtime, sin deploy, sin produccion, sin Auth real, sin escritura Firestore, sin HR writes, sin Make/Gemini/WhatsApp real y sin cambios frontend aplicados.

## 2026-07-04 - Wizard Phase A complete contract TyA

- Se agrego `app/contracts/project-wizard-phase-a.tya.contract.json`.
- Se agrego `tools/migration/tya-project-wizard-phase-a-validator.mjs`.
- Se agrego `app/docs/WIZARD-PHASE-A-COMPLETE-CONTRACT-TYA-20260704.md`.
- Objetivo: avanzar el pendiente vivo de Wizard Phase A completo sin tocar frontend ni activar runtime.
- Decision tecnica: el wizard debe configurar identidad, pais/moneda, HR, cuestionario, revision, submitido, certificacion, documentos/evidencias, agenda, pagos/liquidaciones e integraciones como gates apagados/preparados.
- Impacto Claude/comercializable: Claude debe mapear esta configuracion al wizard visible sin hard-codear TyA/Cinepolis y sin mostrar integraciones como reales.
- Estado seguro: sin runtime, sin deploy, sin produccion, sin Auth real, sin escritura Firestore, sin HR writes, sin Make/Gemini/WhatsApp real y sin cambios frontend.

## 2026-07-04 - Submitido HR-driven configurable Phase A TyA

- Se agrego `app/contracts/submitido-hr-driven-phase-a.tya.contract.json`.
- Se agrego `tools/migration/tya-submitido-hr-driven-validator.mjs`.
- Se agrego `app/docs/SUBMITIDO-HR-DRIVEN-CONFIGURABLE-PHASE-A-TYA-20260704.md`.
- Objetivo: avanzar el pendiente vivo de submitido HR-driven/configurable sin tocar frontend ni activar runtime.
- Decision tecnica: submitido queda configurable por proyecto con modos canonicos `hr_driven`, `external_system`, `platform_review` y `manual_admin_hr_confirmed`; TyA/Cinepolis usa `hr_driven` por defecto.
- Impacto Claude/comercializable: Claude debe mostrar origen y estado de submitido como configuracion por proyecto, separado de cuestionario realizado, revision y liquidacion.
- Estado seguro: sin runtime, sin deploy, sin produccion, sin Auth real, sin escritura Firestore, sin HR writes, sin Make/Gemini/WhatsApp real y sin cambios frontend.

## 2026-07-04 - Admin review functional contract Phase A TyA

- Se agrego `app/contracts/admin-review-phase-a.tya.contract.json`.
- Se agrego `tools/migration/tya-admin-review-contract-validator.mjs`.
- Se agrego `app/docs/ADMIN-REVIEW-FUNCTIONAL-CONTRACT-PHASE-A-TYA-20260704.md`.
- Objetivo: avanzar el pendiente vivo de revision admin funcional sin tocar frontend ni activar runtime.
- Decision tecnica: cuestionario realizado, revision, submitido y liquidacion quedan como pasos separados; submitido debe ser HR-driven o admin-confirmado desde HR.
- Impacto Claude/comercializable: Claude debe trasladar esta separacion conceptual al prototipo comercializable cuando toque UI, sin tratar cuestionario realizado como submitido.
- Estado seguro: sin runtime, sin deploy, sin produccion, sin Auth real, sin escritura Firestore, sin Make/Gemini/WhatsApp real y sin cambios frontend.

## 2026-07-04 - Auth claims readiness Firestore rules Phase A TyA

- Se agrego `app/contracts/auth-claims-phase-a.tya.contract.json`.
- Se agrego `tools/migration/tya-auth-claims-readiness-validator.mjs`.
- Se agrego `app/docs/AUTH-CLAIMS-READINESS-FIRESTORE-RULES-PHASE-A-TYA-20260704.md`.
- Objetivo: preparar readiness documental de claims Auth contra el borrador de reglas Firestore DEV/staging para Phase A.
- Hallazgo: el draft de reglas usa `coordinador` y el contrato Phase A deja `ops` como canonico con `coordinador` como alias transicional pendiente de decision.
- Estado seguro: sin runtime, sin deploy, sin produccion, sin Auth real, sin escritura Firestore, sin Make/Gemini/WhatsApp real y sin cambios frontend.

## 2026-07-04 - CX.data backend adapter contract V78 TyA

- Se agrego `tools/migration/tya-cx-data-backend-adapter-contract.mjs`.
- Se agrego `app/docs/CX-DATA-BACKEND-ADAPTER-CONTRACT-V78-TYA-20260704.md`.
- Se agrego `app/docs/DEV-PREVIEW-SCHEMA-MANIFEST-TYA-20260704.md`.
- Se agrego `app/docs/CX-DATA-ADAPTER-ACCEPTANCE-CHECKLIST-V78-TYA-20260704.md`.
- Se agrego `app/docs/DATA-SOURCE-SELECTOR-CONTRACT-V78-TYA-20260704.md`.
- Objetivo: avanzar el empalme real backend/prototipo definiendo contrato CX.data, selector de fuente y esquemas preview sin tocar modulos/core.
- Estado seguro: sin runtime, sin deploy, sin produccion, sin escritura Firestore, sin importacion real y sin cambios frontend.

## 2026-07-04 - DEV staging runbook y matriz de decision TyA

- Se agrego `app/docs/DEV-STAGING-NEXT-RUNBOOK-DISABLED-TYA-20260704.md`.
- Se agrego `app/docs/DEV-STAGING-READINESS-TO-AUTHORIZATION-MATRIX-TYA-20260704.md`.
- Objetivo: preparar la secuencia futura de revision y matriz de autorizacion sin codigo ejecutable.
- Estado seguro: sin runtime, sin deploy, sin produccion, sin escritura Firestore, sin importacion real y sin cambios frontend.

## 2026-07-04 - DEV staging authorization decision lock TyA

- Se agrego `tools/migration/tya-dev-staging-authorization-decision-lock.mjs`.
- Se agrego `app/docs/DEV-STAGING-AUTHORIZATION-DECISION-LOCK-TYA-20260704.md`.
- Objetivo: cerrar el bloque previo a autorizacion DEV staging dejando claro que no existe runner habilitado y que V78 sigue como baseline.
- Estado seguro: sin runtime, sin deploy, sin produccion, sin escritura Firestore, sin importacion real y sin cambios frontend.
