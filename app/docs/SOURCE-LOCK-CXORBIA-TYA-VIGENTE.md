# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`

## Destino canónico

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR: `#7` existente, draft/open/no merge
- Ref documental/operativa: HEAD vivo de la rama; no `main`, no nueva rama, no nuevo PR.

## Source lock funcional

El producto funcional validado y autorizado para PREPROD sigue siendo exactamente:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

Ningún intento I5 cambió ese source ni desplegó otro producto. Los commits I5 posteriores son QA/workflow/request/documentación; no autorizan sustituir la build congelada.

## Evidencia I4 preservada

- Hosting DEV: run `32328316954`, artifact `9392151808`, exact remote parity PASS.
- Staff/Admin: run `32329139725`, artifact `9392431939`, runtime provider-backed read-only PASS.
- Shopper: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`, sin reproceso.
- Finanzas: blob `088c68680177c470a4539622e1694128dd211d85`; mayo 44/44; junio 2/44 + 42 pendientes + Q451; `liquidada != pagada`.

## I5 PREPROD — sin materialización aún

Target reservado por el gate: `cxorbia-preprod-20260819`.

- run de creación `32332125828`: 0 proyectos creados, 0 Hosting deploys, 0 UAT;
- root cause run `32332360361`: no pudo demostrar parent Project Creator capability para la identidad DEV;
- creator-route run `32332788919`: dedicated/alternate creator secrets ausentes; la única identidad presente es la DEV, autenticada pero sin capacidad de `resourcemanager.projects.create` demostrada.

Por tanto **no existe source lock PREPROD materializado todavía**. No presentar la URL planificada como entorno existente.

## Regla de continuación

Frente vigente: `I5_2_PREPROD_PROJECT_CREATOR_AUTH_BLOCKED`.

No reintentar creación hasta demostrar una identidad con capacidad mínima Project Creator. Cualquier IAM write, creación de service account/key o cambio de parent requiere autorización explícita separada.

Una vez resuelto el capability gate, el deploy PREPROD debe usar exclusivamente `f9802f...`, exactamente una vez, con Hosting-only + UAT read-only conforme a la autorización vigente.

## Seguridad

0 PREPROD projects created, 0 PREPROD deploys, 0 PREPROD UAT, 0 provider business-data writes, 0 Auth/Firestore/Storage/HR/Make/Gemini/payment writes, 0 merge y 0 producción.
