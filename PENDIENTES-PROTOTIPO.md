# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 16:39 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-IDENTITYMAP-SOURCE-PASS-HOSTING-AUTH-NEXT-11`  
**Estado:** `NO_UI_WORKAROUND__STAFF_HOLD_CONSUMED__IDENTITYMAP_SOURCE_FIX_PASS__HOSTING_AUTH_NEXT__GO_LIVE_35`

## Pendiente vivo único antes de volver a observar Staff

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_IDENTITYMAP_POSTCOMPOSE_SOURCE_NO_STAFF`.

No ejecutar Staff nuevamente hasta que el source corregido se materialice en Hosting DEV con paridad remota.

## Evidencia Staff post-hardening

Run `32192976458`, job `95891132356`, artifact `9344922862`, digest `sha256:2ac557db3318bbcd9013e455aa8bc34d64324ce89edbb4e325801ee08c3cc2dc`.

El hardening sí permitió llegar al runtime real:
- Admin/Staff autenticado;
- 15 períodos / 660 visitas;
- provider link target exacto presente y `materialized + tenant_adjudication`;
- agosto canonical `2`;
- residual live `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`;
- postulación y legal sanos;
- Historical Shopper `0`.

Único blocker: `targetCanonicalActual=null` porque `CX.data.__identityMap` no exportó el exact provider link ya aplicado.

El request quedó `enabled=false / consumed=true` en commit `b5effad60d643776c4deeb82a43b4ea114a1ec58`. No retry automático.

## Causa raíz demostrada

`PROVIDER_EXACT_LINK_APPLIED_BUT_NOT_EXPORTED_TO_CANONICAL_IDENTITY_MAP`.

No reparar provider link ni usuarios: el link ya existe, es exacto, authoritative y se aplicó; las dos visitas ya están en el canonical. La brecha estaba en la salida del adapter/composer hacia `identityMap`.

## Corrección source-only completada

- `e8742207db9e81b23f53429d7f487894ae9a9a0d`: post-compose exact provider-link → canonical identityMap.
- `0d73d6c3dced2d5c0e826a16fd2f785634af7515`: parity tests exactos/fail-closed.
- `a4c85480b10678eca83aae5781d255a27a994446`: parity integrado al P0 source gate.

Reglas del fix:
- canonical debe existir ya en output;
- conflicto previo no se sobreescribe;
- no creación de identidad;
- no fuzzy/name/email/phone matching;
- provider/Firestore/browser writes `0`.

Validación source: Source Safe Runtime Guard SUCCESS y `Run P0 exact identity source gates` SUCCESS en Visual Smoke run `32193643479`.

## Próximo gate — requiere autorización nueva

Máximo `1` Firebase Hosting DEV deploy del source exacto que contiene el post-compose bridge, seguido de remote byte/SHA parity del adapter.

Scope:
- Staff runtime `0`;
- provider identity/data writes `0`;
- Firestore data/Auth/Rules/HR/Storage/Make/Gemini/pagos/Historical Shopper `0`;
- Cloud Run `0`;
- merge/production false.

Después del Hosting PASS se abrirá una **nueva observación Staff read-only separada**. Cierre esperado:
- `shp-57d2e3769946 -> TYA_GT_0C0BA8856E` en `CX.data.__identityMap`;
- agosto canonical `2`;
- residual `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`.

I3 integral PASS → formal **60%**.

## Frozen / no reprocesar

I1/I2/I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C; focal provider; R3-B; R3-C anterior; Staff navigation HOLD; Staff post-hardening HOLD; HR 15/660; Finance V2/historical; legal V0.4.

## Claude/prototipo

No parche UI. No hardcode del target, no remapeo desde módulos/core, no creación de usuario alterno, no ocultamiento visual de identidad y no dedupe por similitud.

## Academia

Sin cambio visible en este slice. Cursos/manuales/rutas/notificaciones se actualizan con I4 cuando cambien flujos visibles.

## I4 después de I3

Shopper lifecycle; agenda/reprogramación/cancelación/ejecución/evidencias/cuestionario/review; HR bidireccional; liquidaciones/pagos; multi-proyecto/no-code; roles/scopes/notificaciones/integraciones; Academia/manuales.

## I5

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → gate explícito de producción → cutover/smoke → baseline.

## Avance

**Formal 35% / 65% pendiente.** El avance técnico es real, pero I3 no suma hasta PASS integral runtime.
