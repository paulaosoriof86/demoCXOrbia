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
9. `backend/contracts/phase-a-live-execution-checkpoint-v1.json`
10. `backend/contracts/prototype-baseline-registry-v1.json`
11. `app/core/build-lock.js`

Después consultar:

12. `CAMBIOS-BACKEND.md` y el addendum vigente;
13. `RESUMEN-PARA-CLAUDE.md` y el addendum vigente;
14. `PENDIENTES-PROTOTIPO.md` y el addendum vigente;
15. impacto vigente de Academia;
16. tracker vigente de Phase A;
17. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

## 2. Addenda vigentes del bloque actual

- `CAMBIOS-BACKEND-ADDENDUM-V159-HOSTING-DEV-PASS-20260718.md`
- `RESUMEN-PARA-CLAUDE-ADDENDUM-V159-HOSTING-DEV-PASS-20260718.md`
- `PENDIENTES-PROTOTIPO-ADDENDUM-V159-HOSTING-DEV-PASS-20260718.md`
- `ACADEMIA-IMPACT-V159-HOSTING-DEV-PASS-20260718.md`
- `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-V159-HOSTING-DEV-PASS-20260718.md`

## 3. Estado operativo que manda

- V159 está auditada, empalmada, desplegada en Hosting DEV y validada remotamente.
- Estado: `hosting_dev_remote_smoke_pass_pending_visual`.
- URL DEV exacta: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.
- P0 demostrado: no.
- Siguiente acción: validación visual de Paula.
- V159 solo pasa a `ACTIVE_BASELINE` después de `APROBADO`.
- No solicitar V160, no reauditar V159, no repetir empalme, Hosting DEV o smoke remoto.

## 4. Prevalencia

- Empalmes: addendum canónico de carril.
- Continuidad general: documento maestro actualizado.
- Secuencia Phase A: plan canónico.
- Estado puntual: checkpoint operativo vigente.
- Identidad runtime/baseline: registry, build-lock y manifest.
- Claude: resumen y pendientes vigentes.
- Academia: addendum maestro e impacto vigente.

## 5. Fuentes superadas

No usar como estado operativo:

- checkpoints V110, V113, V114, V131 o V156 anteriores;
- `PHASE-A-LIVE-EXECUTION-CHECKPOINT-TYA-20260713.md`, salvo como histórico marcado SUPERADO;
- copias con `(1)` del índice, addendum, plan o checkpoint;
- planes paralelos que contradigan el plan canónico;
- addenda V159 que todavía indiquen deploy o smoke pendientes.

Los históricos permanecen en GitHub, pero no gobiernan la ejecución.

## 6. Regla de continuidad

Cada sesión continúa desde el checkpoint vigente. No reconstruye auditoría V159, empalme, adapters, mapping, importadores, Auth readiness, reviewQueue, rollback, Hosting DEV ni smoke remoto.

Solo un P0 demostrado permite detener el freeze o solicitar corrección frontend.

## 7. Mantenimiento

Después de cambiar baseline o siguiente acción:

1. actualizar el checkpoint canónico;
2. actualizar registry y contrato vivo;
3. registrar CAMBIOS, Claude, PENDIENTES, Academia y tracker;
4. mantener detalles históricos en GitHub;
5. conservar PR #7 draft/open hasta autorización expresa.
