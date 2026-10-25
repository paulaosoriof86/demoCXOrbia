# Drift Gate - Auth RBAC validator allowlist

Fecha: 2026-07-08  
Bloque: permitir validador Auth/RBAC seguro en drift  
Estado: documentado, sin runtime app changes.

## 1. Contexto

El bloque Auth/RBAC agrego el validador seguro:

- `tools/release/tya-auth-rbac-contract-validate.mjs`

El drift gate debe permitir este tipo de validador porque no toca frontend, no conecta Auth real y no escribe claims.

## 2. Decision

Se actualizo `tools/release/tya-rc-phase-a-drift-gate.mjs` para permitir:

- `tools/release/tya-auth-rbac-contract-validate.mjs`.

## 3. Limites

No se permitieron cambios runtime generales en `/app`.
No se activo Auth real.
No se escribieron claims.
No se activaron providers.
No se activaron imports.
No se activaron database writes.

## 4. Impacto Phase A

Permite mantener contratos Auth/RBAC validados como avance backend reutilizable sin perder proteccion de drift sobre la app runtime.

## 5. Estado seguro

- Sin deploy final.
- Sin produccion.
- Sin merge final.
- Sin Auth real.
- Sin claims reales.
- Sin import real.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
