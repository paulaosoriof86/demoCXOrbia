# PAQUETE EXCLUSIVO PARA CLAUDE — ACUMULADO POST-V156, PRE-EMPALME FINAL

Fecha: 2026-07-17  
Proyecto: CXOrbia — prototipo comercializable + sincronía con backend/tenant TyA  
Repo de continuidad: `paulaosoriof86/demoCXOrbia`  
Rama de empalme posterior: `docs-tya-v6-v71-audit`  
PR de continuidad: #7 draft/open/no merge

## 1. Objetivo de este paquete

Generar una única candidata frontend completa, derivada exclusivamente de la V156 actual, que incorpore los pendientes reales del prototipo, los patrones reutilizables aprendidos durante Phase A, los fixes locales que sí deben consolidarse de forma genérica, la sincronía de Academia y la corrección final del gate comercial.

Este paquete no autoriza ni solicita cambios backend. Claude trabaja solo en el prototipo comercializable. ChatGPT aplicará después el delta auditado mediante `APPLY_DELTA_DIRECTLY` sobre la rama viva.

## 2. Fuente única obligatoria

Trabajar exclusivamente sobre:

- Archivo: `Prototype development request CXOrbia V156.zip`.
- SHA-256 del ZIP actualmente entregado: `d25a9de150d0f3e8e3b83916e98196ff71bf1346aab8a2a986a66e107ca056de`.
- Identidad interna: V156.
- Manifest interno: `app/docs/MANIFEST-V156.json`.
- Runtime cubierto por manifest: 205 archivos.
- Aggregate SHA-256 reproducible: `0262675769bf613c933e0872484bd27d38c4adabe28b335f697ae456cc5c0305`.
- Verificación actual: 0 diferencias de manifest.
- JavaScript verificado: 66 archivos, 0 errores de sintaxis.
- Total del paquete: 256 archivos, incluyendo documentación y evidencias excluidas del runtime manifest.

No partir de V155, V151, V131, V110 ni de otra candidata. No reconstruir libremente. No devolver cambios basados en una versión anterior.

[Contenido completo preservado en el commit original del paquete.]
