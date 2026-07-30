# CAMBIOS BACKEND — ADDENDUM LEGACY REFRESH / R17N

Fecha: 2026-07-29

## Archivos funcionales/tools creados o modificados
- `tools/reconciliation/tya-legacy-shoppers-certifications-refresh-readonly.mjs`: refresh read-only del nodo legacy shopper, dedupe stable-ID, certificaciones, recovery mirrors y diff seguro.
- `.github/workflows/cxorbia-legacy-shoppers-certifications-refresh-readonly.yml`: runner gated read-only; zero writes.
- `.github/cxorbia-firebase-requests/legacy-shoppers-certifications-refresh-readonly.json`: autorización exacta consumida.
- `tools/reconciliation/tya-legacy-existing-profile-field-diff-readonly.mjs`: diff fill-missing/noop/conflict para perfiles stable-linked, sin PII exportada.
- `tools/reconciliation/tya-hr-protected-shopper-crosswalk-readonly.mjs`: stable ID/code crosswalk de refs HR contra shoppers existentes; name matching=false.
- `tools/reconciliation/tya-r17n-post-legacy-plan-no-execute.mjs`: plan R17N no-execute + hash de idempotencia.
- `.github/workflows/cxorbia-canonical-plan-refresh-offline.yml`: extendido para producir R17N offline.
- `.github/cxorbia-firebase-requests/canonical-plan-refresh-offline.json`: trigger offline, providerCalls=0.

## Evidencia creada/actualizada
- `evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json/.md`.
- `evidence/LEGACY-EXISTING-PROFILE-FIELD-DIFF-READONLY-LATEST.json/.md`.
- `evidence/HR-PROTECTED-SHOPPER-CROSSWALK-READONLY-LATEST.json/.md`.
- `evidence/R17N-POST-LEGACY-WRITE-PLAN-NO-EXECUTE-LATEST.json/.md`.
- `evidence/CANONICAL-PLAN-REFRESH-OFFLINE-LATEST.json/.md` refrescado.

## Resultado
- 149 shoppers legacy únicos; 78 certificaciones útiles.
- 120 perfiles create-candidate; 22 stable-linked existing; 7 HOLD.
- 210 HR protected refs: 0 match por stable ID/code, 210 unmapped, 0 collision.
- R17N idempotence PASS; writes autorizados=0.

## Incidente de herramienta corregido y cerrado
Durante una actualización documental se envió por error una escritura sin `branch`, lo que creó en `main` un archivo nuevo inexistente previamente: `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md` con contenido `dummy`, commit `45ffbf281c269be8331cb7417077332726eeb058`.

Corrección inmediata:
- se verificó que el archivo **no existía previamente en `main`** (el diff del commit fue `@@ -0,0 +1 @@`);
- se eliminó exactamente ese archivo de `main` en commit `928bde911a2ce5dd56886b9e7b562801647fd0f4`;
- relectura posterior de ese path en `main`: `404 Not Found`, restaurando el estado previo del árbol para ese archivo;
- no se modificó código funcional, backend, provider, datos ni producción por este incidente.

Prevención: toda mutación documental posterior de CXOrbia debe incluir explícitamente `branch=docs-tya-v6-v71-audit`; no se usa `main` como destino.

## Clasificación
- Reusable CXOrbia: stable-key dedupe, recovery-mirror collapse, fill-missing-only, no overwrite, evidence-transaction crosswalk como siguiente gate.
- Exclusivo cliente: nodo `tya_shoppers_extra`, nomenclatura legacy TyA, 210 refs HR y 78 certificaciones recuperadas.
- Claude/prototipo: sin modificación frontend; deberá preservar separación profile/reference y no mostrar duplicados si el adapter la materializa.
- Academia: identidad estable, carryover de certificaciones y conflictos.
- Sin impacto Claude: workflows/read-only evidence y hash de idempotencia.

## Seguridad
Legacy/Firestore/Auth/Storage/HR writes=0; deploy=0; merge=false; producción=false; pagos/Make/Gemini=0. El incidente documental de `main` quedó revertido completamente en el mismo bloque.
