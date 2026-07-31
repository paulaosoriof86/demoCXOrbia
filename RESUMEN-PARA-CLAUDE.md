# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_STABLE_COMPOSER_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_CUMULATIVE_VISUAL__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS, mismatches0.
- Finanzas/pagos canónicos source-safe aprobados se preservan.
- PR#7 draft/open/no merge; producción intacta.

## 2. Regresión C6 anterior
La visual acumulativa mostró 88→44 visitas, badge1,232/546, scroll movido, shoppers repetidos, perfil/credenciales/histórico fragmentados y comparativo incompleto.

La HR canónica sigue30 tabs/28 mensuales y julio=34 GT+10 HN. El fallo era composición, no fuente.

## 3. Root fix estable aplicado y publicado
Backend adapters implementan:
- baseline HR inmutable por `sourceRevision`;
- composer puro `app/adapters/tya-cumulative-read-model.js`;
- no append de protected visits sobre HR;
- match exacto por `hrRowId`, `sourceTab+sourceRow` o `visitId`;
- crosswalk Shopper solo por evidencia técnica;
- HR mantiene estado operacional;
- perfil protegido agrega username/password/PII cuando el perfil exacto realmente los contiene;
- same revision=no reapply/no rerender;
- changed revision=1 apply +1 compose;
- scroll/selects/foco preservados; modal/form activo difiere rerender.

## 4. Regression gate local — PASS
`PASS_C6_STABLE_COMPOSER_3X_IDEMPOTENCE`:
-14 periodos/616 visitas/208 shoppers;
-120 perfiles protegidos;
-reapply1=616/208;
-reapply2=616/208;
-reapply3=616/208;
-duplicates visita0;
-duplicates shopper0;
-protected visits appended0;
-operational HR state preservado;
-profile overlay visible.

## 5. Hosting DEV + remote smoke — PASS
Autorización fresca consumida: `chat-20260731-c6-stable-cumulative-hosting-02`.

Se ejecutó exactamente1 redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`; Cloud Run0.

Decisión: `PASS_EXISTING_HOSTING_DEV_STABLE_C6_REMOTE_READY`.

Remote gate confirmó:
- composer/bridge/watcher/finance exactos al repo;
- regression 3x PASS sobre composer remoto;
- HR fresh meta + histórico616 + auto-month PASS;
- protectedVisitAppendZero;
- full-profile fail-closed sin sesión visual;
- Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0;
- merge=false; producción=false.

## 6. Qué NO debe hacer Claude
- no reconstruir HR, identidad o finanzas en módulos;
- no dedupe por nombre/teléfono/email;
- no volver a fixtures/demo;
- no reemplazar HR viva ni finanzas canónicas;
- no reintroducir estados superados;
- no crear su propio watcher o máquina de estados;
- no eliminar el regression lock al cambiar de etapa.

## 7. Regla de estabilidad para prototipo
Toda candidata futura debe conservar el read-model contract y pasar regression gate acumulativo. Una función nueva no compensa regresiones en Dashboard, Shoppers, histórico, Beneficios, Finanzas, periodos o fuente.

## 8. 31 identity HOLD
Continúan31 sin vínculo canónico reproducible. Requieren conciliación explícita posterior; no emparejar por similitud.

## 9. Gate pendiente
No ejecutar otro deploy bajo la autorización consumida.

Falta validación humana acumulativa del Hosting DEV ya publicado:3 refresh/focus cycles + Dashboard/HR + Shoppers/perfil/credenciales/histórico + comparativo + Beneficios + Finanzas.

Solo PASS humano permite congelar Corte6 y pasar a agosto.

## 10. Documentación asociada
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-STABLE-COMPOSER-ROOT-FIX-20260731.md`.
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-C6-STABLE-COMPOSER-HOSTING-DEV-REMOTE-PASS-20260731.md`.
- `app/docs/ACADEMIA-IMPACTO-C6-STABLE-COMPOSER-ROOT-FIX-20260731.md`.
- `app/docs/evidence/CORTE6-STABLE-COMPOSER-REGRESSION-GATE-LATEST.json`.
- `app/docs/evidence/CORTE6-STABLE-CUMULATIVE-HUMAN-VISUAL-HOSTING-LATEST.json`.

## 11. Siguiente bloque Phase A
`HUMAN VISUAL ACUMULATIVA PASS → FREEZE C6 → AGOSTO`.
