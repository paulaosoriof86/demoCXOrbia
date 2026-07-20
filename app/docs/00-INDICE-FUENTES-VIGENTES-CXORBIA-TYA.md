# 00 - INDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-19
Estado: ACTIVO Y OBLIGATORIO

## Lectura obligatoria

1. Reglas maestras y continuidad.
2. Addendum de empalme directo y carril file-aware.
3. Addenda de Academia, patrones reutilizables y antidesvío.
4. Plan Phase A sin desviación.
5. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
6. Contratos R20/R21, inventario HR verificado, CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, tracker y PR #7.
7. Addenda V161C R21 Hosting DEV PASS creadas el 2026-07-19.

## Estado vigente

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- V161C aplicada por carril file-aware.
- Commit de empalme: `ab862d2e2a92993238ee96d214c7024fccb22c1a`.
- Estado: `HOSTING_DEV_REMOTE_SMOKE_PASS_PENDING_VISUAL`.
- Build DEV: `v161c-r21-source-safe-20260719-dev`.
- Commit exacto desplegado: `8950ef47a8dd0e6f86ad368ffb68b2be638accb6`.
- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.
- Workflow Hosting DEV: `29716601804`, resultado `SUCCESS`.
- Artifact: `8450820491`.
- Digest: `sha256:f207df387fe0449fc8382093097cb9c316746b60fdc42d8feaa67abe098dc96f`.
- Autorización de deploy consumida y workflow desactivado después del PASS.

## Evidencia funcional vigente

- Corte activo: `CORTE 0B - MOTOR CANÓNICO HISTÓRICO + TENANT/LOGIN`.
- Inventario del corte: junio 2025 a julio 2026, 14 periodos, 28 pestañas y 616 visitas.
- HR viva detectada: 15 periodos, 30 pestañas y 684 visitas; agosto 2026 queda pendiente después del freeze.
- Julio 2026: 44 visitas, 39 asignadas, 5 sin asignar, 4 disponibles y 1 bloqueada por elegibilidad.
- `availableVisits()` y `postulationEligibility()` presentes en remoto.
- Admin, Cliente, Shopper y Academia renderizados sin blockers ni errores de página/consola.
- Advertencia no bloqueante: 209 referencias shopper frente a referencia 216; mantener en revisión sin inventar identidades.
- Pagos confirmados o inferidos: 0.

## Fuentes de cierre V161C R21

- `CAMBIOS-BACKEND-ADDENDUM-V161C-R21-HOSTING-DEV-PASS-20260719.md`.
- `RESUMEN-PARA-CLAUDE-ADDENDUM-V161C-R21-HOSTING-DEV-PASS-20260719.md`.
- `PENDIENTES-PROTOTIPO-ADDENDUM-V161C-R21-HOSTING-DEV-PASS-20260719.md`.
- `PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-V161C-R21-HOSTING-DEV-PASS-20260719.md`.
- `ACADEMIA-IMPACT-V161C-R21-HOSTING-DEV-PASS-20260719.md`.

## Carril vigente

`EXECUTION_LANE_READY -> APPLY_DELTA_DIRECTLY -> POST-GATES -> HOSTING DEV -> REMOTE SMOKE -> VALIDACION VISUAL -> FREEZE`

## Siguiente acción exacta

Paula debe revisar visualmente la URL DEV exacta. Registrar solo diferencias reproducibles; si no existen, aprobar y congelar V161C como `ACTIVE_BASELINE`. No iniciar Corte 1 antes del freeze de Corte 0B.
