# RESUMEN-PARA-CLAUDE.md

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Estado único

El plan vigente sigue siendo `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`, versión `1.0.0`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.

I1–I4, R1–R4, G1 y G2-A permanecen PASS/FROZEN. G2-B no se ejecuta mientras F0 RC15 continúe.

## RC15 F0 — avance material

La matriz canónica alcanza **110 hallazgos clasificados**. Se han descubierto acumulativamente **25 HOLD/P0**; `RC15-CP-093` está contenido y quedan **24 HOLD residuales**.

El avance de exhaustividad es medible: **2 de 4 flags ya están cerrados**.
- todos los workflows de la unión HEAD vivo + rama base están clasificados: 105/105;
- todos los `workflow_dispatch` de esa unión están clasificados;
- `.github/cxorbia-firebase-requests` está mapeado 33/33;
- todavía faltan cerrar globalmente requests dispersos y provider-write entrypoints.

Nuevo HOLD `RC15-CP-108`: el request histórico VIS02B aún expresa `enabled=true` y un presupuesto de 1 Hosting DEV, mientras el executor nominal está inerte y declara consumo. No hay deploy ejecutable por ese workflow actual, pero sí una contradicción de autoridad que F1/F2 deben eliminar.

Nuevos no-HOLD: CP107 (read-only de identidad de service account en rama base), CP109 (C6 V1 consumed/STOP_RETRY) y CP110 (I3 shopper write consumed/STOP_RETRY).

## Claude/prototipo

No hay tarea frontend nueva en este bloque. No modificar `/app/modules`, `/app/core` ni UI por este tramo. Ningún cambio funcional del prototipo fue realizado.

Si una fase posterior demuestra un P0 frontend, se documentará por archivo/módulo y se aplicará el lock de empalme vigente, no un rediseño backend.

## Academia

Sin cambio funcional. Se preserva el requisito de revisar Academia, manuales, cursos, rutas por rol y notificaciones en las fases posteriores de readiness/postproducción.

## Siguiente

`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`: inventariar `backend/config`, `backend/requests`, execute markers, ledgers, aliases y provider-write entrypoints hasta llevar la exhaustividad de 2/4 a 4/4. F1/F2 siguen después; G2-B permanece bloqueado.
