# Incidente — Deploy DEV automático no autorizado

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Resumen

Durante la reconciliación del source lock post-V96, un workflow preexistente de GitHub Actions ejecutó automáticamente un deploy de Firebase Hosting DEV al recibir una actualización del PR.

Este deploy **no fue autorizado por Paula** y contradice el estado seguro acordado de “sin deploy”. Se registra como incidente y se corrige el origen para impedir repeticiones.

## Qué se desplegó

Workflow:

- `CXOrbia RC Phase A DEV Root Deploy`;
- run: 440;
- job: `RC Phase A DEV root deploy hosting only`;
- head asociado: `30217109976bc85a0ba9144f739fa2b9055a452c`;
- checkout del merge ref del PR: `b0ac009ff3ce076316f6cac0b6a79eddc7b6bee9`.

Destino:

- URL DEV: `https://cxorbia-backend-dev.web.app`;
- Firebase project: `cxorbia-backend-dev`;
- hosting target: `cxorbia-dev`.

Comando ejecutado por el workflow:

- `firebase deploy --only hosting:cxorbia-dev --project cxorbia-backend-dev`.

Alcance confirmado:

- Hosting DEV solamente;
- no Firestore rules;
- no Storage rules;
- no Functions;
- no import de datos;
- no Auth/claims;
- no HR writeback;
- no Make/Gemini;
- no pagos;
- no producción.

## Causa raíz

El archivo preexistente `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml` tenía:

- trigger `push` sobre la rama activa;
- trigger `pull_request` hacia la rama base;
- filtros por rutas runtime ya incluidas en el PR acumulado;
- un paso real de `firebase deploy`;
- credencial DEV disponible en GitHub Actions;
- drift gate interno usando SHA `f7dc604f06adb03fbe5597163e3bca2f3ab4a583`, diferente del SHA `489b0420a820b390f4307db93fe8280959f3867c` usado por el drift gate principal.

Por la semántica del evento `pull_request`, una actualización safe-only del PR volvió a ejecutar el workflow porque el diff acumulado del PR contiene rutas coincidentes. El gate interno pasó con su SHA distinto y permitió el deploy.

## Contención aplicada

Se modificó `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml` en commit:

- `35f1db9ce34e959710adfb1ede05458a7d9bb4f4`.

Cambios:

1. Se eliminaron los triggers automáticos `push` y `pull_request`.
2. El workflow quedó `workflow_dispatch` únicamente.
3. Se agregó confirmación manual exacta `DEPLOY_DEV_ROOT`.
4. Se agregó el gate criptográfico del source lock post-V96 antes de cualquier acceso Firebase.
5. Se alineó el drift gate al SHA `489b0420a820b390f4307db93fe8280959f3867c`.
6. Mientras el source lock continúe en `NO_GO_SOURCE_LOCK_RUNTIME_NOT_EMPLOYED`, el deploy manual también queda bloqueado.

## Verificación de contención

Después del commit de contención, los workflows automáticos ejecutados fueron validadores/smokes/readiness. No apareció una nueva ejecución de `CXOrbia RC Phase A DEV Root Deploy`.

## Estado actual correcto

- sí ocurrió un deploy DEV Hosting no autorizado en run 440;
- no ocurrió deploy de producción;
- no hubo Firestore/Auth/Storage/Functions/import/writes/pagos;
- el endpoint DEV puede contener el runtime del merge ref de ese run;
- los despliegues automáticos futuros quedaron bloqueados;
- no se ejecutó rollback, porque un rollback de Hosting también es una acción de deploy y requiere autorización explícita.

## Corrección a documentación previa

Cualquier documento del bloque que diga “sin deploy” debe interpretarse así:

- antes del run 440, la intención y las acciones directas del bloque no ejecutaban deploy;
- sin embargo, el workflow preexistente sí desplegó automáticamente a DEV;
- este documento corrige y prevalece sobre esa afirmación para el estado final del bloque.

## Riesgo residual

El DEV root desplegado no coincide con el source lock post-V96 según el gate de hashes:

- 67 esperados;
- 30 coinciden;
- 37 distintos;
- veredicto `NO_GO_SOURCE_LOCK_RUNTIME_NOT_EMPLOYED`.

Por ello:

- DEV no debe tratarse como baseline aceptada;
- no se deben crear usuarios ni conectar Auth/Firestore sobre ese runtime;
- no se debe comunicar como versión lista para operación.

## Siguiente acción segura

1. Mantener workflow de deploy manual-only.
2. Completar el empalme controlado del source lock post-V96.
3. Rerun de hash gate, drift y smoke por rol.
4. Decidir con autorización explícita si se debe:
   - dejar el DEV actual temporalmente;
   - redeployar el source lock validado;
   - o ejecutar rollback a una versión DEV anterior.

## Necesidad de Paula

No se requiere información adicional.

Para cambiar nuevamente el contenido publicado en DEV —incluido rollback— se necesita autorización explícita de Paula, porque implicaría otro deploy.
