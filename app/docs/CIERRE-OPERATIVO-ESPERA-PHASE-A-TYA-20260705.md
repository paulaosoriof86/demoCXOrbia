# Cierre operativo de espera Phase A - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Definir que hacer mientras Claude vuelve o mientras se habilita ejecucion local, que puede avanzar backend sin riesgo, que no debe tocarse y cuando pedir accion de Paula.

## Estado actual

- Source lock: bloqueado.
- Produccion: bloqueada.
- Deploy: bloqueado.
- Merge: bloqueado.
- P0 frontend: pendiente.
- Backend preview: avanzado.
- Ejecucion local: pendiente.

## Durante la espera de Claude

Se puede avanzar solo en trabajo seguro:

1. Documentacion acumulada.
2. Indices y continuidad.
3. Revision de contratos documentales.
4. Preparacion de checklists.
5. Templates de auditoria.
6. Revision de fixtures sinteticos.
7. Rutas de ejecucion local preview.

No se debe intentar corregir el P0 desde backend.

## Backend que puede avanzar sin riesgo

Backend puede avanzar en lectura documental, validadores locales preview sin datos reales, reportes sanitizados, matrices de decision, templates de auditoria, documentacion de gates y hardening documental Phase A.

Condiciones: sin produccion, sin deploy, sin merge, sin import real, sin escrituras reales, sin proveedores reales y sin datos sensibles.

## Lo que no debe tocarse

No tocar modulos UI para corregir P0 desde backend, Firebase config, gates de produccion, proveedores reales, pagos reales, imports reales, datos crudos TyA ni diagnosticos locales sin revision.

## Cuando pedir accion de Paula

Pedir accion de Paula solo si:

1. Claude entrega un ZIP nuevo.
2. Se necesita ejecucion en repo local.
3. Falta confirmar una regla de negocio no documentada.
4. Hay decision de produccion o source lock.
5. Se necesita configurar credenciales o proveedores reales.
6. Hay conflicto entre fuentes, repo, ZIP o documentos.

## Si Claude vuelve

Usar `app/docs/PROMPT-CORTO-CLAUDE-P0-POST-V87-20260705.md` y `app/docs/PAQUETE-CLAUDE-P0-POST-V87-CXORBIA-TYA-20260705.md`.

Pedir candidata P0 minima con delta real. No pedir P1 ni Academia profunda antes del P0.

## Si llega ZIP nuevo

Aplicar `app/docs/CHECKLIST-DECISION-NUEVA-CANDIDATA-CLAUDE-PHASE-A-TYA-20260705.md` y completar `app/docs/TEMPLATE-REPORTE-DECISION-CANDIDATA-CLAUDE-20260705.md`.

Empalmar solo si queda `candidate_for_empalme`.

## Si se ejecuta local backend

Secuencia:

1. `node tools/migration/tya-local-readiness-consistency-check.mjs`
2. `node tools/migration/tya-local-readiness-preflight.mjs`
3. `node tools/migration/tya-phase-a-local-readiness-runbook.mjs`
4. Revisar salidas.
5. No subir salidas locales sin revision.

## Errores que deben evitarse

- Avanzar P1 visual antes de P0.
- Declarar source lock por documentacion.
- Declarar produccion lista por backend preview.
- Asumir que un ZIP nuevo corrige sin auditar.
- Activar proveedores reales por textos de demo.
- Subir diagnosticos locales sin revisar.
- Pedir datos a Paula que ya esten documentados.

## Decision actual

Mantener espera operativa controlada. Continuar solo bloques backend documentales o preview seguros hasta que llegue candidata Claude, ejecucion local o decision expresa de Paula.

## Siguiente bloque recomendado

Preparar un paquete corto de estado para Paula: que esta listo, que falta, que espera Claude, que espera local y que no requiere accion inmediata.
