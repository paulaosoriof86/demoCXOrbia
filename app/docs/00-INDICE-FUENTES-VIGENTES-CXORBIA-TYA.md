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

## Estado vigente

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- V161C aplicada por carril file-aware.
- Commit de empalme: `ab862d2e2a92993238ee96d214c7024fccb22c1a`.
- Estado: `TECHNICAL_PASS_PENDING_DEV_AUTHORIZATION`.
- HEAD técnico post-gates: `7acc4e6c18355827df6ed649c3a537db07eec196`.
- Workflow R21: `29712762494`, resultado `SUCCESS`.
- Artifact: `8449340543`.
- Manifest: `app/docs/MANIFEST-V161C-EMPALME-DIRECTO-20260719.json`.
- Build lock: `app/core/build-lock.js`.
- Verificador: `tools/release/tya-v161c-empalme-directo-verify.mjs`.
- No publicar Hosting DEV sin autorización separada.

## Evidencia funcional vigente

- Corte activo: `CORTE 0B - MOTOR CANÓNICO HISTÓRICO + TENANT/LOGIN`.
- Inventario del corte: junio 2025 a julio 2026, 14 periodos, 28 pestañas y 616 visitas.
- La HR viva ya contiene agosto 2026; ese periodo se excluye del baseline de julio mediante `tya-hr-tab-inventory-r20-v1` y queda pendiente de incorporación después del freeze.
- Julio 2026: 44 visitas, 39 asignadas, 5 sin asignar, 4 disponibles y 1 bloqueada por elegibilidad.
- `availableVisits()` y `postulationEligibility()` presentes.
- 0 blockers, 0 page errors y 0 console errors en el smoke navegador R21.
- Advertencia no bloqueante: 209 referencias shopper frente a referencia 216; mantener en revisión sin inventar identidades.
- Decisión navegador: `PASS_WITH_WARNING_R21_TYA_SOURCE_SEMANTICS`.

## Carril vigente

`EXECUTION_LANE_READY -> APPLY_DELTA_DIRECTLY -> COMMIT/PUSH -> POST-GATES -> AUTORIZACION DEV -> VALIDACION VISUAL -> FREEZE`

## Siguiente acción exacta

Solicitar autorización separada para publicar Hosting DEV del mismo build canónico R21, ejecutar smoke remoto y recibir validación visual de Paula. No iniciar Corte 1 antes del freeze de Corte 0B.
