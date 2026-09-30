# Frontend handoff V87 auditoria

Fecha: 2026-07-05

V87 fue comparada contra V86 y no trae cambios de contenido en `app/`.

Resultado tecnico:

- Archivos V86: 97.
- Archivos V87: 97.
- Agregados: 0.
- Eliminados: 0.
- Modificados: 0.
- JS revisados: 61.
- Fallas JS: 0.
- Scripts locales faltantes: 0.
- Scripts duplicados: 0.

Decision: V87 queda como reupload sin delta operativo. No cambia baseline viva.

Prioridad antes de salida controlada: corregir textos visibles que prometen acciones externas reales cuando los gates siguen apagados.

Archivos a revisar:

- `modules/postulaciones.js`
- `modules/dashboard.js`
- `core/topbar.js`
- `modules/correo.js`
- `modules/academia.js`
- `core/automations.js`
- `core/manuales-data.js`
- `core/liquidacion.js`

Reemplazar mensajes de envio o sync real por estados honestos de borrador, pendiente backend, fallback manual, revision manual, preview o gate apagado.

No ampliar Academia en este corte. Solo ajustar la frase que promete sincronia automatica y movimiento de liquidacion.

Senales backend aun ausentes en V87:

- `availableFrom`
- `outboxStatus`
- `mailboxId`
- `formVersion`
- `externalFolderRef`
- `crmEntityId`

No tocar contratos, tools ni gates. No activar integraciones ni produccion.
