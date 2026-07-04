# CAMBIOS-BACKEND.md

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
