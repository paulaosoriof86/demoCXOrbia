# RESUMEN-PARA-CLAUDE-ADDENDUM-20260629-CONFIGURACION-SYNC-PROYECTOS

## Mensaje para Claude

El frontend aprobado no debe redisenarse ni parcharse desde backend. Sin embargo, durante la migracion se detectaron necesidades funcionales para que el prototipo sea comercializable y no quede amarrado a una cuenta especifica.

## Puntos a revisar en prototipo

### 1. Configuracion

Paula reporta que Configuracion no funciona correctamente. Revisar el modulo completo y corregir sin romper navegacion, roles ni adapter backend.

Debe permitir configurar desde UI lo que hoy se esta probando por scripts:

- Fuente externa.
- Mapeo de columnas.
- Paises.
- Periodos.
- Reglas de creacion automatica.
- Reglas de deduplicacion.
- Reglas de conflicto.
- Preview/dry-run antes de escribir.

### 2. Nuevo proyecto desde plataforma

Cuando se cree un proyecto desde plataforma, la UI debe guiar la configuracion completa:

- Proyecto con fuente externa o manual.
- Periodos mensuales seleccionables.
- Creacion automatica de periodo si aparece una nueva hoja/mes.
- Creacion de shoppers/evaluadores desde fuente externa cuando haya una asignacion y no exista perfil.
- Asignacion automatica desde fuente externa.
- Posibilidad de crear y asignar tambien desde plataforma, postulacion o registro directo.

### 3. Selectores por periodo

Agregar o profundizar selectores de periodo/pais/proyecto en los modulos operativos donde aplique, para poder revisar historico y periodo vivo.

### 4. Sincronizacion bidireccional

La plataforma debe soportar datos desde:

- HR/fuente externa viva.
- Admin plataforma.
- Shopper/evaluador por registro directo.
- Shopper/evaluador por postulacion.
- Migracion inicial.

Ninguna fuente debe duplicar registros.

### 5. Conflictos

Si fuente externa y plataforma difieren en shopper asignado, fecha, estado, cuestionario, submitido o liquidacion, registrar conflicto visible para administracion. No sobrescribir silenciosamente.

### 6. Pendientes conocidos

- Academia debe completarse y profundizarse.
- CRM queda pendiente de desarrollo.
- Storage/evidencias no esta habilitado hasta resolver Blaze.
- Certificaciones deben migrarse desde BD actual u otra fuente confiable, porque no vienen de HR.

## Restriccion clave

Claude puede ajustar frontend/prototipo. ChatGPT backend no debe modificar /app/modules ni parchar UI en esta fase; debe documentar los ajustes aqui.
