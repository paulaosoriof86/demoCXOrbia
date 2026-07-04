# CAMBIOS-BACKEND.md

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
