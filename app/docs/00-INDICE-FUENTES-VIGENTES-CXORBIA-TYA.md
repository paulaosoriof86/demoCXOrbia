# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-14 09:00 -06:00  
**Estado vivo:** `FORENSIC_ROOT_CAUSE_LOCKED__PRODUCTION_BLOCKED__CORRECTION_EXECUTION_NEXT`

## 1. Lectura obligatoria y prevalente

1. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
2. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
3. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
4. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
5. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
6. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
8. `AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
9. `CAMBIOS-BACKEND.md`, `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR #7 y HEAD de la rama viva.

## 2. Decisión vigente

La auditoría forense integral del 14-ago reemplaza cualquier lectura previa de “candidata lista para producción”. Producción está bloqueada por causas raíz compartidas de release integrity, Auth/identity, persistencia, Shopper workspace, Finance activation y separación read/write.

No pedir a Paula otra visualización del build anterior. No nueva candidata, rama, PR ni auditoría general sin drift reproducible.

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

Detalles y evidencia: `app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`.

## 4. Siguiente acción exacta

`ROOT_CAUSE_CORRECTION_EXECUTION_S1_S6`

1. Canonicalizar Auth/runtime y retirar bypass/owners redundantes.
2. Pasar todas las mutaciones CX.data a adapter canónico; cero mutación local/false-success.
3. Alta/edición Shopper persistente con Auth + claims + membership + profile/crosswalk.
4. HR write real gated/idempotente, conservando HR live como autoridad de lectura.
5. Finance v2 por runtime contract, no hostname.
6. Deploy exacto + E2E real Admin/Ops/Shopper histórico/Shopper nuevo/Cliente + persistencia/reload/new-tab.

## 5. Gates

Source-only puede avanzar. Auth/Firestore/HR/Make writes, deploy, merge y producción solo con autorización/gate específico correspondiente.
