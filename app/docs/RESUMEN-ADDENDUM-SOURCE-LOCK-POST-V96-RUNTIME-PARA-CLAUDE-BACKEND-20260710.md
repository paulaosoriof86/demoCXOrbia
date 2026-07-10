# Resumen addendum para Claude/backend — runtime source lock post-V96

Fecha: 2026-07-10

## Decisión vigente

`Prototype development request.zip` post-V96 continúa como source lock operativo para continuidad backend y no es GO de producción.

La auditoría del paquete sigue válida. El hallazgo nuevo no invalida el ZIP: demuestra que el runtime de la rama `docs-tya-v6-v71-audit` no está empalmado íntegramente con ese paquete.

## Evidencia

Gate criptográfico agregado:

- 67 archivos runtime esperados;
- 30 hashes coinciden;
- 0 archivos faltantes;
- 37 hashes no coinciden;
- veredicto: `NO_GO_SOURCE_LOCK_RUNTIME_NOT_EMPLOYED`.

El drift gate histórico fue depurado:

- redujo falsos bloqueos safe-only de 31 a 4;
- los 4 restantes son cambios runtime reales;
- el SHA validado no se movió.

## Lo que Claude NO debe hacer

- no volver a V96/V95 como metodología anterior;
- no rediseñar libremente;
- no borrar contratos, adapters disabled, gates o validadores backend;
- no eliminar archivos adicionales sin revisar su función;
- no activar Firebase, Auth, Firestore, Storage, Make, Gemini, HR writeback o pagos;
- no cambiar copy de preparado/preview por afirmaciones de operación real;
- no tratar Cinépolis como lógica global.

## Lo que debe hacer un futuro carril frontend/Claude

Aplicar el source lock post-V96 de forma controlada sobre la rama, preservando deliberadamente lo que corresponda de:

- adapters/bridges backend disabled o preview;
- guards de copy/readiness;
- source-safe preview;
- patches incrementales de Academia;
- rutas adicionales;
- scripts de carga requeridos por `index.html`.

La tarea no es copiar el ZIP a ciegas. Debe:

1. comparar cada uno de los 37 archivos distintos;
2. preservar mejoras backend y patches útiles documentados;
3. usar post-V96 como base visual/funcional;
4. mantener el P0 de permisos cerrado;
5. mantener cliente multi-proyecto/proyecto activo;
6. mantener copy honesto;
7. evitar duplicados, scripts huérfanos y regresiones;
8. entregar una rama cuyo gate de 67 hashes pase o cuyas excepciones estén justificadas explícitamente.

## P1 residual que sigue pendiente

- categorizar/allowlistear `cli_*` para permisos cliente granulares;
- módulo desconocido debe ser `false` salvo allowlist explícita;
- copy residual en Soporte y Mis Visitas;
- HR Source: preferir `Conectado por backend` cuando corresponda;
- smoke visual por admin, coordinador/aliado/custom, cliente y shopper.

## Impacto backend

No conectar `CX.data`, Auth o Firestore al runtime hasta que:

- el empalme post-V96 esté aplicado;
- gate de hashes y drift estén reconciliados;
- smoke estático/visual por rol pase;
- exista autorización DEV separada.

## Impacto Academia

Tras el empalme deben revisarse:

- Academia y sus patches incrementales;
- manuales/rutas por rol afectados por permisos;
- curso de Administrabilidad/Diagnóstico/HR Source;
- guía de estados preparado, preview, bloqueado, conectado y producción;
- notificaciones de cambios de módulo.

## Estado seguro

Este addendum no modifica UI, no activa runtime, no despliega, no importa, no escribe y no llama proveedores.
