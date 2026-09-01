# CAMBIOS BACKEND — addendum Corte 5 Hosting DEV existente / Auth preflight

Fecha: 2026-07-30

## Archivos tocados/creados
- `backend/config/phase-a-hosting-dev-execution-request-v1.json`: autorización one-shot del Hosting DEV existente registrada y luego congelada en preflight HOLD, deploy 0/1 no consumido.
- `tools/qa/cxorbia-canonical-backend-readonly-inventory.mjs`: ampliado para reportar únicamente conteos sanitizados de readiness Auth/claims; no PII.
- `.github/cxorbia-firebase-requests/canonical-backend-readonly-inventory.json`: nonce de refresh read-only solicitado; no se afirma ejecución mientras no exista evidencia observable.
- `app/docs/CORTE5-EXISTING-HOSTING-DEV-PREFLIGHT-AUTH-DEPENDENCY-20260730.md`: nueva evidencia de decisión.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`: estado vivo actualizado.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`: fuente vigente y gate actual actualizados.

## Decisión
`HOLD_BEFORE_DEPLOY__EXISTING_HOSTING_VERIFIED__SECURE_BROWSER_AUTH_REQUIRED`.

No se creó Hosting/Firebase adicional. No se ejecutó el deploy porque los datos reales protegidos requieren una sesión Firebase Auth válida y la autorización actual prohíbe Auth writes/Rules deploy. El redeploy queda reservado, no consumido.

## Clasificación
- Reusable CXOrbia: preflight fail-closed para visualización de PII protegida.
- Exclusivo cliente: `cxorbia-backend-dev`, tenant `tya`, proyecto `cinepolis`.
- Claude/prototipo: login real requerido; no patch backend de UI.
- Academia: selector de rol no equivale a Auth.
- Sin impacto Claude: request, inventario sanitizado, controles de deploy.

## Seguridad
Hosting deploy=0; Firestore/Auth/Storage/HR/legacy writes=0; Rules/Functions deploy=0; pagos=0; merge=false; producción=false; PII cruda repo/artifacts=0.
