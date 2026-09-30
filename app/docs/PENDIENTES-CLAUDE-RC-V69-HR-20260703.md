# Pendientes para Claude — RC V69 HR/Cinépolis

Fecha: 2026-07-03
Estado: paquete correctivo menor. No reinicia proyecto.

## Pendientes prioritarios

### 1. URL HR realmente privada

Problema:
- El módulo `hr-source.js` ofusca la URL en pantalla, pero conserva la URL completa en `localStorage`.

Ajuste requerido:
- Al guardar, el frontend debe enviar la URL al backend o dejarla pendiente backend.
- Después de guardar, no debe persistir la URL completa en localStorage.
- Debe guardar solo campos seguros como `sourceRef`, `maskedUrl`, `sourceType`, `lastStatus`.

Criterio de aceptación:
- Después de guardar, `localStorage.cx_hr_source` no contiene la URL completa.
- La pantalla muestra solo máscara o referencia.

### 2. Emitir eventos backend determinísticos

Problema:
- Los botones `Probar conexión`, `Generar preview` y `Solicitar sincronización` solo muestran toast/cambian estado local.
- El backend tendría que parchar DOM para capturar acciones.

Ajuste requerido:
- Emitir eventos por `CX.bus` o contrato equivalente:
  - `hr-source:test`
  - `hr-source:preview`
  - `hr-source:sync-request`
- Payload mínimo: `projectId`, `sourceType`, `sourceRef` o `urlPending`, `requestedAt`.

Criterio de aceptación:
- El backend puede escuchar acciones sin tocar UI ni leer DOM.

### 3. Incidencias esperado-vs-detectado estructuradas

Problema:
- Hay panel de incidencias, pero no estructura visual clara por `expected`, `detected`, `delta`, `severity`.

Ajuste requerido:
- Si backend entrega `issues[]`, renderizar tabla con:
  - severidad;
  - código;
  - periodo/tab;
  - esperado;
  - detectado;
  - delta;
  - fila origen si aplica;
  - acción sugerida.

Criterio de aceptación:
- Una incidencia como `JUNIO 26 HN expected=10 detected=11` se ve claramente y bloquea importación si es crítica.

### 4. Reporte de cambios debe incluir CRM

Problema:
- V69 también cambió `app/modules/crm.js`, pero Cloud no lo reportó.

Ajuste requerido:
- Documentar en el changelog de Cloud los cambios de CRM:
  - pestaña reuniones;
  - pestaña finanzas;
  - pestaña add-ons;
  - acción mock de agendar reunión;
  - mensajes de backend pendiente.

Criterio de aceptación:
- El reporte de entrega coincide con el delta real del ZIP.

## Pendiente para ChatGPT/backend, no Claude

- Alinear `app/index-backend-dev.html` para cargar `modules/hr-source.js` y los módulos faltantes del index principal.
- Construir backend listener/bridge para eventos HR.
- Implementar conexión real Google Sheets / Excel y preview.
- No corresponde a Claude conectar directamente a Sheets.
