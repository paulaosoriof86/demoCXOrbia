# CHECKPOINT — Corte 4 bootstrap DEV read-only

Fecha: 2026-07-29

Estado exacto: `CORTE3_FROZEN__CORTE4_NEW_EMPTY_PASS__BOOTSTRAP_AUTHORIZED__IAM_LOCATION_HOLD__NO_PROVIDER_WRITES`

- PR #7 draft/open/no merge.
- Corte 3 baseline V182 preservado.
- Corte 4 identidad nueva: PASS.
- Corte 4 vacío integral: PASS.
- Bootstrap DEV read-only: autorizado por Paula.
- Preflight commit `34255405b8a3e18bab53a403aa5005e133aab648`.
- Falta IAM para 10 permisos de bootstrap.
- `firestore.googleapis.com` está deshabilitado.
- Ubicación Firestore no definida.
- Provider writes ejecutados después de la autorización: 0.

Siguiente acción humana mínima: elevar temporalmente la misma service account del runner con Firebase Editor + Cloud Datastore Owner + Service Usage Admin y confirmar ubicación Firestore. Después ChatGPT reejecuta preflight y continúa el bootstrap sin nueva autorización mientras se mantenga exactamente el alcance ya autorizado.

No pedir nueva candidata, ZIP, PowerShell ni datos TyA.
