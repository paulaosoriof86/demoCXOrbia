# Addendum cambios backend - CRM, email real futuro y shopper history

Fecha: 2026-07-04

## Archivos creados

- `app/contracts/client-crm-drive-documents-phase-a.tya.contract.json`
- `app/contracts/shopper-communication-history-phase-a.tya.contract.json`
- `app/docs/EMAIL-TRACEABILITY-CORRECTION-REAL-PER-USER-PHASE-A-TYA-20260704.md`
- `app/docs/CLIENT-CRM-ONEDRIVE-DOCUMENTS-PIPELINE-PHASE-A-TYA-20260704.md`
- `app/docs/SHOPPER-COMMUNICATION-HISTORY-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-CRM-EMAIL-SHOPPER-HISTORY-TYA-20260704.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-CRM-EMAIL-SHOPPER-HISTORY-20260704.md`

## Motivo

Paula aclaro que el correo debe ser real y funcional cuando se autorice, por usuario y no solo por tenant/equipo. Tambien explico la necesidad de vincular OneDrive compartido de TyA, documentos, pipeline, clientes/prospectos/proyectos y trazabilidad de comunicaciones en shoppers y clientes.

## Decision

- Se corrige el alcance del correo: ahora queda documentado como correo real futuro por usuario, con configuracion al crear usuario.
- Se crea contrato de CRM/documentos/OneDrive como referencias externas sin conectar API real.
- Se crea contrato de historial extendido de shopper con comunicaciones, no solo visitas realizadas.
- Se documenta impacto Academia.

## Estado seguro

Sin cambios frontend, sin runtime, sin Firestore real, sin OAuth real, sin lectura/envio real de correos, sin OneDrive API real, sin descarga de documentos, sin WhatsApp API real, sin Storage real, sin deploy y sin produccion.
