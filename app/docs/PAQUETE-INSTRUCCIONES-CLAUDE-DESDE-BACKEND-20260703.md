# Paquete de instrucciones para Claude desde backend

Fecha: 2026-07-03

## Objetivo

Consolidar todos los ajustes visuales/frontend que Claude debe implementar en el siguiente prototipo, derivados del avance backend HR Source, pipeline seguro, contrato DEV y matriz de gates.

Este paquete no reemplaza el backend. Claude debe trabajar solo en prototipo/frontend y no debe revertir avances backend.

## Reglas de continuidad

- Un nuevo prototipo de Claude se trata como release candidate incremental.
- No reiniciar backend.
- No eliminar archivos backend agregados.
- No tocar runners, validadores, contratos ni docs backend.
- Mantener la interfaz visual aprobada.
- Si Claude necesita cambiar UX, debe conservar los hooks/eventos ya definidos.

## HR Source

Claude debe mantener o mejorar el modulo HR Source con estas reglas:

- No guardar URL completa de Google Sheets, Excel, OneDrive o SharePoint en localStorage/sessionStorage.
- Mostrar solo referencia enmascarada o `sourceRef` opaco entregado por backend.
- Mantener eventos frontend compatibles:
  - `hr-source:test`
  - `hr-source:preview`
  - `hr-source:sync-request`
- Mostrar respuesta backend de test/preview/sync-request.
- Mostrar tabs, periodos y conteos devueltos por backend.
- No asumir que todos los periodos vienen de demo/localStorage.

## Estados honestos obligatorios

Claude debe diferenciar visualmente:

- Preview disponible.
- Warning.
- Bloqueado por seguridad.
- Pendiente backend.
- Importacion no autorizada.
- Error de validacion.

No debe mostrar:

- Importacion ejecutada cuando `canImport=false`.
- Sincronizacion real si backend responde `blocked`.
- Produccion lista cuando aun hay gates bloqueados.

## Contrato DEV de importacion

El frontend puede mostrar el contrato como vista informativa:

- Estado del contrato.
- Conteos por coleccion.
- Blockers.
- Gates pendientes.
- Resultado de validacion.

Pero no debe habilitar acciones destructivas.

## Matriz de gates

Claude debe agregar o preparar una vista visual que separe:

- DEV preview.
- DEV import.
- Staging.
- Produccion.

Cada fase debe mostrar:

- Gates listos.
- Gates pendientes.
- Gates bloqueados.
- Siguiente accion.
- Responsable si aplica.

La UI debe impedir saltos de fase y dejar claro que produccion requiere autorizacion de Paula.

## Seguridad visual

No exponer:

- URL completa de HR.
- Credenciales.
- IDs privados innecesarios.
- Datos PII.
- DPI.
- CSV crudos.
- Rutas sensibles internas.

## Finanzas / liquidaciones

Liquidaciones deben mostrarse como candidatas hasta cruce financiero externo.

No deben mostrarse como finales, pagadas o importadas si no existe validacion backend y autorizacion.

## Mensajes sugeridos

- `Preview generado. Sin escritura en base de datos.`
- `Importacion bloqueada por seguridad.`
- `Pendiente resolver gates antes de continuar.`
- `Fuente conectada mediante referencia segura.`
- `No se ha importado informacion a Firestore.`

## Validacion posterior

Cuando Claude entregue una nueva version:

- Auditar como RC incremental.
- Comparar contra backend actual.
- Confirmar que no reintrodujo persistencia de URL completa.
- Confirmar que no cambio los eventos HR Source.
- Confirmar que no habilito importacion real desde frontend.
- Documentar resueltos y pendientes.

## Archivos backend que Claude no debe modificar

- `app/core/backend-hr-source-bridge.js`
- `app/core/backend-config-preview-dev.js`
- `tools/hr-source/*`
- `tools/migration/*`
- `CAMBIOS-BACKEND.md`
- Documentos de auditoria/contrato/pipeline salvo que se pidan cambios documentales especificos.

## Documentos relacionados

- `app/docs/MEJORAS-PARA-CLAUDE-DESDE-BACKEND-20260703.md`
- `app/docs/CHECKLIST-REVISION-VISUAL-POST-PIPELINE-TYA-20260703.md`
- `app/docs/RESUMEN-EJECUTIVO-PIPELINE-SEGURO-TYA-20260703.md`
- `app/docs/TYA-PRODUCTION-GATES-MATRIX-20260703.md`
