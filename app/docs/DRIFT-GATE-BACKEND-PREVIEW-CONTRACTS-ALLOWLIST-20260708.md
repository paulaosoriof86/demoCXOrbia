# Drift Gate - backend preview contracts allowlist

Fecha: 2026-07-08  
Bloque: permitir contratos/adapters backend preview en drift seguro  
Estado: documentado, sin runtime app changes.

## 1. Contexto

El avance de backend Phase A agrego contratos y adapters preview no conectados:

- `backend/contracts/cxdata-firestore-phase-a-v1.json`;
- `backend/adapters/firebase-cxdata-adapter.preview.mjs`;
- `tools/release/tya-cxdata-firestore-contract-validate.mjs`;
- `tools/release/tya-hosting-deploy-readiness.mjs`.

El drift gate los bloqueo porque aun no estaban clasificados como archivos backend preview seguros.

## 2. Decision

Se actualizo `tools/release/tya-rc-phase-a-drift-gate.mjs` para permitir:

- `backend/contracts/`;
- `backend/adapters/`;
- `tools/release/tya-cxdata-firestore-contract-validate.mjs`;
- `tools/release/tya-hosting-deploy-readiness.mjs`.

## 3. Limites

No se permitieron cambios runtime generales en `/app`.
No se permitieron providers.
No se permitieron imports reales.
No se permitieron database writes.
No se activo frontend.

## 4. Impacto Phase A

Permite avanzar backend real sin bloquear el drift por contratos seguros, manteniendo protegida la app runtime.

## 5. Estado seguro

- Sin deploy final.
- Sin produccion.
- Sin merge final.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
