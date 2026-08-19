# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 19:44 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-SOURCE-READINESS-HOLD-18`  
**Estado:** `LOCKED__I3_PASS_FROZEN__GO_LIVE_60__I4A_READINESS_HOLD__TEST_SHOPPER_RESOLUTION_NEXT__NO_PRODUCTION`

## Carril vigente

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Avance formal

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS` frozen; I4 `0/25` in progress/not scored; I5 `0/15` = **60% / 40%**.

## Frozen / no reprocesar

I1/I2/I3 completo; Historical Shopper; TARGET_B Admin; Rules/provider/Hosting/Staff I3.11C; HR `15/660`; Finance V2/historical; legal V0.4. No reabrir I3.

## I4-A — Shopper lifecycle

Fuente de alcance: addendum maestro Phase A 2026-08-17, sección `9. I4 — operación visible`.

### Readiness adjudication

`HOLD_I4A_SOURCE_READINESS__VISIBLE_SHOPPER_LIFECYCLE_COVERAGE_NOT_YET_PROVEN`

**Probado/reutilizable:**
- `app/adapters/tya-canonical-shopper-portal-v2.js`: identidad Shopper exacta; Mi Perfil/contacto; certificación visible; histórico canónico/estados; read-only.
- `app/adapters/cxorbia-shopper-membership-wiring-v1.js`: membership exacto tenant/shopper/projectIds, role `shopper`, scopes y fail-closed; browser provider/Firestore writes `0`.
- `app/adapters/cxorbia-shopper-admin-command-contract-v1.js`: contrato reusable create/update/reset protegido, provider ACK obligatorio, campos sensibles protegidos, sin password/token en browser ni localStorage.
- I3 congelado: postulación vs asignación HR PASS; `8` platform posts; `15` HR assignments; HR assignments no son postulations; histórico preservado.

**Aún no probado como experiencia visible Shopper E2E:** documentos/instrucciones; disponibles; acción de postulación; notificaciones; presentación de certificación nueva. No se adjudica que falten del producto: solo no están probadas por la evidencia canónica inspeccionada.

No hubo runtime Shopper, login, selección de credencial, provider/data writes, deploy, merge ni producción en este bloque.

## Siguiente frontera exacta

`I4A_RESOLVE_EXISTING_NONHISTORICAL_TEST_SHOPPER_IDENTITY_FROM_FROZEN_EVIDENCE__READONLY_NO_LOGIN`

Resolver exactamente una identidad Shopper de prueba/no histórica ya existente usando solo evidencia congelada. Prohibido Historical Shopper. Sin login/credential selection ni mutaciones. Después, si resulta elegible, se requerirá autorización separada para una única observación visible I4-A DEV.

## Clasificación

- **Reusable CXOrbia:** contratos exact identity/membership/admin command y patrón fail-closed.
- **Exclusivo TyA:** contraste inicial con lifecycle real y evidencia HR/postulación.
- **Claude/prototipo:** no parchear UI; cualquier superficie visible no probada se documenta, no se corrige desde backend.
- **Academia:** certification/instructions/notifications quedan dentro del futuro contraste visible; sin cambio actual.
- **Sin impacto Claude inmediato:** readiness source-only/read-only.
