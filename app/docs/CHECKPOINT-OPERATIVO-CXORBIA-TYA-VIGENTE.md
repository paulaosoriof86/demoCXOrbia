# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-24  
**Estado:** `V174_ACTIVE_BASELINE_CORTE3_ROOT_CAUSE_DIAGNOSED_CORRECTION_PACKAGE_READY_P0_HOLD_NO_FREEZE_NO_PRODUCTION`

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

- 616 visitas HR;
- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos canónicos listos;
- 38 filas sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- 0 pagos confirmados;
- 0 lotes.

## 4. Hosting DEV y smoke técnico

- Hosting DEV: publicado.
- Remote live smoke R25: PASS técnico.
- Mayo 2026: 44 visitas HR, 42 filas exactas, 2 revisiones fail-closed, 32 exactas GT y 10 HN.
- El smoke validó DOM/spec y una sesión Shopper inyectada; no sustituyó descarga real, identidad visible ni viewport móvil.

## 5. Validación visual de Paula — P0 HOLD

1. **Multimoneda:** `Q 13,229` sumó `Q 7,368 + L 5,861`.
2. **Pago:** se mostró “honorarios pagados” con 0 pagos confirmados.
3. **Reembolsos:** se aplicó una conciliación inferida del 85 % sin fuente.
4. **Periodo:** Finanzas quedó aislado del contexto de 14 periodos.
5. **Exportación:** PDF vacío/incorrecto y Excel no generado.
6. **Revisión humana:** dos filas pendientes sin superficie visible.
7. **Shopper:** Beneficios no validable con identidad real/controlada desde el flujo visible DEV.

P1 vinculados:

- tablas, modales, topbar y breadcrumbs insuficientes en móvil;
- scroll horizontal sin pista;
- Dashboard y Movimientos/Tesorería ambiguos;
- exportación habilitada sin filas;
- copy de IA/Gemini no honesto.

## 6. Diagnóstico de causa raíz cerrado

- `app/modules/finanzas.js` usa la moneda del primer país en agregados multimoneda.
- `app/modules/beneficios.js` usa la moneda del primer país para totales del shopper.
- `app/core/finanzas-core.js` denomina `honPaga` a honorarios que no están pagados.
- `app/modules/finanzas.js` infiere `reembolsado = reembolso * 0.85`.
- Finanzas/Movimientos usan `CX.finStore.periods()` en vez del contexto canónico.
- R25 interceptó la especificación del reporte, no descargó ni abrió archivos reales.
- Las revisiones existen en datos, pero no en una bandeja visible.
- R25 inyectó `shopperId`; el flujo visible no ofreció identidad Shopper controlada.

Documento:

`app/docs/CORTE3-DIAGNOSTICO-CAUSA-RAIZ-Y-CORRECCION-FOCALIZADA-20260724.md`.

## 7. Corrección preparada

- Paquete focalizado para Claude:
  `app/docs/PAQUETE-CLAUDE-CORTE3-CORRECCION-FOCALIZADA-20260724.md`.
- Gate fuente fail-closed:
  `tools/qa/tya-corte3-p0-source-contract-r26-gate.mjs`.
- Plan Phase A canónico reconciliado con V174 y Corte 3.
- No se modificaron módulos/core desde backend.

## 8. Decisión

- Corte 3: `P0_PROVEN_VISUAL_HOLD`.
- Diagnóstico: cerrado.
- Corrección frontend: paquete listo, pendiente candidata de Claude.
- Freeze: prohibido.
- Corte 4: no iniciar.
- No tratar los P0 como pendientes cosméticos.

## 9. Siguiente bloque exacto

`CLAUDE APLICA PAQUETE FOCALIZADO SOBRE V174 → ENTREGA CANDIDATA → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + GATES → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL REAL → APROBADO → FREEZE CORTE 3`.

## 10. Clasificación

- **Reusable CXOrbia:** multimoneda, estados devengado/por pagar/pagado, review queue visible, exportación real y sesión visible por rol.
- **Exclusivo cliente:** cifras TyA/Cinépolis y dos revisiones de mayo.
- **Claude/prototipo:** Finanzas, Movimientos, Beneficios, reportes, periodo, responsive y copy IA.
- **Academia:** monedas, liquidación/pago, revisión, exportación y rutas por rol.
- **Sin impacto Claude:** gate R26, diagnóstico y reconciliación documental.

## 11. Estado seguro

Hosting DEV permanece publicado; sin producción, merge, Cloud Run deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini live.
