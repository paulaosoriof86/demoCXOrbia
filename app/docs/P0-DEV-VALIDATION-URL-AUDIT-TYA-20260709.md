# P0 DEV validation URL audit TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Corregir el bloqueo detectado por Paula: no se habia entregado una URL de validacion visible, por lo tanto no correspondia pedir smoke humano ni avanzar a GO DEV como si Paula pudiera revisar cambios.

## Hallazgo principal

Existe una URL DEV prevista por configuracion/workflow, pero el deploy del head actual no quedo exitoso. Por lo tanto, la URL no debe tratarse como validacion actual aprobada.

URL DEV prevista por workflow/configuracion: `https://cxorbia-backend-dev.web.app`

Estado actual: `not_verified_for_current_head`.

## Evidencia revisada

- `firebase.json` publica carpeta `app` y usa hosting target `cxorbia-dev`.
- `.firebaserc` usa proyecto default/dev `cxorbia-backend-dev` y mapea target hosting `cxorbia-dev` al sitio/proyecto `cxorbia-backend-dev`.
- El workflow del head actual expone `CXORBIA_DEV_ROOT_URL=https://cxorbia-backend-dev.web.app`.
- El workflow `CXOrbia RC Phase A DEV Root Deploy` fallo.
- En ese workflow, `Predeploy gate` y `Drift gate` pasaron, pero `Secret availability check` fallo.
- Por ese fallo, `Deploy Hosting DEV root` y `Verify DEV root URL` quedaron skipped.
- No hay artefactos disponibles en ese run.

## Decision operativa

No se debe pedir smoke humano hasta que exista una URL verificada del head actual o un entorno local/preview equivalente confirmado.

No se debe usar produccion para validar este PR.

Produccion sigue reservada para la plataforma actual hasta aprobacion final.

## Bloqueador actual

P0: `dev_validation_url_not_verified_for_current_head`.

Causa inmediata: deploy DEV root bloqueado por `Secret availability check`.

## Que se puede hacer sin Paula

- Documentar el bloqueo.
- Confirmar configuracion de hosting en repo.
- Confirmar que el workflow intento usar una URL DEV.
- Confirmar que no hay deploy verificado para el head actual.
- Preparar el siguiente paso exacto sin pedir rutas alternativas.

## Que podria requerir Paula

Solo si se va a desbloquear la URL DEV:

1. Autorizar un deploy DEV/preview, no produccion.
2. Confirmar o agregar el secret requerido por el workflow en GitHub Actions/Firebase, si no esta disponible.

No se debe pedir HR, reglas, shoppers, certificaciones, pagos ni datos operativos para este bloqueo.

## Siguiente paso recomendado

Preparar bloque P0 de desbloqueo de URL DEV:

- identificar secret requerido si el workflow lo expone en logs o YAML;
- si no se puede ver el secret desde el conector, pedir a Paula una unica accion concreta en GitHub Settings/Secrets o autorizacion para que Codex lo configure si tiene permisos;
- volver a correr deploy DEV root;
- verificar URL DEV;
- solo entonces pedir smoke humano.

## Estado seguro

Documentacion solamente. No cambia UI/core, no activa runtime, no importa, no escribe, no despliega, no produce y no usa datos sensibles.
