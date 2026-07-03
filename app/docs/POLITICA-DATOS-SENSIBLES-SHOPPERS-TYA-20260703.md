# Politica propuesta datos sensibles shoppers TyA

Fecha: 2026-07-03

## Objetivo

Definir una politica tecnica antes de cualquier import DEV futuro de datos sensibles de shoppers.

## Estado

Esta propuesta no ejecuta importacion ni escritura. Sirve como gate previo.

## Regla base

- No incluir datos sensibles en repo.
- No mostrar datos sensibles en previews publicos.
- No importar datos sensibles hasta definir destino, permisos y proteccion.

## Opciones tecnicas

### Opcion A - Excluir del primer import

Usar solo datos operativos minimos para validar visitas, postulaciones y estados.

Ventaja: menor riesgo y avance rapido.
Pendiente: completar datos privados despues.

### Opcion B - Coleccion privada restringida

Guardar campos sensibles solo en ruta privada por tenant/proyecto, con reglas estrictas por rol.

Ventaja: conserva datos utiles.
Pendiente: requiere reglas auditadas antes de escribir.

### Opcion C - Cifrado de campos

Cifrar campos sensibles antes de persistirlos.

Ventaja: mayor proteccion.
Pendiente: requiere gestion de llaves y flujo de lectura seguro.

## Recomendacion inicial

Para primer DEV import futuro: usar Opcion A para datos operativos y dejar la parte privada bloqueada hasta reglas/cifrado.

## Gate requerido

Paula debe confirmar si el primer import DEV puede excluir datos sensibles de shoppers o si deben conservarse desde el inicio.
