# RESUMEN PARA CLAUDE — addendum Corte 5 Hosting DEV / Auth

Fecha: 2026-07-30

## Estado
Corte 5 backend/data está técnicamente PASS, pero la validación visual con datos reales quedó detenida **antes del deploy** porque el navegador necesita Firebase Auth/claims para leer Firestore protegido.

## No hacer
- no crear candidata nueva;
- no crear nuevo Hosting/Firebase;
- no hardcodear credenciales/tokens;
- no hacer público un snapshot con PII;
- no convertir el selector de rol actual en una falsa autenticación;
- no tocar módulos solo para ocultar `auth:pending`.

## Pendiente frontend real
Antes de producción el login debe autenticar al usuario contra Firebase Auth y traducir la identidad autenticada a la sesión/rol de CXOrbia de forma fail-closed. El selector de rol actual puede seguir sirviendo en demo/validación source-safe, pero no puede gobernar acceso a PII real.

Backend preparará primero la reconciliación Auth/RBAC y definirá el contrato exacto. Claude solo debe intervenir cuando se entregue una tarea focalizada por archivo/flujo o si se demuestra un P0 visual reproducible.

## Preservado
- Corte 3 V182 frozen;
- `cxorbia-backend-dev` canónico;
- R17N 1,406/1,406;
- 14 periodos /616 visitas /208 refs /77 certificaciones /572 controles;
- P0 de periodos corregido;
- Hosting DEV existente `cxorbia-backend-dev.web.app`;
- autorización del único redeploy: reservada, no consumida.

## Academia
Explicar que rol visual, identidad de sesión y autenticación del proveedor son capas distintas; PII real solo se presenta tras Auth/RBAC.
