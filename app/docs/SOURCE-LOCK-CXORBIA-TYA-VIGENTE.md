# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-IAM-AUTH-GRANTED-ROUTE-BLOCKED-40`

## Destino canónico

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR: `#7` existente, draft/open/no merge
- Ref documental/operativa: HEAD vivo de la rama; no `main`, no nueva rama, no nuevo PR.

## Source lock funcional

El producto funcional validado y autorizado para PREPROD sigue siendo exactamente:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

Ningún intento I5 cambió ese source ni desplegó otro producto. Los commits I5 posteriores son QA/request/documentación; no autorizan sustituir la build congelada.

## Evidencia I4 preservada

- Hosting DEV: run `32328316954`, artifact `9392151808`, exact remote parity PASS.
- Staff/Admin: run `32329139725`, artifact `9392431939`, runtime provider-backed read-only PASS.
- Shopper: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`, sin reproceso.
- Finanzas: blob `088c68680177c470a4539622e1694128dd211d85`; mayo 44/44; junio 2/44 + 42 pendientes + Q451; `liquidada != pagada`.

## I5 PREPROD — sin materialización aún

Target reservado por el gate: `cxorbia-preprod-20260819`.

- run de creación `32332125828`: 0 proyectos creados, 0 Hosting deploys, 0 UAT;
- root cause run `32332360361`: no pudo demostrar parent Project Creator capability para la identidad DEV;
- creator-route run `32332788919`: dedicated/alternate creator secrets ausentes en ese run; la identidad DEV autenticó pero sin capacidad de `resourcemanager.projects.create` demostrada.

Por tanto **no existe source lock PREPROD materializado todavía**. No presentar una URL planificada como entorno existente.

## IAM mínimo — autorización vigente

La autorización administrativa mínima para resolver Project Creator ya fue recibida y permanece vigente. Autoriza reutilizar una identidad separada existente y otorgar solo la capacidad mínima necesaria para crear `cxorbia-preprod-20260819`, sin crear service account/key ni conceder privilegios adicionales.

No existe evidencia terminal posterior de un IAM write ejecutado bajo esa autorización. No debe solicitarse nuevamente ni declararse consumida.

## Regla de continuación

Frente vigente: `I5_2_PREPROD_PROJECT_CREATOR_AUTH_GRANTED_EXECUTION_ROUTE_BLOCKED`.

Gate técnico:

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_GRANTED__PROVIDER_EXECUTION_ROUTE_UNAVAILABLE`

El carril conectado actual no expone un control-plane Google Cloud/Firebase IAM provider-admin. El preflight existente es read-only y no puede efectuar el grant. No se reintenta creación con la identidad DEV, no se crea una key y no se inventa una nueva identidad.

Cuando una ruta provider-admin quede conectada y verificable, la misma autorización vigente permite ejecutar el grant mínimo, probar `resourcemanager.projects.create` y continuar inmediatamente con el PREPROD original: proyecto limpio `cxorbia-preprod-20260819` → un único Hosting de `f9802f...` → UAT read-only.

## Seguridad

0 PREPROD projects created, 0 PREPROD deploys, 0 PREPROD UAT, 0 IAM writes bajo la autorización nueva, 0 provider business-data writes, 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes, 0 merge y 0 producción.