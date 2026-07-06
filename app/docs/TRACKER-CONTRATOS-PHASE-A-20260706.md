# Tracker contratos Phase A - CXOrbia TyA

Fecha: 2026-07-06

## Objetivo

Tener una referencia compacta de contratos Phase A para continuidad.

## Estado general

Seguimos en Phase A. Todo este tracker es documental/contractual.

## Contratos operativos

| Bloque | Contrato | Documento | Estado |
|---|---|---|---|
| Estado operacional proyecto | `app/contracts/project-operational-state-phase-a.tya.contract.json` | `CONTRATO-ESTADO-OPERACIONAL-PROYECTO-PHASE-A-20260706.md` | listo documental |
| Ruteo cuestionario | `app/contracts/questionnaire-routing-phase-a.tya.contract.json` | `CONTRATO-RUTEO-CUESTIONARIO-PHASE-A-20260706.md` | listo documental |
| Evidencias | `app/contracts/evidence-storage-routing-phase-a.tya.contract.json` | `CONTRATO-EVIDENCIAS-STORAGE-PHASE-A-20260706.md` | listo documental |
| Cierre operativo | `app/contracts/liquidations-phase-a.tya.contract.json` | `CONTRATO-CIERRE-OPERATIVO-PHASE-A-20260706.md` | listo documental |
| Asignaciones | `app/contracts/assignment-sync-phase-a.tya.contract.json` | `CONTRATO-SINCRONIZACION-ASIGNACIONES-PHASE-A-20260706.md` | listo documental |
| Postulaciones | `app/contracts/postulation-decision-flow-phase-a.tya.contract.json` | `CONTRATO-POSTULACIONES-PHASE-A-20260706.md` | listo documental |
| Outbox | `app/contracts/notification-outbox-phase-a.tya.contract.json` | `CONTRATO-OUTBOX-PHASE-A-20260706.md` | listo documental |

## Gates pendientes

- P0 frontend corregido.
- Nueva candidata auditada cuando exista.
- Source lock posterior.
- Readiness local revisado.
- Backend real posterior a gates.
- Import real posterior a autorizacion.
- Proveedores reales posteriores a autorizacion.

## No autoriza

- Produccion.
- Deploy.
- Merge.
- Import real.
- Escritura real.
- Proveedores reales.

## Siguiente bloque sugerido

Preparar mapa de dependencias entre contratos Phase A y gates de salida.
