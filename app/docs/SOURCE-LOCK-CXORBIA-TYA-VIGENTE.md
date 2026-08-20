# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-I4-PROTECTED-RUNTIME-CLOSED-38`

## Destino canónico

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR: `#7` existente, draft/open/no merge
- Ref documental/operativa: HEAD vivo de la rama; no `main`, no nueva rama, no nuevo PR.

## Source lock funcional de I4

El producto funcional validado y materializado en Hosting DEV es exactamente:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

La evidencia de Hosting DEV es run `32328316954`, artifact `9392151808`, `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`.

Los commits posteriores hasta el cierre técnico previo a documentación (`8831723a4cf3e656b3dddd1ed5c72b45f0dc2ec8`) solo cambian los dos requests/gates consumidos; la comparación contra `f9802f...` contiene **0 cambios en `app/`**. Los commits posteriores de este epoch son documentación de cierre I4 y tampoco autorizan cambio funcional.

## Runtime probado

- Staff/Admin provider-backed read-only: run `32329139725`, artifact `9392431939`, `PASS_READONLY_POST_GATES` y `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`.
- Shopper real: checkpoint histórico `PASS_I3_HISTORICAL_SHOPPER_LOGIN_AFTER_EXACT_RECOVERY` reutilizado sin reproceso, reset ni cambio de blobs protegidos.
- Finanzas: `app/data/tya-payment-history-source-safe.js` conserva blob `088c68680177c470a4539622e1694128dd211d85`; mayo 44/44; junio 2/44 + 42 pendientes + Q451; `liquidada != pagada`.
- Multi-proyecto/no-code, documentos, reservas, certificaciones y Academia permanecen preservados; Cinépolis sigue siendo proyecto configurable.

## Fuentes con autoridad actual

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
2. `app/docs/EXECUTION-STATE-CXORBIA-TYA-VIGENTE.md`
3. `app/docs/SOURCE-LOCK-CXORBIA-TYA-VIGENTE.md`
4. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
5. `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`
6. `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
7. `app/docs/ACADEMIA-ADDENDUM-I4-PROTECTED-RUNTIME-CLOSE-20260819.md`
8. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`
9. PR #7 y HEAD vivo como evidencia ejecutable/documental.

Los checkpoints antiguos sirven como evidencia histórica, no como instrucción para retroceder la frontera.

## Regla de I5

I5 debe partir de esta misma build/source lock funcional. No se cambia candidata ni se modifica producto por FAIL de workflows legacy/stale sin evidencia reproducible de P0.

Cualquier deploy PREPROD o PRODUCCIÓN requiere autorización específica. La preparación read-only de I5 no modifica este source lock funcional.

## Seguridad

Este source lock registra 1 deploy DEV ya autorizado/consumido. No autoriza segundo deploy DEV, PREPROD, producción, merge, import real, provider writes, HR/Auth/Firestore/Storage writes, Make/Gemini ni pagos.
