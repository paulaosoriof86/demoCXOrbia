# DECISION-SYNC-BIDIRECCIONAL-HR-PLATAFORMA-20260629

## Contexto

La HR no debe tratarse solo como importacion historica. Es una fuente viva y debe coexistir con creacion y asignacion desde plataforma, postulacion del shopper y registro directo.

## Decision

El backend debe soportar sincronizacion bidireccional e incremental entre HR y plataforma.

## Fuentes validas

1. HR viva
   - Si HR asigna una visita a un shopper que no existe, se crea un shopper operativo minimo.
   - Si HR actualiza visita, fecha programada, fecha realizada, cuestionario, submitido o liquidado, Firestore se actualiza.

2. Plataforma admin
   - Alta manual de shopper.
   - Asignacion manual de visita.
   - Creacion de visitas, proyectos y periodos.

3. Shopper
   - Registro directo.
   - Postulacion.
   - Flujo de visita desde portal shopper.

## Deduplicacion obligatoria

- Shopper: deduplicar por tenant, pais y nombre normalizado como fallback. Cuando existan identificadores seguros, usarlos como claves normalizadas o hash.
- Visita: deduplicar por tenant, periodo/proyecto, pais, id de sucursal o cinema, quincena, franja y referencia de encuesta cuando exista.
- Asignacion: no duplicar si HR y plataforma asignan la misma visita al mismo shopper.
- Cuestionario y liquidacion: actualizar por visitId y shopperId, sin duplicar en relecturas.

## Conflictos

Si HR y plataforma difieren en shopper asignado, fecha o estado critico, no se debe sobrescribir silenciosamente. Debe registrarse conflicto de sincronizacion para revision.

## Nuevo proyecto desde plataforma

Cuando se cree un nuevo proyecto desde la plataforma, la configuracion debe permitir:

- Definir fuente HR.
- Mapear columnas.
- Definir paises y periodos.
- Activar creacion automatica de periodos mensuales.
- Activar o desactivar creacion automatica de shoppers desde HR.
- Activar o desactivar asignacion automatica desde HR.
- Probar preview antes de escribir.

## Requisito de producto

Todo lo que hoy se haga por migracion o script debe poder ejecutarse despues desde una UI administrativa de plataforma.

## Restricciones

- No se escribio Firestore en esta decision.
- No Hosting.
- No merge.
- No produccion.
- No cambios en app/modules.
