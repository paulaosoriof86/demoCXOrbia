# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-14 10:08 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__DURABLE_GO_LIVE_PLAN_LOCKED__ITERATION_1_NEXT`

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
10. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR #7 y HEAD de la rama viva.

## 2. Decisión vigente

La auditoría forense integral del 14-ago reemplaza cualquier lectura previa de “candidata lista para producción”. El addendum de plan durable convierte esas causas raíz en una secuencia cerrada de cinco iteraciones base y prohíbe reprocesar Auth, crear otra candidata o reabrir diagnóstico general sin drift/P0 nuevo reproducible.

Toda corrección continúa sobre `docs-tya-v6-v71-audit` y PR #7. Cinépolis permanece como primer proyecto configurable del tenant TyA; los patrones corregidos deben ser multi-tenant, multi-proyecto y reutilizables para el prototipo/no-code.

## 3. Causas raíz canónicas

- `P0_RELEASE_INTEGRITY`
- `P0_AUTH_CONTROL_PLANE_FRAGMENTATION`
- `P0_IDENTITY_CONTROL_PLANE`
- `P0_PERSISTENCE_SPLIT_BRAIN`
- `P0_ADMIN_SHOPPER_PERSISTENCE_AND_CREDENTIAL_MODEL`
- `P0_FALSE_SUCCESS_IN_READONLY_RUNTIME`
- `P0/P1_SHOPPER_WORKSPACE_DATA_CONSUMPTION`
- `P0/P1_FINANCE_RUNTIME_ACTIVATION`
- `P1_HR_READ_OK_WRITE_PENDING`
- `PROCESS_ROOT_CAUSE`

Detalles/evidencia: `app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`.

Plan de ejecución durable: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`.

## 4. Siguiente acción exacta

`ITERACION_1_SOURCE_ONLY_ROOT_CAUSE_CONSOLIDATION`

Objetivo: preservar lo ya resuelto de Auth/HR/read models, consolidar un único control plane humano, preparar command adapter canónico CX.data, eliminar false-success, activar Finance por runtime contract y registrar los P0 frontend quirúrgicos sobre la misma candidata.

## 5. Gates

Source-only puede avanzar. Auth/Firestore/HR/Make writes, deploy, merge y producción solo con autorización/gate específico correspondiente.
