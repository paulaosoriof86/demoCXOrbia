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
10. `backend/contracts/phase-a-hr-canonical-visit-state-r20-v1.json`
11. `backend/config/tya-tenant-runtime-profile.source-safe.json`
12. `backend/contracts/phase-a-live-execution-checkpoint-v1.json`
13. `backend/contracts/prototype-baseline-registry-v1.json`
14. `app/core/build-lock.js`

Después consultar:

15. `CAMBIOS-BACKEND.md` y el addendum vigente;
16. `RESUMEN-PARA-CLAUDE.md` y el addendum vigente;
17. `PENDIENTES-PROTOTIPO.md` y el addendum vigente;
18. impacto vigente de Academia;
19. tracker vigente de Phase A;
20. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

## 2. Addenda vigentes del bloque actual

- `VALIDACION-VISUAL-V159-NO-APROBADO-20260718.md`
- `CAMBIOS-BACKEND-ADDENDUM-CORTE-0B-R20-HISTORICO-20260718.md`
- `RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE-0B-R20-HISTORICO-20260718.md`
- `PENDIENTES-PROTOTIPO-ADDENDUM-CORTE-0B-R20-HISTORICO-20260718.md`
- `ACADEMIA-IMPACT-CORTE-0B-R20-HISTORICO-20260718.md`
- `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-CORTE-0B-R20-HISTORICO-20260718.md`

Los addenda anteriores de Hosting DEV PASS y de V159 NO APROBADA permanecen como evidencia histórica, pero el estado operativo actual lo gobiernan el checkpoint y los addenda R20.

## 3. Estado operativo que manda

- V159 está auditada y empalmada, pero fue `NO APROBADA` visualmente.
- Hosting DEV anterior se conserva solo como evidencia del fallo.
- V159 no es `ACTIVE_BASELINE`.
- Corte activo: `CORTE 0B — MOTOR CANÓNICO HISTÓRICO + TENANT/LOGIN`.
- Estado actual: `CORTE_0B_R20_IMPLEMENTED_PENDING_GATES_AND_VISUAL`.
- El motor R20 aplica a todos los periodos detectados en la HR, no solo mayo/junio/julio.
- Como mínimo debe cubrirse todo el año vigente si una fuente anterior no puede leerse.
- Mayo, junio y julio son muestras obligatorias de regresión, no lógica especial.
- Siguiente acción: ejecutar builder HR vivo R20, gates históricos, revisar conflictos y solo después publicar nuevo Hosting DEV con autorización específica.

## 4. Prevalencia

- Continuidad general: documento maestro actualizado.
- Candidatas/empalme: addendum canónico de composite previo y carril atómico.
- Secuencia Phase A: plan canónico.
- Estado puntual: checkpoint operativo vigente.
- Semántica HR: contrato R20.
- Tenant/login: perfil source-safe TyA.
- Evidencia del P0: validación visual V159 NO APROBADA.
- Runtime/baseline: registry, build-lock y manifest.
- Claude: resumen y pendientes vigentes.
- Academia: addendum maestro e impacto R20 vigente.

## 5. Regla de candidatas futuras

Para toda candidata que toque módulos críticos:

```text
EXECUTION_LANE_READY
→ AUDITORÍA DELTA
→ COMPOSITE TEMPORAL DEL MISMO HASH + BACKEND/OVERLAYS
→ GATES SEMÁNTICOS
→ VISUALIZACIÓN PRE-EMPALME
→ APROBACIÓN/HOLD
→ APPLY_DELTA_DIRECTLY DEL MISMO HASH APROBADO
→ COMMIT/PUSH ATÓMICO
→ POST-GATES
→ FREEZE
```

La rama viva no recibe la candidata antes de que Paula apruebe visualmente el composite exacto.

## 6. Fuentes superadas o que deben retirarse del panel de Fuentes

No usar como estado operativo:

- checkpoints anteriores que declaraban V159 pendiente únicamente de aprobación;
- copias con `(1)` del índice, addendum de empalme, plan o checkpoint;
- addenda antiguos de ejecución directa 20260716/20260717;
- planes paralelos que contradigan el composite pre-empalme;
- documentos que limiten el Corte 0B a mayo/junio/julio;
- ZIPs de candidatas como fuente maestra permanente.

Los históricos pueden permanecer en GitHub, pero no deben competir en Fuentes activas.

## 7. Regla de continuidad

Cada sesión continúa desde el checkpoint vigente. No reconstruye V159, el empalme, adapters, importadores, Auth readiness, reviewQueue, rollback ni Hosting anterior.

Sí continúa focalizadamente con:

- lectura multi-tab completa;
- motor histórico R20;
- conflictos de columnas/fechas;
- reconciliación de consumidores;
- tenant/login configurable;
- gates y nueva validación visual.

## 8. Mantenimiento

Después de cambiar estado, baseline o siguiente acción:

1. actualizar este índice;
2. actualizar checkpoint y plan;
3. actualizar registry/contrato cuando corresponda;
4. registrar CAMBIOS, Claude, PENDIENTES, Academia y tracker;
5. reemplazar en Fuentes los archivos canónicos, sin duplicarlos;
6. conservar PR #7 draft/open hasta autorización expresa.
