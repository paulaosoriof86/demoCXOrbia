# CAMBIOS BACKEND — V174 VISUAL FREEZE, VISIT ID ESTABLE Y CORTE 3

**Fecha:** 2026-07-23

## 1. V174 preservada

V174 continúa como baseline activa, técnica y visualmente aprobada para M1/Corte 1/Corte 2A. No se modificaron sus módulos frontend ni la interfaz de `CX.data`.

## 2. Archivos creados

### Identidad estable de visita

- `tools/hr-source/tya-stable-visit-id-r20.mjs`;
- `tools/hr-source/tya-stabilize-source-safe-visit-ids-r20.mjs`;
- `tools/qa/tya-stable-visit-id-r20-gate.mjs`;
- `tools/qa/tya-source-safe-stable-visit-payload-r20-gate.mjs`.

### Corte 3 Finanzas

- `tools/qa/tya-corte3-financial-reconciliation-r20-gate.mjs`;
- `backend/contracts/tya-corte3-financial-r20-delta-review-v1.json`;
- `app/docs/CORTE3-FINANCIAL-RECONCILIATION-R20-TECHNICAL-PASS-20260723.md`.

### Source-lock verificable

- `tools/release/tya-v174-proposed-source-lock-verify.mjs`.

## 3. Archivos actualizados

- `tools/hr-source/tya-filter-source-safe-to-inventory-r20.mjs`;
- `tools/release/cxorbia-readonly-post-gates-runner.mjs`;
- `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`;
- `.github/workflows/cxorbia-readonly-post-gates-runner.yml`;
- `backend/contracts/cxorbia-controlled-runners-v1.json`;
- `app/docs/ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- este registro;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V174-VISUAL-FREEZE-CORTE3-INICIO-20260723.md`;
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V174-VISUAL-FREEZE-CORTE3-INICIO-20260723.md`;
- `app/docs/ACADEMIA-IMPACT-V174-VISUAL-FREEZE-CORTE3-INICIO-20260723.md`;
- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-ADDENDUM-V174-VISUAL-FREEZE-CORTE3-INICIO-20260723.md`;
- PR #7.

## 4. Causa raíz corregida

La identidad anterior usaba campos mutables de operación. Se reemplazó por identidad canónica basada en:

`tenantId + projectId + periodKey + country + sourceRow`.

El filtro runtime de inventario ahora estabiliza cada visita antes de que el snapshot sea consumido por plataforma o conciliación financiera.

## 5. Corte 3 — resultado

El perfil controlado produjo PASS técnico revisado:

- 616 visitas HR;
- 247 filas financieras;
- 209 enlaces exactos;
- 38 filas en revisión;
- 79 entradas en review queue;
- 15 enlaces nuevos exactos revisados;
- 2 enlaces anteriores retirados y mantenidos en revisión;
- 1 cambio de estado mantenido en revisión;
- 0 cambios de `hrRowId` canónico;
- 0 registros financieros nuevos o perdidos.

No se aprobó ni ejecutó ningún pago.

## 6. Regresión

El perfil V174/M1/Corte 2A se volvió a ejecutar con el filtro runtime y la identidad estable. Pasaron builder, encabezados, payload, HR in-place, histórico, reportes, proyecto/periodo/KPI, Corte 2A, M1, propuesta de source lock y verificación del composite propuesto.

Run: `30039152686`  
Artifact: `8576510415`  
Digest: `sha256:d9b3ac061fd8d667939fb5caec66810acfaf1a007d78c17cd685a56ae6b84eeb`.

## 7. Clasificación

- **Reusable CXOrbia:** identidad estable de visita, filtros runtime, reconciliación financiera fail-closed y revisión source-safe.
- **Exclusivo cliente:** delta financiero TyA/Cinépolis, 15 exactos nuevos y tres casos retenidos en revisión.
- **Claude/prototipo:** no cambiar módulos; próximo trabajo será consumo visual mediante adapter único. Responsive/PDF/Excel siguen pendientes no bloqueantes.
- **Academia:** identidad estable, review queue y separación entre conciliación, liquidación y pago.
- **Sin impacto Claude:** runners, gate contractual, artifacts y verificación source-lock efímera.

## 8. Siguiente bloque

`SNAPSHOT FINANCIERO CANÓNICO SOURCE-SAFE → ADAPTER ÚNICO → FINANZAS Y BENEFICIOS CONSUMEN LA MISMA VERDAD → GATES UI/EXPORTACIONES`.

## 9. Estado seguro

Sin merge, producción, deploy, import real, pagos, Firestore/Auth/Storage/HR writes, Make/Gemini ni base vieja conectada.
