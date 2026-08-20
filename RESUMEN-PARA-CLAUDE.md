# RESUMEN-PARA-CLAUDE.md

**SYNC_EPOCH:** `CXORBIA-20260819-I5-PREPROD-CREATOR-BLOCKED-39`

## Estado único vigente

`I4_FROZEN_PASS__I5_2_PREPROD_PROJECT_CREATOR_AUTH_BLOCKED` — **85% formal / 15% pendiente**. I1–I4 están congelados. No generar nueva candidata, no reauditar y no reconstruir Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas, certificaciones o Academia.

## Producto funcional congelado

El source funcional que cerró I4 sigue siendo exactamente `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.

- Hosting DEV same-build: run `32328316954`, artifact `9392151808`, exact remote parity PASS.
- Staff/Admin provider-backed read-only: run `32329139725`, artifact `9392431939`, runtime Staff/Admin PASS.
- Shopper histórico: `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`; no reejecutar/resetear.
- Finanzas: mayo 44/44; junio 2/44 + 42 pendientes + Q451; `liquidada != pagada`.
- Multi-proyecto/no-code y Academia permanecen preservados.

## I5 PREPROD — resultado real

Paula autorizó un Firebase PREPROD nuevo/limpio + un único Hosting PREPROD de `f9802f...` + UAT read-only, sin merge/producción ni writes de negocio.

Ejecución consumida:
- run `32332125828`, job `96314651567`, artifact `9393386559`;
- target `cxorbia-preprod-20260819` inexistente;
- 1 intento de `projects:create`;
- 0 proyectos creados;
- 0 Hosting PREPROD deploys;
- 0 UAT;
- 0 writes.

Root cause:
- run `32332360361`, artifact `9393462199`: identidad DEV sin parent creator capability demostrable;
- run `32332788919`, job `96316503352`, artifact `9393599029`: `HOLD_I5_NO_EXISTING_CREATOR_ROUTE_AUTHENTICATES`;
- secrets creator dedicados ausentes;
- service account DEV autentica pero no tiene `resourcemanager.projects.create` demostrado.

## Frontera actual

`NARROW_PROVIDER_ADMIN_PROJECT_CREATOR_AUTH_REQUIRED`

No reintentar PREPROD con la identidad DEV. El próximo movimiento es exclusivamente habilitar una identidad de provisión con capacidad mínima de Project Creator en el parent correcto; cualquier IAM/service-account/key write requiere autorización específica separada.

Después de demostrar capability, se reemite la creación PREPROD bajo la autorización original y se ejecuta el único Hosting PREPROD + UAT read-only, sin volver a abrir I1–I4.

## Frontend / Claude

No existe tarea frontend nueva derivada de este bloqueo. No tocar `app/modules` ni `app/core` por asociación. La brecha histórica PDF/XLSX/PPTX de `modules/cliente-extra.js` sigue separada y no es la causa del HOLD PREPROD.

## Academia

Sin reconstrucción. I5 solo debe actualizar/publicar manuales o cursos si PREPROD/UAT demuestra una diferencia real de comportamiento.

## Seguridad

PREPROD projects creados: 0. Hosting PREPROD deploys: 0. UAT: 0. Auth/Firestore/Storage/HR/Make/Gemini/payment writes: 0. Merge: false. Producción: false.
