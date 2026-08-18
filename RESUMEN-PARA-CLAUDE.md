# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 13:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-SOURCE-CORRECTION-04`  
**Estado:** `NO_FRONTEND_PATCH__RUNTIME_IDENTITY_CONTRACT_SOURCE_CORRECTED__STAFF_READONLY_CLOSE_NEXT__GO_LIVE_35`

## Estado Phase A
I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 formal` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% / 65%**. I3 integral PASS → **60% / 40%**.

## Hallazgo y corrección reusable
La causa quedó probada en backend: `cxorbia-provider-identity-link-runtime-v1.js` usaba un predicate legacy incompatible con el contrato canónico. El target real `materialized + tenant_adjudication` era válido para `cxorbia-identity-roll-forward-v1` pero el runtime exigía `active + providerAck=true`, por lo que lo filtraba.

R3-A ya corrige exclusivamente:
- `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`;
- agrega `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs`.

La corrección preserva API/runtime bridge, exact technical identity, tenant/project isolation y cero fuzzy/name/email/phone matching. No toca `/app/modules`, `/app/core` ni `CX.data`.

## Qué NO debe hacer Claude
- no workaround UI;
- no hardcodear `TYA_GT_0C0BA8856E`;
- no recrear Admin/Shopper;
- no compensar desde módulos;
- no reinterpretar Cinépolis como lógica global.

## Siguiente bloque backend
`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_NO_WRITES`.

Primero ejecutará el parity gate source y luego una única prueba Staff/Admin DEV read-only. PASS esperado: `shp-57d2e3769946 → TYA_GT_0C0BA8856E`, agosto canonical `2`, residual `0`, duplicados `0`. Sin writes/password changes/deploy.

## Producto no-code/comercializable
TyA = primer tenant; Cinépolis = primer proyecto configurable. Mantener configuración por tenant/proyecto para source/mapping, país/moneda/timezone/locale, reglas/documentos/certificación, postulaciones/asignación, agenda, cuestionarios, evidencias/revisión, pagos, roles/notificaciones, integraciones y Academia. Fuentes objetivo: Sheets/Excel/CSV/API/CXOrbia/import/proveedor-link.

## I4 posterior a I3
1. documentos/certificación/disponibles/postulación/asignación;
2. agenda/reprogram/cancelación/ejecución/evidencias/cuestionario/submit/review;
3. HR bidireccional;
4. Finanzas/liquidaciones/pagos + multi-proyecto/no-code;
5. roles/scopes/notificaciones/integraciones.

## Academia
R3-A no confirma aún cambio visible para usuario. Si R3-B valida la conducta runtime corregida, sincronizar manuales/cursos/rutas/notificaciones con cualquier cambio operacional visible.

## Clasificación
- **Reusable CXOrbia:** runtime/canonical identity contract parity.
- **Exclusivo TyA/Cinépolis:** fixtures QA solamente.
- **Claude/prototipo:** sin parche UI.
- **Academia:** pendiente solo si R3-B confirma impacto visible.
- **Sin impacto Claude inmediato:** Staff read-only close.
