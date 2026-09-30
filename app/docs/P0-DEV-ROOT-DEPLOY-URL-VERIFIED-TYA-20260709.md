# P0 DEV root deploy URL verified TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Resultado

URL DEV verificada para validacion visual controlada:

`https://cxorbia-backend-dev.web.app`

## Run verificado

Workflow: `CXOrbia RC Phase A DEV Root Deploy`
Run id: `29060941996`
Job: `RC Phase A DEV root deploy hosting only`
Job id: `86262451348`

## Pasos en success

- Checkout.
- Setup Node.
- Predeploy gate.
- Drift gate.
- Secret availability and JSON sanity check.
- Firebase CLI access check.
- Deploy Hosting DEV root.
- Verify DEV root URL.
- Upload DEV root deploy reports.

## Alcance

Hosting DEV root solamente.

No es produccion. No es merge final. No activa Firestore/Auth/Storage reales. No activa HR/Make/Gemini. No importa datos. No ejecuta pagos.

## Decision operativa

Se puede pedir smoke humano focalizado sobre URL DEV.

La validacion debe confirmar rutas criticas, copy honesto, Academia, Diagnostico, Administrabilidad y consola sin errores JS criticos.

## Estado seguro

Deploy DEV hosting verificado. Produccion sigue sin tocarse.
