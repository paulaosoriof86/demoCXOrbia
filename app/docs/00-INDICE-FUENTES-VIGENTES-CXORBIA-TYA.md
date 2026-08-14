# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-14 11:20 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__ITERATION_2_CANONICAL_PERSISTENCE_PASS__SOURCE_READY_FOR_DEV_WRITE_GATES__GO_LIVE_35__ITERATION_3_NEXT`

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
10. `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
11. `GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`
12. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, PR #7 y HEAD de la rama viva.

## 2. Decisión vigente

La auditoría forense y el plan durable prevalecen sobre cualquier lectura previa de “candidata lista para producción” o porcentajes M1–M10.

Toda corrección continúa sobre `docs-tya-v6-v71-audit` / PR #7. No nueva candidata, rama, PR ni reauditoría general sin drift/P0 nuevo reproducible.

Cinépolis es el primer proyecto configurable de TyA, no lógica global. Los patrones corregidos deben ser multi-tenant/multi-proyecto y reutilizables para el prototipo/no-code.

## 3. Iteración 1 — PASS

`ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION`.

Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION1_SOURCE_ONLY`.

NO REPROCESO Auth. Se conservan el owner Firebase/Auth, exact identity, HR live/protected overlay, read models y evidencia previa.

## 4. Iteración 2 — PASS

`ITERACION_2_CANONICAL_PERSISTENCE_AND_TRANSVERSAL_REGRESSION`.

Marker: `PASS_ROOT_CAUSE_CORRECTION_ITERATION2_CANONICAL_PERSISTENCE`.

Cierre: `SOURCE_READY_FOR_DEV_WRITE_GATES`.

Evidencia: workflow existente `CXOrbia Phase A Live Execution Checkpoint`, run `31823098359`, **SUCCESS**.

Cerrado:

- `CX.data` conserva su interfaz pública y la mutación canónica queda detrás del command boundary;
- cero fallback local/localStorage productivo en runtime canónico;
- provider ACK obligatorio para éxito;
- tenant/project/role/shopper scope fail-closed;
- Shopper Admin separa datos protegidos y exige backend/cifrado;
- `Mis Visitas` P0 `find()`/estados literales cerrado con listas completas/facets canónicas y acciones ACK-aware;
- controles legacy direct-write aún no convertidos quedan fail-closed, no simulan persistencia;
- I2 source-safe multi-tenant/multi-proyecto PASS.

Provider writes/deploy/producción: 0.

## 5. Porcentaje vigente

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.

**GO-LIVE: 35% completado / 65% pendiente.**

Pesos: I1 15 PASS / I2 20 PASS / I3 25 / I4 25 / I5 15. El porcentaje solo avanza al cerrar el gate de cada iteración.

## 6. Siguiente acción exacta

`ITERACION_3_DEV_AUTH_FIRESTORE_SHOPPER_PERSISTENCE`

Objetivo: activar, con gate DEV explícito, persistencia provider real para alta/edición Shopper + Auth/claims/membership/profile/crosswalk, validar Shopper histórico y Shopper nuevo, y probar readback/reload/new-tab/segundo contexto sin reconstruir Auth ni adjudicar identidades por similitud.

## 7. Gates

I2 source-only está cerrado. I3 requiere autorización explícita de Auth/Firestore writes DEV. HR/Make/Storage/pagos, deploy, merge y producción permanecen bloqueados hasta sus gates correspondientes.
