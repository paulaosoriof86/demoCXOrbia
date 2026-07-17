# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-17  
Estado: ACTIVO Y OBLIGATORIO  
Regla: este archivo se lee primero y define la única jerarquía vigente de fuentes.

## 1. Fuentes activas y orden obligatorio

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
2. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
3. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
4. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
5. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
6. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
7. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
8. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`

Después consultar en el repositorio:

9. `PROTOCOLO-VALIDACION-VISUAL-TYA-20260713.md`;
10. source lock/checkpoint más reciente;
11. `CAMBIOS-BACKEND.md` y addenda;
12. `RESUMEN-PARA-CLAUDE.md` y addenda;
13. `PENDIENTES-PROTOTIPO.md` y addenda;
14. `AGENTS.md`;
15. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

## 2. Prevalencia

- Empalmes: addendum canónico de carril.
- Continuidad general: documento maestro actualizado.
- Secuencia Phase A y checkpoints visuales: plan canónico Phase A.
- Estado operativo puntual: checkpoint vigente.

## 3. Fuentes superadas

Retirar o marcar `SUPERADO / NO USAR`:

- `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-COMPLETO.md`;
- addenda anteriores de ejecución directa 20260716/20260717;
- copias con `(1)` del índice, addendum, plan o checkpoint;
- planes Phase A paralelos que contradigan el plan canónico.

Los históricos permanecen en GitHub, no como Fuentes activas.

## 4. Fuentes no permanentes

No cargar permanentemente ZIPs de candidatas, paquetes Claude, auditorías de versiones, manifests ni múltiples checkpoints.

## 5. Nombres canónicos

Se reemplaza el contenido sin cambiar el nombre:

- `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
- `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
- `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`

No crear `copia`, `(1)`, `V2`, `final` ni otra fecha paralela.

## 6. Instrucción corta para el proyecto

> Antes de responder o actuar, lee primero `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md` y sus fuentes activas. Sigue el plan Phase A por cortes verticales: fuente/regla, mapping/adapter, gate, runtime exacto, validación visual y freeze. No avances al siguiente corte sin evidencia visual. Para candidatas confirma `EXECUTION_LANE_READY`; si quedan GO, ejecuta `APPLY_DELTA_DIRECTLY` en `docs-tya-v6-v71-audit`. No uses ramas/PR nuevos, workflows, PowerShell ni acciones manuales de Paula.

## 7. Mantenimiento

Después de cambiar baseline o siguiente acción:

1. actualizar el checkpoint canónico;
2. reemplazar la versión anterior en Fuentes;
3. mantener detalles históricos en GitHub;
4. conservar PR #7 draft/open hasta autorización expresa.
