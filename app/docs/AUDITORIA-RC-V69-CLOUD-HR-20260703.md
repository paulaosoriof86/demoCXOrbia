# Auditoría RC incremental V69 / reporte Cloud HR

Fecha: 2026-07-03
Base comparada: V68 vs V69.
Regla aplicada: un ZIP nuevo de Claude no reinicia el proyecto; se audita delta, se empalma sobre rama backend estable y se documenta.

## Nota de versión

El archivo recibido se llama `Prototype development request CXOrbia V69.zip`. Cloud lo reportó como V90. Para trazabilidad del repositorio se registra como V69, que es el nombre físico recibido.

## Delta detectado

Archivos agregados:
- `app/modules/hr-source.js`

Archivos modificados:
- `app/core/config.js`
- `app/index.html`
- `app/modules/crm.js`
- `app/modules/finanzas.js`

Archivos eliminados:
- Ninguno.

Validación técnica local del ZIP:
- `node --check` OK en todos los JS.
- Sin extensiones backend nuevas.
- No se detectaron cambios en `backend-*.js`, `firestore.rules`, Firebase config ni reglas.

## Lo que sí resolvió Cloud

1. Fuente HR por proyecto:
   - Se agregó módulo `hr-source.js`.
   - Se agregó navegación `Fuente de HR` en Admin del Proyecto.
   - Se insertó script en `index.html`.

2. Estados honestos:
   - El módulo define 10 estados: `pendiente_backend`, `connected`, `auth_error`, `not_found`, `empty_range`, `schema_changed`, `parsed_with_warnings`, `blocked`, `ready_for_preview`, `ready_for_import`.
   - El frontend no muestra conectado por sí mismo al probar/preview; vuelve a `pendiente_backend`.
   - La sincronización queda bloqueada si `canImport` es falso.

3. Incidencias:
   - Existe panel de incidencias y texto de referencia para conteos, filas en revisión, fechas futuras, submitidos/liquidaciones sin visita, duplicados y schema.

4. Liquidaciones candidatas:
   - `finanzas.js` agrega aviso claro de que liquidaciones son candidatas hasta cruce con Excel financiero externo.

5. Respeto general de backend:
   - No toca backend real ni reglas Firestore.
   - No altera contrato `CX.data`.

## Hallazgos no reportados por Cloud

Cloud no reportó que también modificó `app/modules/crm.js`.

Cambio detectado:
- Nuevas pestañas en ficha 360: reuniones, finanzas y add-ons.
- Nueva acción mock para agendar reunión.
- Mensajes de backend pendiente para calendario, cobros reales, activación y facturación de add-ons.

Dictamen:
- No rompe sintaxis.
- Es extra funcional no relacionado directamente con HR.
- Debe validarse visualmente para confirmar que no genera regresiones en CRM.

## Pendientes importantes detectados

1. URL privada no está realmente protegida en frontend:
   - La UI ofusca la URL en pantalla, pero conserva el valor completo en `localStorage` bajo `cx_hr_source`.
   - Para producción, el frontend debe enviar la URL al backend una sola vez y luego conservar solo un `sourceRef`/máscara.
   - No debe quedar URL completa persistida en localStorage.

2. Botones no emiten contrato backend:
   - `Probar conexión`, `Generar preview` y `Solicitar sincronización` solo muestran toast y cambian estado local.
   - Para que backend conecte sin parchar DOM, el módulo debe emitir eventos/acciones determinísticas por `CX.bus`, por ejemplo `hr-source:test`, `hr-source:preview`, `hr-source:sync-request`.

3. Preview backend DEV debe alinearse:
   - `app/index.html` carga `hr-source.js`.
   - `app/index-backend-dev.html` aún debe incorporar el nuevo script y también mantener alineación de módulos faltantes como `periodos`, `historico`, `cliente-insights` y `novedades`.

4. Incidencias esperado-vs-detectado:
   - Hay panel y texto, pero falta tabla estructurada de `expected`, `detected`, `delta`, `severity`, `sourceTab`, `sourceRow` si backend la entrega.

## Dictamen

V69 sí cierra la mayor parte del frente HR/Cinépolis solicitado a Claude, pero no está 100% listo para backend sin un ajuste menor de contrato:
- no guardar URL completa en localStorage;
- emitir eventos backend determinísticos;
- alinear `index-backend-dev.html` durante el empalme.

No se requiere reiniciar ni abrir rama nueva. El empalme debe copiar solo el delta V69 y aplicar ajuste backend de preview DEV.
