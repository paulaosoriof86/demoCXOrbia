# ACADEMIA — Impacto C6 cancelación antes del runner

**Fecha:** 2026-08-06

## Patrón incorporado

Agregar al contenido de integraciones y troubleshooting:

1. distinguir workflow registrado de job efectivamente ejecutado;
2. revisar run, job y steps antes de interpretar checkpoints creados dentro del runner;
3. un job `cancelled` con `steps=0` prueba que ningún step ni frontera provider fue alcanzado;
4. no atribuir causa externa concreta sin recuperar la anotación o log;
5. usar límites inferior/superior de consumo provider y fail-closed.

## Caso CXOrbia TyA

Los runs v2 y v3 fueron reconocidos por GitHub Actions, pero cancelados antes de ejecutar steps. El diagnóstico previo de “run ausente” fue corregido. Esto constituye un ejemplo reutilizable de observabilidad incompleta y corrección de causa raíz sin tocar datos ni producción.

## Impacto en rutas por rol

Sin cambio funcional para Administración, Operaciones, Cliente o Shopper. Solo se actualiza material técnico de operación y soporte.
