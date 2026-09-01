# ACADEMIA — ADDENDUM I5 PROVIDER USER-AUTH ROOT CAUSE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-PROVIDER-USER-AUTH-ROUTE-REQUIRED-41`

## Impacto Academia

Sin cambio funcional en Academia.

I1–I4 permanecen `PASS/FROZEN` sobre `f9802fdd498934a8e7729fa5c7d18341bec1cd71`. La causa raíz cerrada en este bloque pertenece exclusivamente al control-plane de aprovisionamiento PREPROD y no modifica cursos, rutas por rol, manuales, contenidos, certificaciones, notificaciones ni comportamiento frontend de Academia.

## Estado PREPROD

PREPROD todavía no existe. No presentar `cxorbia-preprod-20260819` ni su URL planificada como entorno materializado.

El bloqueo vigente es:

`PROVIDER_USER_AUTH_PROJECT_CREATION_ROUTE_REQUIRED`

La siguiente transición es `USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`. Después de que el proyecto exista y antes del único Hosting, deberá resolverse por gate separado la identidad mínima de deploy PREPROD.

## Seguridad

0 PREPROD projects created, 0 PREPROD Hosting deploys, 0 UAT, 0 IAM writes, 0 cambios funcionales de Academia, 0 merge y 0 producción.
