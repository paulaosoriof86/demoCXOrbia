# SPRINT-5-MUTACION-DEV-REVERSIBLE-FICTICIA-20260701.md

Fecha: 2026-07-01

## Objetivo

Preparar Sprint 5 para validar la primera mutacion DEV real, reversible y sobre una entidad ficticia controlada, todavia sin conectar botones de UI.

## Base validada

Sprint 4 quedo cerrado con:

- `requestAssignVisit` validado como solicitud/control/log.
- 5 documentos de control/log creados y leidos.
- Sin mutar visitas reales, postulaciones, cuestionarios ni liquidaciones.
- Sin tocar `app/modules`.
- Sin Hosting, sin produccion, sin Orbit y sin Orbia.

## Accion Sprint 5

Validar una mutacion real sobre una visita ficticia de control.

Entidad ficticia:

- Ruta: `tenants/tya/projects/cinepolis-abril-26/visits/sprint5-visit-mutation-no-real-data`.
- Tipo: visita ficticia de prueba.
- Marcador obligatorio: `sprint5Control: true`.
- Campo de seguridad: `noRealData: true`.

## Flujo propuesto

1. Leer proyecto base.
2. Verificar que la visita ficticia no sea una visita real.
3. Crear o sobrescribir solo la visita ficticia de control.
4. Mutar la visita ficticia a estado asignado/controlado.
5. Leer y validar la mutacion.
6. Revertir la visita ficticia a estado revertido/controlado o eliminarla segun el resultado del script.
7. Crear documentos de auditoria/control.
8. Documentar resultado.

## Lo que esta permitido

- Crear/actualizar/eliminar solo la visita ficticia de control Sprint 5.
- Crear logs de control y auditoria Sprint 5.
- Usar Firebase DEV `cxorbia-backend-dev`.
- Usar tenant `tya` y proyecto `cinepolis-abril-26`.

## Lo que esta prohibido

- Mutar visitas reales.
- Mutar postulaciones reales.
- Mutar cuestionarios.
- Mutar liquidaciones.
- Conectar botones de UI.
- Tocar `app/modules`.
- Publicar Hosting.
- Tocar produccion.
- Mezclar Orbit u Orbia.

## Gate de seguridad

El script debe requerir autorizacion exacta por variable de entorno:

`CXORBIA_SMOKE_SPRINT5_MUTATION=YES_PAULA_SMOKE_SPRINT5_MUTATION_DEV`

La credencial DEV local no debe imprimirse ni pegarse en ChatGPT.

## Criterio de cierre

Sprint 5 solo queda cerrado si:

1. Se muta exclusivamente la visita ficticia de control.
2. La mutacion se valida con lectura posterior.
3. La visita ficticia queda revertida o eliminada de forma controlada.
4. Se crean logs/auditoria.
5. No se toca UI ni `app/modules`.
6. Se documenta el resultado real.

## Pendiente para Claude

Claude debe saber que la UI todavia no debe activar botones reales. Cualquier ajuste visual relacionado con acciones debe quedar como mock/estado visual hasta que backend autorice una integracion posterior.