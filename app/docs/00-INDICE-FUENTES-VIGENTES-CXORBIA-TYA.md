# 00 - INDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-20
Estado: ACTIVO Y OBLIGATORIO

## Lectura obligatoria

1. Reglas maestras y continuidad.
2. Addendum de empalme directo y carril file-aware.
3. Addenda de Academia, patrones reutilizables y antidesvío.
4. Plan Phase A sin desviación.
5. `REGLA-PREVALENTE-VALIDACION-VISUAL-DESPUES-DE-CADA-CORTE-20260720.md`.
6. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
7. `AUDITORIA-V163-CORTE1-REPORTES-HOLD-20260720.md`.
8. `RESUMEN-PARA-CLAUDE-ADDENDUM-V163-CORRECCION-20260720.md`.
9. `PENDIENTES-V163-CORTE1-20260720.md`.
10. Contratos, CAMBIOS, tracker, Academia y PR #7.

## Estado vigente

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- `ACTIVE_BASELINE`: V161C/R21.
- Corte 0B congelado y aprobado visualmente.
- Estado: `CORTE_1_V163_HOLD_CORRECCION_CLAUDE_REQUERIDA`.

## Corte 1 aprobado antes de frontend

- 14 periodos y 616 visitas.
- 28 filas periodo/país y 308 filas periodo/país/sucursal.
- 611 asignadas, 5 sin asignar, 592 realizadas, 590 cuestionarios y 527 submitidas.
- 0 pagos confirmados.
- Run `29727050055`: SUCCESS.
- Artifact `8454684849`.

## V163

- Candidata: `Prototype development request (12).zip`.
- SHA-256: `73fcffc48f6d897c7b4e701ff6dbc61898ef6c9afe1ea8291d1950f0d8f5cfe0`.
- Decisión: `HOLD_P0_PROVEN_NO_APPLY`.
- No se aplicó frontend ni se ejecutó Hosting DEV.

P0:

- tres reportes de Sucursal usan métricas de todo el país;
- ausencia de `periodKey` cae silenciosamente en `latestPeriod`.

P1:

- Tendencia incluye el periodo activo;
- coincidencia normalizada de sucursal no exige unicidad.

## Certificaciones y recursos

- Certificaciones: Corte 2 funcional; Corte 6 permisos; Corte 7 sincronización/preservación.
- Recursos: contexto Corte 1; entrega Corte 2; permisos Corte 6; almacenamiento/versionado Corte 7.

## Regla visual

Después de cada corte Paula revisa visualmente el build exacto antes del freeze y antes de iniciar el siguiente.

## Siguiente bloque exacto

`CLAUDE CORRECCION V163 -> AUDITORIA CHATGPT -> APPLY_DELTA_DIRECTLY SOLO SI GO -> POST-GATES -> HOSTING DEV AUTORIZADO -> REVISION VISUAL -> FREEZE CORTE 1`

Corte 2 no comienza antes del freeze de Corte 1.
