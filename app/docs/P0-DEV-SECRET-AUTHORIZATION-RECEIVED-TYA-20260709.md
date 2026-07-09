# P0 DEV secret authorization received TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Autorizacion recibida

Paula autorizo: `AUTORIZO_CONFIGURAR_SECRET_DEV`.

## Intento de ejecucion

Se reviso la disponibilidad de herramientas conectadas para configurar repository secrets de GitHub Actions.

Resultado: no hay accion disponible en el conector actual para crear o actualizar secrets de GitHub Actions ni para cargar credenciales Firebase externas.

## Bloqueador residual

Aunque la autorizacion esta registrada, la configuracion del secret no puede ejecutarse desde esta conversacion con las herramientas disponibles.

Secret requerido:

`FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`

Valor requerido: JSON de service account del proyecto Firebase DEV `cxorbia-backend-dev`.

## Regla de seguridad

El JSON del service account no debe pegarse en ChatGPT, no debe subirse al repo y no debe quedar en documentos.

Debe almacenarse solo como GitHub Actions repository secret.

## Accion manual unica necesaria

Agregar el repository secret en GitHub:

- Repo: `paulaosoriof86/demoCXOrbia`
- Secret name: `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`
- Secret value: JSON completo del service account Firebase DEV `cxorbia-backend-dev`

Despues, re-ejecutar el workflow `CXOrbia RC Phase A DEV Root Deploy`.

## Estado seguro

Documentacion solamente. No cambia UI/core, no activa runtime, no importa, no escribe, no despliega, no produce y no usa datos sensibles.
