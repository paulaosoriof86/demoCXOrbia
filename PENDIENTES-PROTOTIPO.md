# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_STABLE_COMPOSER_CODE_PASS__LOCAL_REGRESSION_3X_PASS__PENDING_ONE_HOSTING_DEV_AUTH__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Human no-credential access: auto-entry Admin + picker Shopper PASS.

## 2. P0 reproducido — root fix ya implementado en código
El fallo visual fue composición no idempotente: 88→44 visitas, badge1,232/546, scroll movido, duplicados Shopper, perfil/histórico repartido y comparativo incompleto.

La HR canónica continúa30 tabs/28 mensuales y julio=34 GT+10 HN.

## 3. Corrección permanente aplicada
- composer canónico `app/adapters/tya-cumulative-read-model.js`;
- baseline HR inmutable por revision;
- protected visit solo overlay exacto; nunca append;
- crosswalk Shopper por `hrRowId`, `sourceTab+sourceRow`, `visitId`, ids canónicos/legacy exactos;
- no dedupe por nombre/teléfono/email;
- watcher no hace nada funcional si la revision no cambió;
- refresh con cambio aplica1 vez y recompone1 vez;
- preservación scroll/selects/foco; modal/form difiere rerender;
- módulos/core frontend intactos.

## 4. Regression gate local PASS
Tres reaplicaciones consecutivas conservaron exactamente616 visitas/208 shoppers, cero duplicateVisitKeys, cero duplicateShopperIds y cero protectedVisitsAppended. Estado HR y perfil protegido se preservaron.

Pendiente: validar el mismo contrato ya publicado en Hosting DEV y en human visual real.

## 5. Lock prototipo/Claude
Sigue activo `app/docs/ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`.

Toda candidata futura debe pasar el regression gate acumulativo y no puede reintroducir fuentes/estados/fixtures superados.

## 6. 31 perfiles sin canonical — HOLD
No resolvibles por vínculo técnico actual. No usar nombre/teléfono/email para emparejar.

## 7. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 8. Agosto
No ejecutar delta agosto hasta cerrar/freeze Corte6 mediante validación remota/humana del root fix.

## 9. Siguiente bloque
Se necesita autorización fresca para `1x Hosting DEV cxorbia-backend-dev/cxorbia-dev`; después remote smoke + human visual3x refresh. No Cloud Run, no producción.
