# COMPARACIÓN DE SHAS PHASE A — BLOQUE 2 C6 DEPLOY TÉCNICO

**Fecha:** 2026-08-03  
**Estado:** `PASS_11_LIVE_BLOBS_MATCH_C6_DEPLOYED_SOURCE_LOCK__VISUAL_COMPOSITION_STILL_PENDING`

## 1. Autoridad técnica

Source lock desplegado en el Hosting DEV existente:

`b908daa8c9cce0bd1c06cb05e3aceb9ff1b98beb`.

Ese build pasó, antes del STOP_RETRY final:

- source/static gates;
- paridad remota;
- HR viva;
- Staff;
- Shopper con identidad exacta y `ownVisits=1`;
- Cliente `tya/cinepolis`;
- modelo financiero delegado, localBilling false, regalía 0, Q60/L200.

Esta comparación demuestra identidad fuente con el deploy técnico. No sustituye la aprobación visual acumulativa.

## 2. Comparación exacta

| Archivo | Blob en source lock C6 | Blob vivo | Resultado | Decisión actual |
|---|---|---|---|---|
| `app/app.js` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/modules/midia.js` | `98d901850a437b029abac2ba3e569dc3a9543940` | `98d901850a437b029abac2ba3e569dc3a9543940` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/modules/historico.js` | `bf259b28e871bc6cea991f14ce5560323ef55f9e` | `bf259b28e871bc6cea991f14ce5560323ef55f9e` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/modules/reservas.js` | `ddc54bad9dfc7b242b06d39daf872c9f9b327c80` | `ddc54bad9dfc7b242b06d39daf872c9f9b327c80` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/modules/shoppers.js` | `df8dbfadabbc7f9a808da83d2a78225b7c5e6055` | `df8dbfadabbc7f9a808da83d2a78225b7c5e6055` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/modules/misvisitas.js` | `418da18fa2c6c30780719e2fc1d9c72e84fd5d20` | `418da18fa2c6c30780719e2fc1d9c72e84fd5d20` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/modules/cert.js` | `5532109dec5c942c2fa6d520ad0a7e0b7b104034` | `5532109dec5c942c2fa6d520ad0a7e0b7b104034` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/modules/cuestionario-shopper.js` | `a9801776eda4b52d447abaf20c28e2bf4290930d` | `a9801776eda4b52d447abaf20c28e2bf4290930d` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/modules/beneficios.js` | `73e200e57530479637792c89c644fcfdf78b6799` | `73e200e57530479637792c89c644fcfdf78b6799` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/modules/finanzas.js` | `623fab9ba1e06c39f83beda610bb771e23910a07` | `623fab9ba1e06c39f83beda610bb771e23910a07` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/core/finanzas-core.js` | `6d3f46f003f3319f96cfd759b8b5ed52afc6a125` | `6d3f46f003f3319f96cfd759b8b5ed52afc6a125` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/core/liquidacion.js` | `dde322890eb8821b822215905b82a22102d73d2c` | `dde322890eb8821b822215905b82a22102d73d2c` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |
| `app/modules/cliente.js` | `4e5981081bdd01de368c4f412ed476244426634e` | `4e5981081bdd01de368c4f412ed476244426634e` | EXACTO | `PRESERVAR_C6_DEPLOYED_SHA` |

El título del estado se mantiene conservador aunque la tabla contiene trece comparaciones exactas; ninguna se convierte automáticamente en aprobación humana final.

## 3. Dictamen

No existe evidencia de que estos archivos hayan sido reemplazados después del deploy C6 por versiones anteriores o paralelas.

Por tanto:

- no deben restaurarse desde M1/V174/V182 por memoria;
- no deben reescribirse para “recuperarlos”;
- deben preservarse mientras se prueba la composición completa;
- los defectos restantes deben buscarse en dependencias, overlays, navegación, fuente, report kit o integración entre módulos.

## 4. Qué sigue sin demostrarse

- que Portal Cliente, Reportes y Finanzas estén compuestos con el mejor resultado visual aprobado, no solo presentes;
- que todos los perfiles vean la navegación completa;
- que reportes Admin/Cliente/Shopper compartan periodo/sourceRevision/alcance;
- que `operacion-extra.js` y `cliente-extra.js` produzcan todas las exportaciones aprobadas sin regresión;
- que el build acumulativo completo esté libre de overlays que alteren módulos después del render;
- que Revisión Admin, detalle de visita, Documentos y Costos correspondan a su mejor linaje.

## 5. Próximo subbloque

- recuperar autoridad de Corte 3/V182 y fixes focales financieros;
- recuperar source locks de Revisión Admin, detalle, Documentos, Costos y Portal/Reportes;
- cerrar clasificación de las filas restantes;
- construir manifest final de composición, no solo inventario.

## 6. Estado seguro

- cambios funcionales: 0;
- deploy: 0;
- provider writes: 0;
- merge: false;
- producción: intacta.
