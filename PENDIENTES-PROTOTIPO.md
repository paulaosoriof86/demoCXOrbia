# PENDIENTES-PROTOTIPO.md

**Última sincronización:** 2026-08-18 14:20 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-R3B-HOLD-DEV-HOSTING-PARITY-05`  
**Estado:** `R3B_HOLD__NO_UI_WORKAROUND__DEV_HOSTING_MATERIALIZATION_AUTH_NEXT__GO_LIVE_35`

## Pendiente vivo único antes de continuar I3

`NEW_AUTH_REQUIRED_I3_11C_DEV_HOSTING_MATERIALIZE_CORRECTED_IDENTITY_RUNTIME_NO_PROVIDER_DATA_WRITES`.

R3-B ya fue ejecutado una sola vez y quedó consumido en HOLD. No se repite automáticamente.

## Evidencia R3-B

Run `32181137350`, artifact `9340865585`:
- parity source corregido: PASS;
- Rules previas: reutilizadas, redeploy `0`;
- Staff/Admin DEV ejecutado read-only;
- target canonical actual `null`;
- agosto canonical `0`;
- residual live `2`;
- provider links `1`, target links `0`;
- duplicados `0/0`;
- postulación y legal permanecen coherentes en runtime lastState;
- provider/Auth/Firestore-data/Rules/HR/Storage/Make/Gemini/payment writes `0`;
- Hosting/CloudRun deploy `0`;
- Historical Shopper `0`;
- merge/production false.

## Causa reducida

`I3_11C_CORRECTED_SOURCE_NOT_EFFECTIVE_IN_REMOTE_DEV__HOSTING_MATERIALIZATION_REQUIRED`.

El adapter corregido en GitHub ya pasa el contrato canónico. El bloqueo ahora no justifica otro cambio de lógica ni provider repair: la corrección R3-A no fue materializada por un deploy Hosting dentro de R3-A/R3-B y el runtime remoto sigue exhibiendo la conducta previa.

## R3-C — próximo gate

Solo con nueva autorización expresa:
- máximo `1` Firebase Hosting DEV deploy;
- source exacto de la rama viva;
- verificar remote fingerprint/hash o semántica inequívoca del contrato corregido;
- provider identity writes `0`;
- Firestore data/Auth/Rules/HR/Storage/Make/Gemini/pagos/Historical Shopper/CloudRun `0`;
- merge/production `false`;
- no ejecutar Staff automáticamente después del deploy.

Después del Hosting PASS se abrirá otro gate Staff read-only separado. El cierre I3 exige:
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual live `0`;
- duplicateVisitKeys `0`;
- duplicateShopperIds `0`.

I3 integral PASS → formal **60%**.

## Frozen / no reprocesar

I1/I2/I3.1→I3.10; Historical Shopper; TARGET_B Admin; request08; I3.5B/I3.5C-2/I3.8; Rules I3.11C; focal provider read; R3-B actual; HR 15/660; Finance V2/historical; legal V0.4.

No Admin/Shopper workaround, password/reset histórico, HR reimport, Finance rebuild, Rules redeploy ni provider identity-link repair.

## I4 — pendientes visibles

### A. Shopper lifecycle
Documentos/instrucciones, certificaciones históricas/nuevas, disponibles, postulación, asignación, perfil/roles/scopes, notificaciones e histórico.

### B. Agenda/visita
Agendar, reprogramar, cancelar, reglas/ventanas, ejecución, evidencias, cuestionario, submit y review/auditoría.

### C. HR/sync
Plataforma→HR y HR→Plataforma con IDs exactos, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`, no duplicación y conflictos a revisión.

### D. Finanzas
Liquidaciones, pagos, junio real, histórico, honorarios/reembolsos configurables y trazabilidad.

### E. Multi-proyecto/no-code
Project Builder/config: source, mapping, cuestionario/provider/link, documentos/reglas/certificación, agenda, pagos, roles/notificaciones, país/moneda/timezone/locale, integraciones, privacidad/evidencias.

## Claude/prototipo

No parche UI para este bloqueo. TyA = primer tenant; Cinépolis = primer proyecto normal configurable. Cualquier hallazgo generalizable se resuelve en contrato reusable y luego se entrega por archivo/módulo.

## Academia

Sin cambio visible en R3-B. Cursos/manuales/rutas/notificaciones/certificación se actualizan con cada slice funcional de I4.

## I5

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → gate producción → cutover/smoke → baseline.

## Avance

**Formal 35% / 65% pendiente.** R3-B HOLD consumido; el siguiente avance técnico es Hosting DEV parity, no otra reauditoría ni otra candidata.
