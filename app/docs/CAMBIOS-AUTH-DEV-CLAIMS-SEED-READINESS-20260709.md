# Cambios Auth DEV claims seed readiness

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Archivos creados

- `backend/contracts/phase-a-auth-dev-claims-seed-readiness-v1.json`
- `backend/config/phase-a-auth-dev-claims-seed.source-safe.json`
- `tools/release/tya-auth-dev-claims-seed-plan-validate.mjs`
- `app/docs/PHASE-A-AUTH-DEV-CLAIMS-SEED-READINESS-20260709.md`

## Cambio funcional

Se agrego un validador ejecutable que revisa el plan source-safe de claims DEV antes de cualquier activacion real de Auth.

## Seguridad

No Auth real. No usuarios. No claims escritos. No emails reales. No passwords. No Firestore writes. No deploy. No produccion. No datos sensibles.

## Estado

Preparado para validacion local/CI sin writes:

```bash
node tools/release/tya-auth-dev-claims-seed-plan-validate.mjs --out .tmp/auth-dev-claims-seed
```
