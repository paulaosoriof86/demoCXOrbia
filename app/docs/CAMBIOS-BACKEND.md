# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-17 15:09 -06:00  
**Estado:** `I3_5_PROVIDER_CROSSWALK_REQUIRED__I3_6_HARNESS_SOURCE_FIXED__NO_REPROCESS`

## 2026-08-17 — I3.5A source hunt + I3.6 frozen-reference harness fix

### I3.5A

Se revisaron contratos y fuentes repo de identidad/crosswalk sin provider write. La evidencia runtime previa permanece: `no_exact_hr_crosswalk`, target live `shp-57d2e3769946`, canonical esperado `TYA_GT_0C0BA8856E`, 2 visitas agosto residuales bajo live id y 0 bajo canonical.

El source-safe `shp-*`/shopperCode deriva de texto HR y no constituye ancla independiente. El contrato `phase-a-hr-source-safe-to-protected-candidates-v1` define `shopperIdentityLinkCandidates`, pero `writeStatus=not_written`, con writes/import/production bloqueados. No se localizó una autoridad materializada reutilizable para el target.

Decisión: `I3_5_PROVIDER_BACKED_CROSSWALK_MATERIALIZATION_REQUIRED`. No se inventó mapping ni se usó fuzzy/PII.

### I3.6 harness

Se modificó únicamente `tools/qa/tya-i3-staff-authority-readonly.mjs`.

Commit `84d26871c6f0cff96eaa84a8789d78b462e190ee` añade resolución read-only del frozen commit en checkout shallow mediante `git fetch --no-tags --depth=1 origin <sha>` cuando el objeto no está disponible, antes de comparar blobs.

No se toca historical Shopper, producto, frontend, core, HR o Finance. Combined status observado del commit: success (`cxorbia/c6-skip13-auth-access-adjudication/overall`, run `32069217043`).

### Source lock

`SOURCE-LOCK-I3-5A-NO-INDEPENDENT-CROSSWALK-I3-6-HARNESS-SOURCE-FIX-20260817.md`.

### Progreso

Formal sigue 35%/65% porque I3 no entrega sus 25 puntos hasta I3.11. Operativamente I3.1/.2/.3/.4/.7 están PASS; I3.6 product/evidence PASS con harness source fixed; I3.5 es la frontera exacta actual.

### Siguiente

`I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET`: primero provider exact-authority validation; STOP cero writes si no existe; si existe, máximo un identity-link materialization/update + ACK/readback. Requiere gate explícito.

## Frozen/no reprocess

Historical Shopper `31906391682`; TARGET_B Admin `32049054855`; request08; HR 15/660; Finance V2/historical; canonical V2/exact identity; durable legal receipt. No fuzzy, HR reimport, Finance rebuild, legal autoaccept, deploy/merge/production fuera de gate.

## Clasificación

Reusable CXOrbia: exact identity fail-closed/provider crosswalk/frozen reference harness. Exclusivo cliente: target agosto TyA. Claude/prototipo: no UI patch. Academia: distinguir id source-safe derivado de ancla canónica. Sin impacto Claude: harness/provider gate.
