# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-21
Estado: `CORTE_1B_VISUAL_NO_GO_FIX_PACKAGE_READY`

## Estado comprobado

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline de seguridad: V161C/R21.
- V164 y Corte 1A integrados.
- Commit de aplicación parcial V172: `0ca607f430ac97ca022687419df688bccfd66e19`.
- Cloud Run DEV y Hosting DEV están desplegados, pero la validación visual es NO-GO.
- Corte 1 no está congelado.
- Corte 2 continúa bloqueado.

## Evidencia visual de Paula

En URL pública e incógnito:

- `Conectado · Degradado` en Admin, Cliente y Shopper;
- datos anteriores de HR en KPI y Liquidaciones;
- recargas frecuentes con pantalla blanca;
- Reportes Admin todavía con comportamiento anterior;
- Reportes Cliente sin diseño/gráficas aprobados;
- Shopper sin módulo `Mis Reportes`.

La causa actual no se atribuye a caché del navegador.

## Causa raíz 1 — empalme acumulado incompleto

El commit V172 aplicó solo:

- `app/app.js`;
- `app/modules/midia.js`;
- `app/modules/misvisitas.js`;
- `app/modules/reservas.js`.

Esos eran los cuatro archivos modificados entre V171b y V172. Como V171b no estaba empalmada, quedaron fuera 14 archivos acumulados V165–V171. La comparación por Git blob SHA confirmó diferencia en todos:

- `app/core/router.js`;
- `app/core/cliente-data.js`;
- `app/core/config.js`;
- `app/modules/operacion-extra.js`;
- `app/modules/cliente-extra.js`;
- `app/modules/integraciones.js`;
- `app/modules/novedades.js`;
- `app/modules/finanzas.js`;
- `app/modules/visitas.js`;
- `app/modules/dashboard.js`;
- `app/modules/crm.js`;
- `app/modules/cliente.js`;
- `app/modules/historico.js`;
- `app/modules/cliente-insights.js`.

## Causa raíz 2 — lectura HR con recarga

- `fresh=1` no omitía TTL.
- El watcher comparaba revisión y ejecutaba `location.reload()`.
- El fast trigger repetía el chequeo cada 15 segundos.
- La proyección de reportes no se reconstruía al sustituir el snapshot.

Consecuencia: snapshot anterior visible, pantalla blanca y estado degradado.

## Paquete correctivo preparado

- Archivo: `PAQUETE_EJECUCION_CODEX_CXORBIA_V172_HR_INPLACE_20260721.zip`.
- SHA-256: `46bb502d4422113b55517afbe8099dcd89da9ca330fe435b64ee16ec1d152d60`.
- Estado: `READY_FOR_CODEX_APPLY_ONLY`.

Incluye:

1. los 14 archivos acumulados exactos de V172;
2. `server.mjs` con lectura `fresh=1` que omite TTL;
3. adapter nuevo de aplicación in-place;
4. watcher sin recarga de documento;
5. trigger sin intervalo duplicado;
6. proyección Corte 1 reconstruible;
7. build R22 con orden correcto;
8. gate antirretroceso.

## Gates locales

- 21 JS/MJS: `node --check` PASS.
- `PASS_TYA_LIVE_HR_INPLACE_REFRESH_GATE`:
  - cero `location.reload()`;
  - fresh omite TTL;
  - snapshot aplicado en memoria;
  - proyección reconstruida;
  - revisión compartida;
  - re-render por bus existente.

## División de responsabilidades

- ChatGPT/backend: diagnóstico, archivos, arquitectura, paquete y gates — completado.
- Codex: aplicar exactamente `files/`, commit/push atómico, gates, DEV y evidencia.
- Claude: no interviene.

## Siguiente bloque exacto

`CODEX APPLY PACKAGE EXACTO → COMMIT/PUSH ATÓMICO → HEAD_AFTER → MANIFEST/BUILD-LOCK/VERIFICADOR → CLOUD RUN DEV + HOSTING DEV → CAMBIO HR YA EXISTENTE REFLEJADO SIN RECARGA → VALIDACIÓN VISUAL ADMIN/CLIENTE/SHOPPER`

## Estado seguro

Sin merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos.