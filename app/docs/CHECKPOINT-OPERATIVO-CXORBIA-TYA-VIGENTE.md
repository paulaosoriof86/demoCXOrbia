# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-24  
**Estado:** `V174_ACTIVE_BASELINE_CORTE3_P0_PROVEN_VISUAL_HOLD_NO_FREEZE_NO_PRODUCTION`

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
- El smoke validó DOM/spec y una sesión Shopper controlada; no sustituyó la validación humana de archivos, identidad real y móvil.

## 5. Validación visual de Paula — HOLD

Paula aportó diez capturas móviles y demostró los siguientes P0:

1. **Multimoneda:** `Q 13,229` resulta de sumar `Q 7,368 + L 5,861` y rotular el total como quetzales.
2. **Pago:** la UI habla de “honorarios pagados” con 0 pagos confirmados.
3. **Reembolsos:** se presentan diferencias conciliadas/inferidas sin fuente confirmada.
4. **Periodo:** el selector financiero solo muestra `2026-07` y no los 14 periodos canónicos.
5. **Exportación:** PDF vacío/incorrecto y Excel no generado.
6. **Revisión humana:** las dos filas pendientes no se muestran ni se pueden localizar.
7. **Shopper:** Beneficios no se puede validar con una identidad Shopper real visible en DEV.

P1 confirmados:

- tablas, modales, topbar y breadcrumbs no operables correctamente en móvil;
- scroll horizontal sin señal;
- Dashboard y Movimientos/Tesorería ambiguos;
- copy de IA/Gemini no honesto mientras la integración está bloqueada;
- exportación habilitada con 0 filas.

## 6. Ubicación de las dos revisiones

Por conteos canónicos, ambas pertenecen a Guatemala: 34 visitas HR GT frente a 32 exactas GT; Honduras tiene 10/10 exactas. La UI no expone `visitId`, `hrRowId`, shopper, cine ni motivo para identificarlas.

## 7. Decisión

- Corte 3: `P0_PROVEN_VISUAL_HOLD`.
- Freeze: prohibido.
- Corte 4: no iniciar.
- No se permite tratar los P0 como pendientes cosméticos P1/P2.

## 8. Documentación

- `VALIDACION-VISUAL-CORTE3-HOLD-PAULA-20260724.md`.
- `CAMBIOS-BACKEND-ADDENDUM-CORTE3-VISUAL-HOLD-20260724.md`.
- `RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE3-VISUAL-HOLD-20260724.md`.
- `PENDIENTES-PROTOTIPO-ADDENDUM-CORTE3-VISUAL-HOLD-20260724.md`.
- `ACADEMIA-IMPACTO-CORTE3-VISUAL-HOLD-20260724.md`.

## 9. Siguiente bloque exacto

`DIAGNÓSTICO DE CAUSA RAÍZ POR HALLAZGO → PAQUETE FOCALIZADO PARA CLAUDE/PROTOTIPO + AJUSTE DE GATES → CANDIDATA AUDITADA → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL REAL → APROBADO → FREEZE CORTE 3`.

## 10. Clasificación

- **Reusable CXOrbia:** separación multimoneda, estados de pago honestos, review queue visible, pruebas reales de exportación y sesión por rol.
- **Exclusivo cliente:** cifras y filas TyA/Cinépolis.
- **Claude/prototipo:** Finanzas, Movimientos, Beneficios, reportes, periodo, responsive y copy IA.
- **Academia:** monedas, liquidación/pago, revisión, exportación y rutas por rol.
- **Sin impacto Claude:** documentación y actualización de estado.

## 11. Estado seguro

Hosting DEV permanece publicado; sin producción, merge, Cloud Run deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes, Make ni Gemini live.
