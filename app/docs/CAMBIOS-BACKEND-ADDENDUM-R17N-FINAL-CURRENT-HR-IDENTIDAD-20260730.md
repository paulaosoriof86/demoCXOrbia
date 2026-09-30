# CAMBIOS BACKEND — R17N FINAL / HR ACTUAL / IDENTIDAD REAL

Fecha: 2026-07-30

## Estado

`R17N_FINAL_CURRENT_HR_IDENTITY_READY__NO_EXECUTE__NO_DATA_WRITES__NO_PRODUCTION`

## Causa raíz corregida

El crosswalk anterior de 210 referencias shopper estaba basado en `app/data/tya-hr-source-safe-periods.js`, cuyo snapshot había sido generado el 2026-07-13. La HR viva cambió después de ese corte. Continuar resolviendo las 9 referencias del snapshot viejo habría tratado una fotografía histórica como verdad operativa actual.

Se releyó la HR viva y se generó una proyección source-safe actual hasta julio:

- 14 periodos;
- 616 visitas;
- 208 referencias shopper actuales;
- contra el snapshot previo de 210 refs: 2 agregadas, 4 retiradas, 206 en intersección;
- PII persistida en GitHub: 0;
- provider/HR/Firestore writes: 0.

## Identidad shopper actual

Crosswalk transaccional exacto contra `cxorbia-backend-dev`, usando `visitId`, `hrRowId` y `sourceSheet+sourceRow`:

- 208 refs HR actuales;
- 201 enlazadas a shoppers canónicos existentes;
- 7 sin evidencia transaccional exacta inicial;
- 0 conflictos;
- 571 visitas con match exacto y 45 sin evidencia canónica exacta por visita.

Las 7 restantes se reconciliaron en read-only con identidad real en memoria desde HR viva + shoppers actuales de `tya-plataforma` + evidencia canónica:

- 7/7 identidades reales presentes en HR viva;
- 2 corresponden a perfiles legacy actuales que serán create-candidates;
- 5 no existen ni en legacy actual ni en perfil canónico y serán create-candidates desde la identidad real HR vigente;
- 0 HOLD de identidad actual;
- nombre nunca usado como llave única de automerge;
- PII cruda persistida en GitHub: 0.

## R17N FINAL no-execute

Target: `cxorbia-backend-dev`, tenant `tya`, proyecto padre `cinepolis`.

- 208/208 referencias shopper con target definido;
- 201 reutilizan perfil canónico existente;
- 2 apuntan a perfiles legacy create-candidate incluidos en el set legacy;
- 5 requieren perfil nuevo desde HR viva con relectura de identidad en memoria al ejecutar;
- foundation: 16;
- perfiles legacy create: 120;
- perfiles HR-current create adicionales: 5;
- certificaciones create: 77; 1 certificación permanece HOLD;
- visitas: 616/616 ready;
- controles de liquidación: 572/572 ready; pagos=0;
- writes exactos potencialmente listos: 1,406;
- tenant update: HOLD;
- 22 existing-profile updates: HOLD por conflictos de campos no vacíos;
- 7 legacy profile holds: HOLD;
- `AGOSTO 26 HN`: HOLD.

Idempotencia offline: PASS. `executeAllowed=false`. Writes ejecutados: 0.

## Correcciones metodológicas del gate

1. El status del workflow offline fue cambiado a fail-closed basado en `job.status`; ya no puede publicar PASS solo porque exista evidencia antigua en el checkout.
2. Se detectó y corrigió un error de verificación del path `hrImports`: el contrato canónico usa `tenants/{tenantId}/projects/{projectId}/hrImports/{importId}`.
3. El contrato R14C financiero conserva un conteo shopper fijo de 210 y por eso no se fuerza sobre la HR actual de 208. Se preservan por separado sus 247 filas financieras, 196 enlaces exactos por visitId y 51 reviews para aplicarlos posteriormente por identidad estable, sin reintroducir el shopper-gap stale.

## Archivos principales

- `app/data/tya-hr-source-safe-current-through-july.js`
- `app/docs/evidence/CURRENT-HR-THROUGH-JULY-SOURCE-SAFE-LATEST.json`
- `app/docs/evidence/VISIT-IDENTITY-CROSSWALK-READONLY-LATEST.json`
- `app/docs/evidence/CURRENT-UNRESOLVED-SHOPPER-IDENTITY-READONLY-LATEST.json`
- `app/docs/evidence/R17N-FINAL-WRITE-PLAN-NO-EXECUTE-LATEST.json`
- `tools/reconciliation/tya-filter-current-hr-through-july-source-safe.mjs`
- `tools/reconciliation/tya-current-unresolved-shopper-identity-reconciliation-readonly.mjs`
- `tools/reconciliation/tya-r17n-final-write-plan-no-execute.mjs`

## Clasificación

- **Reusable CXOrbia:** freshness lock de fuente antes de identity crosswalk; status fail-closed; identidad transaccional + real; plan exacto idempotente antes de writes.
- **Exclusivo cliente:** TyA/Cinépolis, HR viva, `tya-plataforma`, 208 refs actuales, 120+5 perfiles create y 77 certificaciones.
- **Claude/prototipo:** no nueva candidata ni ajuste frontend; cuando el backend real esté materializado, la UI autorizada debe mostrar identidad real y no placeholders.
- **Academia:** distinguir snapshot histórico de fuente viva, anonimización de evidencia vs identidad operativa, crosswalk multi-fuente e idempotencia.
- **Sin impacto Claude:** workflows, probes, hashes y evidencia sanitizada.

## Seguridad

Firestore/Auth/Storage/HR/legacy writes=0; deletes=0; deploy=0; merge=false; producción=false; pagos/lotes/Make/Gemini=0.
