# CAMBIOS-BACKEND.md

**Última sincronización:** 2026-08-18 13:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-SOURCE-CORRECTION-04`  
**Estado:** `R3A_RUNTIME_IDENTITY_CONTRACT_SOURCE_CORRECTED__R3B_READONLY_CLOSE_AUTH_REQUIRED__GO_LIVE_35`

## Iteración R3-A — source correction reusable

Causa previa probada: `PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.

### Archivos
- Modificado: `app/adapters/cxorbia-provider-identity-link-runtime-v1.js`.
- Nuevo: `tools/qa/cxorbia-provider-identity-runtime-contract-parity-gate.mjs`.
- Evidencia: `app/docs/evidence/I3-11C-PROVIDER-RUNTIME-SOURCE-CORRECTION-LATEST.json`.
- Sin cambios en `/app/modules`, `/app/core` ni interfaz `CX.data`.

### Corrección
El runtime provider ya no exige únicamente `status=active` + `providerAck=true`. Se alinea con el contrato reusable `cxorbia-identity-roll-forward-v1`:
- estados authoritative `active|confirmed|approved|materialized`;
- authorities confiables `provider_exact|tenant_adjudication|platform_created|migrated_exact`;
- authorityRef requerido;
- period-independent obligatorio y period-scoped rechazado;
- `sourceSafe=false` rechazado;
- tenant/project isolation preservada;
- tokens/aliases técnicos exactos solamente;
- fuzzy/name/email/phone matching sigue deshabilitado.

Si `CX_IDENTITY_ROLL_FORWARD_CONTRACT` está disponible, el runtime delega a su `normalizeLink`; si no, usa fallback equivalente para evitar que backend-dev dependa de un cambio de `index.html`.

El parity gate cubre target `materialized`, estados/authorities, aislamiento tenant/project, period scope, sourceSafe, tokens técnicos y rechazo de name/email-only. El script queda preparado; su ejecución explícita se incorpora al próximo gate runtime read-only. No se afirma ejecución independiente del script en este bloque connector-only.

## Safety
Provider reads/writes `0/0`; Auth/Firestore-data/Rules/Hosting/CloudRun/HR/Storage/Make/Gemini/pagos/Historical Shopper `0`; merge/production false.

## Clasificación
- **Reusable CXOrbia:** corrección de trust contract + parity gate.
- **Exclusivo TyA/Cinépolis:** solo fixtures de QA.
- **Claude/prototipo:** sin parche UI.
- **Academia:** sin cambio funcional confirmado aún.
- **Sin impacto Claude inmediato:** source/runtime adapter.

## Avance
**Formal 35% / 65% pendiente.** R3-A queda aplicado. I3 solo pasa a 60% con R3-B runtime read-only integral PASS.

## Siguiente bloque exacto
`NEW_AUTH_REQUIRED_I3_11C_STAFF_RUNTIME_CANONICAL_IDENTITY_CLOSE_READONLY_NO_WRITES`.
