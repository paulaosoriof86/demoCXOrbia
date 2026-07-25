# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-24  
**Estado:** `V174_ACTIVE_BASELINE_V175_AUDITED_P0_PROVEN_HOLD_V176_REQUIRED_NO_FREEZE_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama obligatoria: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- No nueva rama, PR, `main` ni force push.
- Producción, merge, imports, pagos y writes reales: no ejecutados.

## 2. Baseline V174 preservada

- V174/M1/Corte 1/Corte 2A: PASS técnico y visual aprobado.
- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional V174: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Source lock visual: `d057d77c9117d9d451cfc9a6563083b78b926d57`.
- Módulos V174, HR source-safe, adapters y `CX.data`: preservados.

## 3. Corte 3 — verdad financiera canónica

- 14 periodos y 616 visitas HR;
- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos canónicos listos;
- 38 filas sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- 0 pagos confirmados;
- 0 lotes.

Mayo 2026:

- 44 visitas HR;
- 42 filas exactas;
- 2 revisiones fail-closed;
- 32 exactas GT;
- 10 exactas HN.

## 4. Estado previo a V175

- Hosting DEV publicado sobre V174.
- Smoke remoto live R25: PASS técnico, no aceptación visual.
- Validación móvil de Paula: siete P0 comprobados.
- Diagnóstico y paquete correctivo inicial: cerrados.
- Gate R26: creado y fail-closed.

## 5. Candidata V175 recibida

### EXECUTION_LANE_READY

- ZIP recibido y extraído en la misma sesión.
- Manifest y cinco SHA-256: PASS.
- UTF-8 sin BOM: PASS.
- `node --check`: 4/4 PASS.
- GitHub autenticado, rama viva y PR #7 verificados.

### Delta declarado

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js`;
- `app/app.js`;
- `app/styles/layout.css`.

### Correcciones válidas

- devengado/por pagar/pagado separados;
- `honPaga` eliminado;
- 85 % inferido eliminado;
- copy de análisis determinístico;
- estructura parcial multimoneda;
- estructura visual de revisión;
- intento de acceso Shopper DEV visible;
- mejoras responsive.

## 6. V175 — P0 comprobados

1. `_isDevAccess()` acepta `web.app`/`firebaseapp` genéricos y puede exponer el selector Shopper fuera del DEV autorizado.
2. La bandeja solo detecta campos faltantes; ignora `reviewRequired`, `financialSourceStatus`, `liquidationState` y `paymentState`, por lo que no demuestra las dos revisiones canónicas.
3. Movimientos sigue usando `CX.finStore.curPeriod()` para datos, presupuesto, exportación y “mes siguiente”, aunque el selector visible sea canónico.
4. Tabla, CxP, ingresos por tipo, presupuesto y KPIs principales de Beneficios siguen usando la moneda del primer país.
5. Presupuesto usa llaves incompatibles proyecto/periodo y puede ignorarse o duplicarse completo por país/moneda.
6. Dashboard permite exportar por existencia de países, no por filas financieras reales.

Evidencia adicional:

- screenshots 01 y 02 son idénticos;
- ninguna captura muestra la bandeja de revisiones;
- V175 reconoce que no validó los conteos canónicos TyA.

## 7. Gates

- R26 sobre V175: HOLD, ocho checks fallidos.
- R27 residual: HOLD, trece checks fallidos.
- Gate vigente agregado:
  `tools/qa/tya-corte3-v175-residual-p0-r27-gate.mjs`.

## 8. Decisión

- V175: `P0_PROVEN_HOLD`.
- V175 no se aplicó parcial ni totalmente.
- `APPLY_DELTA_DIRECTLY`: no ejecutado.
- Hosting DEV: no actualizado.
- Freeze: prohibido.
- Corte 4: no iniciar.
- Siguiente candidata requerida: V176 incremental sobre V175, preservando V174.

## 9. Documentación vigente del bloque

- `app/docs/AUDITORIA-V175-CORTE3-P0-PROVEN-HOLD-20260724.md`.
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V175-P0-HOLD-20260724.md`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V175-P0-HOLD-20260724.md`.
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V175-P0-HOLD-20260724.md`.
- `app/docs/ACADEMIA-IMPACTO-V175-P0-HOLD-20260724.md`.

## 10. Clasificación

- **Reusable CXOrbia:** allowlist DEV, periodo único, multimoneda total, presupuesto canónico, review queue y export fail-closed.
- **Exclusivo cliente:** cifras TyA/Cinépolis y dos revisiones GT.
- **Claude/prototipo:** corrección V176 de los cinco archivos.
- **Academia:** seguridad, periodo, moneda, presupuesto, revisión y evidencia.
- **Sin impacto Claude:** auditoría, R26/R27 y continuidad documental.

## 11. Siguiente bloque exacto

`CLAUDE CORRIGE V175 Y ENTREGA V176 INCREMENTAL → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + R27 → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL REAL → APROBADO → FREEZE CORTE 3`.

## 12. Estado seguro

Hosting DEV permanece en la versión anterior; sin producción, merge, Cloud Run deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini live.
