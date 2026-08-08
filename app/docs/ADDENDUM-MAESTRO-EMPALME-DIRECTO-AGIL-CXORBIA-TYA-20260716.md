# ADDENDUM MAESTRO — EMPALME DIRECTO Y ÁGIL

Fecha: 2026-07-16

Este documento sustituye la secuencia anterior que hizo obligatorios la rama aislada, los workflows y todos los gates antes del empalme. Esa secuencia no corresponde a la metodología histórica probada del proyecto.

## Método vigente

1. Verificar ZIP, versión interna, SHA-256 y manifest.
2. Comparar contra la baseline viva.
3. Validar integridad, sintaxis, scripts, rutas, eliminaciones, datos sensibles y P0.
4. Si no existe P0 comprobado, empalmar inmediatamente el delta runtime en `docs-tya-v6-v71-audit`.
5. Preservar backend, contratos, adapters, tools y documentación acumulada.
6. Aplicar solo reconciliaciones explícitas indispensables.
7. Generar manifest runtime, `build-lock.js`, verificador y documentación.
8. Hacer un solo commit y push.
9. Ejecutar smoke y gates TyA después del empalme como requisito para DEV o producción, no como bloqueo previo de baseline.

## Decisión

- P0 comprobado: detener y corregir focalizadamente.
- Solo P1/P2 o validación visual pendiente: documentar, empalmar y continuar Phase A.
- No crear otra rama, PR, transferencia, Drive, Base64 o workflow para un empalme ordinario.
- No esperar colas CI para copiar un delta ya auditado.

## V156

V156 ya tiene ZIP e identidad verificados, manifest interno de 205 archivos con 0 diferencias, 35 archivos runtime modificados, 0 eliminados, 67 JS/MJS válidos, scripts verificados y ningún P0 comprobado. `core/finanzas-core.js` ya incorpora la semántica R18D de proyecto y periodo.

**Decisión: GO para empalme directo V156 sobre la rama viva.**

Después del commit se verifican manifest/source lock, proyecto-periodo-KPI-histórico, 14 periodos, 616 visitas, 44 por periodo, 216 shoppers, junio ejecutado con pagos pendientes y smoke Admin/Shopper/Cliente. Una falla posterior genera una corrección focalizada sobre V156; no reinicia el empalme.

Estado seguro: sin merge, deploy, producción, importaciones reales, writes, integraciones live ni pagos reales.
