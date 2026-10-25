# CAMBIOS BACKEND — Addendum Corte 4 bootstrap DEV read-only

Fecha: 2026-07-29

- Autorización expresa recibida: `Autorizo bootstrap DEV read-only de Corte 4`.
- Se creó `tools/release/cxorbia-corte4-bootstrap-preflight.mjs`.
- Se creó `.github/cxorbia-firebase-requests/corte4-bootstrap-preflight.json`.
- Se creó `.github/workflows/cxorbia-corte4-bootstrap-readonly-preflight.yml`.
- Se ejecutó preflight provider read-only sobre `cxorbia-tya-dev-260729-c4`.
- Resultado final visible en commit `34255405b8a3e18bab53a403aa5005e133aab648`: 10 permisos faltantes, `firestore.googleapis.com` deshabilitado y ubicación Firestore no definida.
- Provider writes ejecutados: `0`.
- Permisos faltantes: `firebase.clients.create`, `datastore.databases.create`, `firebaseauth.configs.create`, `firebaseauth.users.create`, `firebaseauth.users.update`, `firebaserules.rulesets.create`, `firebaserules.rulesets.get`, `firebaserules.releases.create`, `firebaserules.releases.update`, `serviceusage.services.enable`.
- Se documentó combinación temporal recomendada de IAM: Firebase Editor + Cloud Datastore Owner + Service Usage Admin; retirar después del bootstrap y volver a Viewer.
- La ubicación Firestore permanece sin seleccionar; no se hará una decisión irreversible por inferencia silenciosa.
- No se modificó `app/modules/**`.
- No se ejecutó Rules deploy, Firestore/Auth data write, Storage, Hosting deploy, Functions, import, pago, Make/Gemini, merge ni producción.

Clasificación: Reusable CXOrbia = permission preflight y least-privilege temporal; Exclusivo cliente = projectId DEV TyA; Claude/prototipo = sin tarea nueva; Academia = IAM/API/location como gates separados; Sin impacto Claude = workflow/provider preflight.
