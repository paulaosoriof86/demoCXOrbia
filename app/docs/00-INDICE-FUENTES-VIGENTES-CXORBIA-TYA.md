# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-18  
Estado: ACTIVO Y OBLIGATORIO

## 1. Lectura obligatoria

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
2. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
3. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
4. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
5. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
6. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
7. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
8. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`

Después consultar contratos R20, CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES-PROTOTIPO, Academia, tracker, PR #7 y HEAD de `docs-tya-v6-v71-audit`.

## 2. Estado operativo vigente

- V159 está empalmada, pero aún no es `ACTIVE_BASELINE`.
- Corte activo: `CORTE 0B — MOTOR CANÓNICO HISTÓRICO + TENANT/LOGIN`.
- Estado: `CORTE_0B_R20_TECHNICAL_PASS_PENDING_HOSTING_DEV_VISUAL`.
- Commit de evidencia: `f9e7f65b7d7d5975d2905a55d25891d36e876255`.
- Workflow: `29661230006`, resultado `SUCCESS`.
- HR source-safe: 28 pestañas, 14 periodos, 616 visitas, junio 2025–julio 2026.
- Los gates históricos, proyecto/periodo, roles, módulos y overlays pasaron.
- Smoke local/static Admin, Cliente y Shopper pasó.
- Falta Hosting DEV corregido, smoke remoto y aprobación visual de Paula.

## 3. Evidencia resumida

- 44 visitas por periodo: 34 GT y 10 HN.
- Mayo y junio 2026: 44 realizadas, 44 cuestionarios y 44 submitidas por mes.
- Julio 2026: 39 asignadas, 5 sin asignar, 35 programadas, 4 pendientes de programar, 21 realizadas/cuestionario, 7 pendientes de submitido y 14 submitidas.
- 209 referencias shopper protegidas; la diferencia frente a la referencia 216 queda en revisión, sin inventar ni eliminar identidades.
- 196 enlaces financieros exactos y 92 elementos de revisión financiera.
- Cero pagos, lotes o certificaciones inferidos.
- 40 visitas requieren revisión de calidad/contradicción de fuente.

## 4. Prevalencia

- Empalmes: addendum canónico de carril file-aware y aplicación directa.
- Phase A: plan canónico.
- Estado puntual: checkpoint vigente.
- Semántica HR: contrato R20.

## 5. Regla de candidatas

```text
EXECUTION_LANE_READY
→ AUDITORÍA DELTA
→ P0_PROVEN o GO
→ si GO sin P0: APPLY_DELTA_DIRECTLY
→ COMMIT/PUSH ATÓMICO
→ POST-GATES
→ VALIDACIÓN VISUAL
→ FREEZE
```

No usar composite previo obligatorio, nueva rama/PR, workflow transportador, conectores archivo por archivo ni tareas manuales para Paula.

## 6. Fuentes que deben retirarse

- copias con `(1)`;
- checkpoints que digan que V159 no está empalmada;
- addenda que exijan visualización antes de empalmar una candidata GO;
- planes paralelos;
- ZIPs de candidatas como fuente permanente.

## 7. Siguiente acción exacta

1. Publicar Hosting DEV del mismo commit/build, solo con autorización específica.
2. Ejecutar smoke remoto.
3. Recibir revisión visual de Paula.
4. Corregir únicamente diferencias reproducibles.
5. Congelar Corte 0B con `APROBADO`.
6. No iniciar Corte 1 antes del freeze.

## 8. Mantenimiento

Al cambiar el estado, reemplazar este índice y el checkpoint canónico; actualizar CAMBIOS, Claude, PENDIENTES, Academia, tracker y PR #7 sin crear copias paralelas.