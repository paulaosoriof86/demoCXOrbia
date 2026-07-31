# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_STABLE_COMPOSER_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_CUMULATIVE_VISUAL__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Human no-credential access: auto-entry Admin + picker Shopper PASS.
- Stable composer code + local regression 3x PASS.
- Stable composer publicado en Hosting DEV + remote smoke PASS.

## 2. Regresión C6 anterior
La visual anterior mostró composición no idempotente: 88→44 visitas, badge1,232/546, scroll movido, duplicados Shopper, perfil/histórico repartido y comparativo incompleto.

La HR canónica continúa30 tabs/28 mensuales y julio=34 GT+10 HN. El problema no era la fuente.

## 3. Corrección permanente vigente
- composer canónico `app/adapters/tya-cumulative-read-model.js`;
- baseline HR inmutable por revision;
- protected visit solo overlay exacto; nunca append;
- crosswalk Shopper por llaves técnicas exactas;
- no dedupe por nombre/teléfono/email;
- watcher no hace nada funcional si la revision no cambió;
- refresh con cambio aplica1 vez y recompone1 vez;
- preservación scroll/selects/foco; modal/form difiere rerender;
- módulos/core frontend intactos.

## 4. Regression gate + Hosting remoto — PASS técnico
Local: tres reaplicaciones conservaron616 visitas/208 shoppers, duplicateVisitKeys0, duplicateShopperIds0 y protectedVisitsAppended0.

Remote: `PASS_EXISTING_HOSTING_DEV_STABLE_C6_REMOTE_READY` después de exactamente1 Hosting DEV autorizado. Composer/bridge/watcher/finance remotos coinciden exactamente con repo; regression 3x remoto PASS; HR fresh/616/auto-month PASS; Cloud Run0 y demás providers/writes0.

## 5. Pendiente P0 de cierre visual
No se declara resuelto visualmente hasta validar en browser real del Hosting DEV:
- ningún 88→44 u otro cambio transitorio en 3 refresh/focus cycles;
- scroll no salta;
- shoppers no se multiplican/reparten cuando existe crosswalk exacto;
- perfil/username/password/PII/histórico convergen en identidad canónica cuando existe fuente exacta;
- comparativo histórico conserva meses previos;
- Beneficios/Finanzas conservan fuente canónica;
- cuestionario completado/submitido no regresan.

## 6. Lock prototipo/Claude
Activo `app/docs/ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`.

Toda candidata futura debe preservar funcionalidades ya aprobadas; no puede reintroducir fuentes/estados/fixtures superados.

## 7. 31 perfiles sin canonical — HOLD
No resolvibles por vínculo técnico actual. No usar nombre/teléfono/email para emparejar.

## 8. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 9. Agosto
No ejecutar delta agosto hasta cerrar/freeze Corte6 mediante validación humana acumulativa del root fix remoto ya publicado.

## 10. Gate inmediato
`HUMAN VISUAL ACUMULATIVA 3x REFRESH + DOMINIOS COMPLETOS → PASS/FAIL → FREEZE C6 → AGOSTO`.

No ejecutar otro Hosting con la autorización consumida. No producción/merge.
