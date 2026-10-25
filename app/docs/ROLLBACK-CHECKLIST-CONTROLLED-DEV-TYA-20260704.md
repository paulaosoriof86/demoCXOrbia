# Rollback checklist controlled DEV TyA

Fecha: 2026-07-04

## Proposito

Definir las condiciones minimas de rollback antes de cualquier escritura DEV futura.

Este documento no autoriza escritura. Es una lista de revision previa.

## Precondiciones

- Readiness V5 en `ready_for_controlled_dev_authorization_review`.
- Autorizacion explicita de Paula para DEV controlado.
- Confirmacion del proyecto Firebase DEV objetivo.
- Confirmacion de que no es produccion.
- Snapshot o respaldo disponible antes de cualquier escritura.
- Runner activo separado, no el runner disabled.

## Rollback requerido

Antes de cualquier escritura futura debe existir:

- identificador de batch;
- lista de rutas destino por tenant/project;
- conteo esperado por coleccion;
- forma de borrar solo documentos del batch;
- forma de restaurar snapshot si aplica;
- registro local de commit, fecha, batch y operador;
- prueba local de no contaminacion de datos productivos.

## Criterios de stop inmediato

- Ruta sin `tenantId` o `projectId`.
- Intento de escribir fuera de DEV.
- Conteos distintos al dry-run esperado.
- Datos sensibles sin politica definida.
- Cualquier activacion de Auth real, Make o notificaciones reales.
- Error de reglas o permisos.

## Estado

- Checklist documental.
- Sin runtime.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
