# P0 DEV URL secret blocker TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Identificar el bloqueo exacto que impide entregar URL de validacion visible para PR #7 / V91.

## Resultado

El bloqueo exacto es falta del secret de GitHub Actions:

`FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`

## Evidencia

El workflow `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml` define:

- nombre del workflow: `CXOrbia RC Phase A DEV Root Deploy`;
- URL esperada: `https://cxorbia-backend-dev.web.app`;
- deploy hosting only, sin Firestore/Storage rules, Functions, imports o providers;
- secret requerido: `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`;
- si el secret falta, escribe `status=blocked_missing_secret`, imprime `Missing FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV secret.`, bloquea antes de cualquier llamada a Firebase y hace `exit 1`.

Por eso el run actual fallo en `Secret availability check` y los pasos de deploy/verificacion quedaron skipped.

## Decision operativa

No corresponde pedir smoke humano ni GO DEV hasta resolver este P0.

La URL `https://cxorbia-backend-dev.web.app` es la URL DEV prevista, pero no debe tratarse como validacion actual del head hasta que el workflow termine en success y verifique la URL.

## Que no se toca

- No se toca produccion.
- No se hace merge final.
- No se activa Firestore/Auth/Storage reales.
- No se activa HR/Make/Gemini.
- No se importa.
- No se escribe.
- No se hacen pagos.
- No se suben datos sensibles.

## Accion necesaria

Para desbloquear URL DEV se necesita una de estas opciones:

1. Agregar en GitHub Actions el secret `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV` con el JSON de service account del proyecto Firebase DEV `cxorbia-backend-dev`.
2. Autorizar a una herramienta con permisos suficientes para configurarlo si Paula ya tiene ese secret/credencial administrado fuera del repo.

Despues de eso se debe rerun/re-ejecutar `CXOrbia RC Phase A DEV Root Deploy` y verificar que el paso `Verify DEV root URL` termine en success.

## Siguiente paso exacto

Pedir a Paula una decision unica:

`AUTORIZO_CONFIGURAR_SECRET_DEV` o `LO_CONFIGURO_YO`.

Si Paula elige `LO_CONFIGURO_YO`, entregar solo los pasos minimos de GitHub Settings > Secrets and variables > Actions para agregar `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`, sin pedir PowerShell.

## Estado seguro

Documentacion solamente. No cambia UI/core, no activa runtime, no importa, no escribe, no despliega, no produce y no usa datos sensibles.
