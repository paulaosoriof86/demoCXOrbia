# Staging deploy retry after drift allowlist

Fecha: 2026-07-07

## Bloque completado

Se reintento el workflow de staging deploy despues de corregir el allowlist del drift gate.

## Archivos involucrados

- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`
- `tools/release/tya-rc-phase-a-drift-gate.mjs`
- `app/docs/DRIFT-GATE-FIX-STAGING-WORKFLOW-ALLOWLIST-20260707.md`
- `app/docs/STAGING-DEPLOY-RETRY-AFTER-DRIFT-ALLOWLIST-20260707.md`

## Cambio aplicado

Se hizo una actualizacion no funcional del workflow de staging para disparar nuevamente el proceso controlado.

El workflow mantiene:

- Hosting preview only;
- no Firestore rules;
- no Storage rules;
- no Functions;
- no imports;
- no proveedores;
- no Make/Gemini;
- no mensajeria/correo;
- no pagos reales.

## Secret requerido

El workflow solo puede desplegar si existe:

- `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`

Si el secret no existe, debe bloquearse antes de cualquier llamada a Firebase.

## Claude

No hay pendiente importante para Claude.

Esto es release/gate/staging, no UX/prototipo.

## Estado seguro

Sin produccion real, sin merge final, sin reglas, sin proveedores reales, sin imports y sin datos sensibles.
