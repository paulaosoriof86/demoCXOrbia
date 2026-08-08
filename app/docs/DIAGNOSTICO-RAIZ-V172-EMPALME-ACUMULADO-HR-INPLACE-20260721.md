# Diagnóstico raíz V172 — empalme acumulado incompleto + HR viva sin recarga

Fecha: 2026-07-21
Estado: `VISUAL_NO_GO_FIX_PACKAGE_READY`

## Identidad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- `HEAD_BEFORE` debe resolverse al ejecutar desde `origin/docs-tya-v6-v71-audit`.
- Commit runtime V172 parcial que debe permanecer como ancestro: `0ca607f430ac97ca022687419df688bccfd66e19`.
- Candidata: `Prototype development request CXOrbia V172.zip`.
- SHA-256 candidata: `2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5`.

## Evidencia visual reproducible

Paula confirmó en URL pública e incógnito:

- `Conectado · Degradado` en Admin, Cliente y Shopper;
- KPI y Liquidaciones con una revisión anterior de la HR;
- recargas frecuentes con pantalla blanca;
- Reportes Admin todavía sin las mejoras aprobadas;
- Reportes Cliente sin el diseño/gráficas ya incorporados en la candidata;
- Shopper sin `Mis Reportes`.

No se atribuye este estado a caché del navegador.

## Causa raíz 1 — empalme acumulado incompleto

El commit V172 aplicó únicamente los cuatro archivos de la ronda V172 contra V171b:

- `app/app.js`;
- `app/modules/midia.js`;
- `app/modules/misvisitas.js`;
- `app/modules/reservas.js`.

V171b no estaba empalmada previamente. Por tanto quedaron fuera 14 archivos acumulados de V165–V171. Se comparó el Git blob SHA del HEAD vivo contra la candidata V172 completa y los 14 difieren:

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

Esto explica el retorno de `window.print()` sobre la página, CSV presentado como Excel, métricas sintéticas, ausencia de `mireportes` y pérdida de diseño/gráficas.

## Causa raíz 2 — mecanismo HR vivo incorrecto

El runtime desplegado tenía tres defectos:

1. `fresh=1` no omitía el TTL: el servidor devolvía cache si aún estaba dentro de `CACHE_MS`.
2. El watcher solo comparaba metadatos y ejecutaba `location.reload()` cuando cambiaba la revisión.
3. Un segundo trigger repetía la comprobación cada 15 segundos.

Consecuencia: información anterior presentada como live, pantalla blanca, pérdida de contexto y estado `degraded`.

## Solución técnica preparada por backend

Paquete local:

`PAQUETE_EJECUCION_CODEX_CXORBIA_V172_HR_INPLACE_20260721.zip`

SHA-256 final:

`eaadd16ef78539bfd45c60ad8eed9dc0507a385b80583640fb3f1666f4f9eb15`

Incluye:

- los 14 archivos acumulados exactos de V172;
- `server.mjs` con `fresh=1` que omite TTL;
- adapter nuevo `tya-live-source-inplace-apply.js`;
- proyección Corte 1 reconstruible por revisión;
- watcher sin `location.reload()`;
- fast trigger sin intervalo duplicado;
- build R22 con orden de scripts in-place;
- gate `tya-live-hr-inplace-refresh-gate.mjs`.

Gate local ejecutado:

`PASS_TYA_LIVE_HR_INPLACE_REFRESH_GATE`

Comprobó:

- cero recarga de documento;
- `fresh=1` omite TTL;
- snapshot sustituido en memoria;
- proyección reconstruida;
- revisión compartida;
- re-render mediante el bus existente.

Los 21 JS/MJS incluidos pasan `node --check`.

## División de responsabilidades

- ChatGPT/backend: diagnóstico, arquitectura, archivos exactos, paquete y gates.
- Codex: únicamente aplicar `files/`, crear un commit/push atómico, ejecutar gates, desplegar DEV y devolver evidencia.
- Claude: no interviene en este bloque.

## Siguiente bloque exacto

`CODEX RESUELVE HEAD_BEFORE ACTUAL → VERIFICA ANCESTRO 0ca607f → APLICA PAQUETE EXACTO → COMMIT/PUSH ATÓMICO → MANIFEST/BUILD-LOCK/VERIFICADOR → CLOUD RUN DEV + HOSTING DEV → CAMBIO HR YA EXISTENTE REFLEJADO IN-PLACE → VALIDACIÓN VISUAL ADMIN/CLIENTE/SHOPPER`

## Estado seguro

Sin merge, producción, escrituras HR/Firestore/Auth/Storage, Make/Gemini live ni pagos.