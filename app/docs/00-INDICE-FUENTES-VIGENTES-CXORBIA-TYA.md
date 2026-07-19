# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-18  
Estado: ACTIVO Y OBLIGATORIO

## Lectura obligatoria

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
2. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
3. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
4. Addenda de Academia, patrones reutilizables y antidesvío.
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
7. Contratos R20/R21, CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, tracker y PR #7.

## Estado vigente

- Rama viva: `docs-tya-v6-v71-audit`.
- V159 empalmada, aún no `ACTIVE_BASELINE`.
- Corte activo: `CORTE 0B — MOTOR CANÓNICO HISTÓRICO + TENANT/LOGIN`.
- Estado: `R21_TECHNICAL_PASS_PENDING_FRONTEND_CORRECTION_AND_NEW_DEV_AUTHORIZATION`.
- Commit técnico validado: `287cd0729c14ef9dfe63ce566c6bc2ff8604f2a0`.
- R18A run `29669393823`: éxito.
- Gates completos run `29669735189`: éxito.
- Artifact `8436913243`.
- El DEV publicado sigue en R20, commit `68ac6513df24b307d46836c84ac15eb9ecd52648`, con validación visual `NO APROBADA`.
- R21 no está desplegado.

## Evidencia

- 14 periodos y 616 visitas, junio 2025–julio 2026.
- 44 visitas por periodo: 34 GT y 10 HN.
- Julio: 39 asignadas, 5 sin asignar, 4 disponibles, 1 bloqueada por `P1Q`, 35 programadas, 21 realizadas/cuestionario y 14 submitidas.
- Cero liquidaciones o pagos inferidos.
- 209 referencias shopper frente a 216: revisión no bloqueante, sin crear ni eliminar identidades.

## Pendiente frontend

1. `app/core/router.js`: proyecto/periodo separados y selectores por alcance.
2. `app/modules/visita-detalle.js`: consumir elegibilidad y no mostrar `null` ni éxito falso.
3. `app/app.js`: login desde perfil tenant.
4. Cliente: Academia separada de Capacitación.

Handoff: `RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE-0B-R21-POSTULACION-LOGIN-Y-SELECTORES-20260718.md`.

## Carril vinculante

`EXECUTION_LANE_READY → AUDITORÍA DELTA → GO o P0_PROVEN → APPLY_DELTA_DIRECTLY → POST-GATES → VALIDACIÓN VISUAL → FREEZE`

No crear nueva rama, PR, composite previo obligatorio ni tarea manual para Paula.

## Siguiente acción

Claude corrige solo los cuatro puntos; el delta se aplica directamente en la rama viva; se ejecutan post-gates; luego se solicita autorización separada para nuevo Hosting DEV y se repite la validación visual. Corte 0B solo se congela con `APROBADO`.

Paula no debe volver a sustituir las Fuentes durante este estado intermedio.
