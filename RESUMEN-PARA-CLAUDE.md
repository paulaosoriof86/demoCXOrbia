# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_STABLE_COMPOSER_CODE_PASS__LOCAL_REGRESSION_3X_PASS__PENDING_ONE_HOSTING_DEV_AUTH__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe aprobados se preservan.
- PR#7 draft/open/no merge; producción intacta.

## 2. P0 visual anterior
La visual acumulativa mostró 88→44 visitas, badge1,232/546, scroll movido, shoppers repetidos, perfil/credenciales/histórico fragmentados y comparativo incompleto.

La HR canónica sigue30 tabs/28 mensuales y julio=34 GT+10 HN. El fallo era composición, no fuente.

## 3. Root fix estable aplicado
Backend adapters ya implementan:
- baseline HR inmutable por `sourceRevision`;
- composer puro `app/adapters/tya-cumulative-read-model.js`;
- no append de protected visits sobre HR;
- match exacto por `hrRowId`, `sourceTab+sourceRow` o `visitId`;
- crosswalk Shopper solo por evidencia técnica;
- HR mantiene estado operacional;
- perfil protegido agrega username/password/PII cuando el perfil realmente los contiene;
- same revision=no reapply/no rerender;
- changed revision=1 apply +1 compose;
- scroll/selects/foco preservados; modal/form activo difiere rerender.

## 4. Regression gate local PASS
`PASS_C6_STABLE_COMPOSER_3X_IDEMPOTENCE`:
-14 periodos/616 visitas/208 shoppers;
-120 perfiles protegidos;
-616 protected visits de prueba con IDs alternos;
-reapply1=616/208;
-reapply2=616/208;
-reapply3=616/208;
-duplicates visita0;
-duplicates shopper0;
-protected visits appended0;
-operational HR state preservado;
-profile overlay visible.

CI remoto no se ejecutó; evidencia local está documentada como tal.

## 5. Qué NO debe hacer Claude
- no reconstruir HR, identidad o finanzas en módulos;
- no dedupe por nombre/teléfono/email;
- no volver a fixtures/demo;
- no reemplazar HR viva ni finanzas canónicas;
- no reintroducir estados superados;
- no crear su propio watcher o su propia máquina de estados.

## 6. Regla de estabilidad para prototipo
Toda candidata futura debe conservar el read-model contract y pasar regression gate acumulativo. La función nueva no compensa una regresión en Dashboard, Shoppers, histórico, Beneficios, Finanzas, periodos o fuente.

## 7. 31 identity HOLD
Continúan31 sin vínculo canónico reproducible. Requieren conciliación explícita posterior; no emparejar por similitud.

## 8. Gate pendiente
El fix está en GitHub, no desplegado. Requiere autorización fresca para exactamente1 redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`; no Cloud Run.

Después: remote smoke + human visual con 3 refresh y validación Dashboard/HR, Shoppers/perfil/credenciales/histórico, comparativo, Beneficios y Finanzas.

## 9. Documentación asociada
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-STABLE-COMPOSER-ROOT-FIX-20260731.md`.
- `app/docs/ACADEMIA-IMPACTO-C6-STABLE-COMPOSER-ROOT-FIX-20260731.md`.
- `app/docs/evidence/CORTE6-STABLE-COMPOSER-REGRESSION-GATE-LATEST.json`.

## 10. Siguiente bloque Phase A
`1x HOSTING DEV AUTORIZADO → REMOTE/HUMAN REGRESSION PASS → FREEZE C6 → AGOSTO`.
