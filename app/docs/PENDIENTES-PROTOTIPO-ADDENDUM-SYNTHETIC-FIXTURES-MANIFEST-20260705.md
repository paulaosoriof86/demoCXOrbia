# Pendientes prototipo addendum - Synthetic fixtures manifest

Fecha: 2026-07-05

## Pendientes para Claude / prototipo

1. Readiness o panel tecnico no debe mostrar fixtures sinteticos como datos reales.
2. Si se muestra resultado de validator, separar claramente:
   - fixture listo;
   - validator preview listo;
   - input faltante;
   - review requerido;
   - gate real apagado;
   - pendiente de prototipo;
   - bloqueo por privacidad.
3. No usar textos que prometen integraciones reales mientras gates esten apagados.
4. Incorporar semanticamente estas señales backend recientes:
   - `availableFrom` para disponibilidad/agenda;
   - `outboxStatus` para notificaciones;
   - `mailboxId` para correo por usuario;
   - `formVersion` para postulaciones dinamicas;
   - `externalFolderRef` para referencias documentales externas;
   - `crmEntityId` para CRM y trazabilidad.
5. En liquidaciones/Mis beneficios, separar honorario, Boleto, Combo, reembolso total, total, estado de pago, lote y movimiento individual.
6. En comunicaciones, separar notificacion interna, draft, fallback manual, manual log y provider pending.
7. En ranking, mostrar desglose de metricas, muestra insuficiente, conflicto y revision manual; no autoasignar ni mostrar decision final automatica.
8. En Academia, explicar fixtures, validators, readiness, gates y diferencias entre preview y produccion.

## P0 que siguen vivos

- `cuestionario enviado`
- `HR sincronizada`
- `WhatsApp enviado`
- `Correo enviado`
- `Sincronía automática`
- `sincroniza la HR externa`
- `mueve la liquidación`

## Validacion esperada de Claude

Claude debe corregir los textos P0 y agregar estados honestos sin tocar backend, contratos, validators ni fixtures. La siguiente candidata debe auditarse contra la ultima baseline auditada y debe separar delta vs acumulado.

## Estado seguro

Este documento no cambia frontend ni runtime. No activa produccion, deploy, merge, Firestore, HR, Storage, Make, Gemini, email, WhatsApp, pagos ni import real.
