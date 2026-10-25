# Corte 5 — preflight del Hosting DEV existente / dependencia Auth

Fecha: 2026-07-30

## Decisión

`HOLD_BEFORE_DEPLOY__EXISTING_HOSTING_VERIFIED__SECURE_BROWSER_AUTH_REQUIRED`

La autorización de Paula para **un único redeploy del Hosting DEV de visualización ya existente** fue registrada, pero el deploy NO se consumió porque el preflight fail-closed detectó una dependencia de seguridad previa: el navegador no puede leer los datos reales protegidos de `cxorbia-backend-dev` sin una sesión Firebase Auth válida.

## Hosting correcto confirmado

No se crea Hosting ni proyecto Firebase nuevo.

- proyecto DEV: `cxorbia-backend-dev`;
- hosting target: `cxorbia-dev`;
- sitio existente: `cxorbia-backend-dev`;
- root URL existente: `https://cxorbia-backend-dev.web.app`;
- entrypoint previsto para backend controlado: `index-backend-dev.html`;
- Hosting público final `tya-plataforma` permanece intacto.

## Por qué no se ejecutó el redeploy todavía

1. `firestore.rules` exige `request.auth != null` y claims de rol/tenant para leer tenant, shoppers, proyectos, periodos y visitas.
2. `app/core/backend-firebase.js` exige Firebase Auth para el preview DEV cuando `devPreviewAuth.enabled=true`.
3. `app/index-backend-dev.html` solo contempla un helper de Auth local/privado antes de `backend-firebase.js`; no existe una credencial segura embebible en Hosting.
4. El login visible actual de `app/app.js` es selector de perfil/rol de la UI; no autentica al usuario ante Firebase.
5. Inyectar contraseña, custom token, ID token o service account en JS, URL o Hosting público expondría credenciales o PII y queda prohibido.
6. La autorización vigente excluye Auth writes y Rules deploy, por lo que no permite crear/cambiar un principal o claims para resolver esta dependencia.

Ejecutar Hosting ahora produciría una de dos salidas incorrectas: `auth:pending`/sin datos reales o un atajo inseguro. Por eso el único redeploy autorizado permanece **0/1 y no consumido**.

## Evidencia previa útil

El inventario read-only del backend canónico ya demostró 17 usuarios Auth y solo las claim keys agregadas históricas `isDev/projectId/projectIds/role/shopperId/tenantId/tenantIds/tenants`. No aparecen `personaType`, `scope` ni `permissionsVersion`, que forman parte del contrato Phase A actual. Esto no autoriza modificar usuarios; solo demuestra que Auth/RBAC necesita reconciliación antes del acceso visual final con PII real.

## Trabajo realizado bajo la autorización

- se verificó que el Hosting DEV existente es el correcto;
- se registró el one-shot exacto en `backend/config/phase-a-hosting-dev-execution-request-v1.json`;
- se ejecutó preflight estático de seguridad;
- se amplió el inventario read-only para poder reportar únicamente conteos de readiness Auth, nunca identidad/PII;
- se solicitó un refresh read-only del inventario; al cierre de este documento no existe todavía evidencia observable de que GitHub Actions lo haya ejecutado, por lo que no se afirma resultado nuevo;
- se congeló el request de Hosting en `preflight_hold_auth_required_no_deploy`, con `hostingDeployExecutions=0`.

## Qué NO ocurrió

- Hosting deploy: 0;
- nuevo Hosting: 0;
- nuevo proyecto Firebase: 0;
- Firestore writes: 0;
- Auth writes: 0;
- Storage/HR/legacy writes: 0;
- Rules/Functions deploy: 0;
- pagos: 0;
- merge: 0;
- producción: 0;
- PII cruda en repo/artifacts: 0.

## Camino mínimo sin reproceso

No pedir otra autorización de Hosting: la autorización del único redeploy queda reservada y no consumida.

Siguiente bloque:

`CORTE 6 AUTH/RBAC — RECONCILIAR EXISTING AUTH + CLAIM TAXONOMY + SECURE BROWSER LOGIN → autorización específica solo para los cambios Auth/Rules estrictamente necesarios → reutilizar el mismo Hosting DEV y el mismo único redeploy ya autorizado → validación visual real → freeze Corte 5/6 según gates`.

La prioridad es reutilizar usuarios Auth existentes cuando correspondan a personas reales y sea seguro hacerlo; no importar Auth legacy ni crear usuarios duplicados por rutina.

## Clasificación

- Reusable CXOrbia: preflight fail-closed de Hosting con datos protegidos; Auth/RBAC antes de PII real.
- Exclusivo cliente: tenant `tya`, proyecto `cinepolis`, Hosting DEV existente `cxorbia-backend-dev`.
- Claude/prototipo: el login visible necesita autenticación real antes de producción; no se parchea desde backend en este bloque.
- Academia: selección visual de rol no equivale a autenticación; Hosting no debe exponer PII sin RBAC.
- Sin impacto Claude: request one-shot, inventario Auth sanitizado y controles de deploy.
