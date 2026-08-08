# Corte 4 — Bootstrap DEV read-only · preflight IAM/location

**Fecha:** 2026-07-29  
**Estado:** `AUTHORIZED_BOOTSTRAP__PREFLIGHT_BLOCKED_IAM_AND_FIRESTORE_LOCATION__NO_PROVIDER_WRITES`

## Autorización vigente

Paula autorizó expresamente en la conversación actual: `Autorizo bootstrap DEV read-only de Corte 4`.

Alcance autorizado: Web App DEV, inicialización mínima Firestore/Auth necesaria para lectura protegida, Rules read-only DEV, activación de lectura DEV y smoke posterior. Continúan fuera de alcance: import/materialización, Storage, Hosting deploy, Functions, HR writes, Make/Gemini, pagos/lotes, merge y producción.

## Preflight ejecutado

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama: `docs-tya-v6-v71-audit`
- PR #7: draft/open/no merge
- Target: `cxorbia-tya-dev-260729-c4`
- Workflow: `CXOrbia Corte 4 Bootstrap DEV Read-only Preflight`
- Commit diagnóstico: `34255405b8a3e18bab53a403aa5005e133aab648`
- Provider reads: sí
- Provider writes: `0`

## Resultado comprobado

El proyecto y Firebase siguen verificables, pero la cuenta del runner conserva permisos de lectura insuficientes para ejecutar el bootstrap autorizado.

Permisos faltantes detectados por `testIamPermissions`:

1. `firebase.clients.create`
2. `datastore.databases.create`
3. `firebaseauth.configs.create`
4. `firebaseauth.users.create`
5. `firebaseauth.users.update`
6. `firebaserules.rulesets.create`
7. `firebaserules.rulesets.get`
8. `firebaserules.releases.create`
9. `firebaserules.releases.update`
10. `serviceusage.services.enable`

Además:

- `firestore.googleapis.com`: deshabilitado;
- ubicación Firestore: no definida;
- por tanto `providerWriteReady=false`;
- no se intentó ninguna escritura.

## Desbloqueo mínimo

Para la misma cuenta de servicio del runner que ya tiene `Viewer`, la combinación operativa recomendada sin usar Owner/basic Editor es:

- `Firebase Editor` (`roles/firebase.editor`): Web App, Auth y Rules;
- `Cloud Datastore Owner` (`roles/datastore.owner`): creación/configuración de Firestore;
- `Service Usage Admin` (`roles/serviceusage.serviceUsageAdmin`): habilitar `firestore.googleapis.com`.

Después del bootstrap estos permisos elevados deben retirarse y el runner puede volver a `Viewer` para lectura.

## Ubicación Firestore pendiente

La ubicación no está predefinida por Firebase y es una decisión persistente del proyecto. No se seleccionará por inferencia silenciosa.

Para este proyecto DEV, `us-central1` es la recomendación operativa por ser regional y adecuada para priorizar costo/latencia; producción decidirá su ubicación en un gate separado. `nam5` queda como alternativa multirregional si se prioriza disponibilidad sobre costo en DEV.

## Siguiente bloque exacto

`IAM WRITE ROLES TEMPORALES + UBICACIÓN FIRESTORE CONFIRMADA → RE-PREFLIGHT → EJECUTAR BOOTSTRAP AUTORIZADO → WEB APP DEV → FIRESTORE → AUTH TEMPORAL → RULES READ-ONLY → CX.data SMOKE → VALIDACIÓN VISUAL → FREEZE CORTE 4`.

## Clasificación

- **Reusable CXOrbia:** preflight de permisos antes de writes, separación IAM/API/location y retiro posterior de privilegios.
- **Exclusivo cliente:** projectId DEV TyA.
- **Claude/prototipo:** sin intervención frontend todavía.
- **Academia:** diferenciar autorización funcional, permisos IAM, API habilitada y ubicación irreversible.
- **Sin impacto Claude:** workflow/preflight provider.

## Estado seguro

Sin provider writes, Rules deploy, Firestore/Auth data writes, Storage, Hosting deploy, Functions, imports, pagos, Make/Gemini, merge ni producción.
