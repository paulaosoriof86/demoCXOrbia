# Resumen para Claude - Login externo y gestion de postulaciones

Fecha: 2026-07-04

## Bloque backend completado

Se corrigio la interpretacion sobre login y se documento el flujo de gestion estrategica de postulaciones.

## Archivos creados

- `app/contracts/login-entry-options-phase-a.tya.contract.json`
- `app/docs/LOGIN-ENTRY-OPTIONS-EXTERNAL-SELECTOR-PHASE-A-TYA-20260704.md`
- `app/contracts/postulation-management-decision-phase-a.tya.contract.json`
- `app/docs/POSTULATION-MANAGEMENT-DECISION-GROUPING-PHASE-A-TYA-20260704.md`
- `app/docs/ACADEMIA-IMPACT-GESTION-POSTULACIONES-DECISION-TYA-20260704.md`

## Para prototipo

Cuando Claude vuelva:

1. Login externo:
   - permitir configurar que botones aparecen antes del login;
   - admin, shopper, cliente, representante, coordinador, franquiciado, aliado, etc.;
   - no confundir con modulos internos por plan;
   - ocultar boton no reemplaza seguridad backend.

2. Gestion de postulaciones:
   - agrupar por sucursal;
   - agrupar por shopper;
   - filtrar por quincena/periodo;
   - aprobar con fecha propuesta;
   - pedir ajuste de fecha;
   - pedir confirmacion de fecha;
   - pedir reprogramacion;
   - enviar mensaje suave cuando no se selecciona;
   - evitar doble aprobacion;
   - fallback WhatsApp Web si Make/API no esta activo.

## Estado seguro

Sin cambios frontend, sin runtime, sin Auth real, sin Firestore real, sin WhatsApp API real, sin Make real, sin deploy y sin produccion.
