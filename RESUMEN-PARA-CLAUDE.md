# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 13:13 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-CONTRACT-DRIFT-03`  
**Estado:** `NO_FRONTEND_PATCH__ROOT_CAUSE_RUNTIME_CONTRACT_DRIFT__ADAPTER_SOURCE_CORRECTION_NEXT__GO_LIVE_35`

## Estado Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 formal` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% / 65%**.

I3.9/I3.10 frozen PASS. Rules I3.11C PASS/consumed. Focal provider read PASS/consumed. R2B forensic PASS con causa raíz.

## Hallazgo reusable probado

No es una falla UI ni un link provider roto.

`app/adapters/cxorbia-provider-identity-link-runtime-v1.js` usa un predicate legacy que solo acepta `status === active` + `providerAck === true`.

El contrato reusable `app/adapters/cxorbia-identity-roll-forward-v1.js` acepta estados authoritative `active | confirmed | approved | materialized` y authorities confiables, incluida `tenant_adjudication` con authorityRef.

El target real está `materialized` + `tenant_adjudication`, por lo que el runtime legacy lo elimina del set aunque el provider y el contrato canónico lo consideran válido. `app/index-backend-dev.html` carga el runtime legacy.

Causa: `PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.

## Qué NO hacer en frontend

- no workaround UI;
- no hardcodear `TYA_GT_0C0BA8856E`;
- no recrear Admin/Shopper;
- no compensar desde módulos;
- no cambiar copy para esconder el HOLD.

## Siguiente bloque backend

`I3_11C_UNIFY_PROVIDER_IDENTITY_RUNTIME_WITH_CANONICAL_ROLL_FORWARD_SOURCE_CORRECTION_NO_PROVIDER_IO`.

Se toca únicamente adapter reusable + QA parity. `/app/modules` y `/app/core` permanecen intactos.

## Preservar

- interfaz exacta `CX.data`;
- identidad exacta/crosswalk; cero fuzzy/name/email/phone matching;
- multi-tenant `tenantId/projectId`;
- Staff/Admin existente;
- Historical Shopper frozen;
- Cinépolis proyecto configurable, no global.

## Producto no-code/comercializable

El fix es reusable CXOrbia. Configuración por tenant/proyecto debe seguir cubriendo país/moneda/timezone/locale; source/mapping; documentos/reglas/certificación; disponibilidad/postulación/asignación; agenda/reprogram/cancel; cuestionarios; ejecución/evidencias/revisión; pagos/liquidación; roles/scopes/notificaciones; integraciones/gates; privacidad y Academia.

Fuentes objetivo: Google Sheets, Excel, CSV, API, CXOrbia nativo, import manual y plataforma/proveedor/link externo. Project Builder: `crear → configurar source → mapear → dry-run → validar → activar → monitorear`.

## I4 después de I3

1. documentos/certificación/disponibles/postulación/asignación;
2. agenda/reprogram/cancelación/ejecución/evidencias/cuestionario/submit/review;
3. Finanzas/liquidaciones/pagos + multi-proyecto/configuración;
4. roles/scopes/notificaciones/integraciones + HR bidireccional;
5. estados vacíos/conflictos/revisión humana.

## Academia

Sin cambio funcional visible en R2B. Si el runtime correction cambia comportamiento visible confirmado, actualizar manuales/cursos/rutas/notificaciones junto al cierre funcional.

## Clasificación

- **Reusable CXOrbia:** identity runtime/canonical contract parity.
- **Exclusivo TyA/Cinépolis:** IDs exactos QA.
- **Claude/prototipo:** no cambio UI inmediato.
- **Academia:** sin cambio funcional todavía.
- **Sin impacto Claude inmediato:** adapter source correction.
