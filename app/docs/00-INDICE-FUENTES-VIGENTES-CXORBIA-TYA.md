# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`  
**Estado:** `SOURCE_TRUTH_SYNCHRONIZED__NO_MODULE_REBUILD__I4_RUNTIME_CONVERGENCE_REQUIRED__FORMAL_60_40`

Orden obligatorio: Execution State → Source Lock → Checkpoint → Plan Unificado/Addendum → Plan Lock → CAMBIOS/RESUMEN/PENDIENTES → tracker → evidencia activa → PR #7/HEAD/delta. Sigue vigente `ADDENDUM-MAESTRO-PRIORIDAD-GO-LIVE-FINANZAS-ANTES-MAKE-20260819.md`.

## CONTINUITY_FAST_PATH — NO RECONSTRUCCIÓN
No reabrir ni reconstruir I1/I2/I3/I4-A/I4-B, Finance V2/historical, multi-proyecto/no-code, módulos Shopper, certificación, documentos, reservas ni Academia por defecto. Los módulos y contratos existen; el problema de salida no es ausencia general de funcionalidad sino convergencia del runtime protegido y prueba visible con datos/identidades reales.

## Porcentaje — interpretación obligatoria
I1 `15/15`; I2 `20/20`; I3 `25/25 FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% formal / 40% pendiente**.

Este 60% es **score del plan**, no porcentaje de funcionalidad construida ni prueba de estar listo para producción. El lock no permite puntuar I4 parcialmente. Si I4 cierra con runtime real + validación visible, el score salta directamente a **85%**; I5 preproducción/go-live lleva a **100%**. No usar nuevamente `60% listo para producción` como sinónimo de readiness.

## Hallazgo forense vigente — por qué un artefacto completo pudo verse incompleto
El HEAD vivo contiene módulos, adapters y contratos ya trabajados, pero existen rutas de validación distintas que no prueban lo mismo:

1. `app/index.html` y su visual smoke validan principalmente el artefacto/demo. Un PASS allí no demuestra Auth real, claims, identidad protegida ni datos provider-backed.
2. El antiguo carril source-safe/R18D trabaja deliberadamente con referencias protegidas y no debe mostrar perfiles Shopper completos. En el run vigente observó 217 shoppers como `protectedReferenceShoppers`.
3. El runtime real que debe certificar Phase A es `app/index-backend-dev.html`: Auth → claims/membership → identidad exacta → perfil protegido → HR viva → overlays canónicos → `CX.data` → módulos.
4. Finanzas ya está construida y cableada en ese runtime. El problema histórico fue que rutas/gates viejos podían seguir viendo el overlay financiero anterior (`paidConfirmed:0`) en vez de la verdad histórica canónica posterior. No reconstruir Finanzas; validar la composición canónica en el runtime protegido.
5. Hay gates antiguos con expectativas congeladas (por ejemplo 616 visitas) mientras la lectura HR actual del mismo run produjo 15 periodos, 659 visitas y 217 shoppers. Esos fallos se clasifican como drift de gate/expectativa hasta demostrar regresión del producto.

## Bloques ya reutilizados/cerrados
- I4-C: source readiness HR↔plataforma suficiente para Phase A inicial; Make/HR runtime diferido y no bloqueante según addendum vigente.
- I4-D: `PASS_I4D_FINANCE_EXISTING_CXDATA_REUSE_CONFIRMED`. No reconstruir ni recablear Finanzas. Verdad histórica: Mayo 44/44 pagadas; Junio 2/44 pagadas, 42 pendientes, Q451 confirmados; `liquidada != pagada`.
- I4-E: `PASS_I4E_MULTI_PROJECT_NO_CODE_REUSE_AND_CONTRACT_ALIGNMENT`. Cinépolis permanece proyecto configurable por `tenantId + projectId`.

## Frontera viva exacta
`I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E`

No abrir I4-F Academia como prioridad mientras no se cierre esta convergencia. Academia ya existe y solo requerirá alineación final posterior.

### Criterios para cerrar I4
- Shopper real autenticado: identidad exacta, perfil autorizado, histórico, certificaciones presentadas y beneficios/pagos correctos en pantalla.
- Admin real: Auth/claims/membership correctos; lectura de Shoppers con identidad autorizada y acciones Phase A persistibles solo por command/provider ACK. Sin bypass.
- Finanzas en runtime protegido: Mayo 44/44; Junio 2/44 + 42 pendientes + Q451; ninguna inferencia `liquidada=pagada`.
- Mismo `CX.data` canónico consumido por módulos; cero fallback silencioso a demo/source-safe viejo.
- Gates de conteos derivados de la fuente actual, no hardcodes históricos; distinguir drift de gate de P0 real.
- Validación visible E2E en el mismo build protegido antes de congelar I4.

## Después de I4
I4-F Academia/alineación final dentro del cierre I4 → score formal **85%** → I5 preproducción, misma build, UAT/seguridad/gates, autorización de deploy/producción → **100%**.

Make/Gemini runtime y ejecución bancaria de pagos continúan fuera del bloqueo inicial. 0 deploy/merge/producción por esta sincronización documental.