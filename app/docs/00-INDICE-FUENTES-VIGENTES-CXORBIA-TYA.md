# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-14 10:42 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__ITERATION_1_SOURCE_ONLY_PASS__GO_LIVE_15__ITERATION_2_NEXT`

## 1. Lectura obligatoria y prevalente

1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
8. `AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
9. `ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`
10. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
11. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD de la rama viva.

## 2. Decisión vigente

La auditoría forense del 14-ago y el plan durable prevalecen sobre cualquier lectura previa de “candidata lista para producción” o porcentajes M1–M10.

Toda corrección continúa sobre `docs-tya-v6-v71-audit` / PR #7. No nueva candidata, rama, PR ni reauditoría general sin drift/P0 nuevo reproducible.

Cinépolis es el primer proyecto configurable de TyA, no lógica global. Los patrones corregidos deben ser multi-tenant/multi-proyecto y reutilizables para el prototipo/no-code.

## 3. Iteración 1 — cerrada

`ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION` = PASS.

Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`.

Evidencia: workflow existente `CXOrbia Phase A Live Execution Checkpoint`, run `31820315435`, SUCCESS.

Cerrado:

- Auth owner protegido efectivo en `core/backend-browser-auth.js`, sin reconstruir Auth;
- bypass DEV Shopper neutralizado solo en ruta humana protegida;
- Finance v2 por runtime contract, no hostname;
- command adapter reusable fail-closed creado;
- contrato alta/edición Shopper persistente creado;
- HR writer reusable gated/idempotente creado;
- verificador de Iteración 1 creado;
- verificador operativo obsoleto corregido para autoridad forense actual.

Provider writes/deploy/producción: 0.

## 4. Porcentaje vigente

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

**GO-LIVE: 15% completado / 85% pendiente.**

Pesos: I1 15 / I2 20 / I3 25 / I4 25 / I5 15. El porcentaje solo avanza al cerrar el gate de cada iteración.

## 5. Siguiente acción exacta

`ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION`

Objetivo: conectar las mutaciones Phase A existentes de `CX.data` al command adapter, eliminar fallback local/localStorage productivo y false-success, mantener writes cerrados y ejecutar regresión transversal + prueba source-safe multi-tenant/multi-proyecto.

P0 frontend focalizado todavía visible: `app/modules/misvisitas.js` debe pasar de `find()`/estados literales a listas completas/facets canónicas sobre la misma candidata, sin rediseño y con éxito dependiente de provider ACK.

## 6. Gates

Source-only puede avanzar. Auth/Firestore/HR/Make/Storage writes, cambios de credenciales, deploy, merge y producción solo con autorización/gate específico correspondiente.
