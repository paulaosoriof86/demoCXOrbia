# P0 DEV root deploy diagnostic workflow TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Corregir el deploy DEV root opaco despues de que el secret ya fue agregado por Paula.

## Estado previo

- `Secret availability check` paso a success.
- `Deploy Hosting DEV root` fallo.
- `Verify DEV root URL` quedo skipped.

## Cambio aplicado

Se actualizo `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml` para reemplazar el paso opaco de `FirebaseExtended/action-hosting-deploy@v0` por diagnostico explicito con Firebase CLI.

El workflow ahora separa:

1. disponibilidad del secret;
2. JSON valido;
3. `type=service_account`;
4. `project_id=cxorbia-backend-dev`;
5. dominio de `client_email` del proyecto DEV;
6. acceso a Firebase Hosting con `hosting:sites:list`;
7. deploy hosting only con `firebase-tools deploy --only hosting:cxorbia-dev --project cxorbia-backend-dev`;
8. verificacion de `https://cxorbia-backend-dev.web.app`.

## Seguridad

El diagnostico no imprime private_key ni contenido del secret. Solo registra estado, tipo, project_id y dominio enmascarado del client_email.

## Alcance

Hosting DEV root solamente.

No despliega produccion, no reglas Firestore, no Storage rules, no Functions, no imports, no providers, no pagos y no datos sensibles.

## Resultado esperado

El push al workflow debe disparar nuevamente `CXOrbia RC Phase A DEV Root Deploy`.

Si falla de nuevo, el nuevo log debe identificar si el problema es:

- JSON invalido;
- project_id equivocado;
- client_email de otro proyecto;
- falta de permisos IAM/Firebase Hosting;
- target/sitio hosting inaccesible;
- fallo real de deploy;
- fallo de verificacion URL.

## Estado seguro

Workflow diagnostico solamente sobre DEV Hosting. No cambia UI/core ni datos operativos.
