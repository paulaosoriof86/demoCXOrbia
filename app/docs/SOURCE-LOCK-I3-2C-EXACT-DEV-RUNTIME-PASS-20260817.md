# SOURCE LOCK — I3.2C EXACT DEV RUNTIME PASS

**Fecha:** 2026-08-17 14:16 -06:00  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `I3_2_PASS__I3_3_PASS__NO_PERIODS_LIFECYCLE_FIX_RUNTIME_CONFIRMED__CONTINUE_I3_4`

## 1. Ejecución autorizada

Request: `i3-2c-exact-dev-runtime-confirm-no-periods-lifecycle-fix-20260817-01`.

Target source HEAD: `9ebdca78d463e7e8032d8c75175f9829a45636a1`.
Request commit: `9b9da36c7d3ff24640b1f71cec80345780adcef6`.
Run `32064468544`; job `95493109113`; artifact `9299444816`; digest `sha256:ecc3b96d38e22c1d7b02bea8c4674d70a3fb937257267a3b44736f777eb6eb38`.

## 2. Resultado autoritativo

Artifact `summary.json`: `PASS_C6_DEV_ROOT_ENTRYPOINT_HOSTING_AND_RUNTIME`.

Artifact `runtime/human-root.json`: `PASS_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY`.

Remote parity: `PASS_C6_DEV_ROOT_ENTRYPOINT_REMOTE_PARITY`, root/direct exact, SHA256 `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`.

## 3. I3.2 / I3.3 cerrados

El mismo build remoto demostró:

- Staff role `admin`, namespace `staff`;
- membership verified;
- 15 periodos;
- 660 visitas;
- 200 shoppers en read model;
- firstPeriod `2025-06`;
- latestPeriod `2026-08`;
- currentProjectId `cinepolis`;
- currentPeriodId `cinepolis-2026-08`;
- frontend handoff `entered`;
- stale provider empty cleared;
- router/shell mounted;
- selector Proyecto montado;
- selector Periodo montado;
- legal runtime present;
- legal provider authority true;
- legal pending false;
- canonical form real;
- 3 reloads estables;
- new-tab estable;
- no credentials/tokens expuestos.

Por tanto, el blocker `NO_PERIODS_VISIBLE` queda cerrado y el fix lifecycle-safe de `tya-phase-a-authority-compat-v1.js` está confirmado en DEV.

## 4. Seguridad

- Hosting deploys en este run: `1`;
- automatic second deploys: `0`;
- Cloud Run deploys: `0`;
- Auth writes/password changes/resets: `0`;
- Firestore writes: `0`;
- HR writes: `0`;
- Rules/Storage/Make/Gemini/payment writes: `0`;
- Historical Shopper access: `0`;
- user creates/updates: `0`;
- merge false;
- production false.

## 5. Congelado — NO REPROCESAR

I1/I2 PASS; I3.1 PASS; **I3.2 PASS; I3.3 PASS**; Historical Shopper `31906391682` PASS/reset consumido; TARGET_B Admin `32049054855` PASS; request08 consumido; HR 15/660 no reimport; Finance V2/source-safe/historical no rebuild; exact identity no fuzzy; legal no autoaccept.

## 6. Progreso

Formal sigue `35% / 65%` hasta I3.11 integral. El avance interno sí aumentó: I3.1→I3.3 quedan cerrados y congelados.

## 7. Siguiente acción exacta

`I3.4_POSTULATION_VS_HR_ASSIGNMENT_AUTHORITY_RUNTIME_READONLY`.

Debe comprobar sobre el mismo DEV que Postulaciones contiene solo posts persistidos de plataforma, que assignments HR permanecen separados y que no reaparece `hr-post-*` como postulación. Luego continuar I3.5→I3.7 sin diagnóstico general.

## 8. Clasificación

- Reusable CXOrbia: lifecycle-safe scope + same-build remote runtime proof.
- Exclusivo cliente: TyA/Cinépolis/15 periodos/660 visitas.
- Claude/prototipo: sin cambios modules/core.
- Academia: documentar readiness efectivo con selectores y persistencia de contexto.
- Sin impacto Claude: tooling/gates/evidencia, salvo obligación de no revertir el fix.
