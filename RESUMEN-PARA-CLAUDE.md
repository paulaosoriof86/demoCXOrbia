# RESUMEN-PARA-CLAUDE.md

**Última sincronización:** 2026-08-18 14:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-R3B-HOLD-DEV-HOSTING-PARITY-05`  
**Estado:** `NO_FRONTEND_PATCH__SOURCE_CONTRACT_CORRECTED__REMOTE_DEV_PENDING_HOSTING_MATERIALIZATION__GO_LIVE_35`

## Estado Phase A

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 formal` hasta cierre integral; I4 `0/25`; I5 `0/15` = **35% / 65%**. I3 integral PASS → **60% / 40%**.

## Qué se probó en R3-B

Run `32181137350` ejecutó una sola validación Staff/Admin DEV read-only.

El source backend corregido pasó `PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY`; por tanto el contrato reusable en GitHub sí reconoce enlaces authoritative `materialized + tenant_adjudication` y mantiene identity matching exclusivamente técnico/exacto.

Sin embargo, el runtime remoto DEV siguió observando:
- `1` provider identity link;
- `0` target links;
- canonical actual `null`;
- agosto canonical `0`;
- residual live `2`;
- duplicados `0/0`.

No hay evidencia de nueva falla UI. El mismo runtime lastState mostró app montada, authority lista, 8 postulaciones plataforma, 15 asignaciones HR correctamente separadas y legal provider authority/receipt accepted funcionando.

## Causa actual / frontera backend

`I3_11C_CORRECTED_SOURCE_NOT_EFFECTIVE_IN_REMOTE_DEV__HOSTING_MATERIALIZATION_REQUIRED`.

R3-A corrigió el adapter pero hizo Hosting deploy `0`; R3-B también hizo Hosting deploy `0` y probó el sitio DEV remoto. El siguiente trabajo es materializar el source ya corregido en Firebase Hosting DEV y verificar paridad del asset servido. No volver a cambiar el provider link ni inventar workaround UI.

## No hacer en frontend

- no hardcodear `TYA_GT_0C0BA8856E`;
- no remapear desde módulos;
- no esconder los dos residuales visualmente;
- no cambiar `/app/modules` ni `/app/core` por este hallazgo;
- no reconstruir identidad por nombre/email/teléfono;
- no crear Admin/Shopper alterno.

## Siguiente bloque backend

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_CORRECTED_IDENTITY_RUNTIME_NO_PROVIDER_DATA_WRITES`.

Alcance: máximo un deploy Hosting DEV + remote parity. Después se requerirá un gate Staff read-only separado para probar el cierre integral de I3.

## Preservar

- interfaz exacta `CX.data`;
- identidad exacta/crosswalk, no fuzzy matching;
- Staff/Admin existente;
- Historical Shopper frozen;
- I3.9/I3.10 frozen;
- multi-tenant `tenantId/projectId`;
- Cinépolis proyecto configurable, nunca global;
- Rules I3.11C ya desplegadas y consumidas, sin redeploy.

## I4 después de I3

1. documentos/certificación/disponibles/postulación/asignación;
2. agenda/reprogram/cancelación/ejecución/evidencias/cuestionario/submit/review;
3. HR bidireccional;
4. Finanzas/liquidaciones/pagos + multi-proyecto/configuración;
5. roles/scopes/notificaciones/integraciones;
6. Academia/manuales/rutas/notificaciones en paralelo a cambios visibles.

## Clasificación

- **Reusable CXOrbia:** source-vs-deployed-runtime parity y canonical identity contract.
- **Exclusivo TyA/Cinépolis:** IDs y fixtures de validación.
- **Claude/prototipo:** sin cambio UI inmediato.
- **Academia:** sin cambio funcional inmediato.
- **Sin impacto Claude inmediato:** Hosting DEV materialization.
