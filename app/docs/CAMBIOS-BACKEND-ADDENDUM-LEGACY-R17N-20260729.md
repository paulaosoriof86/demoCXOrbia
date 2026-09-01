# CAMBIOS BACKEND — ADDENDUM LEGACY REFRESH / R17N / VISIT IDENTITY CROSSWALK

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
- `tools/reconciliation/tya-visit-identity-crosswalk-readonly.mjs`: crosswalk autorizado HR source-safe ↔ visitas existentes de `cxorbia-backend-dev` por `visitId`, `hrRowId` y `sourceSheet+sourceRow`.
- `.github/workflows/cxorbia-visit-identity-crosswalk-readonly.yml`: runner read-only del crosswalk de identidad de visita.
- `.github/cxorbia-firebase-requests/visit-identity-crosswalk-readonly.json`: autorización exacta consumida para ese gate.
- `app/docs/ADDENDUM-IDENTIDAD-REAL-SHOPPER-PII-SOURCE-SAFE-VS-PLATAFORMA-20260729.md`: lock conceptual para impedir que `source-safe` se interprete como anonimización permanente de la plataforma.

## Evidencia creada/actualizada
- `evidence/LEGACY-SHOPPERS-CERTIFICATIONS-REFRESH-LATEST.json/.md`.
- `evidence/LEGACY-EXISTING-PROFILE-FIELD-DIFF-READONLY-LATEST.json/.md`.
- `evidence/HR-PROTECTED-SHOPPER-CROSSWALK-READONLY-LATEST.json/.md`.
- `evidence/R17N-POST-LEGACY-WRITE-PLAN-NO-EXECUTE-LATEST.json/.md`.
- `evidence/CANONICAL-PLAN-REFRESH-OFFLINE-LATEST.json/.md` refrescado.
- `evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json/.md`.

## Resultado legacy / R17N
- 149 shoppers legacy únicos; 78 certificaciones útiles.
- 120 perfiles create-candidate; 22 stable-linked existing; 7 HOLD.
- R17N idempotence PASS; writes autorizados=0.

## Resultado visit-identity crosswalk
Gate autorizado: HR source-safe + visitas existentes de `cxorbia-backend-dev`; no visitas legacy; no nombres/email/teléfono para enlazar.

Rerun v2 final:
- HR refs shopper: 210;
- visitas HR con shopperRef: 616;
- visitas canónicas existentes escaneadas: 619;
- shoppers canónicos existentes: 215;
- referencias resueltas: 201;
- referencias pendientes: 9;
- conflictos multi-shopper: 0;
- visitas resueltas por identidad exacta: 571;
- visitas sin evidencia canónica exacta suficiente: 45;
- target shopper inexistente: 0;
- mapping hash: `9221098951aa03d34301273c3adc8f7773a410a39901432ec6f6e3040ce4720f`.

### Defecto del primer intento y causa raíz
El primer run devolvió falsamente 0/210 porque el sanitizador técnico del gate rechazaba espacios dentro de `sourceSheet`/`hrRowId` (por ejemplo nombres de pestaña mensuales). Ese campo no es PII de shopper sino identidad operacional de fuente. Se separó `safeTechnicalId` de `safeSourceIdentity`, se conservan espacios controlados y el rerun resolvió 201/210 sin cambiar alcance ni usar nombres.

## Identidad real vs source-safe
`source-safe` protege GitHub/logs/evidencias; no obliga a ocultar la identidad real dentro de la plataforma autorizada. La materialización futura debe llevar los datos reales útiles del shopper directamente de fuente autorizada al backend canónico, con RBAC/Rules y sin PII cruda en repo. La UI Admin/Operativo debe mostrar identidad real cuando el perfil exista; hashes/placeholders son solo artefactos técnicos.

La regla `no name-only automerge` se conserva como protección contra fusiones incorrectas, no como anonimización del producto.

## Incidente de herramienta corregido y cerrado
Durante una actualización documental se envió por error una escritura sin `branch`, lo que creó en `main` un archivo nuevo inexistente previamente: `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md` con contenido `dummy`, commit `45ffbf281c269be8331cb7417077332726eeb058`.

Corrección inmediata:
- se verificó que el archivo no existía previamente en `main`;
- se eliminó exactamente ese archivo de `main` en commit `928bde911a2ce5dd56886b9e7b562801647fd0f4`;
- relectura posterior del path en `main`: `404 Not Found`;
- no se modificó código funcional, backend, provider, datos ni producción.

Prevención: toda mutación documental posterior de CXOrbia incluye explícitamente `branch=docs-tya-v6-v71-audit`.

## Clasificación
- Reusable CXOrbia: stable-key dedupe, recovery-mirror collapse, evidencia transaccional exacta, separación PII-backend/source-safe, RBAC y no-overwrite.
- Exclusivo cliente: nodo `tya_shoppers_extra`, HR Cinépolis, 210 refs, 201 resueltas/9 pendientes y 78 certificaciones recuperadas.
- Claude/prototipo: sin modificación frontend inmediata; cuando el backend tenga perfil real, mostrar identidad real autorizada y no placeholders permanentes.
- Academia: identidad real, privacidad por rol, carryover de certificaciones, dedupe y conflictos.
- Sin impacto Claude: workflows/read-only evidence y hashes.

## Seguridad
Legacy/Firestore/Auth/Storage/HR writes=0; deploy=0; merge=false; producción=false; pagos/Make/Gemini=0.
