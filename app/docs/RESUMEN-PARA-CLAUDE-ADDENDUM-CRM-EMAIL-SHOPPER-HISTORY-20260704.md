# Resumen para Claude - CRM, email real futuro y shopper history

Fecha: 2026-07-04

## Bloque backend completado

Se corrigio el alcance de correo y se documentaron CRM/OneDrive/documentos/pipeline y shopper communication history.

## Archivos creados

- `app/contracts/client-crm-drive-documents-phase-a.tya.contract.json`
- `app/contracts/shopper-communication-history-phase-a.tya.contract.json`
- `app/docs/EMAIL-TRACEABILITY-CORRECTION-REAL-PER-USER-PHASE-A-TYA-20260704.md`
- `app/docs/CLIENT-CRM-ONEDRIVE-DOCUMENTS-PIPELINE-PHASE-A-TYA-20260704.md`
- `app/docs/SHOPPER-COMMUNICATION-HISTORY-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-CRM-EMAIL-SHOPPER-HISTORY-TYA-20260704.md`

## Para prototipo

Cuando Claude vuelva:

- Correo debe modelarse como real futuro por usuario, no solo tenant/equipo.
- Al crear usuario debe poder elegirse con correo vinculado o sin correo.
- Mientras no haya integracion autorizada, mostrar estados honestos: no conectado, manual, futuro OAuth, bloqueado.
- CRM debe permitir link externo a carpeta OneDrive por cliente/prospecto/proyecto/partner.
- Cliente/prospecto/proyecto debe tener pipeline y documentos vinculados.
- Shopper history debe incluir comunicaciones, postulaciones, certificaciones, liquidaciones, pagos y visitas historicas, no solo visitas realizadas.
- Diferenciar visible para shopper vs notas internas.

## Estado seguro

Sin cambios frontend, sin runtime, sin Firestore real, sin OAuth real, sin lectura/envio real de correos, sin OneDrive API real, sin descarga de documentos, sin WhatsApp API real, sin Storage real, sin deploy y sin produccion.
