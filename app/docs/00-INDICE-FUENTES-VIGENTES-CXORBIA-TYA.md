# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**SYNC_EPOCH:** `CXORBIA-20260819-I4-PROTECTED-RUNTIME-CLOSED-38`  
**Estado:** `I4_CLOSED_PASS__FORMAL_85_15__I5_PREPRODUCTION_READINESS_OPEN`

## Orden obligatorio vigente

1. `EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
2. `SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
4. `PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
5. addendum prevalente de empalme/carril file-aware y Plan Lock Phase A
6. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`, `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
7. `ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`
8. PR #7 y HEAD de `docs-tya-v6-v71-audit`

Sigue vigente `ADDENDUM-MAESTRO-PRIORIDAD-GO-LIVE-FINANZAS-ANTES-MAKE-20260819.md`.

## I4 — CERRADO / NO REPROCESAR

I1, I2, I3 e I4 quedan congelados. No volver a `CORTE_0B`, I3, otra candidata, otra auditoría general ni reconstrucción de Auth, Shopper, Finanzas, multi-proyecto, documentos, reservas o Academia.

**Score formal del plan:** I1 `15/15`; I2 `20/20`; I3 `25/25`; I4 `25/25`; I5 `0/15` = **85% formal / 15% pendiente**. Este porcentaje es avance del plan, no una declaración de producción.

## Evidencia terminal de I4

- Producto materializado en Hosting DEV: source exacto `f9802fdd498934a8e7729fa5c7d18341bec1cd71`.
- Hosting DEV one-shot: run `32328316954`, artifact `9392151808`, decisión `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`; 1 deploy DEV, paridad remota exacta y 0 writes de datos/proveedores.
- Staff/Admin same-build read-only: run `32329139725`, artifact `9392431939`, `PASS_READONLY_POST_GATES` + `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`.
- Shopper: se reutiliza el PASS real histórico congelado `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY`; no se reprocesó, no se seleccionó credencial Shopper y no hubo reset/write en el cierre I4. Los blobs protegidos verificados permanecieron sin cambio.
- Fuente viva observada por el runtime Staff: 15 periodos, 660 visitas y 200 shoppers vivos; el crosswalk exacto conserva 209 entradas protegidas. No se usan 616/216/44 como hardcodes de gate.
- Finanzas: `app/data/tya-payment-history-source-safe.js` tiene el mismo blob `088c68680177c470a4539622e1694128dd211d85` en el source desplegado y en la rama; mayo `44/44` pagadas; junio `2/44` pagadas, `42` pendientes, `Q451`; `liquidada != pagada`; 0 lotes ejecutables creados.
- Entre el source desplegado `f9802f...` y el HEAD de cierre previo a documentación `8831723a...` no hubo cambios en `app/`; solo estado de requests/gates. Por tanto no existe drift funcional que obligue a repetir Finanzas o Shopper.
- Los dos requests one-shot ejecutados quedaron persistidos como `consumed=true`, `enabled=false`; no se reintentan.

## Frontera viva

`I5_PREPRODUCTION_AND_GO_LIVE`

### Siguiente acción exacta sin nueva autorización

`I5_1_PREPRODUCTION_READINESS_AND_UAT_PLAN_READONLY`

1. congelar matriz de regresión transversal sobre la misma build;
2. verificar scopes/seguridad/rollback/checkpoint y datos limpios sin writes;
3. distinguir PASS vigentes de workflows legacy/stale para no perseguir falsos bloqueos;
4. preparar el gate PREPROD/UAT sin ejecutar deploy;
5. solicitar autorización específica únicamente cuando el siguiente paso real sea desplegar PREPROD o PRODUCCIÓN.

## Academia

I4 no exige reconstrucción. La alineación real de autoridad, identidad, HR/plataforma y Finanzas queda documentada en `ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`. En I5 solo se actualiza/publica contenido si PREPROD/UAT demuestra una diferencia real.

## Seguridad

I4 cerró con 1 deploy autorizado exclusivamente a Hosting DEV. Cierre documental: 0 segundo deploy, 0 merge, 0 producción, 0 provider/data/HR/Auth/Storage writes, 0 Make/Gemini y 0 ejecución bancaria.
