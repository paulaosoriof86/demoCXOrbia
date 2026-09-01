# RESUMEN PARA CLAUDE — ADDENDUM I5 IAM AUTH GRANTED / PROVIDER ROUTE BLOCKED

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-IAM-AUTH-GRANTED-ROUTE-BLOCKED-40`

## Estado que Claude debe respetar

- I1–I4 permanecen `PASS/FROZEN`.
- Source funcional congelado: `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- Score formal: `85/100`.
- PREPROD todavía no existe.
- La autorización PREPROD sigue vigente.
- La autorización administrativa mínima para Project Creator ya fue recibida y no debe volver a solicitarse.
- No existe evidencia terminal de un IAM write posterior a esa autorización.

## Bloqueo actual

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_GRANTED__PROVIDER_EXECUTION_ROUTE_UNAVAILABLE`

Es un bloqueo de control-plane provider, no un defecto del frontend ni una regresión de Auth, Shopper, Finanzas, multi-proyecto o Academia.

## Qué NO debe modificar Claude

No crear candidata nueva, no tocar `/app/modules` ni `/app/core` por este bloqueo, no reconstruir autenticación, no ajustar Finanzas, no crear infraestructura alternativa y no asumir que PREPROD ya existe.

## Próxima transición

Cuando el carril provider-admin sea verificable, continuar con la autorización vigente: capability mínima → `cxorbia-preprod-20260819` limpio → único Hosting de `f9802f...` → UAT read-only.

## Impacto frontend

Ninguno en este bloque. No hay ajuste visual pendiente derivado de esta reconciliación.