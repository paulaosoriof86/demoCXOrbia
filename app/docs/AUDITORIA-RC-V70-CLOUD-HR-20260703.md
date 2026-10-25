# Auditoría RC incremental V70 / HR Source

Fecha: 2026-07-03
Base comparada: V69 vs V70.
Regla aplicada: un ZIP nuevo de Claude no reinicia el proyecto; se audita delta, se documenta y se empalma sobre la rama backend estable solo cuando corresponda.

## Delta detectado

Archivos agregados: ninguno.
Archivos eliminados: ninguno.
Archivos modificados:

- `app/modules/hr-source.js`

Validación técnica local del ZIP V70:

- 93 archivos totales.
- `node --check` OK en 60 archivos JS.
- No se detectaron cambios en backend, reglas Firestore ni Firebase config.
- No se detectaron nuevas extensiones ejecutables fuera del prototipo.

## Qué resolvió V70 frente a V69

### 1. URL HR ya no queda completa en localStorage

V69 ofuscaba visualmente la URL, pero persistía la URL completa en `localStorage.cx_hr_source`.

V70 corrige el comportamiento:

- `get()` ya no usa `url`; usa `sourceRef` y `maskedUrl`.
- `save()` construye un objeto seguro con `tipo`, `sourceRef`, `maskedUrl`, estado, periodos, conteos, incidencias y `canImport`.
- La URL completa no se guarda en localStorage.
- El input de URL queda vacío después de guardar.
- El texto visible aclara que la URL real va al backend/secret.

Dictamen: resuelto para frontend, con observación menor: `sourceRefFrom()` deriva una referencia parcial desde la URL. Para producción ideal, el `sourceRef` debería ser devuelto por backend como token opaco, no generado por el navegador.

### 2. Eventos backend determinísticos

V69 no emitía eventos backend claros.

V70 agrega:

- `CX.hrSource.emitBackend(kind, pid)`.
- Evento `hr-source:test`.
- Evento `hr-source:preview`.
- Evento `hr-source:sync-request`.
- Payload con `projectId`, `sourceType`, `sourceRef`, `urlPending`, `requestedAt`.

Dictamen: resuelto para que backend escuche sin leer DOM.

### 3. Incidencias esperado-vs-detectado

V69 tenía panel textual.

V70 agrega tabla estructurada para `incidencias[]` con:

- severidad;
- código;
- periodo/tab;
- esperado;
- detectado;
- delta;
- fila;
- acción sugerida.

Dictamen: resuelto en UI siempre que backend entregue esos campos.

### 4. Bloqueo de sincronización

Se mantiene que `Solicitar sincronización` queda bloqueado si `canImport` es falso.

Dictamen: sigue correcto.

## Pendientes que quedan para backend

Estos no corresponden a Claude:

1. Crear listener/bridge backend para eventos:
   - `hr-source:test`;
   - `hr-source:preview`;
   - `hr-source:sync-request`.

2. Conectar realmente Google Sheets / Excel Online.

3. Resolver almacenamiento real de la URL como secreto/configuración privada.

4. Generar respuesta backend con contrato:

```json
{
  "status": "ready_for_preview",
  "counts": {},
  "periodsDetected": [],
  "issues": [],
  "canImport": false
}
```

5. Alinear `index-backend-dev.html` cuando se haga empalme final.

## Pendientes menores para Claude/prototipo

No bloquean el avance backend, pero deben quedar documentados:

1. `sourceRef` idealmente debe ser token opaco generado por backend, no derivado parcial desde la URL en navegador.
2. El reporte de Cloud debe indicar que V69 también había modificado CRM.
3. Validar visualmente CRM porque V69 introdujo cambios no reportados en pestañas de ficha 360.

## Dictamen

V70 corrige los tres pendientes principales detectados en V69:

- URL completa en localStorage;
- falta de eventos backend;
- falta de tabla esperado-vs-detectado.

No se requiere paquete inmediato para Claude. Se conserva pendiente menor para futuras mejoras. Backend puede continuar con listener/bridge HR y conector real sin esperar otra corrección de frontend.
