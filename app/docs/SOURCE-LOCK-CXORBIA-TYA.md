# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 14:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-R3B-HOLD-DEV-HOSTING-PARITY-05`  
**Estado:** `LOCKED__R3B_HOLD_CONSUMED__CORRECTED_IDENTITY_SOURCE_PENDING_DEV_HOSTING_MATERIALIZATION_AUTH__NO_PRODUCTION`

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

Canonical state: `app/docs/CXORBIA-EXECUTION-STATE.json`.

## Formal

**35% completado / 65% pendiente.** I3 sigue `0/25` hasta PASS integral; al cerrar I3 pasa a 60%.

## Frozen / no rerun

I1/I2; I3.1→I3.10; Historical Shopper run `31906391682`; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C run `32163552089`; focal provider read run `32171812808`; R3-B Staff run `32181137350`; HR 15/660; Finance V2/historical; legal V0.4.

No crear Admin/Shopper workaround. No reset/recovery Historical Shopper. No Rules redeploy. No provider identity-link repair. No rerun automático de R3-B.

## R3-B — HOLD consumido

Run `32181137350`, artifact `9340865585`:
- static source parity: `PASS_PROVIDER_IDENTITY_RUNTIME_CANONICAL_CONTRACT_PARITY`;
- Rules: verified prior state reused, `0` redeploy;
- Staff/Admin browser executed exactly once;
- base decision `FAIL_C6_UNIFIED_HUMAN_AUTH_STAFF_ADMIN_RUNTIME_READONLY` / `AUTH_RUNTIME_TIMEOUT`;
- provider runtime link count `1`, target link count `0`;
- target canonical actual `null`;
- agosto canonical `0`, residual live `2`;
- visit/shopper duplicates `0/0`;
- postulation authority and durable legal state remain healthy in runtime lastState;
- all writes/deploys/production in R3-B `0`.

## Bloqueador actual

`I3_11C_CORRECTED_SOURCE_NOT_EFFECTIVE_IN_REMOTE_DEV__HOSTING_MATERIALIZATION_REQUIRED`.

R3-A corrigió el adapter en GitHub y R3-B demostró paridad canónica de ese source, pero ninguno de esos bloques desplegó Hosting. La prueba R3-B se hizo contra `cxorbia-backend-dev.web.app` y el comportamiento remoto continúa siendo el del filtro anterior. No se capturó el hash remoto exacto, de modo que el cierre correcto es materializar primero el source corregido en DEV y verificar paridad del asset servido.

## Siguiente frontera

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_CORRECTED_IDENTITY_RUNTIME_NO_PROVIDER_DATA_WRITES`

Solo con nueva autorización expresa:
1. máximo un deploy Firebase Hosting DEV;
2. rama viva/fuente corregida exacta;
3. remote fingerprint/hash o prueba semántica inequívoca del adapter corregido;
4. cero provider identity writes, Firestore data writes, Auth writes, Rules, HR, Storage, Make, Gemini, pagos, Historical Shopper, Cloud Run, merge y producción;
5. no ejecutar automáticamente Staff después del deploy.

Hosting PASS abrirá un nuevo gate Staff read-only separado.

## Circuit breaker

- PASS consumido no se repite salvo regresión nueva reproducible.
- R3-B HOLD consumido no se repite antes de materializar Hosting DEV.
- Dos repeticiones sin nueva reducción causal → `FORENSIC_STOP`.
- Si documentación y evidence/HEAD divergen → `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`.
- Gate ejecutado no sincronizado → `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`.

## Producto / frontend / Academia

TyA = primer tenant; Cinépolis = primer proyecto configurable. El fix es reusable backend. No hardcode global, no parche `/app/modules` o `/app/core`, no workaround UI. Academia no cambia por este bloque técnico; los cambios funcionales visibles de I4 actualizarán manuales/cursos/rutas/notificaciones en paralelo.

## Producción

Producción permanece sin autorización y sin cambios. Después de I3: I4 visible; luego I5 freeze/build-lock/preprod/rollback/same-build E2E/gate explícito de producción/cutover/smoke/baseline.
