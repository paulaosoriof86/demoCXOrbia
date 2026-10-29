# CXOrbia Recovery I3 — recibo focal B11/B12/E06 — 2026-10-29

**Estado:** `SOURCE_FIXED_LOCAL_QA_PASS__CANONICAL_CI_AND_DEV_E2E_PENDING`  
**Modalidad:** source-only; sin cambios en datos ni proveedores.  
**Rama única:** `recovery/cxorbia-phase-a-20260831`  
**Predecesor confirmado por lectura remota:** `5957646a71140448ddc59d26766773d79cf6d943`  
**Ámbito:** B11 (paridad KPI y período), B12 (histórico), E06 (cliente y proyectos). Gate I3, Gate20 y Gate21 continúan en `HOLD`.

## Contraejemplos en la Preview autenticada anterior

- Dashboard octubre 2026: 36 realizadas de 44; Períodos octubre 2026: 9 realizadas de 44.
- Histórico: fila con 44 visitas mostraba países `—` y modal `Sin visitas` al filtrar con `projectId===periodId`.
- Clientes: 17 períodos presentados como 17 proyectos y 0 visitas, frente a Proyectos: 1 proyecto, 17 períodos, 748 visitas en total.

## Causa de código y cambio mínimo

1. `app/core/data.js` calcula `periodStats.done` mediante el mismo `visitBucketFns.realizadas` que usa Dashboard, incluyendo evidencia de fecha/facets incluso si el estado textual está desfasado.
2. `app/modules/historico.js` usa `data.recordPeriodId(v)` en las estadísticas/desglose, no `v.projectId` del negocio.
3. `app/modules/clientes.js` relaciona visitas por `recordPeriodId`; agrupa los períodos de un cliente bajo programas de negocio únicos al contar y presentar proyectos, sin fusionar/borrar períodos ni registros.
4. `app/modules/proyectos.js` filtra las visitas de configuración por `recordPeriodId`.

## Pruebas y límites

- QA sintética focal: **4 PASS / 0 FAIL**, `tools/qa/cxorbia-i3-period-project-client-parity.test.mjs`.
- Regresión de reportes VRM-289: **3 PASS / 0 FAIL**.
- Regresión de fuente HR G03: **3 PASS / 0 FAIL**.
- Adaptador portátil (fixture): **38 comprobaciones PASS**, sin escrituras a proveedor real.
- `git diff --check`: PASS; sintaxis Node de archivos cambiados: PASS.
- El antiguo `tya-phase-a-complete-composition-source-gate.mjs` reportó `FAIL` por diferencias con manifiestos F9/V6 históricos y un orden de carga posterior; **no representa source proof final vigente** y no se declara resuelto. Sus numerosos mismatches no se atribuyen automáticamente a este paquete.

**Pendiente para promover:** readback de commit/árbol/HEAD; CI canónica; pruebas autenticadas Admin y Shopper sobre la *nueva* candidata efectivamente servida y cotejo con HR externa viva. No marcar `MATCH` ni subir numerador 5/21 por pruebas de fixture. No reinterpretar estados de los períodos (actualmente faltan readbacks del proveedor); no cerrar ni archivar períodos por fecha sin autoridad. PDF autenticado D07 y fusión Stiven permanecen fuera de esta reparación y abiertos.

**Seguridad:** 0 modificaciones a PROD `tya-plataforma.web.app`, DEV live, Cloud Run, Firestore, Auth, IAM, Rules, HR, Storage, pagos, identidades o estados operativos; 0 fusiones y 0 despliegues en este paquete source-only. Las aprobaciones anteriores se preservan y sólo requieren revalidación en owners/dependencias afectados.
