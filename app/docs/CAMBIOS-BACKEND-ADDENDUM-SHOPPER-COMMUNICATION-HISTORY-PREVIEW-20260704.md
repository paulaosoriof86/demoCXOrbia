# Cambios backend addendum - Shopper communication history preview

Fecha: 2026-07-04

## Bloque completado

Preview validator de shopper communication history, usando CRM folder refs, email/mailbox, notification outbox y politica de datos sensibles como gates previos.

## Archivos creados

1. `app/contracts/shopper-communication-history-preview-phase-a.tya.contract.json`
   - Tipo: nuevo.
   - Que cambia: define contrato source-safe para historial de comunicaciones shopper sin leer ni enviar comunicaciones reales.
   - Por que: el tracker marcaba como siguiente bloque crear preview validator de shopper communication history.

2. `tools/migration/tya-shopper-communication-history-preview-validator.mjs`
   - Tipo: nuevo.
   - Que cambia: agrega validador Node que revisa contratos y opcionalmente un JSON local sintetico/sanitizado con communications.
   - Por que: permite clasificar historial listo, log manual, draft, confirmacion manual requerida, provider pendiente, payload sensible y referencias faltantes.

3. `app/docs/SHOPPER-COMMUNICATION-HISTORY-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta objetivo, entrada segura, outcomes, reglas, pendientes backend, pendientes Claude, impacto Academia y estado seguro.

4. `app/docs/ACADEMIA-IMPACT-SHOPPER-COMMUNICATION-HISTORY-PREVIEW-TYA-20260704.md`
   - Tipo: nuevo.
   - Que cambia: documenta rutas por rol, manuales, lecciones, checklists y glosario para Academia.

## Estado seguro

- Sin cambios frontend.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin import real.
- Sin Firestore writes.
- Sin Storage writes.
- Sin lectura de correo o WhatsApp.
- Sin envio de correo o WhatsApp.
- Sin Make real.
- Sin Gemini real.
- Sin proveedor externo real.
- Sin datos sensibles.

## Phase A que avanza

- Shopper history queda preparado como historial de eventos/resumen seguro/referencias, no conversaciones crudas.
- WhatsApp Web fallback requiere confirmacion manual.
- Email draft/manual log no equivale a envio real.
- Se vincula comunicacion con shopper, visita, HR row, postulacion, asignacion, notification, mailAction o CRM entity.
- Pagos/liquidaciones no pueden incluir banco ni cuenta.

## Pendientes backend derivados

1. Preparar input local sintetico/sanitizado de communications.
2. Integrar este validator en una secuencia local segura.
3. Ejecutar validators de liquidaciones/corte junio cuando exista fuente segura.
4. Conectar communication history con notification outbox/email/CRM solo a nivel preview.
5. Preparar Make/email/WhatsApp payloads futuros sin activar.

## Pendientes prototipo/Claude derivados

1. Shopper history no debe mostrar cuerpos crudos de WhatsApp/email.
2. No debe mostrar telefonos/correos crudos ni adjuntos privados.
3. Mostrar estados: preview, draft, manual log, pendiente backend, confirmacion manual, provider pending y bloqueado sensible.
4. Separar notificacion in-app de comunicacion externa.
5. Vincular historial por llaves estables, no por coincidencia visual.
6. No decir enviado/sincronizado/entregado sin confirmacion manual o provider gate futuro.

## Impacto Academia

Se creo documento especifico para Academia sobre communication history, trazabilidad manual, WhatsApp fallback, email draft/manual log, privacidad en comunicaciones, support case notes, checklists y glosario.

## Siguiente bloque recomendado

Contrato ranking/scoring shopper o preparacion de inputs sinteticos/sanitizados para ejecutar validators previos. Si Paula no entrega fuente segura real, continuar con contrato ranking/scoring shopper.
