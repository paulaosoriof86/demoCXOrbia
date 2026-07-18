# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-18  
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
9. `VALIDACION-VISUAL-V159-NO-APROBADO-20260718.md`
10. `backend/contracts/phase-a-live-execution-checkpoint-v1.json`
11. `backend/contracts/prototype-baseline-registry-v1.json`
12. `app/core/build-lock.js`

Después consultar:

13. `CAMBIOS-BACKEND.md` y el addendum vigente;
14. `RESUMEN-PARA-CLAUDE.md` y el addendum vigente;
15. `PENDIENTES-PROTOTIPO.md` y el addendum vigente;
16. impacto vigente de Academia;
17. tracker vigente de Phase A;
18. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

## 2. Addenda vigentes del bloque actual

- `VALIDACION-VISUAL-V159-NO-APROBADO-20260718.md`
- `CAMBIOS-BACKEND-ADDENDUM-V159-VISUAL-NO-APROBADO-20260718.md`
- `RESUMEN-PARA-CLAUDE-ADDENDUM-V159-VISUAL-NO-APROBADO-20260718.md`
- `PENDIENTES-PROTOTIPO-ADDENDUM-V159-VISUAL-NO-APROBADO-20260718.md`

Los addenda anteriores de Hosting DEV PASS quedan como evidencia técnica histórica, no como estado operativo vigente.

## 3. Estado operativo que manda

- V159 está auditada y empalmada.
- Hosting DEV y smoke remoto técnico: PASS.
- Validación visual de Paula: `NO APROBADO`.
- Estado: `HOLD_VISUAL_SEMANTIC_P0_PROVEN`.
- P0 demostrado: sí.
- V159 no es `ACTIVE_BASELINE`.
- No se reabre empalme ni auditoría estructural.
- Siguiente acción: `CORTE 0B — MOTOR CANÓNICO DE ESTADOS + CONFIGURACIÓN TENANT/LOGIN`.

## 4. Prevalencia

- Continuidad general: documento maestro actualizado.
- Candidatas y empalme: addendum canónico de carril, complementado por el gate visual pre-empalme del plan Phase A cuando la candidata toque módulos críticos o exista P0 semántico.
- Secuencia Phase A: plan canónico.
- Estado puntual: checkpoint operativo vigente.
- Evidencia visual actual: `VALIDACION-VISUAL-V159-NO-APROBADO-20260718.md`.
- Identidad runtime/baseline: registry, build-lock y manifest.
- Claude: resumen y pendientes vigentes.
- Academia: addendum maestro e impacto vigente.

## 5. Fuentes superadas

No usar como estado operativo:

- checkpoints V110, V113, V114, V131 o V156 anteriores;
- checkpoint anterior que declaraba V159 pendiente únicamente de aprobación visual;
- `PHASE-A-LIVE-EXECUTION-CHECKPOINT-TYA-20260713.md`, salvo como histórico marcado SUPERADO;
- copias con `(1)` del índice, addendum, plan o checkpoint;
- planes paralelos que contradigan el plan canónico;
- addenda V159 que indiquen que no existe P0 visual.

Los históricos permanecen en GitHub, pero no gobiernan la ejecución.

## 6. Regla de continuidad

Cada sesión continúa desde el checkpoint vigente. No reconstruye auditoría V159, empalme, adapters, importadores, Auth readiness, reviewQueue, rollback, Hosting DEV ni smoke remoto.

Sí corrige focalizadamente el mapping/estado canónico, configuración tenant/login y consumidores visuales demostrados por el P0.

Para futuras candidatas críticas:

`AUDITORÍA → COMPOSITE TEMPORAL CON OVERLAYS → GATES SEMÁNTICOS → VISUALIZACIÓN PRE-EMPALME → APROBACIÓN → APPLY_DELTA_DIRECTLY DEL MISMO HASH`.

## 7. Mantenimiento

Después de cambiar baseline o siguiente acción:

1. actualizar el checkpoint canónico;
2. actualizar plan, registry y contrato vivo cuando corresponda;
3. registrar CAMBIOS, Claude, PENDIENTES, Academia y tracker;
4. mantener detalles históricos en GitHub;
5. conservar PR #7 draft/open hasta autorización expresa.
