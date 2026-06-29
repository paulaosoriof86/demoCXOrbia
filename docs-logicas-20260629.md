# Logicas generales CXOrbia 20260629

## Alcance

Este documento registra mejoras generales de producto para el prototipo comercializable. No incluye datos aplicados a ningun cliente.

## Periodos y fuente viva

La hoja de ruta operativa puede ser historica y viva. Cada hoja mensual debe convertirse en un periodo seleccionable. La plataforma debe poder importar el historico y luego sincronizar cambios futuros.

## Fuentes de entrada

La misma operacion puede recibir datos desde hoja de ruta viva, administracion de plataforma, registro directo, postulacion y migracion inicial.

## Perfil operativo creado desde fuente externa

Cuando una fuente externa trae una asignacion para una persona que aun no existe, el sistema debe crear un perfil operativo minimo y asociarlo a la visita. Ese perfil se puede completar despues.

## Creacion desde plataforma

La plataforma debe permitir crear personas evaluadoras, visitas, asignaciones, proyectos, periodos y configuracion de fuentes externas.

## Deduplicacion

- Persona evaluadora: tenant, pais, nombre normalizado y claves seguras cuando existan.
- Visita: tenant, periodo, pais, sucursal, franja, quincena y referencia externa cuando exista.
- Asignacion: no duplicar cuando visita y persona ya coinciden.
- Entregables: actualizar por visita y persona.

## Conflictos

Cuando una fuente externa y la plataforma difieran en campos criticos, se debe registrar conflicto de sincronizacion para revision.

## Creacion de proyecto

Al crear un proyecto desde plataforma debe configurarse fuente externa, columnas, paises, periodos, creacion automatica de periodos, perfiles desde fuente externa, asignacion automatica y preview antes de escribir.

## Pendiente frontend

Agregar selectores de periodo y pais en modulos operativos sin romper el adapter backend.
